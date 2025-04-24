from adaptive_test import AdaptiveTester

# Specify the path to your saved model
model_path = "trained_model.pth"
dataset_path = "dataset_sequential.csv"

# Create the adaptive tester instance
print("Initializing Adaptive Tester...")
tester = AdaptiveTester(dataset_path, model_path,num_questions=301)

# Run the test
print("Starting adaptive test...")
results = tester.run_test(max_questions=10)

# Display summary
if results:
    print("\nTest Summary:")
    print(f"Questions administered: {len(results)}")
    print(f"Correct answers: {sum(1 for r in results if r['correct'])}")
    print(f"Final ability estimate: {results[-1]['ability']:.3f}")