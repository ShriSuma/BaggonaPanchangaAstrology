import os
import json
from google import genai
from google.genai import types

client = genai.Client()

def extract():
    print("Uploading images...")
    # The user attached images. I need to find where they are. 
    # Let's search the workspace for images.
