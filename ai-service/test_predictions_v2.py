import requests
import json

url = "http://localhost:5001/predict"

tests = [
    "I feel great today, everything is going well and I'm happy",
    "I've been feeling extremely unstable in my relationships and my sense of who I am changes constantly. I feel empty and have intense mood swings.", # Borderline-ish
    "I avoid social situations because I'm terrified of being judged or rejected by others, even though I want to be close to people." # Avoidant-ish
]

for text in tests:
    print(f"Testing: {text}")
    response = requests.post(url, json={"text": text})
    print(response.json())
    print("-" * 50)
