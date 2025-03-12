import pandas as pd
import os

# Load the questions metadata
questions_df = pd.read_csv(r"C:\Users\HP\Downloads\EdNet-Contents\contents\questions.csv")

# Define the folder containing user answer files
user_answers_folder = r"C:\Users\HP\Downloads\EdNet-KT1\KT1"

# Initialize an empty list to store data
all_users_data = []

# Loop through each CSV file in the folder
for filename in os.listdir(user_answers_folder)[0:10]:  # Limit to 10 files for now
    if filename.endswith(".csv") and filename.startswith("u"):
        user_id = filename[1:-4]  # Extract user_id from filename (remove "u" and ".csv")
        user_df = pd.read_csv(os.path.join(user_answers_folder, filename))  # Load user's answers
        user_df["user_id"] = user_id  # Add user_id column
        all_users_data.append(user_df)  # Append to list

# Combine all users' data into a single DataFrame
users_responses_df = pd.concat(all_users_data, ignore_index=True)

# Merge user responses with questions to get correct answers
merged_df = users_responses_df.merge(questions_df, on="question_id", how="inner")

# Create the 'correct' column (1 if user_answer == correct_answer, else 0)
merged_df["correct"] = (merged_df["user_answer"] == merged_df["correct_answer"]).astype(int)

# Select only relevant columns
final_data = merged_df[["user_id", "question_id", "correct"]]

# Preview the processed data
print(final_data.head())

# Save to a CSV file for later use
final_data.to_csv("processed_ednet_data.csv", index=False)
