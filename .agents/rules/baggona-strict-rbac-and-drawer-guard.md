# Strict RBAC & Drawer Guard (ಬಗ್ಗೋಣ ಕಟ್ಟುನಿಟ್ಟಿನ ಪಾತ್ರಾಧಾರಿತ ನಿಯಂತ್ರಣ & ಬರ್ಗರ್ ಮೆನು ರಕ್ಷಕ ನಿಯಮ)

## Mandatory Core Directives (ಕಡ್ಡಾಯ ನಿಯಮಗಳು)

### 1. Burger Control (Hamburger Menu) Restriction
- **ONLY TWO PROFILES ARE EVER PERMITTED TO HAVE BURGER CONTROL (HAMBURGER MENU) & ALL PAGES ACCESS**:
  1. **Super Admin**: (`role === "superadmin"`, e.g. `$hriSuma`, `ShriSuma`, `superadmin`). Super Admin also has master oversight and the Super Admin Control Center (`superadmindashboard`).
  2. **Baggona Master Profile**: (`username.toLowerCase() === "baggona"`).
- **EVERY OTHER PROFILE (All Priests, Purohitas, Devotees, New Users including Venkataramana Pandit / `venkat`)**:
  - **SHALL NEVER GET BURGER CONTROL (HAMBURGER MENU BUTTON)**.
  - The hamburger button (`<button aria-label="Open Menu">`) must **NEVER** be rendered in the header for these users.
  - The side drawer navigation must **NEVER** be rendered or opened for these users.
  - They must **NEVER** have access to all menu options.
  - Their interface must be strictly locked to **ONLY** the specific module(s) granted to them by Super Admin in `allowedModules`.

### 2. Header Architecture for Non-Master Users
- For all non-master priest users (e.g. `venkat` / `Venkataramana Pandit`), the header must display:
  - Branded Baggona Panchanga Gokarna title.
  - Priest identity badge (e.g., `🙏 ಶ್ರೀ ವೆಂಕಟರಮಣ ಪಂಡಿತ್`).
  - Active module badge (e.g., `🌟 ಸಾರ್ವಜನಿಕ ಕುಂಡಲಿ`).
  - Coin Balance Pill (`🪙 ನಾಣ್ಯ ಕೋಶ`).
  - Dedicated Sign Out button (`🚪 ನಿರ್ಗಮನ`).
  - **NO hamburger / burger menu button**.

### 3. Hardened Route & State Guard (Anti-Hack Protection)
- In `App.tsx` and `Layout.tsx`, enforce hard route validation:
  - If a non-master user's active page or URL points to an unauthorized page, immediately redirect to their primary allowed module (e.g. `public_kundli` or `priestdashboard`).
  - No user or hacker can manipulate `setPage` or URL parameters to open unassigned features.

### 4. Floating Coin Deduction CSS Animation
- Whenever coins are deducted across ANY page (`PublicKundliPage`, `PriestMobilePortal`, `SankhyaShastraPriestPortal`, `KundliPage`, etc.):
  - The upward floating vibrant red badge (`-500 Coins (₹50)`, `-1000 Coins (₹100)`, `-250 Coins (₹25)`) using CSS keyframes (`float-up-fade`) **MUST** be triggered.
  - User must visually see the deduction amount rising upwards and fading out clearly.

### 5. Production Database Hygiene
- Zero test profiles (e.g. `ಶ್ರೀರಾಮ್ ಭಟ್`, `priest_gokarna_...`, `priest_subrahmanya_...`) are allowed in production Firestore `users` or `wallets`.
- Only legitimate, authorized profiles (`superadmin`, `baggona`, `venkat`, etc.) shall exist.
