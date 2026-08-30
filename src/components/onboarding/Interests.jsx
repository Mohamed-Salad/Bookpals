import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../ui/Card";
import { PreferencesForm } from "./PreferencesForm";

export default function Interests() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-ink mb-4">
          Tell Us About Your Reading Preferences
        </h1>
        <p className="text-ink-muted mb-8">
          Help us personalize your experience by sharing your reading
          preferences and interests. This will help us connect you with
          like-minded readers and recommend relevant communities.
        </p>

        <Card className="p-8">
          <PreferencesForm user={user} onComplete={() => navigate("/home")} />
        </Card>
      </div>
    </div>
  );
}
