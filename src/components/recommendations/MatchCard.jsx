import { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { sendFriendRequest } from "../../services/database";
import { useAuth } from "../../context/AuthContext";

const pct = (n) => `${Math.round((n ?? 0) * 100)}%`;
const tick = (n) => (n >= 1 ? "✓" : n > 0 ? "~" : "✗");

// Renders a match_users RPC row (supabase/migrations/0002_matching.sql).
// Also accepts the older flat placeholder shape ({ username, score,
// sharedGenres }) so it keeps working anywhere it hasn't been swapped over.
export function MatchCard({ match }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    user_id,
    username,
    avatar_url,
    score,
    shared_genres = [],
    genre_score = 0,
    type_score = 0,
    author_score = 0,
    freq_score = 0,
    format_score = 0,
    time_score = 0,
  } = match;

  const handleConnect = async () => {
    if (!user?.id || connecting) return;
    setConnecting(true);
    try {
      await sendFriendRequest(user.id, user_id);
      setSent(true);
      toast.success(`Connection request sent to ${username}.`);
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    } catch (error) {
      toast.error(error.message || "Couldn't send connection request.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Card className="flex flex-col items-center text-center gap-2 p-4">
      <Avatar src={avatar_url} name={username} size="lg" />
      <p className="font-medium text-ink">{username}</p>

      <Popover className="relative">
        <PopoverButton className="focus:outline-none">
          <Badge variant="accent">{pct(score)} match</Badge>
        </PopoverButton>
        <PopoverPanel
          anchor="bottom"
          className="z-20 mt-2 w-56 rounded-lg border border-ink/10 bg-surface p-3 text-left text-xs text-ink-muted shadow-lg"
        >
          <p className="flex justify-between">
            <span>Genres</span> <span>{pct(genre_score)}</span>
          </p>
          <p className="flex justify-between">
            <span>Reading type</span> <span>{tick(type_score)}</span>
          </p>
          <p className="flex justify-between">
            <span>Authors</span> <span>{pct(author_score)}</span>
          </p>
          <p className="flex justify-between">
            <span>Frequency</span> <span>{tick(freq_score)}</span>
          </p>
          <p className="flex justify-between">
            <span>Format</span> <span>{tick(format_score)}</span>
          </p>
          <p className="flex justify-between">
            <span>Time of day</span> <span>{tick(time_score)}</span>
          </p>
        </PopoverPanel>
      </Popover>

      {shared_genres.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {shared_genres.slice(0, 2).map((g) => (
            <Badge key={g}>{g}</Badge>
          ))}
        </div>
      )}

      <Button
        variant={sent ? "secondary" : "primary"}
        className="w-full mt-1"
        disabled={connecting || sent}
        onClick={handleConnect}
      >
        {sent ? "Request sent" : connecting ? "Sending…" : "Connect"}
      </Button>
    </Card>
  );
}
