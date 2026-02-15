import torch
import pandas as pd
import random
import os
from irt import IRTModel

class AdaptiveTester:
    def __init__(self, dataset_path, model_path, num_questions=301):
        # Load dataset from CSV
        df = pd.read_csv(dataset_path)

        # Map difficulty strings to numerical if needed
        difficulty_map = {'Easy': 0.5, 'Medium': 1.5, 'Hard': 2.5}
        if df.shape[0] > 0 and isinstance(df.loc[0, 'Difficulty'], str):
            df['Difficulty'] = df['Difficulty'].map(difficulty_map)

        # Map discrimination strings to numerical if needed
        discrimination_map = {'Low': 0.5, 'Medium': 1.5, 'High': 2.5}
        if df.shape[0] > 0 and isinstance(df.loc[0, 'Discrimination'], str):
            df['Discrimination'] = df['Discrimination'].map(discrimination_map)

        # Add guessing parameter if it doesn't exist
        if 'Guessing Probability' not in df.columns:
            df['Guessing Probability'] = 0.25

        # Convert DataFrame to list of dicts for processing
        self.question_bank = df.to_dict(orient='records')

        # Initialize the IRTModel
        self.irt_model = IRTModel(num_questions)

        # Load the trained model state if provided
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        elif model_path:
            print(f"Warning: Model file {model_path} not found. Using default parameters.")

        self.administered = set()
        self.theta = 0.0  # Estimated ability
        self.response_history = []  # Track correct/incorrect responses

        # Assign an index to each question
        for i, q in enumerate(self.question_bank):
            q['index'] = i

        # Sort a copy of the question bank by difficulty for reference
        self.sorted_by_difficulty = sorted(self.question_bank, key=lambda x: x['Difficulty'])

    @classmethod
    def from_json(cls, questions_json, model_path=None, num_questions=None):
        """
        Creates an AdaptiveTester instance using a JSON list (list of dicts)
        for the question bank instead of a CSV file.
        If num_questions is not provided, it is set to len(questions_json).
        """
        # 1) determine how many items
        if num_questions is None:
            num_questions = len(questions_json)

        # 2) build the bare instance
        inst = cls.__new__(cls)
        inst.question_bank = questions_json
        inst.administered = set()
        inst.theta = 0.0
        inst.response_history = []

        # 3) create an IRTModel of the right size
        inst.irt_model = IRTModel(num_questions)

        # 4) if you have a checkpoint, load only the 3PL vectors that match length
        if model_path and os.path.exists(model_path):
            state = torch.load(model_path)
            for key in ("difficulty", "discrimination", "guessing"):
                if key in state and state[key].numel() == num_questions:
                    getattr(inst.irt_model, key).data.copy_(state[key])
        # (we deliberately skip loading any of the .layers.* weights)

        # 5) now overwrite those 3PL parameters with your JSON values
        diffs = torch.tensor([q.get("Difficulty", 1.0) for q in questions_json],
                             dtype=torch.float32)
        discs = torch.tensor([q.get("Discrimination", 1.0) for q in questions_json],
                             dtype=torch.float32)
        gs = torch.tensor([q.get("Guessing Probability", 0.25) for q in questions_json],
                          dtype=torch.float32)

        inst.irt_model.difficulty.data.copy_(diffs)
        inst.irt_model.discrimination.data.copy_(discs)
        inst.irt_model.guessing.data.copy_(gs)

        # 6) give each question its index and sort by difficulty if you need that
        for i, q in enumerate(questions_json):
            q["index"] = i
        inst.sorted_by_difficulty = sorted(
            questions_json,
            key=lambda x: float(x.get("Difficulty", 1.5))
        )

        return inst

    def load_model(self, model_path):
        # Load the saved model state
        try:
            state_dict = torch.load(model_path)
            # Resize guessing parameter if needed
            if 'guessing' in state_dict and state_dict['guessing'].size(0) != len(self.question_bank):
                print(f"Warning: Resizing guessing parameter from {state_dict['guessing'].size(0)} to {len(self.question_bank)}")
                new_guessing = torch.ones(len(self.question_bank)) * 0.25
                min_len = min(new_guessing.size(0), state_dict['guessing'].size(0))
                new_guessing[:min_len] = state_dict['guessing'][:min_len]
                state_dict['guessing'] = new_guessing

            # Resize difficulty parameter if needed
            if 'difficulty' in state_dict and state_dict['difficulty'].size(0) != len(self.question_bank):
                print("Warning: Resizing difficulty parameter")
                new_diff = torch.zeros(len(self.question_bank))
                min_len = min(new_diff.size(0), state_dict['difficulty'].size(0))
                new_diff[:min_len] = state_dict['difficulty'][:min_len]
                state_dict['difficulty'] = new_diff

            # Resize discrimination parameter if needed
            if 'discrimination' in state_dict and state_dict['discrimination'].size(0) != len(self.question_bank):
                print("Warning: Resizing discrimination parameter")
                new_disc = torch.ones(len(self.question_bank))
                min_len = min(new_disc.size(0), state_dict['discrimination'].size(0))
                new_disc[:min_len] = state_dict['discrimination'][:min_len]
                state_dict['discrimination'] = new_disc

            self.irt_model.load_state_dict(state_dict, strict=False)
            self.irt_model.eval()  # Set model to evaluation mode
            print(f"Model loaded from {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Continuing with default parameters")

    def run_test(self, max_questions=10):
        if not self.question_bank:
            print("Error: No questions available in the question bank.")
            return []

        # Get indices of questions not yet administered
        available = [q['index'] for q in self.question_bank if q['Question ID'] not in self.administered]

        if not available:
            print("Error: No available questions to administer.")
            return []

        # Select initial question (medium difficulty)
        current_q_idx = self.select_initial_question(available)
        current_q = self.question_bank[current_q_idx]
        results = []
        recent_performance = []  # Track most recent performance (1 for correct, 0 for incorrect)

        for question_num in range(max_questions):
            if not available:
                print("No more questions available.")
                break

            print(f"\n--- Question {question_num + 1}/{max_questions} ---")
            print(f"Current ability estimate: {self.theta:.2f}")
            self.display_question(current_q)

            while True:
                user_answer = input("Your answer (A/B/C/D): ").strip().upper()
                if user_answer in ['A', 'B', 'C', 'D']:
                    break
                print("Invalid answer. Please enter A, B, C, or D.")

            correct_answer = current_q.get('Correct Answer', 'A').strip().upper()
            correct = user_answer == correct_answer

            recent_performance.append(1 if correct else 0)
            if len(recent_performance) > 3:
                recent_performance = recent_performance[-3:]

            print("✓ Correct!" if correct else "✗ Incorrect. Correct answer: " + correct_answer)

            try:
                self.irt_model.update_ability(correct, current_q)
                self.theta = self.irt_model.theta
            except Exception as e:
                print(f"Error updating ability: {e}")
                if correct:
                    self.theta += 0.1 * float(current_q.get('Discrimination', 1.0))
                else:
                    self.theta -= 0.1 * float(current_q.get('Discrimination', 1.0))
                self.theta = max(-3.0, min(3.0, self.theta))

            self.administered.add(current_q['Question ID'])
            self.response_history.append((current_q['Question ID'], correct))
            results.append({
                'question_id': current_q['Question ID'],
                'user_answer': user_answer,
                'correct': correct,
                'ability': self.theta,
                'difficulty': current_q.get('Difficulty', 1.0),
                'discrimination': current_q.get('Discrimination', 1.0)
            })

            available = [q['index'] for q in self.question_bank if q['Question ID'] not in self.administered]
            if not available:
                print("No more questions available.")
                break

            next_q_idx = self.select_next_question(available, recent_performance)
            current_q = self.question_bank[next_q_idx]

        print(f"\nTest complete. Final ability estimate: {self.theta:.3f}")
        return results

    def display_question(self, question):
        print(f"Q: {question.get('Question Text', 'Missing question text')}")
        print(f"A: {question.get('Option A', 'Option A')}")
        print(f"B: {question.get('Option B', 'Option B')}")
        print(f"C: {question.get('Option C', 'Option C')}")
        print(f"D: {question.get('Option D', 'Option D')}")

    def select_initial_question(self, available_indices):
        medium_questions = []
        for idx in available_indices:
            q = self.question_bank[idx]
            if 1.0 <= float(q.get('Difficulty', 1.0)) <= 2.0:
                medium_questions.append(idx)
        if medium_questions:
            return random.choice(medium_questions)
        return random.choice(available_indices)

    def select_next_question(self, available_indices, recent_performance):
        # Compute the target difficulty
        if len(recent_performance) >= 3:
            if sum(recent_performance[-3:]) == 3:
                self.last_target = 2.5
            elif sum(recent_performance[-3:]) == 0:
                self.last_target = 0.5
            else:
                self.last_target = 1.5
        else:
            self.last_target = 1.5

        print(f"Target difficulty: {self.last_target:.2f} (based on recent performance)")
        best_question_idx = min(
            available_indices,
            key=lambda idx: abs(float(self.question_bank[idx].get('Difficulty', 1.5)) - self.last_target)
        )
        selected_difficulty = float(self.question_bank[best_question_idx].get('Difficulty', 1.5))
        print(f"Selected question with difficulty: {selected_difficulty:.2f}")
        return best_question_idx
