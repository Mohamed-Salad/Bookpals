import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { slideIn } from "../utils/animations";
import { signIn, signInWithProvider } from "../services/auth";
import { getPreferences } from "../services/database";
import { useSEO } from "../hooks/useSEO";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Login() {
  useSEO({
    title: "Log In",
    description: "Log in to your BookPals account to connect with your reading community.",
  });
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const { user } = await signIn(values.email, values.password);
      setUser(user);
      // First login (no preferences saved yet) goes through onboarding;
      // returning users go straight to Home. getPreferences returns null
      // (doesn't throw) when there's nothing saved yet - the catch here is
      // only for a genuine fetch failure, which we also route to onboarding
      // as a safe fallback.
      try {
        const prefs = await getPreferences(user.id);
        navigate(prefs ? "/home" : "/onboarding");
      } catch {
        navigate("/onboarding");
      }
    } catch (error) {
      setError(error.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithProvider(provider);
    } catch (error) {
      setError(error.message || "Failed to sign in with " + provider);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-paper flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div variants={slideIn} initial="initial" animate="animate" className="max-w-md w-full">
        <Card className="space-y-8 p-8 backdrop-blur-sm bg-surface/90">
          <div>
            <h1 className="sr-only">Log In to BookPals</h1>
            <h2 className="font-display text-center text-3xl font-extrabold text-ink">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-ink-muted">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-accent-dark hover:underline">
                Sign up here
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 p-4"
                >
                  <div className="text-sm text-red-400">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={values.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={values.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-ink-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                className="rounded-md shadow-sm"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialLogin("github")}
                disabled={loading}
                className="rounded-md shadow-sm"
              >
                <span className="sr-only">Sign in with GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
