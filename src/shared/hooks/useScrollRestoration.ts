import { useEffect } from "react";

const scrollPositions = new Map<string, number>();
const MAX_RESTORE_ATTEMPTS = 10;

export function useScrollRestoration(key: string): void {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const savedPosition = scrollPositions.get(key);
    let restoreFrame: number | null = null;
    let attempts = 0;

    if (typeof savedPosition === "number") {
      const restoreScrollPosition = () => {
        window.scrollTo({ top: savedPosition });
        attempts += 1;

        const documentElement = document.documentElement;
        const maxScrollTop = Math.max(
          documentElement.scrollHeight - window.innerHeight,
          0,
        );

        if (savedPosition > maxScrollTop && attempts < MAX_RESTORE_ATTEMPTS) {
          restoreFrame = window.requestAnimationFrame(restoreScrollPosition);
        }
      };

      restoreFrame = window.requestAnimationFrame(restoreScrollPosition);
    }

    const handleScroll = () => {
      scrollPositions.set(key, window.scrollY);
    };

    const handlePageHide = () => {
      scrollPositions.set(key, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      if (restoreFrame !== null) {
        window.cancelAnimationFrame(restoreFrame);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);

      scrollPositions.set(key, window.scrollY);
    };
  }, [key]);
}
