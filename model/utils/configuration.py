import torch
import numpy as np
import argparse
import random
import os
import yaml
from model.dataset import Dataset, collate_fn
from model.model import MAMLModel
from torch.optim import Adam, SGD

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def initialize_seeds(seed):
    """Initialize all random seeds for reproducibility"""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False


def create_parser():
    parser = argparse.ArgumentParser(description='ML')
    parser.add_argument('--model', type=str, default='biirt-random', help='Model type')
    parser.add_argument('--name', type=str, default='demo', help='Experiment name')
    parser.add_argument('--hidden_dim', type=int, default=1024, help='Hidden dimension size')
    parser.add_argument('--question_dim', type=int, default=4, help='Question embedding dimension')
    parser.add_argument('--lr', type=float, default=1e-4, help='Learning rate')
    parser.add_argument('--meta_lr', type=float, default=1e-4, help='Meta learning rate')
    parser.add_argument('--inner_lr', type=float, default=1e-1, help='Inner loop learning rate')
    parser.add_argument('--inner_loop', type=int, default=5, help='Number of inner loops')
    parser.add_argument('--policy_lr', type=float, default=2e-3, help='Policy learning rate')
    parser.add_argument('--dropout', type=float, default=0.5, help='Dropout rate')
    parser.add_argument('--dataset', type=str, default='assist2009', help='Dataset name')
    parser.add_argument('--fold', type=int, default=1, help='Fold number for cross-validation')
    parser.add_argument('--n_query', type=int, default=10, help='Number of queries')
    parser.add_argument('--seed', type=int, default=221, help='Random seed')
    parser.add_argument('--use_cuda', action='store_true', help='Use CUDA if available')
    parser.add_argument('--save', action='store_true', help='Save model')
    parser.add_argument('--neptune', action='store_true', help='Log to Neptune')

    # New arguments for adaptive testing
    parser.add_argument('--data_path', type=str, default='', help='Path to training data')
    parser.add_argument('--valid_data_path', type=str, default='', help='Path to validation data')
    parser.add_argument('--run_adaptive_test', action='store_true', help='Run adaptive testing')
    parser.add_argument('--max_questions', type=int, default=20, help='Max questions in adaptive test')
    parser.add_argument('--eval_every', type=int, default=10, help='Evaluate every N epochs')
    parser.add_argument('--config', type=str, default='config.yaml', help='Path to YAML config file')

    # Parse command line arguments
    args = parser.parse_args()
    params = args

    # Dataset-specific configurations
    dataset_configs = {
        'eedi-3': {
            'n_question': 948,
            'train_batch_size': 512,
            'test_batch_size': 1000,
            'n_epoch': 10000,
            'wait': 1000,
            'repeat': 5
        },
        'eedi-1': {
            'n_question': 27613,
            'n_epoch': 750,
            'train_batch_size': 128,
            'test_batch_size': 512,
            'wait': 50,
            'repeat': 2
        },
        'assist2009': {
            'n_question': 26688,
            'train_batch_size': 128,
            'test_batch_size': 512,
            'n_epoch': 5000,
            'wait': 250,
            'repeat': 10
        },
        'ednet': {
            'n_question': 13169,
            'n_epoch': 500,
            'train_batch_size': 200,
            'test_batch_size': 512,
            'wait': 25,
            'repeat': 1
        },
        'junyi': {
            'n_question': 25785,
            'n_epoch': 750,
            'train_batch_size': 128,
            'test_batch_size': 512,
            'wait': 50,
            'repeat': 2
        }
    }

    if params.dataset in dataset_configs:
        for key, value in dataset_configs[params.dataset].items():
            setattr(params, key, value)

    # Try to load YAML config if specified
    if params.config and os.path.exists(params.config):
        try:
            with open(params.config, 'r') as yaml_file:
                config = yaml.safe_load(yaml_file)

            # Override with YAML config values
            if config and isinstance(config, dict):
                # Model parameters
                if 'model' in config and isinstance(config['model'], dict):
                    for key, value in config['model'].items():
                        setattr(params, key, value)

                # Training parameters
                if 'training' in config and isinstance(config['training'], dict):
                    for key, value in config['training'].items():
                        if key == 'batch_size':
                            setattr(params, 'batch_size', value)  # Correctly set batch_size
                        elif key == 'epochs':  # Set the epochs parameter correctly
                            setattr(params, 'epochs', value)  # Set to params.epochs
                        else:
                            setattr(params, key, value)

                # Adaptive testing parameters
                if 'adaptive_testing' in config and isinstance(config['adaptive_testing'], dict):
                    for key, value in config['adaptive_testing'].items():
                        if key != 'content_balance':  # Special handling for content_balance
                            setattr(params, key, value)

            print(f"Loaded configuration from {params.config}")
        except Exception as e:
            print(f"Error loading YAML config: {e}")

    return params


def train_model():
    params = create_parser()
    initialize_seeds(params.seed)

    # Data loaders
    train_dataset = Dataset(params.data_path)
    valid_dataset = Dataset(params.valid_data_path) if params.valid_data_path else train_dataset

    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=params.train_batch_size,
        collate_fn=collate_fn(params.n_question),
        shuffle=True,
        pin_memory=True if torch.cuda.is_available() else False
    )

    valid_loader = torch.utils.data.DataLoader(
        valid_dataset,
        batch_size=params.test_batch_size,
        collate_fn=collate_fn(params.n_question),
        shuffle=False,
        pin_memory=True if torch.cuda.is_available() else False
    )

    # Model initialization
    model = MAMLModel(
        n_question=params.n_question,
        question_dim=params.question_dim,
        dropout=params.dropout,
        sampling=params.model.split('-')[-1] if hasattr(params, 'model') and '-' in params.model else 'random',
        n_query=params.n_query
    ).to(device)

    # Optimizers
    optimizer = Adam(model.parameters(), lr=params.lr)
    meta_params = [torch.zeros(1, params.question_dim).to(device).requires_grad_()]
    meta_optimizer = SGD(meta_params, lr=params.meta_lr)

    # Training loop
    best_val_accuracy = 0.0
    for epoch in range(params.n_epoch):
        model.train()
        epoch_loss = 0.0

        for batch in train_loader:
            batch = {k: v.to(device) for k, v in batch.items()}

            # Forward pass
            config = {
                'mode': 'train',
                'theta': torch.zeros(batch['input_labels'].size(0), device=device),
                'meta_param': meta_params[0].expand(len(batch['input_labels']), -1)
            }

            output = model(batch, config)
            loss = output['loss']

            # Backward pass
            optimizer.zero_grad()
            meta_optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            meta_optimizer.step()

            epoch_loss += loss.item()

        # Validation
        if (epoch + 1) % params.eval_every == 0:
            val_accuracy = evaluate(model, valid_loader, params)
            print(f'Epoch [{epoch + 1}/{params.n_epoch}], '
                  f'Loss: {epoch_loss / len(train_loader):.4f}, '
                  f'Val Accuracy: {val_accuracy:.4f}')

            # Save best model
            if val_accuracy > best_val_accuracy:
                best_val_accuracy = val_accuracy
                if params.save:
                    torch.save(model.state_dict(), f'best_model_{params.name}.pt')

    # Adaptive testing
    if params.run_adaptive_test:
        from model.irt import AdaptiveTester
        tester = AdaptiveTester(train_dataset.data)
        test_results = tester.run_test(params.max_questions)
        print(f"\nAdaptive Test Results:")
        print(f"- Final Ability Estimate: {test_results['final_theta']:.3f}")
        print(f"- Questions Administered: {len(test_results['administered'])}")
        if 'concept_counts' in test_results:
            print(f"- Concept Coverage:")
            for concept, count in test_results["concept_counts"].items():
                print(f"  • {concept}: {count} questions")


def evaluate(model, loader, params):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for batch in loader:
            batch = {k: v.to(device) for k, v in batch.items()}

            config = {
                'mode': 'eval',
                'theta': torch.zeros(batch['input_labels'].size(0), device=device),
                'meta_param': torch.zeros(1, params.question_dim).to(device)
            }

            output = model(batch, config)
            predictions = output['output'].round().cpu().numpy()
            labels = batch['output_labels'].cpu().numpy()
            mask = batch['output_mask'].cpu().numpy()

            correct += ((predictions == labels) * mask).sum()
            total += mask.sum()

    return correct / total if total > 0 else 0.0


if __name__ == "__main__":
    train_model()