from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

base = AutoModelForCausalLM.from_pretrained("./hf-models/tinyllama")
model = PeftModel.from_pretrained(base, "romance-lora-out")
model = model.merge_and_unload()
model.save_pretrained("./merged-romance-model")
