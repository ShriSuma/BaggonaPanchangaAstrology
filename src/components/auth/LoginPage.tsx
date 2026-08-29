import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../features/auth/authStore";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotInput, setForgotInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    step,
    maskedEmail,
    mfaEmail,
    resetUsername,
    login,
    verifyMfaOtp,
    resendMfaOtp,
    cancelMfa,
    openForgotPassword,
    requestPasswordReset,
    verifyResetOtpAndSetPassword,
    cancelPasswordReset
  } = useAuthStore();

  // Handle resend timer countdown
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error ?? "Invalid login credentials.");
      } else if (res.requiresMfa) {
        setInfoMessage(`A 6-digit verification code has been dispatched to ${mfaEmail}. Valid for 3 minutes.`);
        setResendCooldown(30);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const res = await verifyMfaOtp(cleanOtp);
      if (!res.success) {
        setError(res.error ?? "Verification failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setError("Please enter your username or registered email.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const res = await requestPasswordReset(forgotInput);
      if (res.success) {
        setInfoMessage(`Password reset code sent to ${mfaEmail} (valid for 3 minutes).`);
        setResendCooldown(30);
      } else {
        setError(res.error ?? "Failed to request password reset.");
      }
    } catch (err) {
      setError("Failed to process request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const res = await verifyResetOtpAndSetPassword(otp, newPassword);
      if (res.success) {
        setInfoMessage("Password updated successfully! Please log in with your new password.");
        setPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.error ?? "Failed to reset password.");
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setInfoMessage(null);
    try {
      const res = await resendMfaOtp();
      if (res.success) {
        setInfoMessage(`New verification code sent to ${mfaEmail} (valid for 3 minutes).`);
        setResendCooldown(30);
        setOtp("");
      } else {
        setError(res.error ?? "Failed to resend code.");
      }
    } catch (err) {
      setError("Failed to resend verification code.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-amber-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold text-2xl shadow-lg shadow-amber-500/20 mb-4">
            {step === "mfa_pending"
              ? "🔒"
              : step === "forgot_password" || step === "reset_password"
              ? "🔑"
              : "🕉️"}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-200">
            {step === "mfa_pending"
              ? "Security Verification"
              : step === "forgot_password"
              ? "Reset Your Password"
              : step === "reset_password"
              ? "Create New Password"
              : "Baggona Panchanga Portal"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === "mfa_pending"
              ? `Enter the 6-digit MFA code sent to ${maskedEmail}`
              : step === "forgot_password"
              ? "Enter your account username to receive a reset code"
              : step === "reset_password"
              ? `Enter code sent to ${maskedEmail} and choose a new password`
              : "Please log in with your credentials to access the portal"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <span>📧</span>
            <span>{infoMessage}</span>
          </div>
        )}

        {/* STEP 1: Login Credentials */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. baggona or $hriSuma"
                className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    openForgotPassword();
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In & Request OTP</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: MFA OTP Verification */}
        {step === "mfa_pending" && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full px-4 py-3 bg-slate-950/90 border border-amber-500/40 rounded-xl text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all text-2xl font-mono text-center tracking-[0.5em] font-bold"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & Complete Sign In</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
              <button
                type="button"
                onClick={() => {
                  cancelMfa();
                  setError(null);
                  setInfoMessage(null);
                  setOtp("");
                }}
                className="hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-amber-400 hover:text-amber-300 disabled:text-slate-600 font-semibold transition-colors disabled:no-underline underline underline-offset-2"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP Code"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Forgot Password (Enter Username/Email) */}
        {step === "forgot_password" && (
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2">
                Your Account Username
              </label>
              <input
                type="text"
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                placeholder="e.g. baggona or superadmin"
                className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Sending Reset Code..." : "Send Reset Code via Email"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  cancelPasswordReset();
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-2"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Reset Password (Enter OTP + New Password) */}
        {step === "reset_password" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-1 text-center">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full px-4 py-2.5 bg-slate-950/90 border border-amber-500/40 rounded-xl text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 text-xl font-mono text-center tracking-[0.4em] font-bold"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-amber-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-amber-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6 || !newPassword}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Updating Password..." : "Save New Password & Log In"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  cancelPasswordReset();
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-2"
              >
                ← Cancel & Return to Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          Gokarna Heritage Panchanga & Security System
        </div>
      </div>
    </div>
  );
};
