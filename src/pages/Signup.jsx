import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { slideIn } from "../utils/animations";
import { validateUsername } from "../utils/questions";
import { signUp, signInWithProvider } from "../services/auth";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (!values.username) {
      errors.username = "Username is required";
    } else {
      const usernameError = validateUsername(values.username);
      if (usernameError) {
        errors.username = usernameError;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      const { user } = await signUp(
        values.email,
        values.password,
        values.username
      );
      setUser(user);
      navigate("/onboarding");
    } catch (error) {
      setError(error.message || "Failed to sign up. Please try again.");
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
            <h2 className="font-display text-center text-3xl font-extrabold text-ink">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-ink-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-accent-dark hover:underline">
                Sign in here
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
                id="username"
                name="username"
                type="text"
                label="Username"
                value={values.username}
                onChange={handleChange}
                placeholder="Choose a username"
                error={formErrors.username}
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={values.email}
                onChange={handleChange}
                placeholder="Enter your email"
                error={formErrors.email}
              />
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={values.password}
                onChange={handleChange}
                placeholder="Create a password"
                error={formErrors.password}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
