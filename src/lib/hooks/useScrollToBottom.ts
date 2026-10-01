'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const BOTTOM_THRESHOLD = 80;

/**
 * Keeps a scrollable chat transcript pinned to the latest message.
 * Auto-follow only happens while the user is already at the bottom, so
 * scrolling up to read earlier content is never interrupted.
 */
export function useScrollToBottom<T extends HTMLElement>(contentKey: unknown) {
  const scrollRef = useRef<T | null>(null);
  const [isPinned, setIsPinned] = useState(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsPinned(distanceFromBottom <= BOTTOM_THRESHOLD);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setIsPinned(true);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isPinned) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [contentKey, isPinned]);

  return { scrollRef, isPinned, scrollToBottom };
}
