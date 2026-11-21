import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ChevronDown,
  Heart,
  ArrowRight,
  Droplet,
  Truck,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';

const TOTAL_FRAMES = 119;

const FRAME_URLS = Array.from({ length: TOTAL_FRAMES }, (_, index) => {
  const num = String(index + 1).padStart(3, '0');
  return `${import.meta.env.BASE_URL}frames/ezgif-frame-${num}.jpg`;
});

const clamp01 = (v) => Math.min(1, Math.max(0, v));

function getOverlayMotion(progress, [inStart, inEnd, outStart, outEnd]) {
  let opacity = 0;
  let translateY = 26;

  if (inStart === 0 && inEnd === 0 && progress <= outStart) {
    opacity = 1;
    translateY = 0;
  } else if (progress >= inStart && progress < inEnd) {
    const t = clamp01((progress - inStart) / (inEnd - inStart));
    const eased = t * t * (3 - 2 * t);
    opacity = eased;
    translateY = (1 - eased) * 28;
  } else if (progress >= inEnd && progress <= outStart) {
    opacity = 1;
    translateY = 0;
  } else if (progress > outStart && progress <= outEnd) {
    const t = clamp01((progress - outStart) / (outEnd - outStart));
    const eased = t * t * (3 - 2 * t);
    opacity = 1 - eased;
    translateY = -eased * 22;
  }

  return { opacity, translateY };
}

const HIGHLIGHTS = [
  {
    icon: Truck,
    title: 'Coleta Domiciliar',
    description: 'Busca gratuita na sua casa nas 5 zonas de Marília com agendamento simples.',
  },
  {
    icon: ShieldCheck,
    title: 'Frascos Esterilizados',
    description: 'Vidros preparados e entregues sob padrão hospitalar do BLH HCFAMEMA.',
  },
  {
    icon: Sparkles,
    title: 'Rastreio Inteligente',
    description: 'Acompanhamento completo da coleta à pasteurização laboratorial.',
  },
  {
    icon: Droplet,
    title: 'Impacto Real',
    description: '1 litro de leite materno pode alimentar até 10 bebês prematuros na UTI.',
  },
];

export default function BottleExplodedScroll({ onQueroDoar, onLogin, userSession }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef(new Array(TOTAL_FRAMES).fill(null));
  const loadedFlagsRef = useRef(new Array(TOTAL_FRAMES).fill(false));

  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnKeyRef = useRef(-1);
  const lastTickTimeRef = useRef(0);
  const rafIdRef = useRef(null);

  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fullscreen high-DPI canvas draw with seamless white studio blend and continuous sub-frame smoothing
  const drawFrame = useCallback((exactFrame, allowSubframeBlend = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const clamped = Math.min(TOTAL_FRAMES - 1, Math.max(0, exactFrame));
    const idxA = Math.floor(clamped);
    const idxB = Math.min(TOTAL_FRAMES - 1, idxA + 1);
    const frac = clamped - idxA;

    const resolveLoaded = (frameIndex) => {
      if (loadedFlagsRef.current[frameIndex]) return imagesRef.current[frameIndex];
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (frameIndex - offset >= 0 && loadedFlagsRef.current[frameIndex - offset]) {
          return imagesRef.current[frameIndex - offset];
        }
        if (frameIndex + offset < TOTAL_FRAMES && loadedFlagsRef.current[frameIndex + offset]) {
          return imagesRef.current[frameIndex + offset];
        }
      }
      return null;
    };

    const imgA = resolveLoaded(allowSubframeBlend ? idxA : Math.round(clamped));
    if (!imgA || !imgA.naturalWidth || !imgA.naturalHeight) return;

    const imgB =
      allowSubframeBlend && frac > 0.01 && frac < 0.99 && idxB !== idxA && loadedFlagsRef.current[idxB]
        ? imagesRef.current[idxB]
        : null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (displayWidth === 0 || displayHeight === 0) return;

    const targetW = Math.round(displayWidth * dpr);
    const targetH = Math.round(displayHeight * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Preserve exact 16:9 composition centered on screen (no zoom, no crop, stable camera)
    const imgRatio = imgA.naturalWidth / imgA.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgA, offsetX, offsetY, drawWidth, drawHeight);

    if (imgB && imgB.naturalWidth && imgB.naturalHeight) {
      const smoothAlpha = frac * frac * (3 - 2 * frac);
      ctx.globalAlpha = smoothAlpha;
      ctx.drawImage(imgB, offsetX, offsetY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    }

    // Invisible studio perimeter blend into pure #FFFFFF
    const featherX = drawWidth * 0.08;
    const featherY = drawHeight * 0.08;

    const topGrad = ctx.createLinearGradient(0, offsetY, 0, offsetY + featherY);
    topGrad.addColorStop(0, '#FFFFFF');
    topGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(offsetX, offsetY, drawWidth, featherY);

    const bottomGrad = ctx.createLinearGradient(0, offsetY + drawHeight - featherY, 0, offsetY + drawHeight);
    bottomGrad.addColorStop(0, 'rgba(255,255,255,0)');
    bottomGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(offsetX, offsetY + drawHeight - featherY, drawWidth, featherY);

    const leftGrad = ctx.createLinearGradient(offsetX, 0, offsetX + featherX, 0);
    leftGrad.addColorStop(0, '#FFFFFF');
    leftGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(offsetX, offsetY, featherX, drawHeight);

    const rightGrad = ctx.createLinearGradient(offsetX + drawWidth - featherX, 0, offsetX + drawWidth, 0);
    rightGrad.addColorStop(0, 'rgba(255,255,255,0)');
    rightGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(offsetX + drawWidth - featherX, offsetY, featherX, drawHeight);
  }, []);

  // Silent progressive background preloading (zero React re-renders, zero UI counters)
  useEffect(() => {
    let isCancelled = false;

    const loadSingle = (index) =>
      new Promise((resolve) => {
        if (loadedFlagsRef.current[index]) {
          resolve();
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.src = FRAME_URLS[index];

        const onReady = () => {
          if (isCancelled) return;
          imagesRef.current[index] = img;
          loadedFlagsRef.current[index] = true;
          if (index === 0) {
            setFirstFrameReady(true);
            lastDrawnKeyRef.current = -1;
            drawFrame(currentFrameRef.current, false);
          }
          resolve();
        };

        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(onReady).catch(onReady);
          } else {
            onReady();
          }
        };
        img.onerror = () => resolve();
      });

    const preloadAll = async () => {
      await loadSingle(0);
      if (isCancelled) return;

      const keyframes = [];
      const rest = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (i % 6 === 0 || i === TOTAL_FRAMES - 1) keyframes.push(i);
        else rest.push(i);
      }

      const ordered = [...keyframes, ...rest];
      const BATCH = 12;
      for (let i = 0; i < ordered.length; i += BATCH) {
        if (isCancelled) return;
        await Promise.all(ordered.slice(i, i + BATCH).map(loadSingle));
      }
    };

    preloadAll();
    return () => {
      isCancelled = true;
    };
  }, [drawFrame]);

  // Video-smooth scroll scrubbing loop
  useEffect(() => {
    const computeProgress = () => {
      const section = sectionRef.current;
      if (!section) return 0;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return clamp01(-rect.top / scrollable);
    };

    const handleScroll = () => {
      const p = computeProgress();
      // Complete all 119 frames smoothly across 92% of the scroll runway
      const animProgress = clamp01(p / 0.92);
      targetFrameRef.current = animProgress * (TOTAL_FRAMES - 1);
      setProgress(p);
    };

    const handleResize = () => {
      lastDrawnKeyRef.current = -1;
      handleScroll();
      drawFrame(currentFrameRef.current, false);
    };

    const tick = (now) => {
      const prev = lastTickTimeRef.current || now;
      lastTickTimeRef.current = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));

      const diff = targetFrameRef.current - currentFrameRef.current;
      let isMoving = false;

      if (prefersReducedMotion || Math.abs(diff) <= 0.01) {
        currentFrameRef.current = targetFrameRef.current;
      } else {
        const damping = 1 - Math.exp(-dt * 6.5);
        currentFrameRef.current += diff * damping;
        isMoving = true;
      }

      const clamped = Math.min(TOTAL_FRAMES - 1, Math.max(0, currentFrameRef.current));
      const drawKey = isMoving ? Math.round(clamped * 24) : Math.round(clamped) * 24;

      if (drawKey !== lastDrawnKeyRef.current) {
        drawFrame(isMoving ? clamped : Math.round(clamped), isMoving && !prefersReducedMotion);
        lastDrawnKeyRef.current = drawKey;
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    handleScroll();
    rafIdRef.current = window.requestAnimationFrame(tick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      if (rafIdRef.current) window.cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [drawFrame, prefersReducedMotion]);

  // Overlay choreography synced to scroll progress (pure cinematic text, zero frame counters)
  const heroOverlay = getOverlayMotion(progress, [0.0, 0.0, 0.11, 0.17]);
  const midOverlay1 = getOverlayMotion(progress, [0.22, 0.28, 0.42, 0.48]);
  const midOverlay2 = getOverlayMotion(progress, [0.53, 0.59, 0.72, 0.78]);
  const closingOverlay = getOverlayMotion(progress, [0.81, 0.87, 0.98, 1.0]);

  return (
    <div id="historia-leiteflow" className="bg-white">
      {/* ========== FULLSCREEN CINEMATIC SCROLL-VIDEO STAGE ========== */}
      <section
        ref={sectionRef}
        aria-label="Experiência visual interativa LeiteFlow"
        className="relative w-full bg-white h-[480vh] sm:h-[520vh]"
      >
        <div className="sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-full bg-white overflow-hidden">
          {/* Full-Viewport Centered Video-Canvas (100% camera stable, zero frame counters) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!firstFrameReady && (
              <img
                src={FRAME_URLS[0]}
                alt="Frasco de leite materno LeiteFlow"
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            )}
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className={`w-full h-full block transition-opacity duration-300 ${
                firstFrameReady ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            />
          </div>

          {/* 01 — Opening Hero Typography Overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between py-10 sm:py-14 px-4 text-center pointer-events-none select-none will-change-transform"
            style={{
              opacity: heroOverlay.opacity,
              transform: `translate3d(0, ${heroOverlay.translateY}px, 0)`,
              visibility: heroOverlay.opacity < 0.01 ? 'hidden' : 'visible',
            }}
          >
            <div className="space-y-2 sm:space-y-3 mt-1">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.34em] text-[#4A6B5D]">
                Banco de Leite Humano • Marília
              </p>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#1E242B]">
                LeiteFlow
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#1E242B]/65">
                Cada Gota. Uma Vida.
              </p>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-[11px] sm:text-xs tracking-[0.2em] uppercase text-[#8C8275]">
              <span>Role para explorar</span>
              <ChevronDown className="w-4 h-4 animate-bounce text-[#4A6B5D]" />
            </div>
          </div>

          {/* 02 — Mid-Scroll Floating Headline (Levitation & Opening) */}
          <div
            className="absolute inset-x-0 bottom-10 sm:bottom-14 px-4 flex justify-center text-center pointer-events-none select-none will-change-transform"
            style={{
              opacity: midOverlay1.opacity,
              transform: `translate3d(0, ${midOverlay1.translateY}px, 0)`,
              visibility: midOverlay1.opacity < 0.01 ? 'hidden' : 'visible',
            }}
          >
            <div className="max-w-xl px-6 py-4 rounded-3xl bg-white/75 backdrop-blur-md border border-[#EFECE6]/80 shadow-sm">
              <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E242B] tracking-tight">
                Pureza em Movimento
              </h2>
              <p className="text-xs sm:text-sm text-[#1E242B]/70 mt-1.5 leading-relaxed">
                Rico em anticorpos vivos e nutrientes insubstituíveis — 1 litro doado alimenta até 10 bebês prematuros na UTI Neonatal.
              </p>
            </div>
          </div>

          {/* 03 — Mid-Scroll Floating Headline (Milk Swirl Explosion) */}
          <div
            className="absolute inset-x-0 bottom-10 sm:bottom-14 px-4 flex justify-center text-center pointer-events-none select-none will-change-transform"
            style={{
              opacity: midOverlay2.opacity,
              transform: `translate3d(0, ${midOverlay2.translateY}px, 0)`,
              visibility: midOverlay2.opacity < 0.01 ? 'hidden' : 'visible',
            }}
          >
            <div className="max-w-xl px-6 py-4 rounded-3xl bg-white/75 backdrop-blur-md border border-[#EFECE6]/80 shadow-sm">
              <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E242B] tracking-tight">
                Coleta 100% Gratuita
              </h2>
              <p className="text-xs sm:text-sm text-[#1E242B]/70 mt-1.5 leading-relaxed">
                O HCFAMEMA entrega frascos esterilizados e realiza a coleta domiciliar gratuita nas 5 zonas de Marília.
              </p>
            </div>
          </div>

          {/* 04 — Closing CTA Overlay (Peak Suspended Swirl) */}
          <div
            className="absolute inset-x-0 bottom-8 sm:bottom-12 px-4 flex justify-center text-center will-change-transform"
            style={{
              opacity: closingOverlay.opacity,
              transform: `translate3d(0, ${closingOverlay.translateY}px, 0)`,
              pointerEvents: closingOverlay.opacity > 0.35 ? 'auto' : 'none',
              visibility: closingOverlay.opacity < 0.01 ? 'hidden' : 'visible',
            }}
          >
            <div className="max-w-lg px-7 py-5 rounded-3xl bg-white/85 backdrop-blur-md border border-[#EFECE6] shadow-lg space-y-3.5">
              <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#1E242B] tracking-tight">
                Doe Vida. Doe Leite.
              </h2>
              <p className="text-xs sm:text-sm text-[#1E242B]/70 leading-relaxed">
                Faça seu cadastro express em menos de um minuto e transforme seu excedente em recomeço.
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                {userSession ? (
                  <button
                    onClick={onLogin}
                    className="px-7 py-3 rounded-full bg-[#4A6B5D] text-white font-medium text-xs sm:text-sm hover:bg-[#3d594d] transition-all shadow-md flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Acessar Meu Painel</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onQueroDoar}
                      className="px-7 py-3 rounded-full bg-[#4A6B5D] text-white font-medium text-xs sm:text-sm hover:bg-[#3d594d] transition-all shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Quero Doar</span>
                    </button>
                    <button
                      onClick={onLogin}
                      className="px-6 py-3 rounded-full bg-white text-[#1E242B] font-medium text-xs sm:text-sm border border-[#EFECE6] hover:border-[#4A6B5D]/40 hover:text-[#4A6B5D] transition-all flex items-center gap-2"
                    >
                      <span>Acessar Plataforma</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MINIMALIST 4-CARD FEATURE STRIP + SUBTLE MARQUEE ========== */}
      <section className="relative overflow-hidden bg-[#FAF9F6] border-y border-[#EFECE6] pt-16 sm:pt-24 pb-10 sm:pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1E242B] tracking-tight">
              Cuidado Clínico em Cada Etapa
            </h2>
            <p className="text-sm sm:text-base text-[#8C8275] mt-2">
              Tecnologia e acolhimento humano conectados ao Banco de Leite de Marília.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-[#EFECE6] hover:border-[#4A6B5D]/30 transition-all shadow-sm hover:shadow-md flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EBF1EE] text-[#4A6B5D] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#1E242B]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8C8275] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtle Oversized Kinetic Background Marquee */}
        <div
          aria-hidden="true"
          className="mt-14 sm:mt-16 overflow-hidden select-none pointer-events-none opacity-[0.06]"
        >
          <div className="animate-leiteflow-marquee whitespace-nowrap font-serif text-5xl sm:text-7xl lg:text-8xl tracking-[0.08em] text-[#1E242B] uppercase">
            <span className="mx-8">• LEITEFLOW • CADA GOTA CARREGA VIDA • BANCO DE LEITE HUMANO • MARÍLIA</span>
            <span className="mx-8">• LEITEFLOW • CADA GOTA CARREGA VIDA • BANCO DE LEITE HUMANO • MARÍLIA</span>
          </div>
        </div>
      </section>
    </div>
  );
}
