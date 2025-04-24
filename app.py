import os
import json

from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from adaptive_test import AdaptiveTester

# ─── Flask App Setup ────────────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "ade-yinka")

# ─── MongoDB Setup ─────────────────────────────────────────────────────────────
mongo_uri = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://akinsanyaadeyinka4166:rUhSy7yhz4gI05QS@adaptlearn.s8xjzt2.mongodb.net"
)
client = MongoClient(mongo_uri)
db     = client["adaptlearn"]
users  = db["users"]

# ─── Model & Question Bank ─────────────────────────────────────────────────────
MODEL_PATH = "trained_model.pth"

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Adaptive Testing API is running"}), 200

@app.route("/start_test", methods=["POST"])
def start_test():
    """
    Kick off a new adaptive test for the given user.
    Expects header: X-User-ID: <MongoDB ObjectId string>
    And either:
      - multipart form with key "questions_file" pointing at a .json file, OR
      - JSON body { "questions": [ {...}, {...}, ... ] }
    """
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401

    try:
        user_oid = ObjectId(user_id)
    except:
        return jsonify({"error": "Invalid X-User-ID"}), 400

    user = users.find_one({"_id": user_oid})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Load the questions JSON
    if "questions_file" in request.files:
        try:
            questions = json.load(request.files["questions_file"])
        except Exception as e:
            return jsonify({"error": f"Failed to parse uploaded JSON file: {e}"}), 400
    else:
        body = request.get_json(silent=True) or {}
        questions = body.get("questions")
        if not isinstance(questions, list):
            return jsonify({"error": "Provide questions via file upload or JSON body under key 'questions'"}), 400

    if not questions:
        return jsonify({"error": "No questions provided"}), 400

    # Initialize tester
    tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
    tester.administered     = set()
    tester.theta            = 0.0
    tester.response_history = []

    # Pick first question
    first_idx = tester.select_initial_question([q["index"] for q in questions])
    first_q   = questions[first_idx]

    # Persist everything in the user doc
    users.update_one(
        {"_id": user_oid},
        {"$set": {
            "testSession.questions":       questions,
            "testSession.administered":    [],
            "testSession.theta":           0.0,
            "testSession.responseHistory": [],
            "testSession.correctResponses": [],
            "testSession.wrongResponses":   [],
            "testSession.currentIndex":    first_idx
        }}
    )

    return jsonify({
        "question": first_q.get("Question Text", ""),
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
    """
    Accepts header: X-User-ID
    Body JSON: { "answer": "A"|"B"|"C"|"D" }
    Returns feedback + next question, or test‑complete summary.
    """
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return jsonify({"error": "Missing X-User-ID header"}), 401

    try:
        user_oid = ObjectId(user_id)
    except:
        return jsonify({"error": "Invalid X-User-ID"}), 400

    user = users.find_one({"_id": user_oid})
    ts   = user.get("testSession") if user else None
    if not ts or "questions" not in ts:
        return jsonify({"error": "No active test session"}), 400

    questions        = ts["questions"]
    current_idx      = ts.get("currentIndex", 0)
    administered     = set(ts.get("administered", []))
    theta            = ts.get("theta", 0.0)
    response_history = ts.get("responseHistory", [])
    correct_list     = ts.get("correctResponses", [])
    wrong_list       = ts.get("wrongResponses", [])

    if current_idx < 0 or current_idx >= len(questions):
        return jsonify({"error": "Invalid session index"}), 500

    q = questions[current_idx]
    body = request.get_json(silent=True) or {}
    answer = body.get("answer", "").strip().upper()
    correct_answer = (q.get("Correct Answer","") or "").strip().upper()
    was_correct = (answer == correct_answer)

    # Rebuild tester just to run ability + selection
    tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
    tester.administered     = administered
    tester.theta            = theta
    tester.response_history = response_history

    # Update ability & history
    tester.irt_model.update_ability(was_correct, q)
    tester.theta = tester.irt_model.theta
    tester.administered.add(q.get("Question ID"))
    tester.response_history.append(1 if was_correct else 0)

    # update correct/wrong arrays
    if was_correct:
        correct_list.append(q.get("Question ID"))
    else:
        wrong_list.append(q.get("Question ID"))

    # See if we’re done
    remaining = [idx for idx in range(len(questions)) if questions[idx]["Question ID"] not in tester.administered]
    if not remaining:
        # tear down session
        users.update_one({"_id": user_oid}, {"$unset": {"testSession": ""}})
        total_correct = sum(tester.response_history)
        return jsonify({
            "message":       "Test complete",
            "final_theta":   tester.theta,
            "total_correct": total_correct,
            "administered":  list(tester.administered),
            "correct_ids":   correct_list,
            "wrong_ids":     wrong_list
        }), 200

    # Otherwise pick next
    next_idx   = tester.select_next_question(remaining, tester.response_history[-3:])
    next_q     = questions[next_idx]
    target_diff = getattr(tester, "last_target", None)

    # Persist updated session
    users.update_one(
        {"_id": user_oid},
        {"$set": {
            "testSession.administered":     list(tester.administered),
            "testSession.theta":            tester.theta,
            "testSession.responseHistory":  tester.response_history,
            "testSession.correctResponses": correct_list,
            "testSession.wrongResponses":   wrong_list,
            "testSession.currentIndex":     next_idx
        }}
    )

    return jsonify({
        "submitted_answer":  answer,
        "correct_answer":    correct_answer,
        "was_correct":       was_correct,
        "current_theta":     tester.theta,
        "target_difficulty": target_diff,
        "next_question": {
          "question": next_q.get("Question Text",""),
          "options": {
            "A": next_q.get("Option A",""),
            "B": next_q.get("Option B",""),
            "C": next_q.get("Option C",""),
            "D": next_q.get("Option D","")
          }
        }
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0",
            port=int(os.environ.get("PORT", 5000)),
            debug=True)
