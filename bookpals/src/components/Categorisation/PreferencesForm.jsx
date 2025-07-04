import React, { useState, useEffect } from "react";
import { READING_QUESTIONS, formatUserPreferences } from "../../utils/questions";

export default function PreferencesForm({
  initialValues,
  onSubmit,
  submitButtonText = "Save Preferences",
}) {
  const [formData, setFormData] = useState(initialValues || {});
  const [errors, setErrors] = useState({});

  // Update form data when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);

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

  const handleButtonSelect = (questionId, value) => {
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
    // Clear error when field is modified
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format data if needed
      const formattedData = initialValues
        ? formData
        : formatUserPreferences(formData);
      await onSubmit(formattedData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      if (error.message && error.message.includes("Missing required fields")) {
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
        setErrors({ submit: "Failed to save preferences. Please try again." });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {READING_QUESTIONS.map((question) => (
        <div key={question.id} className="mb-6">
          <label className="block text-lg font-medium text-white mb-2">
            {question.label}
            {question.required && <span className="text-red-400 ml-1">*</span>}
          </label>

          {question.type === "text" && (
            <input
              type="text"
              value={formData[question.id] || ""}
              onChange={(e) => handleChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-2 bg-dark-lighter/50 border border-primary/20 rounded-lg text-white placeholder-gray-400"
            />
          )}

          {question.type === "button-select" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleButtonSelect(question.id, option)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    formData[question.id] === option
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-dark-lighter/50 text-gray-200 hover:bg-dark-lighter/70 border border-primary/20"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
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
            <p className="mt-1 text-sm text-red-400">{errors[question.id]}</p>
          )}
        </div>
      ))}

      {errors.submit && <p className="text-sm text-red-400">{errors.submit}</p>}

      <button
        type="submit"
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark"
      >
        {submitButtonText}
      </button>
    </form>
  );
}
