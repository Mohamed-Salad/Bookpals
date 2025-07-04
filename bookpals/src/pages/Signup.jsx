import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideIn } from "../utils/animations";
import { validateUsername } from "../utils/questions";
import { signUp, signInWithProvider } from "../services/auth";

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
      navigate("/interests");
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
      className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-slate-900 dark:to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        variants={slideIn}
        initial="initial"
        animate="animate"
        className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg border border-gray-200 dark:border-primary/20 shadow-xl"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            <input
              id="username"
              name="username"
              type="text"
              value={values.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            />
            {formErrors.username && (
              <span className="text-red-500">{formErrors.username}</span>
            )}

            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            />
            {formErrors.email && (
              <span className="text-red-500">{formErrors.email}</span>
            )}

            <input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            />
            {formErrors.password && (
              <span className="text-red-500">{formErrors.password}</span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
