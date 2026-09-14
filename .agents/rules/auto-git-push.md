# Automatic Git Commit & Push Rule (ಸ್ವಯಂಚಾಲಿತ ಗಿಟ್ ಕಮಿಟ್ ಮತ್ತು ಪುಶ್ ನಿಯಮ)

## Mandatory Directive
1. **Always Commit and Push After Every Change**:
   - Whenever code, documentation, or configuration files are modified, created, or fixed as part of a user request, the agent MUST automatically stage, commit, and push the changes to the git remote (`git push origin <current-branch>`).
   - Do NOT stop after editing files or completing a task; always run verification (`npx tsc --noEmit` and tests if applicable) and immediately execute:
     ```bash
     git add <modified-files>
     git commit -m "<concise descriptive commit message>"
     git push origin <current-branch>
     ```
   - Ensure commit messages are clear, professional, and descriptive.
   - Confirm successful git push with the commit hash and branch name in the final response to the user.
