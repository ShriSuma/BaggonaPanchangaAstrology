import json

transcript_path = "/Users/shreesuma/.gemini/antigravity-ide/brain/8e62f6c8-ae47-4ddc-ba99-35042d257e0d/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if idx + 1 in [72, 74]:
            try:
                data = json.loads(line)
                print(f"Line {idx+1}: type={data.get('type')}, status={data.get('status')}")
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    print(f"  Tool name: {tc.get('name')}")
                    args = tc.get("args", {})
                    if isinstance(args, str):
                        args = json.loads(args)
                    print("  Keys in args:", list(args.keys()))
                    for k, v in args.items():
                        if isinstance(v, str):
                            print(f"    {k}: len={len(v)}, value snippet: {repr(v[:200])}")
                        else:
                            print(f"    {k}: {v}")
            except Exception as e:
                print("Error:", e)
