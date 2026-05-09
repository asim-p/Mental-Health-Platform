import requests
import json

url = "http://localhost:5001/predict"

tests = [
    "I feel great today, everything is going well and I'm happy",
    "I feel worthless and hopeless all the time, nothing matters anymore. I can't stop crying and feel empty.",
    "I want to end it all, life is unbearable and I don't want to live anymore. I have a plan.",
    "I struggle with my personality and how I interact with others, it feels like I have deep-seated issues with my self-image."
]

for text in tests:
    print(f"Testing: {text}")
    response = requests.post(url, json={"text": text})
    print(response.json())
    print("-" * 50)
