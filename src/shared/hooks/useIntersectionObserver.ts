import { MutableRefObject, useEffect, useRef } from "react";

export function useIntersectionObserver(
  onIntersect: () => void,
  options?: IntersectionObserverInit,
): MutableRefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      });
    }, options);

    observer.observe(target);

    return () => observer.disconnect();
  }, [onIntersect, options]);

  return ref;
}
