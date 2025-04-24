import numpy as np
from scipy.optimize import newton
import torch
import torch.nn as nn


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


class IRTModel(nn.Module):
    def __init__(self, n_question=None):
        super(IRTModel, self).__init__()
        self.theta = 0.0  # Initial ability estimate
        self.n_question = n_question
        # Match the parameter names and dimensions from the saved model
        self.difficulty = nn.Parameter(torch.zeros(n_question))
        self.discrimination = nn.Parameter(torch.ones(n_question))
        self.guessing = nn.Parameter(torch.ones(n_question) * 0.25)

        # Exactly match the dimensions from the error message
        self.ability_embed = nn.Linear(1, 3)  # Changed from 32 to 3

        self.layers = nn.ModuleList([
            nn.Linear(3, 256),  # Changed from (32, 64) to (3, 256)
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, n_question)  # Changed from (64, 1) to (256, n_question)
        ])

    def forward(self, x):
        # Define forward pass for model inference
        x = self.ability_embed(x.view(-1, 1))
        for layer in self.layers:
            x = layer(x)
        return x

    def update_ability(self, correct, question):
        """
        Update ability based on the response to a question
        """
        # Extract question parameters (with safer index access)
        q_idx = int(question.get('Question ID', 0)) - 1  # Assuming IDs start from 1

        # Use model parameters if available, otherwise fall back to question values
        if q_idx >= 0 and q_idx < len(self.discrimination):
            a = self.discrimination[q_idx].item()
            b = self.difficulty[q_idx].item()
            c = self.guessing[q_idx].item()
        else:
            # Fallback to values from the question
            a = float(question.get('Discrimination', 1.0))
            b = float(question.get('Difficulty', 0.0))
            c = float(question.get('Guessing Probability', 0.25))

        # Update theta using a simple approach
        if correct:
            # Increase theta if answered correctly
            self.theta += 0.1 * a
        else:
            # Decrease theta if answered incorrectly
            self.theta -= 0.1 * a

        # Clamp theta to reasonable range
        self.theta = max(-3.0, min(3.0, self.theta))

    def select_next_question(self, available_indices):
        """
        Select the next question based on maximum information at current ability level.
        """
        if not available_indices:
            return None

        max_info = -float('inf')
        best_q_idx = available_indices[0]

        for idx in available_indices:
            # Calculate information for this question at current ability
            a = self.discrimination[idx].item()
            b = self.difficulty[idx].item()
            c = self.guessing[idx].item()

            # Fisher information formula for 3PL model
            p = c + (1 - c) * sigmoid(a * (self.theta - b))
            q = 1 - p
            info = (a ** 2 * q) / p * ((p - c) / (1 - c)) ** 2

            if info > max_info:
                max_info = info
                best_q_idx = idx

        return best_q_idx