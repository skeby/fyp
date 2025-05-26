# import os
# import json
#
# from flask import Flask, request, jsonify
# from pymongo import MongoClient
# from bson.objectid import ObjectId
# from adaptive_test import AdaptiveTester
#
# # ─── Flask App Setup ────────────────────────────────────────────────────────────
# app = Flask(__name__)
# app.secret_key = os.environ.get("SECRET_KEY", "ade-yinka")
#
# # ─── MongoDB Setup ─────────────────────────────────────────────────────────────
# mongo_uri = os.environ.get(
#     "MONGO_URI",
#     "mongodb+srv://akinsanyaadeyinka4166:rUhSy7yhz4gI05QS@adaptlearn.s8xjzt2.mongodb.net"
# )
# client = MongoClient(mongo_uri)
# db     = client["adaptlearn"]
# users  = db["users"]
#
# # ─── Model & Question Bank ─────────────────────────────────────────────────────
# MODEL_PATH = "trained_model.pth"
#
# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Adaptive Testing API is running"}), 200
#
# @app.route("/start_test", methods=["POST"])
# def start_test():
#     """
#     Kick off a new adaptive test for the given user.
#     Expects header: X-User-ID: <MongoDB ObjectId string>
#     And either:
#       - multipart form with key "questions_file" pointing at a .json file, OR
#       - JSON body { "questions": [ {...}, {...}, ... ] }
#     """
#     user_id = request.headers.get("X-User-ID")
#     if not user_id:
#         return jsonify({"error": "Missing X-User-ID header"}), 401
#
#     try:
#         user_oid = ObjectId(user_id)
#     except:
#         return jsonify({"error": "Invalid X-User-ID"}), 400
#
#     user = users.find_one({"_id": user_oid})
#     if not user:
#         return jsonify({"error": "User not found"}), 404
#
#     # Load the questions JSON
#     if "questions_file" in request.files:
#         try:
#             questions = json.load(request.files["questions_file"])
#         except Exception as e:
#             return jsonify({"error": f"Failed to parse uploaded JSON file: {e}"}), 400
#     else:
#         body = request.get_json(silent=True) or {}
#         questions = body.get("questions")
#         if not isinstance(questions, list):
#             return jsonify({"error": "Provide questions via file upload or JSON body under key 'questions'"}), 400
#
#     if not questions:
#         return jsonify({"error": "No questions provided"}), 400
#
#     # Initialize tester
#     tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
#     tester.administered     = set()
#     tester.theta            = 0.0
#     tester.response_history = []
#
#     # Pick first question
#     first_idx = tester.select_initial_question([q["index"] for q in questions])
#     first_q   = questions[first_idx]
#
#     # Persist everything in the user doc
#     users.update_one(
#         {"_id": user_oid},
#         {"$set": {
#             "testSession.questions":       questions,
#             "testSession.administered":    [],
#             "testSession.theta":           0.0,
#             "testSession.responseHistory": [],
#             "testSession.correctResponses": [],
#             "testSession.wrongResponses":   [],
#             "testSession.currentIndex":    first_idx
#         }}
#     )
#
#     return jsonify({
#         "question": first_q.get("Question Text", ""),
#         "options": {
#           "A": first_q.get("Option A", ""),
#           "B": first_q.get("Option B", ""),
#           "C": first_q.get("Option C", ""),
#           "D": first_q.get("Option D", "")
#         },
#         "theta": tester.theta
#     }), 200
#
# @app.route("/submit_answer", methods=["POST"])
# def submit_answer():
#     """
#     Accepts header: X-User-ID
#     Body JSON: { "answer": "A"|"B"|"C"|"D" }
#     Returns feedback + next question, or test‑complete summary.
#     """
#     user_id = request.headers.get("X-User-ID")
#     if not user_id:
#         return jsonify({"error": "Missing X-User-ID header"}), 401
#
#     try:
#         user_oid = ObjectId(user_id)
#     except:
#         return jsonify({"error": "Invalid X-User-ID"}), 400
#
#     user = users.find_one({"_id": user_oid})
#     ts   = user.get("testSession") if user else None
#     if not ts or "questions" not in ts:
#         return jsonify({"error": "No active test session"}), 400
#
#     questions        = ts["questions"]
#     current_idx      = ts.get("currentIndex", 0)
#     administered     = set(ts.get("administered", []))
#     theta            = ts.get("theta", 0.0)
#     response_history = ts.get("responseHistory", [])
#     correct_list     = ts.get("correctResponses", [])
#     wrong_list       = ts.get("wrongResponses", [])
#
#     if current_idx < 0 or current_idx >= len(questions):
#         return jsonify({"error": "Invalid session index"}), 500
#
#     q = questions[current_idx]
#     body = request.get_json(silent=True) or {}
#     answer = body.get("answer", "").strip().upper()
#     correct_answer = (q.get("Correct Answer","") or "").strip().upper()
#     was_correct = (answer == correct_answer)
#
#     # Rebuild tester just to run ability + selection
#     tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
#     tester.administered     = administered
#     tester.theta            = theta
#     tester.response_history = response_history
#
#     # Update ability & history
#     tester.irt_model.update_ability(was_correct, q)
#     tester.theta = tester.irt_model.theta
#     tester.administered.add(q.get("Question ID"))
#     tester.response_history.append(1 if was_correct else 0)
#
#     # update correct/wrong arrays
#     if was_correct:
#         correct_list.append(q.get("Question ID"))
#     else:
#         wrong_list.append(q.get("Question ID"))
#
#     # See if we’re done
#     remaining = [idx for idx in range(len(questions)) if questions[idx]["Question ID"] not in tester.administered]
#     if not remaining:
#         # tear down session
#         users.update_one({"_id": user_oid}, {"$unset": {"testSession": ""}})
#         total_correct = sum(tester.response_history)
#         return jsonify({
#             "message":       "Test complete",
#             "final_theta":   tester.theta,
#             "total_correct": total_correct,
#             "administered":  list(tester.administered),
#             "correct_ids":   correct_list,
#             "wrong_ids":     wrong_list
#         }), 200
#
#     # Otherwise pick next
#     next_idx   = tester.select_next_question(remaining, tester.response_history[-3:])
#     next_q     = questions[next_idx]
#     target_diff = getattr(tester, "last_target", None)
#
#     # Persist updated session
#     users.update_one(
#         {"_id": user_oid},
#         {"$set": {
#             "testSession.administered":     list(tester.administered),
#             "testSession.theta":            tester.theta,
#             "testSession.responseHistory":  tester.response_history,
#             "testSession.correctResponses": correct_list,
#             "testSession.wrongResponses":   wrong_list,
#             "testSession.currentIndex":     next_idx
#         }}
#     )
#
#     return jsonify({
#         "submitted_answer":  answer,
#         "correct_answer":    correct_answer,
#         "was_correct":       was_correct,
#         "current_theta":     tester.theta,
#         "target_difficulty": target_diff,
#         "next_question": {
#           "question": next_q.get("Question Text",""),
#           "options": {
#             "A": next_q.get("Option A",""),
#             "B": next_q.get("Option B",""),
#             "C": next_q.get("Option C",""),
#             "D": next_q.get("Option D","")
#           }
#         }
#     }), 200
#
# if __name__ == "__main__":
#     app.run(host="0.0.0.0",
#             port=int(os.environ.get("PORT", 5000)),
#             debug=True)

# import os
# import json
# from flask import Flask, request, jsonify
# from pymongo import MongoClient
# from bson.objectid import ObjectId
# from adaptive_test import AdaptiveTester
#
# # ─── Flask App Setup ────────────────────────────────────────────────────────────
# app = Flask(__name__)
# app.secret_key = os.environ.get("SECRET_KEY", "ade-yinka")
#
# # ─── MongoDB Setup ─────────────────────────────────────────────────────────────
# mongo_uri = os.environ.get(
#     "MONGO_URI",
#     "mongodb+srv://akinsanyaadeyinka4166:rUhSy7yhz4gI05QS@adaptlearn.s8xjzt2.mongodb.net"
# )
# client = MongoClient(mongo_uri)
# db     = client["adaptlearn"]
# users  = db["users"]
#
# # ─── Model Path ─────────────────────────────────────────────────────────────────
# MODEL_PATH = "trained_model.pth"
#
# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Adaptive Testing API is running"}), 200
#
# @app.route("/start_test", methods=["POST"])
# def start_test():
#     """
#     Kick off a new adaptive test.
#     Headers:
#       X-User-ID: <MongoDB ObjectId>
#     Body:
#       either multipart/form-data "questions_file" (.json),
#       or application/json { "questions": [...] }
#     """
#     user_id = request.headers.get("X-User-ID")
#     if not user_id:
#         return jsonify({"error": "Missing X-User-ID header"}), 401
#
#     try:
#         user_oid = ObjectId(user_id)
#     except:
#         return jsonify({"error": "Invalid X-User-ID"}), 400
#
#     user = users.find_one({"_id": user_oid})
#     if not user:
#         return jsonify({"error": "User not found"}), 404
#
#     # load questions
#     if "questions_file" in request.files:
#         try:
#             questions = json.load(request.files["questions_file"])
#         except Exception as e:
#             return jsonify({"error": f"Bad JSON file: {e}"}), 400
#     else:
#         body = request.get_json(silent=True) or {}
#         questions = body.get("questions")
#         if not isinstance(questions, list):
#             return jsonify({"error": "Provide questions as JSON under key 'questions'"}), 400
#
#     if not questions:
#         return jsonify({"error": "Empty question list"}), 400
#
#     # initialize adaptive tester
#     tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
#     tester.administered     = set()
#     tester.theta            = 0.0
#     tester.response_history = []
#
#     first_idx = tester.select_initial_question([q["index"] for q in questions])
#     first_q   = questions[first_idx]
#
#     # persist under testSession
#     users.update_one(
#         {"_id": user_oid},
#         {"$set": {
#             "testSession.questions":        questions,
#             "testSession.administered":     [],
#             "testSession.correctResponses": [],
#             "testSession.wrongResponses":   [],
#             "testSession.responseHistory":  [],
#             "testSession.theta":            0.0,
#             "testSession.currentIndex":     first_idx
#         }}
#     )
#
#     return jsonify({
#         "question": first_q.get("Question Text", ""),
#         "options": {
#             "A": first_q.get("Option A",""),
#             "B": first_q.get("Option B",""),
#             "C": first_q.get("Option C",""),
#             "D": first_q.get("Option D","")
#         },
#         "theta": tester.theta
#     }), 200
#
# @app.route("/submit_answer", methods=["POST"])
# def submit_answer():
#     """
#     Submit an answer to the current question.
#     Headers:
#       X-User-ID: <MongoDB ObjectId>
#     Body JSON:
#       { "answer": "A"|"B"|"C"|"D" }
#     """
#     user_id = request.headers.get("X-User-ID")
#     if not user_id:
#         return jsonify({"error": "Missing X-User-ID"}), 401
#
#     try:
#         user_oid = ObjectId(user_id)
#     except:
#         return jsonify({"error": "Invalid X-User-ID"}), 400
#
#     user = users.find_one({"_id": user_oid})
#     ts   = user.get("testSession") if user else None
#     if not ts or "questions" not in ts:
#         return jsonify({"error": "No active test session"}), 400
#
#     # unpack session
#     questions        = ts["questions"]
#     current_idx      = ts.get("currentIndex", 0)
#     administered     = set(ts.get("administered", []))
#     correct_list     = ts.get("correctResponses", [])
#     wrong_list       = ts.get("wrongResponses", [])
#     response_history = ts.get("responseHistory", [])
#     theta            = ts.get("theta", 0.0)
#
#     # bounds check
#     if current_idx < 0 or current_idx >= len(questions):
#         return jsonify({"error": "Invalid session index"}), 500
#
#     q = questions[current_idx]
#     body = request.get_json(silent=True) or {}
#     answer = body.get("answer","").strip().upper()
#     correct_answer = (q.get("Correct Answer","") or "").strip().upper()
#     was_correct = (answer == correct_answer)
#
#     # rebuild tester just for ability & selection
#     tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
#     tester.administered     = administered
#     tester.theta            = theta
#     tester.response_history = response_history
#
#     # update ability
#     tester.irt_model.update_ability(was_correct, q)
#     tester.theta = tester.irt_model.theta
#
#     # record this q
#     tester.administered.add(q.get("Question ID"))
#     tester.response_history.append(1 if was_correct else 0)
#
#     # update correct/wrong lists
#     if was_correct:
#         correct_list.append(q.get("Question ID"))
#     else:
#         wrong_list.append(q.get("Question ID"))
#
#     # see if done
#     remaining = [
#         idx for idx in range(len(questions))
#         if questions[idx]["Question ID"] not in tester.administered
#     ]
#     if not remaining:
#         # tear down
#         users.update_one({"_id": user_oid}, {"$unset": {"testSession": ""}})
#         return jsonify({
#             "message":       "Test complete",
#             "final_theta":   tester.theta,
#             "total_correct": len(correct_list),
#             "administered":  list(tester.administered),
#             "correct_ids":   correct_list,
#             "wrong_ids":     wrong_list
#         }), 200
#
#     # pick next
#     next_idx   = tester.select_next_question(remaining, tester.response_history[-3:])
#     next_q     = questions[next_idx]
#     target_diff = getattr(tester, "last_target", None)
#
#     # persist updates
#     users.update_one(
#         {"_id": user_oid},
#         {"$set": {
#             "testSession.administered":     list(tester.administered),
#             "testSession.correctResponses": correct_list,
#             "testSession.wrongResponses":   wrong_list,
#             "testSession.responseHistory":  tester.response_history,
#             "testSession.theta":            tester.theta,
#             "testSession.currentIndex":     next_idx
#         }}
#     )
#
#     return jsonify({
#         "submitted_answer":  answer,
#         "correct_answer":    correct_answer,
#         "was_correct":       was_correct,
#         "current_theta":     tester.theta,
#         "target_difficulty": target_diff,
#         "next_question": {
#             "question": next_q.get("Question Text",""),
#             "options": {
#                 "A": next_q.get("Option A",""),
#                 "B": next_q.get("Option B",""),
#                 "C": next_q.get("Option C",""),
#                 "D": next_q.get("Option D","")
#             }
#         }
#     }), 200
#
# if __name__ == "__main__":
#     app.run(
#         host="0.0.0.0",
#         port=int(os.environ.get("PORT",5000)),
#         debug=True
#     )


# import os
# import json
# import uuid
# from flask import Flask, request, jsonify
# from pymongo import MongoClient
# from bson.objectid import ObjectId
# from adaptive_test import AdaptiveTester
#
# app = Flask(__name__)
# app.secret_key = os.environ.get("SECRET_KEY", "ade-yinka")
#
# # ─── MongoDB Setup ─────────────────────────────────────────────────────────────
# mongo_uri = os.environ.get(
#     "MONGO_URI",
#     "mongodb+srv://akinsanyaadeyinka4166:rUhSy7yhz4gI05QS@adaptlearn.s8xjzt2.mongodb.net")
# client = MongoClient(mongo_uri)
# db     = client["adaptlearn"]
# users  = db["users"]
#
# MODEL_PATH = "trained_model.pth"
#
# # ─── Helpers ───────────────────────────────────────────────────────────────────
# def _get_user_and_sessions():
#     """ Fetch user by header X-User-ID and return (user_oid, user_doc). """
#     uid = request.headers.get("X-User-ID")
#     if not uid:
#         return None, ({"error": "Missing X-User-ID header"}, 401)
#     try:
#         oid = ObjectId(uid)
#     except:
#         return None, ({"error": "Invalid X-User-ID"}, 400)
#     u = users.find_one({"_id": oid})
#     if not u:
#         return None, ({"error": "User not found"}, 404)
#     # ensure we have the map container
#     if "testSessions" not in u:
#         u["testSessions"] = {}
#     return oid, u
#
# # ─── Routes ────────────────────────────────────────────────────────────────────
#
# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Adaptive Testing API is running"}), 200
#
# @app.route("/start_test", methods=["POST"])
# def start_test():
#     """
#     Start a brand-new adaptive-test session.
#     Headers:
#       X-User-ID: <MongoDB ObjectId>
#     Body (one of):
#       - multipart/form-data "questions_file" (.json)
#       - application/json { "questions": [ ... ] }
#     Returns:
#       {
#         "test_id": "...",
#         "question": "...",
#         "options": { "A":..., "B":..., ... },
#         "theta": 0.0
#       }
#     """
#     user_oid, err = _get_user_and_sessions()
#     if err:
#         return jsonify(err[0]), err[1]
#
#     # load question bank
#     if "questions_file" in request.files:
#         try:
#             questions = json.load(request.files["questions_file"])
#         except Exception as e:
#             return jsonify({"error": f"Bad JSON file: {e}"}), 400
#     else:
#         payload = request.get_json(silent=True) or {}
#         questions = payload.get("questions")
#         if not isinstance(questions, list):
#             return jsonify({"error": "Provide 'questions': [...] in JSON body"}), 400
#
#     if not questions:
#         return jsonify({"error": "Empty question list"}), 400
#
#     # init tester
#     tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
#     tester.administered = set()
#     tester.theta = 0.0
#     tester.response_history = []
#
#     first_idx = tester.select_initial_question([q["index"] for q in questions])
#     first_q = questions[first_idx]
#
#     # generate session id
#     test_id = str(uuid.uuid4())
#
#     # persist under testSessions.<test_id>
#     users.update_one(
#         {"_id": user_oid},
#         {"$set": {
#             f"testSessions.{test_id}.questions":        questions,
#             f"testSessions.{test_id}.administered":     [],
#             f"testSessions.{test_id}.correctResponses": [],
#             f"testSessions.{test_id}.wrongResponses":   [],
#             f"testSessions.{test_id}.responseHistory":  [],
#             f"testSessions.{test_id}.theta":            0.0,
#             f"testSessions.{test_id}.currentIndex":     first_idx
#         }}
#     )
#
#     return jsonify({
#         "test_id": test_id,
#         "question": first_q.get("Question Text",""),
#         "options": {
#             "A": first_q.get("Option A",""),
#             "B": first_q.get("Option B",""),
#             "C": first_q.get("Option C",""),
#             "D": first_q.get("Option D","")
#         },
#         "theta": 0.0
#     }), 200
#
# @app.route("/submit_answer", methods=["POST"])
# def submit_answer():
#     """
#     Submit an answer to an existing session.
#     Headers:
#       X-User-ID: <MongoDB ObjectId>
#       X-Test-ID: <the test_id returned earlier>
#     Body JSON:
#       { "answer": "A"|"B"|"C"|"D" }
#     Returns either the next question or final summary.
#     """
#     user_oid, err = _get_user_and_sessions()
#     if err:
#         return jsonify(err[0]), err[1]
#
#     test_id = request.headers.get("X-Test-ID")
#     if not test_id:
#         return jsonify({"error": "Missing X-Test-ID header"}), 400
#
#     user_doc = users.find_one({"_id": user_oid})
#     sess_map = user_doc.get("testSessions", {})
#     sess = sess_map.get(test_id)
#     if not sess:
#         return jsonify({"error": "Unknown or expired test_id"}), 400
#
#     # unpack session
#     questions        = sess["questions"]
#     current_idx      = sess["currentIndex"]
#     administered     = set(sess["administered"])
#     correct_list     = sess["correctResponses"]
#     wrong_list       = sess["wrongResponses"]
#     response_history = sess["responseHistory"]
#     theta            = sess["theta"]
#
#     if current_idx < 0 or current_idx >= len(questions):
#         return jsonify({"error": "Invalid session index"}), 500
#
#     q = questions[current_idx]
#     body = request.get_json(silent=True) or {}
#     answer = (body.get("answer","") or "").strip().upper()
#     correct_answer = (q.get("Correct Answer","") or "").strip().upper()
#     was_correct = (answer == correct_answer)
#
#     # rebuild tester
#     tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
#     tester.administered     = administered
#     tester.theta            = theta
#     tester.response_history = response_history
#
#     # update ability
#     tester.irt_model.update_ability(was_correct, q)
#     tester.theta = tester.irt_model.theta
#
#     # record this question
#     tester.administered.add(q["Question ID"])
#     tester.response_history.append(1 if was_correct else 0)
#     if was_correct:
#         correct_list.append(q["Question ID"])
#     else:
#         wrong_list.append(q["Question ID"])
#
#     # find remaining
#     remaining = [
#         idx for idx in range(len(questions))
#         if questions[idx]["Question ID"] not in tester.administered
#     ]
#     if not remaining:
#         # test complete → remove this session entirely
#         users.update_one(
#             {"_id": user_oid},
#             {"$unset": {f"testSessions.{test_id}": ""}}
#         )
#         return jsonify({
#             "message":       "Test complete",
#             "final_theta":   tester.theta,
#             "total_correct": len(correct_list),
#             "administered":  list(tester.administered),
#             "correct_ids":   correct_list,
#             "wrong_ids":     wrong_list
#         }), 200
#
#     # pick next question
#     next_idx   = tester.select_next_question(remaining, tester.response_history[-3:])
#     next_q     = questions[next_idx]
#     target_diff = getattr(tester, "last_target", None)
#
#     # persist back updated session
#     users.update_one(
#         {"_id": user_oid},
#         {"$set": {
#             f"testSessions.{test_id}.administered":     list(tester.administered),
#             f"testSessions.{test_id}.correctResponses": correct_list,
#             f"testSessions.{test_id}.wrongResponses":   wrong_list,
#             f"testSessions.{test_id}.responseHistory":  tester.response_history,
#             f"testSessions.{test_id}.theta":            tester.theta,
#             f"testSessions.{test_id}.currentIndex":     next_idx
#         }}
#     )
#
#     return jsonify({
#         "submitted_answer":  answer,
#         "correct_answer":    correct_answer,
#         "was_correct":       was_correct,
#         "current_theta":     tester.theta,
#         "target_difficulty": target_diff,
#         "next_question": {
#             "question": next_q.get("Question Text",""),
#             "options": {
#                 "A": next_q.get("Option A",""),
#                 "B": next_q.get("Option B",""),
#                 "C": next_q.get("Option C",""),
#                 "D": next_q.get("Option D","")
#             }
#         }
#     }), 200
#
# if __name__ == "__main__":
#     app.run(
#         host="0.0.0.0",
#         port=int(os.environ.get("PORT", 5000)),
#         debug=True
#     )

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
        return None, ({"error": "User not found"}, 404)

    # Ensure there's a top‐level container for multiple sessions
    if "testSessions" not in user:
        users.update_one({"_id": oid}, {"$set": {"testSessions": {}}})
        user["testSessions"] = {}

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

    # load questions from file upload or JSON body
    if "questions_file" in request.files:
        try:
            questions = json.load(request.files["questions_file"])
        except Exception as e:
            return jsonify({"error": f"Failed to parse JSON file: {e}"}), 400
    else:
        body = request.get_json(silent=True) or {}
        questions = body.get("questions")
        if not isinstance(questions, list):
            return jsonify({
                "error": "Provide questions via file upload or JSON body under key 'questions'"
            }), 400

    if not questions:
        return jsonify({"error": "No questions provided"}), 400

    # initialize new AdaptiveTester
    tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
    tester.administered     = set()
    tester.theta            = 0.0
    tester.response_history = []

    first_idx = tester.select_initial_question([q["index"] for q in questions])
    first_q   = questions[first_idx]

    # persist under a new session ID
    test_id = str(ObjectId())
    users.update_one(
        {"_id": user_oid},
        {"$set": {
            f"testSessions.{test_id}.questions":       questions,
            f"testSessions.{test_id}.administered":    [],
            f"testSessions.{test_id}.theta":           0.0,
            f"testSessions.{test_id}.responseHistory": [],
            f"testSessions.{test_id}.correctResponses": [],
            f"testSessions.{test_id}.wrongResponses":   [],
            f"testSessions.{test_id}.currentIndex":    first_idx
        }}
    )

    return jsonify({
        "test_id":  test_id,
        "id": first_q.get("Question ID", ""),
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
    ts = user.get("testSessions", {}).get(test_id)
    if not ts:
        return jsonify({"error": "Test session not found"}), 404

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
    answer = (data.get("answer","") or "").strip().upper()
    correct_answer = (q.get("Correct Answer","") or "").strip().upper()
    explanation = (q.get("Explanation", "") or "").strip().upper()
    was_correct = (answer == correct_answer)

    # rebuild tester to update θ and pick next
    tester = AdaptiveTester.from_json(questions, MODEL_PATH, num_questions=len(questions))
    tester.administered     = administered
    tester.theta            = theta
    tester.response_history = response_history

    # update ability & histories
    tester.irt_model.update_ability(was_correct, q)
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
    if not remaining:
        # tear down this sub‐session
        users.update_one(
          {"_id": user_oid},
          {"$unset": {f"testSessions.{test_id}": ""}}
        )
        return jsonify({
            "test_id": test_id,
            "submitted_answer": answer,
            "correct_answer": correct_answer,
            "was_correct": was_correct,
            "explanation": explanation,
            "current_theta": tester.theta,
            "result": {
                "administered": list(tester.administered),
                "correct_ids":  correct_list,
                "wrong_ids":    wrong_list
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
            f"testSessions.{test_id}.administered":     list(tester.administered),
            f"testSessions.{test_id}.theta":            tester.theta,
            f"testSessions.{test_id}.responseHistory":  tester.response_history,
            f"testSessions.{test_id}.correctResponses": correct_list,
            f"testSessions.{test_id}.wrongResponses":   wrong_list,
            f"testSessions.{test_id}.currentIndex":     next_idx
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
