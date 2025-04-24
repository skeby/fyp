import pandas as pd
import json
import sys


def csv_to_json(csv_path, json_path):
    # Read the CSV file into a DataFrame using the csv_path argument.
    df = pd.read_csv(csv_path)

    # Optionally, process the DataFrame (mapping strings to numbers).
    difficulty_map = {'Easy': 0.5, 'Medium': 1.5, 'Hard': 2.5}
    if 'Difficulty' in df.columns and df['Difficulty'].dtype == 'object':
        df['Difficulty'] = df['Difficulty'].map(difficulty_map)

    discrimination_map = {'Low': 0.5, 'Medium': 1.5, 'High': 2.5}
    if 'Discrimination' in df.columns and df['Discrimination'].dtype == 'object':
        df['Discrimination'] = df['Discrimination'].map(discrimination_map)

    # Set default guessing probability if not present
    if 'Guessing Probability' not in df.columns:
        df['Guessing Probability'] = 0.25

    # Convert DataFrame to a list of dictionaries
    records = df.to_dict(orient='records')

    # Write the JSON output to a file
    with open(json_path, 'w') as f:
        json.dump(records, f, indent=4)

    print(f"Successfully converted {csv_path} to {json_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python csv_to_json.py path/to/input.csv path/to/output.json")
    else:
        csv_path = sys.argv[1]
        json_path = sys.argv[2]
        csv_to_json(csv_path, json_path)
