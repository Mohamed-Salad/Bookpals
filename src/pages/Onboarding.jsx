import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/database";
import { PreferencesForm } from "../components/onboarding/PreferencesForm";
import RecommendedCommunities from "../components/recommendations/RecommendedCommunities";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { cn } from "../components/ui/cn";
import { useSEO } from "../hooks/useSEO";

const STEPS = ["Welcome", "Role", "Interests", "Communities"];

const ROLES = [
  { value: "reader", label: "Reader" },
  { value: "creator", label: "Creator" },
  { value: "both", label: "Both" },
];

function StepProgress({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex-1">
          <div
            className={cn(
              "h-1.5 rounded-full",
              i <= step ? "bg-accent-dark" : "bg-ink/10"
            )}
          />
          <p className="mt-1 text-xs text-ink-muted hidden sm:block">{label}</p>
        </div>
      ))}
    </div>
  );
}

// Post-signup wizard: display name/pronouns -> role -> reading preferences
// (existing PreferencesForm, reused as-is) -> suggested communities. Each
// step saves as it goes so leaving mid-flow doesn't lose earlier answers.
export default function Onboarding() {
  useSEO({ title: "Welcome", description: "Set up your BookPals profile and reading preferences." });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [role, setRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveWelcome = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile(user.id, {
        display_name: displayName.trim(),
        pronouns: pronouns.trim() || null,
      });
      setStep(1);
    } catch (err) {
      setError(err.message || "Couldn't save that, try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveRole = async (value) => {
    setRole(value);
    setSaving(true);
    setError(null);
    try {
      await updateProfile(user.id, { role: value });
      setStep(2);
    } catch (err) {
      setError(err.message || "Couldn't save that, try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <StepProgress step={step} />

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {step === 0 && (
          <Card className="p-8">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              Welcome to BookPals
            </h1>
            <p className="text-ink-muted mb-6">
              Let's set up your profile. Pronouns are optional.
            </p>
            <form onSubmit={saveWelcome} className="space-y-4">
              <Input
                label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                required
              />
              <Input
                label="Pronouns (optional)"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. she/her, he/him, they/them"
              />
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Continue"}
              </Button>
            </form>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-8">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              I'm here as a...
            </h1>
            <p className="text-ink-muted mb-6">
              This just helps us tailor what you see - you can change it later.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  disabled={saving}
                  onClick={() => saveRole(value)}
                  className={cn(
                    "px-4 py-6 rounded-lg text-sm font-medium border transition-colors",
                    role === value
                      ? "bg-accent-dark text-white border-accent-dark"
                      : "bg-surface text-ink border-ink/15 hover:bg-surface-raised"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              Your reading preferences
            </h1>
            <p className="text-ink-muted mb-6">
              This is how we find readers and communities you'll actually like.
            </p>
            <PreferencesForm
              user={user}
              submitLabel="Continue"
              onComplete={() => setStep(3)}
            />
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              Communities you might like
            </h1>
            <p className="text-ink-muted mb-6">
              Based on your genres - join now or explore later from Discover.
            </p>
            <RecommendedCommunities limit={6} />
            <Button onClick={() => navigate("/home")} className="w-full mt-6">
              Finish
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
