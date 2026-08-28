import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

// Placeholder card for the Home feed's "Top matches" rail - Phase 3 wires
// this to the real match_users RPC (score + shared genres). Renders
// whatever shape it's given so it can be swapped to live data without a
// prop-shape rewrite: { username, avatar_url, score, sharedGenres }.
export function MatchCard({ username, avatar_url, score, sharedGenres = [] }) {
  return (
    <Card className="flex flex-col items-center text-center gap-2 p-4">
      <Avatar src={avatar_url} name={username} size="lg" />
      <p className="font-medium text-ink">{username}</p>
      {typeof score === "number" && (
        <Badge variant="accent">{Math.round(score * 100)}% match</Badge>
      )}
      {sharedGenres.length > 0 && (
        <p className="text-xs text-ink-muted truncate w-full">
          {sharedGenres.slice(0, 2).join(", ")}
        </p>
      )}
    </Card>
  );
}
