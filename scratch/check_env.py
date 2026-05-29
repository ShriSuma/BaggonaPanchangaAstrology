import os
import sys

print("Python version:", sys.version)
print("Environment keys:")
for key in sorted(os.environ.keys()):
    if any(k in key.lower() for k in ["api", "key", "secret", "token", "gemini", "openai"]):
        print(f"  {key}: {'[SET]' if os.environ[key] else '[EMPTY]'}")
    else:
        print(f"  {key}: {os.environ[key][:30]}...")

try:
    import google.generativeai as genai
    print("google-generativeai package is installed")
except ImportError:
    print("google-generativeai package is NOT installed")

try:
    import speech_recognition as sr
    print("speech_recognition package is installed")
except ImportError:
    print("speech_recognition package is NOT installed")
