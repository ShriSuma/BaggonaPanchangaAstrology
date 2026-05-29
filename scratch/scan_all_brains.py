import json
import os
import glob

brain_dir = "/Users/shreesuma/.gemini/antigravity-ide/brain/*/.system_generated/logs/transcript.jsonl"
log_files = glob.glob(brain_dir)

for lf in log_files:
    print("Scanning log:", lf)
    with open(lf, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            if "JayashreePredictionEngine.ts" in line:
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
                            print(f"  Line {idx+1}: Tool: {name}, Code Len: {len(code)}, Repl Len: {len(repl)}")
                except:
                    pass
