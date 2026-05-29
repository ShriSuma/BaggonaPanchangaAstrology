import os
import subprocess
import speech_recognition as sr
from static_ffmpeg import run

def transcribe_audio():
    ffmpeg_path, _ = run.get_or_fetch_platform_executables_else_raise()
    audio_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/JayashreePandit/jayatte Panchanga 1.mp3"
    scratch_dir = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/scratch"
    output_text_path = os.path.join(scratch_dir, "jayashree_transcription.txt")
    
    # 22 minutes is about 1350 seconds
    chunk_size = 180  # 3 minutes
    total_duration = 1350
    
    r = sr.Recognizer()
    
    with open(output_text_path, "w", encoding="utf-8") as f:
        f.write("=== JAYASHREE PANDIT AUDIO TRANSCRIPTION ===\n\n")
        
        for start_time in range(0, total_duration, chunk_size):
            chunk_wav = os.path.join(scratch_dir, f"chunk_{start_time}.wav")
            print(f"Converting chunk from {start_time}s to {start_time + chunk_size}s...")
            cmd = [
                ffmpeg_path,
                "-y",
                "-ss", str(start_time),
                "-t", str(chunk_size),
                "-i", audio_path,
                "-ar", "16000",
                "-ac", "1",
                chunk_wav
            ]
            try:
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception as e:
                print(f"FFmpeg conversion failed for chunk {start_time}: {e}")
                continue
                
            print(f"Transcribing chunk {start_time}...")
            try:
                with sr.AudioFile(chunk_wav) as source:
                    audio_data = r.record(source)
                text = r.recognize_google(audio_data, language="kn-IN")
                print(f"Chunk {start_time} text: {text[:100]}...")
                f.write(f"--- Time: {start_time//60:02d}:{start_time%60:02d} to {(start_time+chunk_size)//60:02d}:{(start_time+chunk_size)%60:02d} ---\n")
                f.write(text + "\n\n")
                f.flush()
            except Exception as e:
                print(f"Transcription failed for chunk {start_time}: {e}")
                f.write(f"--- Time: {start_time//60:02d}:{start_time%60:02d} to {(start_time+chunk_size)//60:02d}:{(start_time+chunk_size)%60:02d} ---\n")
                f.write(f"[Transcription Failed/No Speech Detected: {e}]\n\n")
                f.flush()
                
            # Clean up chunk wav
            if os.path.exists(chunk_wav):
                os.remove(chunk_wav)
                
    print("All chunks processed. Written to:", output_text_path)

if __name__ == "__main__":
    transcribe_audio()
