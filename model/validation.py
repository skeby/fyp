# validate_config.py
import yaml
import pandas as pd


def validate():
    with open("config.yaml") as f:
        cfg = yaml.safe_load(f)

    df = pd.read_csv("data/dataset_sequential.csv")

    # Check question count match
    assert cfg['model']['n_question'] == len(df), \
        f"Config expects {cfg['model']['n_question']} questions but CSV has {len(df)}"

    # Check concept names
    csv_concepts = set(df['Concept'].unique())
    config_concepts = set(cfg['adaptive_testing']['content_balance'].keys())
    assert config_concepts.issubset(csv_concepts), \
        f"Config concepts {config_concepts} not in CSV concepts {csv_concepts}"


if __name__ == "__main__":
    validate()
    print("✅ Configuration is valid")