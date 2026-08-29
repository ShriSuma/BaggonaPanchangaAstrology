with open('src/pages/PalmReadingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_target = 'import { sanitizeAIText } from "../utils/textFormatter";'
import_repl = 'import { sanitizeAIText } from "../utils/textFormatter";\nimport { PalmLifeStageMilestonesCard } from "../components/palmreading/PalmLifeStageMilestonesCard";'

section_target = '''                          {/* Section 4: AI Prediction Text */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">'''

section_repl = '''                          {/* Section 4: Age-Stratified Life Milestones (Education, Marriage, Children, Wealth) */}
                          {msg.result.lifeStageMilestones && (
                            <PalmLifeStageMilestonesCard
                              milestones={msg.result.lifeStageMilestones}
                              lang={selectedLang}
                              devoteeName={devoteeName}
                            />
                          )}

                          {/* Section 5: AI Prediction Text */}
                          <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">'''

remedy_target = '🪔 {isKn ? "೫. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy)" : "5. Sacred Gokarna Mahabaleshwara Remedy"}'
remedy_repl = '🪔 {isKn ? "೬. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ (Sacred Remedy)" : "6. Sacred Gokarna Mahabaleshwara Remedy"}'

if import_target in content and section_target in content:
    content = content.replace(import_target, import_repl, 1)
    content = content.replace(section_target, section_repl, 1)
    content = content.replace(remedy_target, remedy_repl, 1)
    with open('src/pages/PalmReadingPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS_ADDED_MILESTONES")
else:
    print("MATCH_FAILED")
