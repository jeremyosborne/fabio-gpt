from transformers import AutoModelForCausalLM
from peft import PeftModel
import torch

# base = AutoModelForCausalLM.from_pretrained("./hf-models/tinyllama")
base = AutoModelForCausalLM.from_pretrained(
    "./hf-models/tinyllama",
    trust_remote_code=True,
    torch_dtype=torch.float16,
    use_safetensors=True,
)
model = PeftModel.from_pretrained(base, "romance-lora-out")
model = model.merge_and_unload()
model.save_pretrained("./merged-romance-model")
