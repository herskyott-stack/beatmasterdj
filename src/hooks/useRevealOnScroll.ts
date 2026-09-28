import { useEffect, useRef } from "react";

export const useRevealOnScroll = <T extends HTMLElement = HTMLElement>(
  threshold = 0
) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("bass-drop-active");
      return;
    }

    // NOTE: threshold stays 0 (not a fraction). Tall sections — e.g. the
    // testimonials wall on mobile — can never have a fractional share of
    // their height visible at once, so a fractional threshold leaves them
    // stuck at opacity 0 forever: a giant invisible gap. Reveal as soon as
    // any part of the section enters the viewport instead.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bass-drop-active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
};
