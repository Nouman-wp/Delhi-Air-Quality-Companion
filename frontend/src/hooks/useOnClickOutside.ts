import { useEffect, type RefObject } from "react";

export function useOnClickOutside(ref: RefObject<HTMLElement>, handler: () => void): void {
  useEffect(() => {
    function listener(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}
