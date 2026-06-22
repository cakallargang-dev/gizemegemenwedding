import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createLenis } from "./lenis";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DEBUG_FLAG = typeof window !== "undefined" ? window.location.search.includes("debugMotion=1") : false;

function debugLog(...args) {
  if (DEBUG_FLAG) {
    console.log("[envelope-motion]", ...args);
  }
}

function setLayerActivity(scene, isActive) {
  scene.querySelectorAll("[data-speed]").forEach((layer) => {
    layer.dataset.active = String(isActive);
  });
}

function animateScene(scene) {
  const layers = gsap.utils.toArray("[data-speed]", scene);
  const content = scene.querySelector("[data-scene-copy]");
  const shell = scene.querySelector("[data-scene-shell]") ?? scene;

  ScrollTrigger.create({
    trigger: scene,
    start: "top bottom",
    end: "bottom top",
    onToggle: ({ isActive }) => setLayerActivity(scene, isActive)
  });

  layers.forEach((layer) => {
    const speed = Number(layer.dataset.speed || 0);
    const depth = Number(layer.dataset.depth || 1);

    gsap.fromTo(
      layer,
      { yPercent: speed * 6 },
      {
        yPercent: speed * -50 * depth,
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });

  if (content) {
    gsap.fromTo(
      content,
      { y: 36, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: scene,
          start: "top 72%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }

  if (scene.dataset.pin === "true") {
    ScrollTrigger.create({
      trigger: scene,
      start: "top top",
      end: "+=35%",
      pin: shell,
      pinSpacing: true
    });
  }
}

function animateEnvelopeScene(scene) {
  const flap = scene.querySelector("[data-envelope-flap]");

  if (!flap) {
    debugLog("flap not found");
    return;
  }

  debugLog("binding envelope scene", {
    sceneHeight: scene.offsetHeight,
    flapHeight: flap.offsetHeight
  });

  gsap.set(flap, {
    transformOrigin: "50% 100%",
    rotateX: 0
  });

  gsap.to(flap, {
    rotateX: -175,
    ease: "none",
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        debugLog("progress", {
          progress: Number(self.progress.toFixed(3)),
          flapTransform: flap.style.transform
        });
      }
    }
  });
}

export function initScrollExperience() {
  if (typeof window === "undefined") {
    return () => {};
  }

  debugLog("init start");

  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
  document.documentElement.dataset.motion = prefersReducedMotion.matches ? "reduced" : "full";
  debugLog("motion mode", document.documentElement.dataset.motion);

  if (prefersReducedMotion.matches) {
    document.querySelectorAll("[data-speed]").forEach((layer) => {
      layer.dataset.active = "false";
      layer.style.transform = "none";
    });

    return () => {
      delete document.documentElement.dataset.motion;
    };
  }

  gsap.registerPlugin(ScrollTrigger);
  debugLog("gsap plugin registered");

  const lenis = createLenis();
  debugLog("lenis created");
  const context = gsap.context(() => {
    gsap.utils.toArray("[data-envelope-scene]").forEach((scene) => {
      animateEnvelopeScene(scene);
    });

    gsap.utils.toArray("[data-scene]").forEach((scene) => {
      animateScene(scene);
    });
  }, document.body);

  ScrollTrigger.refresh();
  debugLog("scroll trigger refresh complete", {
    triggers: ScrollTrigger.getAll().length
  });

  return () => {
    lenis.destroy();
    context.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    delete document.documentElement.dataset.motion;
  };
}
