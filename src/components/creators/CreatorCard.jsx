import { Card } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

export function CreatorCard({ creator }) {
  const { profile, craft = [], tagline, works = [] } = creator;
  const topWork = works[0];

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar src={profile?.avatar_url} name={profile?.username} size="md" />
        <div className="min-w-0">
          <p className="font-medium text-ink truncate">
            {profile?.username || "Unknown"}
          </p>
          {tagline && <p className="text-xs text-ink-muted truncate">{tagline}</p>}
        </div>
      </div>

      {craft.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {craft.map((c) => (
            <Badge key={c} className="capitalize">
              {c}
            </Badge>
          ))}
        </div>
      )}

      {topWork ? (
        <p className="text-sm text-ink-muted truncate">
          Latest: <span className="text-ink">{topWork.title}</span>
        </p>
      ) : (
        <p className="text-sm text-ink-muted italic">No works published yet</p>
      )}
    </Card>
  );
}
