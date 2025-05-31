# Romance novel generator

## Front end

- `npm install`
- `npm run dev` and `ollama run llama3`

## Model tuning

- `pipenv --python 3.11`
- `pipenv install httpx datasets transformers peft accelerate torch`
- `pipenv shell` (and `exit` when done)

Generate tuning data:

- One time: `git lfs install`
- One time: `git clone https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0 ./hf-models/tinyllama`
- `python tuning/generate_romance_dataset.py`
- `python tuning/fine_tune_romance.py`
- `python tuning/merge_learnings.py`
- `cp -r ./hf-models/tinyllama/tokenizer* ./merged-romance-model/`
- Create the following `merged-romance-model/Modelfile`

```Dockerfile
FROM llama2

PARAMETER temperature 0.8
PARAMETER top_p 0.9
PARAMETER stop "###"
```

- Update our model `ollama create romance-fabio -f ./merged-romance-model/Modelfile`
- Use this model instead: `ollama run romance-fabio`
- Switch the app to use our model: `json: { model: "romance-fabio", prompt, stream: true },`
