import google.generativeai as genai
import os

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Listing ALL available models:")
try:
    for m in genai.list_models():
        print(f"{m.name} - Methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
