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
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">📊 ದಿನದ ಅಪ್ಲಿಕೇಶನ್ ಸಾರಾಂಶ (Report 1/4)</div>
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
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">🪙 ಪುರೋಹಿತರ ಬಳಕೆ & ನಾಣ್ಯ ವೆಚ್ಚ (Report 2/4)</div>
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
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">💳 ವಾಲೆಟ್ ರೀಚಾರ್ಜ್ ಸಾರಾಂಶ (Report 3/4)</div>
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

export function renderDailyPremiumPdfSummaryEmail(data: {
  date: string;
  totalDownloadsCount: number;
  totalCoinsSpent: number;
  totalAmountInr: number;
  downloads: Array<{
    devoteeName: string;
    username: string;
    priestName?: string;
    portalSource: string;
    language: string;
    coinsSpent: number;
    amountInr: number;
    time: string;
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
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">📄 ಪ್ರೀಮಿಯಂ PDF ಡೌನ್‌ಲೋಡ್ ಸಾರಾಂಶ (Report 4/4)</div>
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Daily Premium PDF Downloads & Bhavishya Synthesis Summary</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ,</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        ಇಂದಿನ ದಿನಾಂಕ <strong>${data.date}</strong> ರಂದು ಬಗ್ಗೋಣ ಭವಿಷ್ಯ ಹಾಗೂ ಪುರೋಹಿತ ಪೋರ್ಟಲ್‌ನಿಂದ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾದ ಪ್ರೀಮಿಯಂ PDF ಜಾತಕ ಪತ್ರಿಕೆಗಳ ವಿವರವಾದ ಸಾರಾಂಶ:
      </p>
      
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #6366f1; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">📄 ಒಟ್ಟು ಪ್ರೀಮಿಯಂ PDF ಡೌನ್‌ಲೋಡ್‌ಗಳು:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.totalDownloadsCount} Downloads</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🪙 ಒಟ್ಟು ವೆಚ್ಚವಾದ ನಾಣ್ಯಗಳು:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; font-size: 16px; text-align: right;">${data.totalCoinsSpent.toLocaleString()} Coins</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">💰 ಒಟ್ಟು ಮೌಲ್ಯ (INR Equivalent):</td>
            <td style="padding: 8px 0; color: #10b981; font-weight: bold; font-size: 16px; text-align: right;">₹${data.totalAmountInr.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #fbbf24; font-size: 14px; margin-top: 20px;">ಇಂದು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದವರ ವಿವರವಾದ ಪಟ್ಟಿ:</h3>
      <div style="space-y: 8px;">
        ${data.downloads.length === 0 ? '<p style="color: #94a3b8; font-size: 13px;">ಇಂದು ಯಾವುದೇ ಪ್ರೀಮಿಯಂ PDF ಡೌನ್‌ಲೋಡ್‌ಗಳು ದಾಖಲಾಗಿಲ್ಲ.</p>' : data.downloads.map((d) => `
          <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #f8fafc; font-weight: bold;">
              <span>👤 ${d.devoteeName} (${d.language.toUpperCase()})</span>
              <span style="color: #fbbf24;">🪙 ${d.coinsSpent.toLocaleString()} Coins (₹${d.amountInr})</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; display: flex; justify-content: space-between;">
              <span>ಮೂಲ: <strong>${d.portalSource}</strong> ${d.priestName ? `• ${d.priestName} (${d.username})` : `• ${d.username}`}</span>
              <span style="color: #cbd5e1; font-family: monospace;">${d.time}</span>
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


export function renderSystemFailureAlertEmail(data: {
  username: string;
  priestName: string;
  action: string;
  attemptedCoins: number;
  errorMessage: string;
  clientIp?: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%); color: #ffffff; padding: 24px; text-align: center;">
      <div style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">⚠️ ಸಿಸ್ಟಮ್ ವೈಫಲ್ಯ ಎಚ್ಚರಿಕೆ</div>
      <div style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Critical System Operation & Coin Failure Alert</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fca5a5; margin-top: 0;"><strong>ಗಮನಿಸಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೇ (Super Admin),</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        ಪುರೋಹಿತರ ಖಾತೆಯಲ್ಲಿ ಸೇವೆಯನ್ನು ಒದಗಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ಸುರಕ್ಷತೆಗಾಗಿ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮರುಪಾವತಿಸಲಾಗಿದೆ (Auto-Rolled Back).
      </p>
      
      <div style="background: rgba(220, 38, 38, 0.15); border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">👤 ಪುರೋಹಿತರ ಹೆಸರು:</td>
            <td style="padding: 8px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.priestName} (${data.username})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">⚡ ಪ್ರಯತ್ನಿಸಿದ ಸೇವೆ:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; text-align: right;">${data.action}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🪙 ನಾಣ್ಯಗಳ ಮೊತ್ತ:</td>
            <td style="padding: 8px 0; color: #38bdf8; font-weight: bold; text-align: right;">${data.attemptedCoins} Coins</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">❌ ದೋಷ ವಿವರ:</td>
            <td style="padding: 8px 0; color: #f87171; font-family: monospace; text-align: right;">${data.errorMessage}</td>
          </tr>
          ${data.clientIp ? `<tr><td style="padding: 8px 0; color: #94a3b8;">🌐 IP ವಿಳಾಸ:</td><td style="padding: 8px 0; color: #94a3b8; font-family: monospace; text-align: right;">${data.clientIp}</td></tr>` : ''}
        </table>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">ಸಮಯ: ${data.timestamp}</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      ॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಭದ್ರತಾ ಎಚ್ಚರಿಕೆ
    </div>
  </div>
</body>
</html>
`;
}

export function renderMfaOtpEmail(data: {
  username: string;
  otpCode: string;
  expiresAt: string;
  recipientEmail: string;
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
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">🔒 Security Verification Code</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fbbf24; margin-top: 0;"><strong>Namaskara ${data.username},</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">Your 6-digit Multi-Factor Authentication (MFA) verification code for Baggona Panchanga Portal is:</p>
      
      <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">6-Digit Security OTP</div>
        <div style="font-size: 36px; font-family: monospace; font-weight: 900; letter-spacing: 12px; color: #fef08a; text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);">${data.otpCode}</div>
        <div style="font-size: 12px; color: #f87171; font-weight: bold; margin-top: 10px;">⏱️ Valid for 3 minutes only (expires at ${data.expiresAt})</div>
      </div>
      
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 10px; padding: 14px; margin: 16px 0; font-size: 13px;">
        <div style="color: #94a3b8;">📧 Sent to: <strong style="color: #f8fafc;">${data.recipientEmail}</strong></div>
        <div style="color: #94a3b8; margin-top: 4px;">🕒 Request Time: <strong style="color: #f8fafc;">${data.timestamp}</strong></div>
      </div>
      
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">If you did not initiate this login request, please contact the administrator immediately.</p>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Heritage Panchanga & Astrology • Gokarna Tradition • Confidential Security Notice
    </div>
  </div>
</body>
</html>
`;
}

export function renderLowAiQuotaAlertEmail(data: {
  remaining: number;
  totalToday: number;
  dailyLimit: number;
  timestamp: string;
  featureBreakdown?: Record<string, number>;
}): string {
  const featuresHtml = data.featureBreakdown
    ? Object.entries(data.featureBreakdown)
        .map(([k, v]) => `<tr><td style="padding: 4px 8px; color: #cbd5e1;">${k}</td><td style="padding: 4px 8px; color: #fbbf24; font-weight: bold; text-align: right;">${v} calls</td></tr>`)
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="${HEADER_STYLES}">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px;">⚠️ AI ಕೋಟಾ ಎಚ್ಚರಿಕೆ (Low AI Quota Alert)</div>
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Last ${data.remaining} AI Requests Remaining Today</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #f87171; margin-top: 0;"><strong>ತುರ್ತು ಸೂಚನೆ (Urgent Notice) - Super Admin:</strong></p>
      <p style="color: #cbd5e1; font-size: 14px;">
        ಇಂದಿನ ದಿನದ Gemini AI ಕೋಟಾದಲ್ಲಿ ಕೇವಲ <strong>${data.remaining}</strong> ಕರೆಗಳು ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿವೆ. ಬಳಕೆದಾರರು ಅಥವಾ ಪುರೋಹಿತರು AI ಪ್ರಶ್ನೆಗಳನ್ನು ಮುಂದುವರಿಸುವ ಮುನ್ನ ದಯವಿಟ್ಟು ಗಮನಿಸಿ.
      </p>
      
      <div style="background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🎯 ಉಳಿದಿರುವ AI ಕರೆಗಳು:</td>
            <td style="padding: 6px 0; color: #ef4444; font-weight: 900; font-size: 18px; text-align: right;">${data.remaining} / ${data.dailyLimit}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">⚡ ಇಂದಿನ ಒಟ್ಟು ಬಳಕೆ:</td>
            <td style="padding: 6px 0; color: #fef08a; font-weight: bold; text-align: right;">${data.totalToday} Calls</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🕒 ಸಮಯ (Timestamp):</td>
            <td style="padding: 6px 0; color: #cbd5e1; text-align: right;">${data.timestamp}</td>
          </tr>
        </table>
      </div>

      ${featuresHtml ? `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 10px; padding: 14px; margin: 16px 0;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">ಇಂದಿನ ಮಾಡ್ಯೂಲ್ ವಿವರ (Feature Breakdown)</div>
        <table style="width: 100%; font-size: 13px;">${featuresHtml}</table>
      </div>` : ""}
      
      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #f59e0b; border-radius: 10px; padding: 14px; margin: 16px 0; font-size: 13px; color: #fef08a;">
        <strong>💡 ಮುಂದಿನ ಕ್ರಮಗಳು (Recommended Actions):</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 20px; color: #cbd5e1;">
          <li>Super Admin ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ API Key ನವೀಕರಿಸಿ ಅಥವಾ ಹೆಚ್ಚುವರಿ ಕೋಟಾ ಸಕ್ರಿಯಗೊಳಿಸಿ.</li>
          <li>ಅಗತ್ಯವಿದ್ದರೆ ಹೆಚ್ಚಿನ ಪುರೋಹಿತರ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಂಯಮ ವಹಿಸಲು ತಿಳಿಸಿ.</li>
        </ul>
      </div>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Panchanga AI Quota Sentinel • Gokarna Heritage Automation
    </div>
  </div>
</body>
</html>
`;
}

export function renderSarvamCriticalQuotaEmail(data: {
  totalQuota: number;
  consumed: number;
  remaining: number;
  remainingPercentage: number;
  totalCalls: number;
  lastSnippet?: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLES}">
  <div style="${CARD_STYLES}">
    <div style="background: linear-gradient(135deg, #7f1d1d, #991b1b, #450a0a); padding: 24px; text-align: center; border-bottom: 2px solid #ef4444;">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px; color: #fee2e2;">🚨 ತುರ್ತು ಎಚ್ಚರಿಕೆ (CRITICAL ALERT)</div>
      <div style="font-size: 14px; font-weight: 700; color: #fca5a5; text-transform: uppercase; letter-spacing: 2px;">Sarvam AI Voice Quota Below 10%</div>
    </div>
    
    <div style="padding: 24px; line-height: 1.6;">
      <p style="font-size: 16px; color: #fca5a5; margin-top: 0;"><strong>ನಮಸ್ಕಾರ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ / ಅಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್ (Namaskara Administrator),</strong></p>
      
      <p style="color: #cbd5e1; font-size: 14px;">
        ನಮ್ಮ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಧ್ವನಿ ಕ್ಲೋನ್ ಮತ್ತು ಮಂತ್ರ ಪಠಣಕ್ಕಾಗಿ ಬಳಸಲಾಗುವ <strong>Sarvam AI Indic Neural Voice (Bulbul:v1)</strong> ಕೋಟಾವು <strong>${data.remainingPercentage.toFixed(1)}%</strong> ಗೆ ಇಳಿದಿದೆ.
      </p>

      <div style="background: rgba(127, 29, 29, 0.4); border: 2px solid #ef4444; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #fca5a5;">⚠️ ಉಳಿದ ಕೋಟಾ (Remaining Quota):</td>
            <td style="padding: 6px 0; color: #ef4444; font-weight: 900; font-size: 18px; text-align: right;">${data.remaining.toLocaleString()} chars (${data.remainingPercentage.toFixed(1)}%)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">📊 ಒಟ್ಟು ಮಿತಿ (Total Quota):</td>
            <td style="padding: 6px 0; color: #f8fafc; font-weight: bold; text-align: right;">${data.totalQuota.toLocaleString()} chars</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🎙️ ಬಳಸಲಾದ ಅಕ್ಷರಗಳು (Consumed):</td>
            <td style="padding: 6px 0; color: #fef08a; font-weight: bold; text-align: right;">${data.consumed.toLocaleString()} chars</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">⚡ ಒಟ್ಟು TTS ಧ್ವನಿ ವಿನಂತಿಗಳು:</td>
            <td style="padding: 6px 0; color: #f8fafc; text-align: right;">${data.totalCalls} Calls</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">🕒 ಎಚ್ಚರಿಕೆ ಸಮಯ (Timestamp):</td>
            <td style="padding: 6px 0; color: #cbd5e1; text-align: right;">${data.timestamp}</td>
          </tr>
        </table>
      </div>

      <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #fef08a;">
        <strong>💡 ತಕ್ಷಣ ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು (Immediate Action Steps):</strong>
        <ol style="margin: 8px 0 0 0; padding-left: 20px; color: #cbd5e1; line-height: 1.7;">
          <li><a href="https://dashboard.sarvam.ai" target="_blank" style="color: #f59e0b; font-weight: bold; text-decoration: underline;">dashboard.sarvam.ai</a> ಗೆ ಲಾಗಿನ್ ಆಗಿ ನಿಮ್ಮ ಸಬ್‌ಸ್ಕ್ರಿಪ್ಷನ್ ಬ್ಯಾಲೆನ್ಸ್ ರೀಚಾರ್ಜ್ ಮಾಡಿ.</li>
          <li>ಅಥವಾ Super Admin ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ನೂತನ Sarvam AI API Key ಅನ್ನು ನವೀಕರಿಸಿ.</li>
        </ol>
      </div>
    </div>
    
    <div style="${FOOTER_STYLES}">
      Baggona Panchanga Telemetry & Voice Sentinel • Gokarna Heritage Automation
    </div>
  </div>
</body>
</html>
`;
}




