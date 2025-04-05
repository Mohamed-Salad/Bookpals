import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import databaseService from "../../services/database";
import { createProfile, createPreferences } from "../../services/database";
import {
  READING_QUESTIONS,
  formatUserPreferences,
} from "../../utils/questions";

export default function Interests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error when field is modified
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleMultiSelect = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: prev[questionId]?.includes(value)
        ? prev[questionId].filter((v) => v !== value)
        : [...(prev[questionId] || []), value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format and validate data using questions.js utility
      const formattedData = formatUserPreferences(formData);

      console.log("Formatted data:", formattedData); // Add this to debug

      // Create profile and preferences using named imports
      await Promise.all([
        createProfile(user.id, formattedData.username),
        createPreferences(user.id, formattedData), // Just pass the whole formatted data
      ]);

      navigate("/home");
    } catch (error) {
      if (error.message.includes("Missing required fields")) {
        const missingFields = error.message
          .replace("Missing required fields: ", "")
          .split(", ");

        const newErrors = {};
        missingFields.forEach((field) => {
          // Map back from snake_case to form field IDs
          const formField =
            field === "reading_type"
              ? "readingType"
              : field === "reading_frequency"
              ? "readingFrequency"
              : field === "genres"
              ? "genres"
              : field === "username"
              ? "username"
              : field;

          newErrors[formField] = "This field is required";
        });

        setErrors(newErrors);
      } else {
        console.error("Error saving preferences:", error);
        setErrors({ submit: "Failed to save preferences. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-aurora-gradient py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Tell Us About Your Reading Preferences
          </h1>
          <p className="text-gray-300 mb-8">
            Help us personalize your experience by sharing your reading
            preferences and interests. This will help us connect you with
            like-minded readers and recommend relevant communities.
          </p>

          <div className="bg-dark-light/50 backdrop-blur-sm shadow-xl rounded-lg p-8 border border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-8">
              {READING_QUESTIONS.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {question.label}
                  </label>

                  {question.type === "text" && (
                    <input
                      type="text"
                      value={formData[question.id] || ""}
                      onChange={(e) =>
                        handleChange(question.id, e.target.value)
                      }
                      placeholder={question.placeholder}
                      className={`w-full px-4 py-2 bg-dark-lighter/50 border border-primary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors[question.id]
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  )}

                  {question.type === "single-select" && (
                    <select
                      value={formData[question.id] || ""}
                      onChange={(e) =>
                        handleChange(question.id, e.target.value)
                      }
                      className={`w-full px-4 py-2 bg-dark-lighter/50 border border-primary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors[question.id]
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <option value="">Select an option</option>
                      {question.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === "multi-select" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleMultiSelect(question.id, option)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            formData[question.id]?.includes(option)
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-dark-lighter/50 text-gray-200 hover:bg-dark-lighter/70 border border-primary/20"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {errors[question.id] && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors[question.id]}
                    </p>
                  )}
                </div>
              ))}

              {errors.submit && (
                <p className="text-sm text-red-400">{errors.submit}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
