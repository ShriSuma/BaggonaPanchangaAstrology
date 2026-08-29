/**
 * Luxury HTML Email Templates for Baggona Panchanga Notifications
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #020617;
  color: #f8fafc;
  margin: 0;
  padding: 24px;
`;

const CARD_STYLES = `
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
`;

const HEADER_STYLES = `
  background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #d97706 100%);
  color: #020617;
  padding: 24px;
  text-align: center;
`;

const FOOTER_STYLES = `
  border-top: 1px solid #1e293b;
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
`;

export function renderPanchangaCreatedEmail(data: {
  date: string;
  location: string;
  tithi?: string;
  nakshatra?: string;
  vara?: string;
  yoga?: string;
  karana?: string;
  userName?: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">New Panchanga Created</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">A new authentic Panchanga calculation has been computed and recorded.</p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📅 Date:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📍 Location:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.location}</td>
          </tr>
          ${data.tithi ? `<tr><td style="padding: 8px 0; color: #94a3b8;">🌙 Tithi:</td><td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.tithi}</td></tr>` : ""}
          ${data.nakshatra ? `<tr><td style="padding: 8px 0; color: #94a3b8;">✨ Nakshatra:</td><td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.nakshatra}</td></tr>` : ""}
          ${data.vara ? `<tr><td style="padding: 8px 0; color: #94a3b8;">☀️ Vara (Weekday):</td><td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.vara}</td></tr>` : ""}
          ${data.userName ? `<tr><td style="padding: 8px 0; color: #94a3b8;">👤 Requested By:</td><td style="padding: 8px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.userName}</td></tr>` : ""}
        </table>
      </div>
      
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Computed at: ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Heritage Panchanga & Astrology • Gokarna Tradition
    </div>
  </div>
</body>
</html>
`;
}

export function renderPremiumPdfDownloadedEmail(data: {
  clientName: string;
  pdfType: string;
  language: string;
  pageCount: number;
  priestName?: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Premium PDF Download Alert</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">A premium high-resolution astrology report has been successfully generated and downloaded.</p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📜 Report Type:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.pdfType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">👤 Devotee / Client:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🌐 Language:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.language.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📄 Pages:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.pageCount} Pages A4</td>
          </tr>
          ${data.priestName ? `<tr><td style="padding: 8px 0; color: #94a3b8;">🕉️ Generated By:</td><td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.priestName}</td></tr>` : ""}
        </table>
      </div>
      
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Downloaded at: ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Heritage Panchanga & Astrology System
    </div>
  </div>
</body>
</html>
`;
}

export function renderCoinRechargeAlertEmail(data: {
  txId: string;
  priestName: string;
  amountInr: number;
  coins: number;
  packageName: string;
  upiUtr: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">🪙 Coin Recharge Request</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Action Required • Verification Pending</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara Admin,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">A priest has initiated a coin recharge and submitted their 12-digit UPI Reference / UTR Number.</p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 2px solid #f59e0b; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🕉️ Priest Name:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.priestName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📦 Package:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.packageName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">💵 Amount Paid:</td>
            <td style="padding: 8px 0; color: #10b981; font-size: 18px; font-weight: bold; text-align: right;">₹${data.amountInr}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🪙 Coins To Credit:</td>
            <td style="padding: 8px 0; color: #f59e0b; font-size: 18px; font-weight: bold; text-align: right;">+${data.coins.toLocaleString()} Coins</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🔢 UPI UTR / Ref No:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-family: monospace; font-size: 16px; font-weight: bold; text-align: right; background: rgba(0,0,0,0.4); padding-right: 6px;">${data.upiUtr}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #94a3b8; font-size: 13px;">
        Please verify the incoming payment of <strong>₹${data.amountInr}</strong> in your UPI / Bank statement for UTR <strong>${data.upiUtr}</strong>, then open the Admin Portal to approve.
      </p>
      
      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Tx ID: ${data.txId} • ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Panchanga Financial Ledger System
    </div>
  </div>
</body>
</html>
`;
}

export function renderCoinApprovedEmail(data: {
  txId: string;
  priestName: string;
  amountInr: number;
  coins: number;
  upiUtr: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">✅ Coins Credited Successfully!</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Baggona Wallet Updated</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara ${data.priestName},</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">Your payment has been verified and your coins have been credited to your Baggona Panchanga Wallet.</p>
      
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; color: #10b981;">+${data.coins.toLocaleString()} Coins</div>
        <div style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Recharge Amount: ₹${data.amountInr} (UTR: ${data.upiUtr})</div>
      </div>
      
      <p style="color: #cbd5e1; font-size: 14px;">You can now generate high-resolution Kundlis, Raman Bhavishya reports, and Royal PDF booklets for your devotees.</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Panchanga Priest Support
    </div>
  </div>
</body>
</html>
`;
}

export function renderNewIpLoginAlertEmail(data: {
  username: string;
  role: string;
  ip: string;
  browser: string;
  os: string;
  deviceType: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="background: linear-gradient(90deg, #dc2626 0%, #ea580c 50%, #dc2626 100%); color: #ffffff; padding: 24px; text-align: center;">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">🚨 Security Alert: New Login</div>
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Unrecognized IP Address Detected</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #f87171; margin-top: 0;"><strong>Namaskara Administrator,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        A login was just authenticated from a <strong>new public IP address or mobile network</strong> for account <strong>${data.username}</strong>.
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 2px solid #ef4444; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">👤 Account:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.username} (${data.role.toUpperCase()})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🌐 IP Address:</td>
            <td style="padding: 8px 0; color: #f87171; font-family: monospace; font-size: 16px; font-weight: bold; text-align: right;">${data.ip}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📱 Device:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.deviceType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">💻 Platform / OS:</td>
            <td style="padding: 8px 0; color: #f8fafc; text-align: right;">${data.os}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🌍 Browser:</td>
            <td style="padding: 8px 0; color: #f8fafc; text-align: right;">${data.browser}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">⏰ Login Time:</td>
            <td style="padding: 8px 0; color: #f8fafc; text-align: right;">${data.timestamp}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #fca5a5; font-size: 13px;">
        ⚠️ If this was you or an authorized priest logging in from a new location, no further action is required. If you do not recognize this activity, please reset your password immediately.
      </p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Panchanga Security & Intrusion Prevention Engine
    </div>
  </div>
</body>
</html>
`;
}

export function renderPasswordResetOtpEmail(data: {
  username: string;
  otpCode: string;
  expiresAt: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">🔑 Password Reset Request</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Baggona Panchanga Security</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara ${data.username},</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">We received a request to reset your password for the Baggona Panchanga Portal.</p>
      
      <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid #f59e0b; border-radius: 14px; padding: 24px; margin: 20px 0; text-align: center;">
        <div style="text-xs; color: #f59e0b; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Your 6-Digit Password Reset Code</div>
        <div style="font-size: 38px; font-family: monospace; font-weight: 800; color: #fbbf24; letter-spacing: 8px;">${data.otpCode}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 10px;">Valid for 10 minutes (expires at ${data.expiresAt})</div>
      </div>
      
      <p style="color: #94a3b8; font-size: 13px;">
        If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
      </p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Heritage Panchanga & Astrology • Gokarna Tradition
    </div>
  </div>
</body>
</html>
`;
}

export function renderPasswordChangedConfirmationEmail(data: {
  username: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">🔒 Password Changed Successfully</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Security Confirmation</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara ${data.username},</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">The password for your Baggona Panchanga account was successfully updated on <strong>${data.timestamp}</strong>.</p>
      
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
        <span style="color: #10b981; font-weight: bold; font-size: 15px;">✓ Your account is now secured with your new password.</span>
      </div>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Panchanga Security Department
    </div>
  </div>
</body>
</html>
`;
}

export function renderAshirvadaPassIssuedEmail(data: {
  passId: string;
  priestName: string;
  devoteeName: string;
  sevaName: string;
  totalDays: number;
  expiresAt: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">🪔 ಆಶೀರ್ವಾದ ಪತ್ರ & QR Pass Issued</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Baggona Temple Ashirvada System</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara Administrator,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        A new <strong>${data.totalDays}-Day Ashirvada QR Pass</strong> has been generated for a devotee.
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #f59e0b; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🙏 Devotee Name:</td>
            <td style="padding: 6px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.devoteeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🕉️ Seva Type:</td>
            <td style="padding: 6px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.sevaName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">👤 Issued By:</td>
            <td style="padding: 6px 0; color: #f8fafc; text-align: right;">${data.priestName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">⏳ Validity Window:</td>
            <td style="padding: 6px 0; color: #10b981; font-weight: bold; text-align: right;">${data.totalDays} Days (Expires ${data.expiresAt})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🆔 Pass Reference:</td>
            <td style="padding: 6px 0; color: #94a3b8; font-family: monospace; text-align: right;">${data.passId}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #94a3b8; font-size: 13px;">
        The devotee can scan this QR code to access daily Darshana, Panchanga transitions, and temple updates for ${data.totalDays} days.
      </p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Heritage Panchanga & Seva System
    </div>
  </div>
</body>
</html>
`;
}

export function renderDailyAppSummaryEmail(data: {
  date: string;
  totalHits: number;
  kundlisCalculated: number;
  panchangaViews: number;
  prashnaCount: number;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">📊 ದಿನದ ಅಪ್ಲಿಕೇಶನ್ ಸಾರಾಂಶ (Report 1/3)</div>
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Baggona Daily App Usage & Traffic Summary</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        ಇಂದಿನ ದಿನಾಂಕ <strong>${data.date}</strong> ರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜಾಲತಾಣದ ದೈನಂದಿನ ಒಟ್ಟಾರೆ ವೀಕ್ಷಣೆ ಮತ್ತು ಬಳಕೆದಾರರ ಚಟುವಟಿಕೆಗಳ ಸಾರಾಂಶ:
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #f59e0b; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📅 ದಿನಾಂಕ (Date):</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🌐 ಒಟ್ಟು ಭಕ್ತರ ವೀಕ್ಷಣೆಗಳು (Total Hits):</td>
            <td style="padding: 8px 0; color: #10b981; font-weight: bold; font-size: 16px; text-align: right;">${data.totalHits}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📜 ರಚಿತ ಕುಂಡಲಿಗಳು (Kundlis Generated):</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.kundlisCalculated}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🕉️ ಪಂಚಾಂಗ ದರ್ಶನಗಳು (Panchanga Views):</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.panchangaViews}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🔢 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿಗಳು:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.prashnaCount}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px;">ವರದಿ ರಚಿಸಿದ ಸಮಯ: ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      ॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈನಂದಿನ ವರದಿ ವ್ಯವಸ್ಥೆ
    </div>
  </div>
</body>
</html>
`;
}

export function renderDailyPriestUsageSummaryEmail(data: {
  date: string;
  totalActivePriests: number;
  totalCoinsSpentToday: number;
  priestBreakdown: Array<{
    priestName: string;
    username: string;
    coinsSpent: number;
    consultationsCount: number;
  }>;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">🪙 ಪುರೋಹಿತರ ಬಳಕೆ & ನಾಣ್ಯ ವೆಚ್ಚ (Report 2/3)</div>
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Daily Priest Activity & Coin Usage Summary</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        ಇಂದಿನ ದಿನಾಂಕ <strong>${data.date}</strong> ರಂದು ಪುರೋಹಿತರು ಬಳಸಿದ ಸೇವೆಗಳು ಮತ್ತು ವೆಚ್ಚವಾದ ನಾಣ್ಯಗಳ ವಿವರವಾದ ಸಾರಾಂಶ:
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #f59e0b; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">👥 ಸಕ್ರಿಯ ಪುರೋಹಿತರು:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.totalActivePriests}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🪙 ಇಂದು ವೆಚ್ಚವಾದ ಒಟ್ಟು ನಾಣ್ಯಗಳು:</td>
            <td style="padding: 8px 0; color: #f59e0b; font-weight: bold; font-size: 16px; text-align: right;">${data.totalCoinsSpentToday.toLocaleString()} Coins (₹${(data.totalCoinsSpentToday / 10).toFixed(2)})</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #fbbf24; font-size: 14px; margin-top: 20px;">ಪುರೋಹಿತರ ವಿವರವಾದ ಪಟ್ಟಿ:</h3>
      <div style="space-y: 8px;">
        ${data.priestBreakdown.length === 0 ? '<p style="color: #94a3b8; font-size: 13px;">ಇಂದು ಯಾವುದೇ ಪುರೋಹಿತರ ನಾಣ್ಯ ವೆಚ್ಚ ದಾಖಲಾಗಿಲ್ಲ.</p>' : data.priestBreakdown.map((p) => `
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #f8fafc; font-weight: bold;">
              <span>👤 ${p.priestName} (${p.username})</span>
              <span style="color: #f59e0b;">🪙 ${p.coinsSpent.toLocaleString()} Coins</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನೆಗಳು / ಪ್ರಶ್ನಾವಳಿಗಳು: ${p.consultationsCount}
            </div>
          </div>
        `).join("")}
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">ವರದಿ ರಚಿಸಿದ ಸಮಯ: ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      ॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈನಂದಿನ ವರದಿ ವ್ಯವಸ್ಥೆ
    </div>
  </div>
</body>
</html>
`;
}

export function renderDailyCoinReloadSummaryEmail(data: {
  date: string;
  totalReloadsCount: number;
  totalAmountInr: number;
  reloads: Array<{
    priestName: string;
    coins: number;
    amountInr: number;
    utr: string;
    status: string;
  }>;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">💳 ವಾಲೆಟ್ ರೀಚಾರ್ಜ್ ಸಾರಾಂಶ (Report 3/3)</div>
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Daily Wallet Recharge & Financial Reload Summary</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        ಇಂದಿನ ದಿನಾಂಕ <strong>${data.date}</strong> ರಂದು ಪುರೋಹಿತರಿಂದ ಸ್ವೀಕರಿಸಲಾದ ವಾಲೆಟ್ ನಾಣ್ಯ ರೀಚಾರ್ಜ್ ಮತ್ತು UPI ಪಾವತಿಗಳ ಸಾರಾಂಶ:
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📥 ಒಟ್ಟು ರೀಚಾರ್ಜ್ ಅರ್ಜಿಗಳು:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.totalReloadsCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">💰 ಒಟ್ಟು ರೀಚಾರ್ಜ್ ಮೊತ್ತ (INR):</td>
            <td style="padding: 8px 0; color: #10b981; font-weight: bold; font-size: 16px; text-align: right;">₹${data.totalAmountInr.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #fbbf24; font-size: 14px; margin-top: 20px;">ರೀಚಾರ್ಜ್ ವಹಿವಾಟುಗಳ ಪಟ್ಟಿ:</h3>
      <div style="space-y: 8px;">
        ${data.reloads.length === 0 ? '<p style="color: #94a3b8; font-size: 13px;">ಇಂದು ಯಾವುದೇ ಹೊಸ ರೀಚಾರ್ಜ್ ಅರ್ಜಿಗಳು ಬಂದಿಲ್ಲ.</p>' : data.reloads.map((r) => `
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #f8fafc; font-weight: bold;">
              <span>👤 ${r.priestName}</span>
              <span style="color: #10b981;">₹${r.amountInr} (🪙 ${r.coins.toLocaleString()} Coins)</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
              UTR ಸಂಖ್ಯೆ: <code style="color: #fbbf24;">${r.utr}</code> | ಸ್ಥಿತಿ: <strong>${r.status}</strong>
            </div>
          </div>
        `).join("")}
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">ವರದಿ ರಚಿಸಿದ ಸಮಯ: ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      ॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈನಂದಿನ ವರದಿ ವ್ಯವಸ್ಥೆ
    </div>
  </div>
</body>
</html>
`;
}

