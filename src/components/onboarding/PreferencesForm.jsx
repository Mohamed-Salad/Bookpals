import { useState } from "react";
import { createPreferences } from "../../services/database";
import { READING_QUESTIONS, formatUserPreferences } from "../../utils/questions";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";

// Shared reading-preferences form, driven entirely by READING_QUESTIONS so
// new questions (e.g. secondaryTypes) show up here with no JSX change.
// Used both standalone (/interests, editing preferences any time) and as
// step 3 of the onboarding wizard - onComplete decides what happens next.
export function PreferencesForm({ user, onComplete, submitLabel = "Save Preferences" }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (questionId, value) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleMultiSelect = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: prev[questionId]?.includes(value)
        ? prev[questionId].filter((v) => v !== value)
        : [...(prev[questionId] || []), value],
    }));
    if (errors[questionId]) setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedData = formatUserPreferences(formData);
      const preferences = await createPreferences(user.id, formattedData);
      onComplete(preferences);
    } catch (error) {
      if (error.message.includes("Missing required fields")) {
        const missingFields = error.message
          .replace("Missing required fields: ", "")
          .split(", ");
        const newErrors = {};
        missingFields.forEach((field) => {
          const formField =
            field === "reading_type"
              ? "readingType"
              : field === "reading_frequency"
              ? "readingFrequency"
              : field;
          newErrors[formField] = "This field is required";
        });
        setErrors(newErrors);
      } else {
        console.error("[PreferencesForm] Error saving preferences:", error);
        setErrors({ submit: "Failed to save preferences. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {READING_QUESTIONS.map((question) => (
        <div key={question.id}>
          <label className="block text-sm font-medium text-ink mb-2">
            {question.label}
          </label>

          {question.type === "text" && (
            <Input
              value={formData[question.id] || ""}
              onChange={(e) => handleChange(question.id, e.target.value)}
              placeholder={question.placeholder}
              error={errors[question.id]}
            />
          )}

          {(question.type === "button-select" || question.type === "multi-select") && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {question.options.map((option) => {
                const selected =
                  question.type === "multi-select"
                    ? formData[question.id]?.includes(option)
                    : formData[question.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      question.type === "multi-select"
                        ? handleMultiSelect(question.id, option)
                        : handleChange(question.id, option)
                    }
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border",
                      selected
                        ? "bg-accent text-white border-accent"
                        : "bg-surface text-ink border-ink/15 hover:bg-surface-raised"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {errors[question.id] && (
            <p className="mt-1 text-sm text-red-500">{errors[question.id]}</p>
          )}
        </div>
      ))}

      {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
