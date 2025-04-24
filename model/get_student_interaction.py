import pandas as pd
import numpy as np

df = pd.read_csv("dataset_sequential.csv")

# Define mappings
difficulty_map = {
    'Easy': 0.5,
    'Medium': 1.5,
    'Hard': 2.5
}

discrimination_map = {
    'Low': 0.5,
    'Medium': 1.5,
    'High': 2.5
}

students = 500  # Increased from 100
questions_per_student = 30  # Fixed number of questions per student

simulated_data = []

for student_id in range(students):
    for _ in range(questions_per_student):
        q_idx = np.random.randint(0, len(df))
        question = df.iloc[q_idx]

        # Map string labels to numerical values
        difficulty = difficulty_map.get(question['Difficulty'], 1.5)
        discrimination = discrimination_map.get(question['Discrimination'], 1.5)
        guessing = float(question['Guessing Probability'])
        theta = np.random.normal(0, 1)  # Simulated student ability

        # 3PL model
        prob_correct = guessing + (1 - guessing) * (1 / (1 + np.exp(-discrimination * (theta - difficulty))))
        correct = int(np.random.rand() < prob_correct)

        simulated_data.append({
            "Student ID": student_id,
            "Question ID": question['Question ID'],
            "Correct": correct,
            "Difficulty": difficulty,
            "Discrimination": discrimination,
            "Guessing Probability": guessing,
            "Concept": question['Concept']
        })

# Save to CSV
sim_df = pd.DataFrame(simulated_data)
sim_df.to_csv("student_interactions.csv", index=False)
