import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Re-run loader when route matches and when user returns to the tab.
 * Fixes blank screens after bottom-nav taps without manual browser refresh.
 */
export function useRouteRefresh(loadFn, routePath) {
  const location = useLocation();
  const loadRef = useRef(loadFn);
  loadRef.current = loadFn;

  const run = useCallback(() => {
    loadRef.current?.();
  }, []);

  useEffect(() => {
    if (location.pathname === routePath) {
      run();
    }
  }, [location.pathname, routePath, run]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && location.pathname === routePath) {
        run();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [location.pathname, routePath, run]);

  return run;
}
