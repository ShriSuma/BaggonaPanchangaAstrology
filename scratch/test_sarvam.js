const fs = require('fs');

async function testSarvam() {
  const apiKey = "sk_duxld45s_658vBx71bZPMfKeLfCXxXwF0";
  const url = "https://api.sarvam.ai/text-to-speech";

  const payload = {
    inputs: ["ಹರಿ ಓಂ, ನಾನು ಶ್ರೀಸುಮ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಪವಿತ್ರ ದರ್ಶನ ಹಾಗೂ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಂಕಲ್ಪಕ್ಕೆ ತಮಗೆ ಭಕ್ತಿಪೂರ್ವಕವಾದ ಸ್ವಾಗತ. ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಆಯುರಾರೋಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ. ಓಂ ನಮಃ ಶಿವಾಯ."],
    target_language_code: "kn-IN",
    speaker: "anand",
    pace: 0.90,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: "bulbul:v3"
  };

  console.log("Sending request to Sarvam AI API with bulbul:v3 and speaker: anand...");
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    if (data?.audios && data.audios.length > 0) {
      console.log("🎉🎉🎉 SUCCESS! Received crystal-clear base64 Kannada audio from Sarvam AI, size:", data.audios[0].length);
      const buffer = Buffer.from(data.audios[0], 'base64');
      fs.writeFileSync('public/audio/sarvam_sample.wav', buffer);
      console.log("Saved dynamic audio to public/audio/sarvam_sample.wav");
    } else {
      console.log("Response body:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Error testing Sarvam AI:", err);
  }
}

testSarvam();
