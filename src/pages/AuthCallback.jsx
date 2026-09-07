import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { handleAuthCallback } from "../services/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const { user } = await handleAuthCallback();
        setUser(user);
        navigate("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(error.message || "Failed to process authentication");
      }
    };

    processCallback();
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-ink">
              Authentication Error
            </h2>
            <p className="mt-2 text-center text-sm text-ink-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-ink">
            Processing Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-ink-muted">
            Please wait while we complete your authentication...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
