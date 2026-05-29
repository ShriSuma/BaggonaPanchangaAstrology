import os
import subprocess
from static_ffmpeg import run

# 1. Get ffmpeg binary path
ffmpeg_path, ffprobe_path = run.get_or_fetch_platform_executables_else_raise()
print("static-ffmpeg path:", ffmpeg_path)

audio_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/JayashreePandit/jayatte Panchanga 1.mp3"
wav_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/scratch/sample.wav"

# Convert first 180 seconds to wav (sample rate 16000, mono)
print("Converting first 180 seconds to WAV...")
cmd = [
    ffmpeg_path,
    "-y",
    "-ss", "0",
    "-t", "180",
    "-i", audio_path,
    "-ar", "16000",
    "-ac", "1",
    wav_path
]
subprocess.run(cmd, check=True)
print("Conversion done.")

# 2. Run speech recognition
import speech_recognition as sr
r = sr.Recognizer()
with sr.AudioFile(wav_path) as source:
    audio_data = r.record(source)
    print("Transcribing...")
    
    # Try transcribing in Kannada (since the user mentioned Kannada translation/spelling issues,
    # the audio is likely in Kannada or contains Kannada names/words).
    print("Trying Kannada (kn-IN)...")
    try:
        text_kn = r.recognize_google(audio_data, language="kn-IN")
        print("\n=== KANNADA TRANSCRIPTION ===")
        print(text_kn)
    except Exception as e:
        print("Kannada transcription failed:", e)

    # Let's try English as well just in case
    print("\nTrying English (en-US)...")
    try:
        text_en = r.recognize_google(audio_data, language="en-US")
        print("\n=== ENGLISH TRANSCRIPTION ===")
        print(text_en)
    except Exception as e:
        print("English transcription failed:", e)
