from torch.utils import data
import torch
import pandas as pd


class Dataset(data.Dataset):
    def __init__(self, csv_path, seed=None):
        df = pd.read_csv(csv_path)
        self.data = []

        for _, row in df.iterrows():
            question_id = row['Question ID']
            if isinstance(question_id, str) and question_id.startswith('Q'):
                question_id = int(question_id[1:])-1  # Remove 'Q' if it exists
            else:
                question_id = int(question_id)-1 # If no 'Q', treat it as integer

            interaction = {
                'student_id': int(row['Student ID']),
                'question_id': question_id,
                'correct': float(row['Correct']),
                'difficulty': float(row['Difficulty']),
                'discrimination': float(row['Discrimination']),
                'guessing': float(row['Guessing Probability']),
            }
            self.data.append(interaction)

        self.n_question = max([d['question_id'] for d in self.data]) + 1  # assumes Q IDs are 0-indexed
        self.seed = seed

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):
        interaction = self.data[index]
        output = {
            'q_ids': torch.LongTensor([interaction['question_id']]),
            'labels': torch.FloatTensor([interaction['correct']]),
            'difficulty': torch.FloatTensor([interaction['difficulty']]),
            'discrimination': torch.FloatTensor([interaction['discrimination']]),
            'guessing': torch.FloatTensor([interaction['guessing']])
        }
        return output


class collate_fn(object):
    def __init__(self, n_question):
        self.n_question = n_question

    def __call__(self, batch):
        B = len(batch)
        input_labels = torch.zeros(B, self.n_question).long()
        output_labels = torch.zeros(B, self.n_question).long()
        input_mask = torch.zeros(B, self.n_question).long()
        output_mask = torch.zeros(B, self.n_question).long()

        difficulties = torch.zeros(B, self.n_question)
        discriminations = torch.zeros(B, self.n_question)
        guessing = torch.zeros(B, self.n_question)

        for b_idx in range(B):
            q_idx = batch[b_idx]['q_ids'].item()
            input_labels[b_idx, q_idx] = batch[b_idx]['labels'].long()
            output_labels[b_idx, q_idx] = batch[b_idx]['labels'].long()
            input_mask[b_idx, q_idx] = 1
            output_mask[b_idx, q_idx] = 1

            difficulties[b_idx, q_idx] = batch[b_idx]['difficulty']
            discriminations[b_idx, q_idx] = batch[b_idx]['discrimination']
            guessing[b_idx, q_idx] = batch[b_idx]['guessing']

        output = {
            'input_labels': input_labels,
            'output_labels': output_labels,
            'input_mask': input_mask,
            'output_mask': output_mask,
            'difficulties': difficulties,
            'discriminations': discriminations,
            'guessing': guessing
        }
        return output
