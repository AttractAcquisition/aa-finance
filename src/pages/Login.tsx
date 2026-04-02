import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-primary animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  const handleOAuth = async (provider: "google") => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) { setError("Enter your email address first."); return; }
    setError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setSubmitting(false);
    if (error) setError(error.message);
    else setMagicSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-8 py-5 flex items-center justify-between">
        <div>
          <p className="label-mono text-primary">Attract Acquisition</p>
          <p className="font-mono text-[10px] text-white-45 tracking-[0.08em] mt-0.5">
            Brand Infrastructure for Service Businesses
          </p>
        </div>
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-primary bg-teal-dim border border-teal-border rounded-[3px] px-2.5 py-1">
          Internal Portal
        </span>
      </header>

      {/* Login card */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[380px]">
          <div className="bg-card border border-border rounded-md p-8">
            {/* Logo / heading */}
            <div className="mb-8">
              <p className="label-mono text-primary mb-2">Secure Access</p>
              <h1 className="font-display text-2xl font-semibold text-foreground leading-tight">
                Sign in to your <span className="text-primary">account</span>
              </h1>
              <p className="text-[13px] text-white-45 mt-2">
                Access is restricted to authorised Attract Acquisition team members.
              </p>
            </div>

            {/* OAuth */}
            <button
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 bg-muted border border-border rounded-[5px] px-4 py-2.5 font-mono text-[12px] tracking-[0.06em] text-foreground hover:border-primary hover:text-primary transition-colors mb-6"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white-45">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email / password form */}
            {magicSent ? (
              <div className="text-center py-4">
                <p className="font-mono text-[12px] text-primary mb-1">Check your inbox</p>
                <p className="text-[13px] text-white-45">
                  A magic link has been sent to <span className="text-white-80">{email}</span>. Click it to sign in.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="label-mono text-primary block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full h-10 bg-muted border border-border rounded-[5px] px-3 font-mono text-[13px] text-foreground placeholder:text-white-45 outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="label-mono text-primary block mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-10 bg-muted border border-border rounded-[5px] px-3 font-mono text-[13px] text-foreground placeholder:text-white-45 outline-none focus:border-primary transition-colors"
                  />
                </div>

                {error && (
                  <p className="font-mono text-[11px] text-loss">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 bg-primary text-primary-foreground font-mono text-[12px] tracking-[0.08em] uppercase rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "…" : mode === "signin" ? "Sign In" : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={submitting}
                  className="w-full font-mono text-[11px] tracking-[0.06em] text-white-45 hover:text-primary transition-colors"
                >
                  Send magic link instead
                </button>
              </form>
            )}

            {/* Toggle signin/signup */}
            {!magicSent && (
              <p className="text-center font-mono text-[11px] text-white-45 mt-6">
                {mode === "signin" ? "No account? " : "Already have access? "}
                <button
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                  className="text-primary hover:opacity-80 transition-opacity"
                >
                  {mode === "signin" ? "Request access" : "Sign in"}
                </button>
              </p>
            )}
          </div>

          <p className="text-center font-mono text-[10px] text-white-45 mt-6 tracking-[0.08em]">
            Brand = Proof × Volume × Consistency
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
