#!/usr/bin/env python3
"""
Baggona Panchanga - Indic Voice Audio Generator
Powered by AI4Bharat Indic-Parler-TTS on Hugging Face Spaces.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env.local or .env
env_local = Path(__file__).resolve().parent.parent / ".env.local"
if env_local.exists():
    load_dotenv(env_local)
else:
    load_dotenv()

from gradio_client import Client
import gradio_client.client

# Bypass the upstream Gradio 5.7.1 server-side bug on /info
orig_get_api_info = gradio_client.client.Client._get_api_info
gradio_client.client.Client._get_api_info = lambda self: {
    "named_endpoints": {
        "/generate_finetuned": {"parameters": [{"label": "Input Text"}, {"label": "Description"}]},
        "/generate_base": {"parameters": [{"label": "Input Text"}, {"label": "Description"}]}
    },
    "unnamed_endpoints": {}
}

HF_TOKEN = os.getenv("VITE_HF_API_KEY") or os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN") or ""

client = Client("https://ai4bharat-indic-parler-tts.hf.space", token=HF_TOKEN or None)

# Authentic Indic speaker descriptions for traditional priest/vedic resonance
PRESET_VOICE_DESCRIPTIONS = {
    "priest_kannada": "Suresh speaks slowly in a low-pitched, calm voice, with a neutral tone, perfect for narration. The recording is very high quality with no background noise.",
    "priest_telugu": "Prakash speaks slowly in a low-pitched, calm voice, with a neutral tone, perfect for narration. The recording is very high quality with no background noise.",
    "priest_tamil": "Sunita speaks slowly in a calm, moderate-pitched voice, delivering the chant with a solemn tone. The recording is very high quality with no background noise.",
    "priest_hindi": "Suresh speaks slowly in a deep, calm, traditional Indian male voice, with solemn vedic cadence. The recording is very high quality with no background noise."
}

def generate_mantra_audio(
    text: str,
    voice_description: str = PRESET_VOICE_DESCRIPTIONS["priest_kannada"]
) -> str:
    """
    Generates high-fidelity MP3 mantra audio using AI4Bharat Indic-Parler-TTS.
    
    Exact endpoint confirmed: /generate_finetuned
    Inputs: [text: str, voice_description: str]
    Returns: Path to the generated .mp3 file
    """
    print(f"Generating audio for text: {text[:60]}...")
    result = client.predict(
        text,
        voice_description,
        api_name="/generate_finetuned"
    )
    print(f"Audio generated successfully at: {result}")
    return result

if __name__ == "__main__":
    test_text = sys.argv[1] if len(sys.argv) > 1 else "ಓಂ ನಮಃ ಶಿವಾಯ"
    audio_path = generate_mantra_audio(test_text)
    print(f"Done! Audio file ready: {audio_path}")
