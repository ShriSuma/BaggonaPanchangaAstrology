import json

transcript_path = "/Users/shreesuma/.gemini/antigravity-ide/brain/8e62f6c8-ae47-4ddc-ba99-35042d257e0d/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "JayashreePredictionEngine.ts" in line:
            print(f"Line {idx+1} contains file name.")
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    name = tc.get("name")
                    args = tc.get("args", {})
                    if isinstance(args, str):
                        try: args = json.loads(args)
                        except: pass
                    tf = args.get("TargetFile", "")
                    if "JayashreePredictionEngine.ts" in tf:
                        code = args.get("CodeContent", "")
                        repl = args.get("ReplacementContent", "")
                        print(f"  Tool: {name}, Code Len: {len(code)}, Repl Len: {len(repl)}")
            except Exception as e:
                print(f"  Error parsing: {e}")
