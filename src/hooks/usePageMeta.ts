import { useEffect } from "react";

const SITE = "https://beatmasterdj.ca";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Per-page <title>, description, canonical and social tags. index.html only
 * carries the homepage's tags, so without this every page told Google it was
 * a duplicate of "/".
 */
export function usePageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description?: string;
  /** Canonical path; defaults to the current pathname. */
  path?: string;
  noindex?: boolean;
}) {
  useEffect(() => {
    const url = SITE + (path ?? window.location.pathname);
    document.title = title;
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
    setMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex" : "index, follow");
  }, [title, description, path, noindex]);
}
