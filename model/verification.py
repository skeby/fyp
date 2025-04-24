import torch
from dataset import Dataset, collate_fn
from model import MAMLModel
from irt import AdaptiveTester


def verify_setup():
    print("=== Starting Verification ===")

    try:
        # 1. Test data loading
        print("\n1. Testing DataLoader...")
        dataset = Dataset("dataset_sequential.csv")
        loader = torch.utils.data.DataLoader(dataset, batch_size=2,
                                             collate_fn=collate_fn(len(dataset)))
        batch = next(iter(loader))

        print("[PASS] Batch shapes:")
        for k, v in batch.items():
            print(f"{k}: {v.shape} {v.dtype}")

        # 2. Test model
        print("\n2. Testing Model Forward Pass...")
        model = MAMLModel(n_question=len(dataset))
        dummy_config = {
            'mode': 'train',
            'theta': torch.zeros(2),
            'meta_param': torch.zeros(1, model.question_dim)  # Added this
        }
        output = model(batch, dummy_config)
        print(f"[PASS] Model output: {output['output'].shape}")
        print(f"Sample predictions: {output['output'][0][:5].tolist()}")  # First 5 predictions

        # 3. Test adaptive testing
        print("\n3. Testing Adaptive Tester...")
        tester = AdaptiveTester(dataset.data[:10])  # Test with first 10 questions
        test_results = tester.run_test(max_questions=2)  # Test with 2 questions
        print(f"[PASS] Adaptive Test Results:")
        print(f"- Final theta: {test_results['final_theta']:.3f}")
        print(f"- Administered: {test_results['administered']}")

    except Exception as e:
        print(f"[FAIL] Verification failed: {str(e)}")
        raise


if __name__ == "__main__":
    verify_setup()
    print("\n=== Verification Complete ===")