import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import Navbar from './Navbar';
import { auth } from './Supabase';
// import { validatePassword, validateEmail } from './utils/authValidation';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setErrors(prev => ({
          ...prev,
          submit: error.message
        }));
        return;
      }

      // Redirect immediately after successful signup
      navigate('/interests');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'An unexpected error occurred. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Navbar">
      <Navbar />
      <div className="Background"></div>
      <div className="signup-container">
        <div className="signup-card">
          <h2>Create Account</h2>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Create a password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            {errors.submit && <div className="error-message">{errors.submit}</div>}

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-links">
            <p>Already have an account? <a href="/login">Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
