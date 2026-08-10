import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — girlMath expense tracker" },
      {
        name: "description",
        content:
          "Sign in or create a free girlMath account to track daily expenses, categories and monthly spending in one calm dashboard.",
      },
      { property: "og:title", content: "Sign in to girlMath" },
      {
        property: "og:description",
        content:
          "Access your girlMath expense tracker — email or Google sign-in, and your spending history stays private to you.",
      },
      { property: "og:url", content: "https://luxe-cents.lovable.app/auth" },
    ],
    links: [{ rel: "canonical", href: "https://luxe-cents.lovable.app/auth" }],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        navigate({ to: "/" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/" });
        } else if (data.user) {
          // Auto-confirm enabled → sign in immediately.
          const { data: s, error: sErr } = await supabase.auth.signInWithPassword({ email, password });
          if (sErr) {
            setInfo("Account created. Check your email to confirm, then sign in.");
            setMode("signin");
          } else if (s.session) {
            navigate({ to: "/" });
          }
        }
      }
    } catch (err) {
      const msg = (err as Error).message ?? "Something went wrong";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err) {
      setError((err as Error).message ?? "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight text-primary num">girlMath</div>
          <div className="mt-1 text-xs text-muted-foreground tracking-wide">
            A calmer expense tracker
          </div>
        </div>

        <div className="rounded-3xl bg-surface p-6 shadow-lift">
          <div className="text-sm text-muted-foreground text-center mb-5">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="w-full h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-foreground text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground/70">
            <div className="h-px flex-1 bg-white/[0.06]" />
            or
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-white/20 transition"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-white/20 transition"
            />

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground"
              >
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ boxShadow: "var(--shadow-accent)" }}
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-foreground hover:text-primary transition"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-foreground hover:text-primary transition"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
