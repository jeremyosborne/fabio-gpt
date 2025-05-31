# Description: Scaffold script to fine-tune a small open-source model for romance scene generation on a Mac (M2)

import os
import json
from datasets import load_dataset, Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import get_peft_model, LoraConfig, TaskType
import torch

# Set your model and LoRA configuration
BASE_MODEL = (
    # "mistralai/Mistral-7B-v0.1"  # Or try "tiiuae/falcon-rw-1b" or "microsoft/phi-2"
    "./hf-models/tinyllama"
)


# Load dataset (this assumes you have a local JSONL file of prompt/response data)
def load_custom_dataset(file_path="data/romance_data.jsonl"):
    with open(file_path, "r") as f:
        lines = [json.loads(l) for l in f.readlines()]
    return Dataset.from_list(lines)


# Prepare the dataset for training
def preprocess(example, tokenizer):
    prompt = f"### Instruction:\n{example['instruction']}\n\n### Input:\n{example['input']}\n\n### Response:\n{example['output']}"
    tokenized = tokenizer(prompt, truncation=True, padding="max_length", max_length=512)
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized


# Main training routine
def fine_tune():
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.float16)

    # Apply LoRA configuration
    config = LoraConfig(
        r=8,
        lora_alpha=16,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.1,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
    )
    model = get_peft_model(model, config)

    raw_dataset = load_custom_dataset()
    tokenized_dataset = raw_dataset.map(
        lambda e: preprocess(e, tokenizer), remove_columns=raw_dataset.column_names
    )

    training_args = TrainingArguments(
        output_dir="romance-lora-out",
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        num_train_epochs=3,
        learning_rate=2e-4,
        fp16=True,
        logging_dir="logs",
        logging_steps=10,
        save_strategy="epoch",
        report_to="none",
    )

    data_collator = DataCollatorForLanguageModeling(tokenizer, mlm=False)

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
    )

    trainer.train()
    model.save_pretrained("romance-lora-out")
    tokenizer.save_pretrained("romance-lora-out")


if __name__ == "__main__":
    fine_tune()
