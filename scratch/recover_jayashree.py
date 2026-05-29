import json
import os

transcript_path = "/Users/shreesuma/.gemini/antigravity-ide/brain/8e62f6c8-ae47-4ddc-ba99-35042d257e0d/.system_generated/logs/transcript.jsonl"
target_file = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/core/JayashreePredictionEngine.ts"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            # Check if there is a tool call in this step
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                if tc.get("name") == "write_to_file":
                    args = tc.get("args", {})
                    # Some args might be stringified JSON or dict
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            continue
                    
                    tf_arg = args.get("TargetFile", "")
                    if "JayashreePredictionEngine.ts" in tf_arg:
                        code_content = args.get("CodeContent", "")
                        if code_content:
                            print("Found code content! Length:", len(code_content))
                            with open(target_file, "w", encoding="utf-8") as out:
                                out.write(code_content)
                            print("Successfully recovered JayashreePredictionEngine.ts!")
        except Exception as e:
            continue
