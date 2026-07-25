import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createPreferences } from "../../services/database";
import { READING_QUESTIONS, formatUserPreferences } from "../../utils/questions";

export default function Interests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Debug log to see what's in formData
  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  const handleChange = (questionId, value) => {
    console.log(`Setting ${questionId} to:`, value);
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error when field is modified
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleButtonSelect = (questionId, value) => {
    console.log(`Button select: ${questionId} = ${value}`);
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
    console.log(`Multi-select: ${questionId}, toggling: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [questionId]: prev[questionId]?.includes(value)
        ? prev[questionId].filter((v) => v !== value)
        : [...(prev[questionId] || []), value],
    }));
    // Clear error when field is modified
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);

    try {
      // Format and validate data using questions.js utility
      const formattedData = formatUserPreferences(formData);
      console.log("Formatted data:", formattedData);

      // Only create preferences (no profile creation needed)
      const preferences = await createPreferences(user.id, formattedData);
      console.log("Saved preferences:", preferences);

      navigate("/home");
    } catch (error) {
      console.error("Error in handleSubmit:", error);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:bg-aurora-gradient py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tell Us About Your Reading Preferences
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            Help us personalize your experience by sharing your reading
            preferences and interests. This will help us connect you with
            like-minded readers and recommend relevant communities.
          </p>

          <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-lg p-8 border border-gray-200 dark:border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-8">
              {READING_QUESTIONS.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                      className={`w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-primary/20 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors[question.id]
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                  )}

                  {/* New button-select type for single selection with buttons */}
                  {question.type === "button-select" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {question.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleButtonSelect(question.id, option)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            formData[question.id] === option
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600/70 border border-gray-300 dark:border-primary/20"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Keep existing multi-select */}
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
                              : "bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600/70 border border-gray-300 dark:border-primary/20"
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
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
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
