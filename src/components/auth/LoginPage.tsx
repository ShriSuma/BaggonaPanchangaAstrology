import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../features/auth/authStore";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    step,
    maskedEmail,
    mfaEmail,
    activeOtp,
    login,
    verifyMfaOtp,
    resendMfaOtp,
    cancelMfa
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
        setInfoMessage(`A 6-digit verification code has been dispatched to ${mfaEmail}`);
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

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setInfoMessage(null);
    try {
      const res = await resendMfaOtp();
      if (res.success) {
        setInfoMessage(`New verification code sent to ${mfaEmail}`);
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
            {step === "mfa_pending" ? "🔒" : "🕉️"}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-amber-200">
            {step === "mfa_pending" ? "Security Verification" : "Baggona Panchanga Portal"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === "mfa_pending"
              ? `Enter the 6-digit MFA code sent to ${maskedEmail}`
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

        {/* Development / Testing OTP Helper Banner */}
        {step === "mfa_pending" && activeOtp && (
          <div className="mb-6 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-center font-mono">
            <div className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">
              📩 Email Sent to {mfaEmail}
            </div>
            <div className="text-sm font-bold text-amber-200 mt-1">
              🔑 OTP Code: <span className="underline decoration-amber-500 underline-offset-4">{activeOtp}</span>
            </div>
          </div>
        )}

        {step === "credentials" ? (
          /* STEP 1: Username & Password Form */
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80 mb-2">
                Password
              </label>
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
        ) : (
          /* STEP 2: 6-Digit MFA OTP Verification Form */
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
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend OTP Code"}
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
