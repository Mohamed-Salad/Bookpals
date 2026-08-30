import { useEffect } from "react";

// This is a client-rendered SPA with no SSR, so search engines never see
// per-route titles/descriptions from this - it's for the browser tab,
// history, and bookmarks, which do read document.title live. Real
// per-route SEO would need prerendering/SSR, out of scope here.
export function useSEO({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = `${title} — BookPals`;

    let metaDescription;
    if (description) {
      metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.dataset.previousContent = metaDescription.content;
        metaDescription.content = description;
      }
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && metaDescription.dataset.previousContent) {
        metaDescription.content = metaDescription.dataset.previousContent;
      }
    };
  }, [title, description]);
}
