import torch
import numpy as np
from dataset import Dataset, collate_fn
from irt import IRTModel, AdaptiveTester
from model import MAMLModel
from utils.configuration import create_parser, initialize_seeds
from torch.optim import Adam

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def train_model():
    # Initialize configuration and seeds
    params = create_parser()
    initialize_seeds(params.seed)
    # Data loaders
    train_dataset = Dataset(params.data_path)
    valid_dataset = Dataset(params.valid_data_path) if params.valid_data_path else train_dataset

    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=params.batch_size,
        # collate_fn=collate_fn(params.model.n_question),
        collate_fn=collate_fn(params.n_question),
        shuffle=True
    )

    valid_loader = torch.utils.data.DataLoader(
        valid_dataset,
        batch_size=params.batch_size,
        # collate_fn=collate_fn(params.model.n_question),
        collate_fn=collate_fn(params.n_question),
        shuffle=False
    )

    # Model and optimizer initialization
    model = MAMLModel(params.n_question).to(device)
    irt_model = IRTModel(params.n_question)
    optimizer = Adam(model.parameters(), lr=params.lr)

    # Training loop
    for epoch in range(params.epochs):
        model.train()
        epoch_loss = 0.0

        for batch in train_loader:
            batch = {k: v.to(device) for k, v in batch.items()}

            batch_size = batch['input_labels'].size(0)
            config = {
                'mode': 'train',
                'theta': torch.zeros(batch_size, device=device)
            }

            output = model(batch, config)
            loss = output['loss']

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()

        # Validation
        if (epoch + 1) % params.eval_every == 0:
            val_accuracy, theta_error = evaluate(model, valid_loader)
            print(f'Epoch [{epoch + 1}/{params.epochs}], '
                  f'Loss: {epoch_loss / len(train_loader):.4f}, '
                  f'Val Accuracy: {val_accuracy:.4f}, '
                  f'Theta Estimation Error: {theta_error:.4f}')

            # Adaptive testing
    if params.run_adaptive_test:
        tester = AdaptiveTester(train_dataset.data)
        # test_results = tester.run_test(params.adaptive_testing.max_questions)
        test_results = tester.run_test(params.max_questions)
        print(f"\nAdaptive Test Results:")
        print(f"- Final Ability Estimate: {test_results['final_theta']:.3f}")
        print(f"- Questions Administered: {len(test_results['administered'])}")

    torch.save(model.state_dict(), "trained_model.pth")
    print("Model saved to trained_model.pth")


def evaluate(model, loader):
    model.eval()
    correct = 0
    total = 0
    total_theta_error = 0.0  # To track theta estimation error

    with torch.no_grad():
        for batch in loader:
            batch = {k: v.to(device) for k, v in batch.items()}

            config = {
                'mode': 'eval',
                'theta': torch.zeros(batch['input_labels'].size(0), device=device)
            }

            output = model(batch, config)
            predictions = output['output'].round().cpu().numpy()
            labels = batch['output_labels'].cpu().numpy()

            # Track accuracy
            correct += (predictions == labels).sum()
            total += labels.size

            # Calculate theta error
            predicted_theta = output['output'].mean(axis=1)
            actual_theta = batch['output_labels'].float().mean(axis=1)  # ← ✅ cast to float
            total_theta_error += np.abs(predicted_theta - actual_theta).sum()

    accuracy = correct / total
    theta_error = total_theta_error / total
    return accuracy, theta_error


if __name__ == "__main__":
    train_model()
