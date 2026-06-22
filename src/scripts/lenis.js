import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createLenis() {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 1
  });

  lenis.on("scroll", ScrollTrigger.update);

  const raf = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return {
    instance: lenis,
    destroy() {
      gsap.ticker.remove(raf);
      lenis.destroy();
    }
  };
}
