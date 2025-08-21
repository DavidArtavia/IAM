// useScrollLockOnly.ts
import { useEffect } from "react";

export function useScrollLockOnly(open: boolean, containerSelector = "body") {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(containerSelector) || document.body;
    
    const unlock = () => {
      el.style.overflow = prevOverflow;
      el.style.paddingRight = prevPR;
      document.body.classList.remove("modal-open");
      // console.log("[useScrollLockOnly] unlock");
    };

    // guardo estilos previos
    const prevOverflow = el.style.overflow;
    const prevPR = el.style.paddingRight;

    if (open) {
      const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
      el.style.overflow = "hidden";
      if (el === document.body && scrollbarW > 0) el.style.paddingRight = `${scrollbarW}px`;
      document.body.classList.add("modal-open");
      // console.log("[useScrollLockOnly] lock");
    } else {
      // si viene cerrado, aseguro estado limpio
      unlock();
    }

    return unlock; // cleanup siempre
  }, [open, containerSelector]);
}
