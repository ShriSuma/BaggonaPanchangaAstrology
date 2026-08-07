import json
import glob

def merge_dict(d1, d2):
    for k, v in d2.items():
        if isinstance(v, dict) and k in d1 and isinstance(d1[k], dict):
            merge_dict(d1[k], v)
        else:
            d1[k] = v

files = glob.glob('src/i18n/locales/*.json')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We'll just load it. Wait, standard json module takes the LAST duplicate key and overrides.
    # So if there are duplicate keys, json.loads already handles it by picking the last one.
    # To properly merge, we might need to do string manipulation or a custom parser.
    # Actually, the user already has duplicate keys. Let's write a simple regex replacement for the end of the file.
    pass
