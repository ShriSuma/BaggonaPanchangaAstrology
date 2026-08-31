const fs = require('fs');
const filePath = '/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/pages/DailyDarshanaPage.tsx';

let content = fs.readFileSync(filePath, 'utf8');

const target = `                  <span style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#064E3B",
                    background: "#6EE7B7",
                    padding: "2px 6px",
                    borderRadius: 8,
                    textTransform: "uppercase"
                  }}>
                    🎙️ {lang === "kn" ? "ಅರ್ಚಕರ ಧ್ವನಿ" : "Priest Voice"}
                  </span>`;

if (content.includes(target)) {
  content = content.replace(target, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully removed ಅರ್ಚಕರ ಧ್ವನಿ tag!');
} else {
  console.error('Target not found!');
  process.exit(1);
}
