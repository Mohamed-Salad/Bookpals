import { useEffect, useState } from "react";
import {
  CRAFTS,
  getCreatorProfile,
  upsertCreatorProfile,
  getWorksByCreator,
  createWork,
  updateWork,
  deleteWork,
  uploadWorkCover,
} from "../../services/creatorService";
import { GENRES } from "../../utils/questions";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "../ui/cn";

const EMPTY_WORK = { title: "", work_type: "", blurb: "", link_url: "", genres: [] };

export function CreatorTab({ userId }) {
  const [loading, setLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [craft, setCraft] = useState([]);
  const [tagline, setTagline] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [openToCollab, setOpenToCollab] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [works, setWorks] = useState([]);
  const [newWork, setNewWork] = useState(EMPTY_WORK);
  const [coverFile, setCoverFile] = useState(null);
  const [savingWork, setSavingWork] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, workList] = await Promise.all([
          getCreatorProfile(userId),
          getWorksByCreator(userId),
        ]);
        if (cancelled) return;
        setCreatorProfile(profile);
        setCraft(profile?.craft || []);
        setTagline(profile?.tagline || "");
        setPortfolioUrl(profile?.portfolio_url || "");
        setOpenToCollab(profile?.open_to_collab || false);
        setWorks(workList || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const toggleCraft = (value) => {
    setCraft((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const toggleNewWorkGenre = (value) => {
    setNewWork((prev) => ({
      ...prev,
      genres: prev.genres.includes(value)
        ? prev.genres.filter((g) => g !== value)
        : [...prev.genres, value],
    }));
  };

  const saveCreatorProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const saved = await upsertCreatorProfile(userId, {
        craft,
        tagline: tagline.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        open_to_collab: openToCollab,
      });
      setCreatorProfile(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const addWork = async (e) => {
    e.preventDefault();
    if (!newWork.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSavingWork(true);
    setError(null);
    try {
      let cover_url = null;
      if (coverFile) cover_url = await uploadWorkCover(userId, coverFile);
      const created = await createWork(userId, { ...newWork, cover_url });
      setWorks((prev) => [created, ...prev]);
      setNewWork(EMPTY_WORK);
      setCoverFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingWork(false);
    }
  };

  const removeWork = async (workId) => {
    try {
      await deleteWork(workId);
      setWorks((prev) => prev.filter((w) => w.id !== workId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Creator profile */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold text-ink mb-4">
          {creatorProfile ? "Your creator profile" : "Set up your creator profile"}
        </h3>
        <form onSubmit={saveCreatorProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Craft</label>
            <div className="flex flex-wrap gap-2">
              {CRAFTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCraft(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border capitalize",
                    craft.includes(c)
                      ? "bg-accent-dark text-white border-accent-dark"
                      : "bg-surface text-ink border-ink/15 hover:bg-surface-raised"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Fantasy writer & worldbuilder"
          />
          <Input
            label="Portfolio URL (optional)"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://..."
          />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={openToCollab}
              onChange={(e) => setOpenToCollab(e.target.checked)}
              className="rounded border-ink/30"
            />
            Open to collaborations
          </label>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save creator profile"}
          </Button>
        </form>
      </Card>

      {/* Works */}
      <Card className="p-6">
        <h3 className="font-display text-lg font-bold text-ink mb-4">Your works</h3>

        {works.length > 0 && (
          <ul className="space-y-3 mb-6">
            {works.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{w.title}</p>
                  {w.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {w.genres.map((g) => (
                        <Badge key={g}>{g}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeWork(w.id)}
                  className="shrink-0 text-red-500 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addWork} className="space-y-4 pt-2">
          <Input
            label="Title"
            value={newWork.title}
            onChange={(e) => setNewWork((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title of your work"
            required
          />
          <Input
            label="Link (optional)"
            value={newWork.link_url}
            onChange={(e) => setNewWork((p) => ({ ...p, link_url: e.target.value }))}
            placeholder="Where can people read/see it?"
          />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Blurb (optional)
            </label>
            <textarea
              value={newWork.blurb}
              onChange={(e) => setNewWork((p) => ({ ...p, blurb: e.target.value }))}
              className="w-full px-4 py-2 bg-surface text-ink border border-ink/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Genres</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleNewWorkGenre(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border",
                    newWork.genres.includes(g)
                      ? "bg-accent-dark text-white border-accent-dark"
                      : "bg-surface text-ink border-ink/15 hover:bg-surface-raised"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Cover image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="text-sm text-ink-muted"
            />
          </div>
          <Button type="submit" disabled={savingWork}>
            {savingWork ? "Publishing…" : "Publish work"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
