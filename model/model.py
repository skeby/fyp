import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from scipy.stats import sampling

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class MAMLModel(nn.Module):
    def __init__(self, n_question, question_dim=3, dropout=0.2):
        super().__init__()
        self.n_question = n_question
        self.question_dim = question_dim
        self.sampling = sampling

        # IRT parameters layer
        self.difficulty = nn.Parameter(torch.zeros(n_question))
        self.discrimination = nn.Parameter(torch.ones(n_question))
        self.guessing = nn.Parameter(torch.zeros(n_question))

        # Student ability embedding
        self.ability_embed = nn.Linear(1, question_dim)

        # Neural network layers
        self.layers = nn.Sequential(
            nn.Linear(question_dim, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, n_question)
        )

        self.sigmoid = nn.Sigmoid()

    # Update the forward pass to handle masks correctly:
    def forward(self, batch, config):
        # Get IRT parameters from batch
        difficulties = batch['difficulties'].to(device)
        discriminations = batch['discriminations'].to(device)
        guessing = batch['guessing'].to(device)

        # Student ability embedding
        theta = config['theta'].unsqueeze(1).float().to(device)
        student_embed = self.ability_embed(theta)

        # Neural network output with IRT integration
        output = self.layers(student_embed)
        output = output * discriminations - difficulties  # Core IRT formulation
        output = output + guessing  # Guessing parameter

        # Apply sigmoid and handle masks
        probs = self.sigmoid(output)
        masks = batch['input_mask'].to(device) if 'input_mask' in batch else 1

        if config['mode'] == 'train':
            loss = F.binary_cross_entropy(probs * masks, batch['input_labels'].float().to(device))
            return {'loss': loss, 'output': probs.detach()}
        return {'output': probs.detach()}

    def update_ability(self, responses):
        """Update ability estimate based on responses"""
        # Integrate with IRTModel for ability updates
        self.irt.update_ability(responses)

    def select_next_question(self, available_q_indices, current_theta):
        """Select next question based on current ability"""
        # Implement question selection logic here
        return self.irt.select_next_question(available_q_indices)
