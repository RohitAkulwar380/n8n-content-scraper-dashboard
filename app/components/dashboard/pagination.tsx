"use client";
import { useEffect, useRef } from "react";

type Props = {
  hasMore: boolean;
  loadMore: () => void;
  loading: boolean;
};

export function InfiniteScrollSentinel({ hasMore, loadMore, loading }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        loadMore();
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loading]);

  return <div ref={ref} className="h-10" />;
}



