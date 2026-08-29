import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import socket
import subprocess

recipient = "spshreepandit@gmail.com"
print(f"Testing direct MX lookup for {recipient}...")

try:
    domain = recipient.split("@")[1]
    # Check MX records
    import subprocess
    res = subprocess.run(["dig", "+short", "mx", domain], capture_output=True, text=True)
    print("MX records for gmail.com:")
    print(res.stdout)
except Exception as e:
    print(f"Error checking MX: {e}")
