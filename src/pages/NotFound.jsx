import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useSEO } from "../hooks/useSEO";

export default function NotFound() {
  useSEO({ title: "Page Not Found", description: "This page doesn't exist on BookPals." });

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-accent-dark mb-4">404</h1>
        <p className="text-xl text-ink mb-2">Page not found</p>
        <p className="text-ink-muted mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/">
          <Button>Back to BookPals</Button>
        </Link>
      </div>
    </div>
  );
}
