# Description: Generates random romance prompt completions using Ollama to create a JSONL fine-tuning dataset

import random
import json
import time
import httpx
from pathlib import Path
from contextlib import contextmanager
import sys
import threading
from tqdm import tqdm

# Output file
OUT_PATH = Path("data/romance_data.jsonl")
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

# Character pools
names = [
    "JeremyGPT",
    "BB846F",
    "Lily",
    "Jake",
    "Aria",
    "Logan",
    "Sasha",
    "Eli",
    "Zoe",
    "Rafael",
]
settings = [
    "a rainy bookstore",
    "a moonlit rooftop",
    "an abandoned castle",
    "a coffee shop during a blackout",
    "a small-town fair",
    "a beach at sunset",
    "a high-speed train",
    "a science conference in Paris",
]
tropes = [
    "enemies to lovers",
    "forced proximity",
    "fake dating",
    "second-chance romance",
    "grumpy x sunshine",
    "opposites attract",
    "love triangle",
    "coworkers fall in love",
]


# Prompt wrapper (same as in your app)
def build_prompt(authorName, loveInterest, setting, trope):
    return f"""
Write the first 2–3 paragraphs of a light-hearted, slightly steamy romance novel. Make it funny, full of clichés, and slightly over-the-top. Use the following info:

- Main character: {authorName}
- Love interest: {loveInterest}
- Setting: {setting}
- Trope: {trope}

Write as if it’s the opening of a paperback romance novel submission.
"""


# Simple console spinner
def spinner():
    while True:
        for cursor in "|/-\\":
            yield cursor


@contextmanager
def spinning(message="Working"):
    spin = spinner()
    stop = False

    def run_spinner():
        while not stop:
            sys.stdout.write(f"\r{message} {next(spin)}")
            sys.stdout.flush()
            time.sleep(0.1)

    thread = threading.Thread(target=run_spinner)
    thread.start()
    try:
        yield
    finally:
        stop = True
        thread.join()
        sys.stdout.write("\r✔ Done!                             \n")


# Generate a single example from Ollama
async def generate_example():
    author = random.choice(names)
    love = random.choice([n for n in names if n != author])
    setting = random.choice(settings)
    trope = random.choice(tropes)
    prompt = build_prompt(author, love, setting, trope)

    async with httpx.AsyncClient(timeout=120.0) as client:
        res = await client.post(
            "http://localhost:11434/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False},
        )
        res.raise_for_status()
        output = res.json()["response"].strip()

    return {
        "instruction": "Write a romantic scene.",
        "input": f"Characters: {author} & {love}\nSetting: {setting}\nTrope: {trope}",
        "output": output,
    }


# Generate many examples and save to JSONL
async def main(n=20):
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        print(f"📝 Generating {n} romance training examples...\n")
        bar = tqdm(range(n), desc="✨ Romance Scenes", unit="scene")

        for i in bar:
            try:
                bar.set_description(f"✨ Scene {i + 1}/{n}")
                start = time.time()
                with spinning("  💕 Whispering sweet nothings to the models"):
                    example = await generate_example()
                f.write(json.dumps(example) + "\n")
                duration = time.time() - start
                preview = example["output"].split(".")[0][:60].strip()
                print(
                    f"[✓] Saved: {example['input'].splitlines()[0]}  ⏱️ {duration:.2f}s"
                )
                print(f"    ✍️  Preview: {preview}...\n")
                time.sleep(1)
            except Exception as e:
                print(f"[!] Error on example {i + 1}:", e)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main(n=20))
