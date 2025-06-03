import os
import json

from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from adaptive_test import AdaptiveTester

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "ade-yinka")

# ─── MongoDB Setup ─────────────────────────────────────────────────────────────
mongo_uri = os.environ.get(
    "MONGO_URI",
    # "mongodb://localhost:27017")
    "mongodb+srv://akinsanyaadeyinka4166:rUhSy7yhz4gI05QS@adaptlearn.s8xjzt2.mongodb.net")
client = MongoClient(mongo_uri)
db     = client["adaptlearn"]
users  = db["users"]

MODEL_PATH = "trained_model.pth"


def _get_user_and_sessions():
    """
    Returns (oid, None) on success,
    or (None, (error_body_dict, status_code)) on failure.
    """
    uid = request.headers.get("X-User-ID")
    if not uid:
        return None, ({"error": "Missing X-User-ID header"}, 401)

    try:
        oid = ObjectId(uid)
    except:
        return None, ({"error": "Invalid X-User-ID"}, 400)

    user = users.find_one({"_id": oid})
    if not user:
        print("User not found")
        return None, ({"error": "Unauthorized: User not found"}, 401)

    # Ensure there's a top‐level container for multiple sessions
    if "topics" not in user:
        users.update_one({"_id": oid}, {"$set": {"topics": {}}})
        user["topics"] = {}

    return oid, None


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Adaptive Testing API is running"}), 200


@app.route("/start_test", methods=["POST"])
def start_test():
    user_oid, err = _get_user_and_sessions()
    if user_oid is None:
        body, code = err
        return jsonify(body), code

    body = request.get_json(silent=True) or {}
    test_id = body.get("test_id")
    if not test_id:
        return jsonify({"error": "Missing test_id"}), 400

    # Check for existing session
    user = users.find_one({"_id": user_oid})
    existing_session = user.get("topics", {}).get(test_id)

    # If session exists and is incomplete, continue from where it left off
    if existing_session:
        administered = existing_session.get("administered", [])
        if len(administered) < 10:
            idx = existing_session.get("current_index", 0)
            questions = existing_session["questions"]
            q = questions[idx]

            return jsonify({
                "test_id": test_id,
                "id": q.get("Question ID", ""),
                "question": q.get("Question Text", ""),
                "question_number": len(administered),
                "options": {
                    "A": q.get("Option A", ""),
                    "B": q.get("Option B", ""),
                    "C": q.get("Option C", ""),
                    "D": q.get("Option D", "")
                },
                "current_theta": existing_session.get("theta", 0.0)
            }), 200
        else:
            # Session is complete; start over
            users.update_one(
                {"_id": user_oid},
                {"$unset": {f"topics.{test_id}": ""}}
            )

    # Start a new session
    if "questions_file" in request.files:
        try:
            questions = json.load(request.files["questions_file"])
        except Exception as e:
            return jsonify({"error": f"Failed to parse JSON file: {e}"}), 400
    else:
        questions = body.get("questions")
        if not isinstance(questions, list) or not questions:
            return jsonify({
                "error": "Provide questions via file upload or JSON body under key 'questions'"
            }), 400

    tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
    tester.administered = set()
    tester.theta = 0.0
    tester.response_history = []

    first_idx = tester.select_initial_question([q["index"] for q in questions])
    first_q = questions[first_idx]

    users.update_one(
        {"_id": user_oid},
        {"$set": {
            f"topics.{test_id}.questions": questions,
            f"topics.{test_id}.administered": [],
            f"topics.{test_id}.theta": 0.0,
            f"topics.{test_id}.response_history": [],
            f"topics.{test_id}.correct_responses": [],
            f"topics.{test_id}.wrong_responses": [],
            f"topics.{test_id}.current_index": first_idx
        }}
    )

    return jsonify({
        "test_id": test_id,
        "id": first_q.get("Question ID", ""),
        "question": first_q.get("Question Text", ""),
        "question_number": 1,
        "options": {
            "A": first_q.get("Option A", ""),
            "B": first_q.get("Option B", ""),
            "C": first_q.get("Option C", ""),
            "D": first_q.get("Option D", "")
        },
        "theta": tester.theta
    }), 200


@app.route("/submit_answer", methods=["POST"])
def submit_answer():
    user_oid, err = _get_user_and_sessions()
    if user_oid is None:
        body, code = err
        return jsonify(body), code

    data = request.get_json(silent=True) or {}
    test_id = data.get("test_id") or request.headers.get("X-Test-ID")
    if not test_id:
        return jsonify({"error": "Missing test_id"}), 400

    # fetch that specific session subdocument
    user = users.find_one({"_id": user_oid})
    ts = user.get("topics", {}).get(test_id)
    if not ts:
        return jsonify({"error": "Test session not found"}), 404

    questions        = ts["questions"]
    current_idx      = ts.get("current_index", 0)
    administered     = set(ts.get("administered", []))
    theta            = ts.get("theta", 0.0)
    response_history = ts.get("response_history", [])
    correct_list     = ts.get("correct_responses", [])
    wrong_list       = ts.get("wrong_responses", [])

    if current_idx < 0 or current_idx >= len(questions):
        return jsonify({"error": "Invalid session index"}), 500

    q = questions[current_idx]
    answer = (data.get("answer","") or "").strip().upper()
    correct_answer = (q.get("Correct Answer","") or "").strip().upper()
    explanation = (q.get("Explanation", "") or "").strip()
    was_correct = (answer == correct_answer)

    # rebuild tester to update θ and pick next
    tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
    tester.administered     = administered
    tester.theta            = theta
    tester.response_history = response_history

    # update ability & histories
    tester.irt_model.update_ability(was_correct, q, current_idx)
    tester.theta = tester.irt_model.theta
    tester.administered.add(q.get("Question ID"))
    tester.response_history.append(1 if was_correct else 0)
    if was_correct:
        correct_list.append(q.get("Question ID"))
    else:
        wrong_list.append(q.get("Question ID"))

    # find remaining
    remaining = [
      idx for idx in range(len(questions))
      if questions[idx]["Question ID"] not in tester.administered
    ]

    # if done
    # if not remaining:

    # if 10 questions done
    if len(tester.administered) == 10:
        # Compute cumulative difficulty
        administered_ids = tester.administered
        total_difficulty = 0
        question_count = 0

        for q in questions:
            if q.get("Question ID") in administered_ids:
                try:
                    diff = float(q.get("Difficulty", 0))
                except (ValueError, TypeError):
                    diff = 0
                total_difficulty += diff
                question_count += 1

        avg_difficulty = total_difficulty / max(question_count, 1)

        # Optional XP formula
        xp_earned = int(avg_difficulty * 10)  # You can adjust scaling

        # Tear down session
        users.update_one(
            {"_id": user_oid},
            {
                # "$unset": {f"topics.{test_id}": ""},
                "$inc": {"xp": xp_earned}
             }
        )

        return jsonify({
            "test_id": test_id,
            "submitted_answer": answer,
            "correct_answer": correct_answer,
            "was_correct": was_correct,
            "explanation": explanation,
            "current_theta": tester.theta,
            "result": {
                "administered": list(administered_ids),
                "correct_ids":  correct_list,
                "wrong_ids":    wrong_list,
                "average_difficulty": round(avg_difficulty, 2),
                "xp_earned": xp_earned
            }
        }), 200


    # pick next
    next_idx   = tester.select_next_question(remaining,
                         tester.response_history[-3:])
    next_q     = questions[next_idx]
    target_diff = getattr(tester, "last_target", None)

    # persist updates back to that sub‐session
    users.update_one(
        {"_id": user_oid},
        {"$set": {
            f"topics.{test_id}.administered":     list(tester.administered),
            f"topics.{test_id}.theta":            tester.theta,
            f"topics.{test_id}.response_history":  tester.response_history,
            f"topics.{test_id}.correct_responses": correct_list,
            f"topics.{test_id}.wrong_responses":   wrong_list,
            f"topics.{test_id}.current_index":     next_idx
        }}
    )

    return jsonify({
        "test_id":          test_id,
        "submitted_answer": answer,
        "correct_answer":   correct_answer,
        "was_correct":      was_correct,
        "current_theta":    tester.theta,
        "explanation": explanation,
        "target_difficulty": target_diff,
        "next_question": {
            "id": next_q.get("Question ID", ""),
          "question": next_q.get("Question Text",""),
        "question_number": len(tester.administered) + 1,
          "difficulty": next_q.get("Difficulty", ""),
          "discrimination": next_q.get("Discrimination", ""),
          "guessing_probability": next_q.get("Guessing Probability", ""),
          "options": {
            "A": next_q.get("Option A",""),
            "B": next_q.get("Option B",""),
            "C": next_q.get("Option C",""),
            "D": next_q.get("Option D","")
          }
        }
    }), 200


if __name__ == "__main__":
    app.run(
      host="0.0.0.0",
      port=int(os.environ.get("PORT", 5000)),
      debug=True
    )
