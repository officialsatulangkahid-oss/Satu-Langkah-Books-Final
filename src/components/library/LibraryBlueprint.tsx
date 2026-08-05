import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";

type Props = { progress: MotionValue<number> };

/** Satu garis yang "digambar" mengikuti scroll pada rentang [start, end]. */
const Line = ({
  progress,
  start,
  end,
  d,
  width = 1.6,
  className = "",
}: Props & { start: number; end: number; d: string; width?: number; className?: string }) => {
  const pathLength = useTransform(progress, [start, end], [0, 1], { clamp: true });
  return (
    <motion.path
      d={d}
      style={{ pathLength }}
      strokeWidth={width}
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
};

/** Elemen yang muncul lembut (untuk daun, bayangan, arsiran). */
const Soft = ({
  progress,
  start,
  end,
  children,
}: Props & { start: number; end: number; children: ReactNode }) => {
  const opacity = useTransform(progress, [start, end], [0, 1], { clamp: true });
  return <motion.g style={{ opacity }}>{children}</motion.g>;
};

const rangeLines = (
  items: { d: string; w?: number }[],
  from: number,
  to: number,
  progress: MotionValue<number>,
  cls: string
) => {
  const span = (to - from) / items.length;
  return items.map((it, i) => (
    <Line
      key={`${cls}-${i}`}
      progress={progress}
      start={from + i * span}
      end={from + (i + 1) * span + span * 0.6}
      d={it.d}
      width={it.w}
      className={cls}
    />
  ));
};

const LibraryBlueprint = ({ progress }: Props) => {
  const ink = "stroke-[hsl(var(--text-heading))]";
  const inkSoft = "stroke-[hsl(var(--text-heading))]/60";

  // Kontras & bayangan naik saat gambar mendekati selesai
  const contrast = useTransform(progress, [0.9, 1], [0.78, 1]);

  const foundation = [
    { d: "M40 500 L960 500", w: 2 },
    { d: "M120 500 L120 486 L880 486 L880 500", w: 1.4 },
    { d: "M150 486 L150 472 L850 472 L850 486" },
    { d: "M300 486 L300 472 M420 486 L420 472 M560 486 L560 472 M700 486 L700 472" },
    { d: "M40 520 L960 520 M180 500 L160 520 M420 500 L400 520 M660 500 L640 520 M900 500 L880 520" },
  ];
  const columns = [
    { d: "M200 472 L200 330" },
    { d: "M330 472 L330 330" },
    { d: "M460 472 L460 330" },
    { d: "M590 472 L590 330" },
    { d: "M720 472 L720 330" },
    { d: "M800 472 L800 330" },
    { d: "M194 330 L206 330 M324 330 L336 330 M454 330 L466 330 M584 330 L596 330 M714 330 L726 330" },
    { d: "M200 330 L200 160 M330 330 L330 152 M460 330 L460 146 M590 330 L590 142 M720 330 L720 140" },
  ];
  const walls = [
    { d: "M160 472 L160 330 L860 330", w: 1.8 },
    { d: "M760 472 L760 330 L860 330 L860 472 Z", w: 1.6 },
    { d: "M860 472 L920 452 L920 190 L860 210", w: 1.4 },
    { d: "M180 452 L760 452", w: 1.2 },
    { d: "M160 430 L760 430" },
    { d: "M770 340 L850 340 M770 360 L850 360 M770 380 L850 380" },
  ];
  const roof = [
    { d: "M150 330 L870 330 L870 316 L150 316 Z", w: 1.8 },
    { d: "M150 316 L150 150 L870 150", w: 1.8 },
    { d: "M150 150 L870 150 L870 316", w: 1.6 },
    { d: "M150 150 L170 132 L890 132 L870 150", w: 1.6 },
    { d: "M170 132 L170 108 L890 108 L890 132" },
    { d: "M400 108 L400 88 L700 88 L700 108" },
    { d: "M180 330 L180 316 M240 336 L200 316 M370 336 L330 316 M500 336 L460 316 M630 336 L590 316" },
  ];
  const windows = [
    { d: "M180 300 L180 170 L860 170 L860 300 Z", w: 1.4 },
    { d: "M265 170 L265 300 M395 170 L395 300 M525 170 L525 300 M655 170 L655 300 M785 170 L785 300" },
    { d: "M180 190 L860 190" },
    { d: "M190 300 L190 180 M275 300 L275 180 M405 300 L405 180 M535 300 L535 180 M665 300 L665 180 M795 300 L795 180" },
    { d: "M230 300 L230 200 M360 300 L360 200 M490 300 L490 200 M620 300 L620 200 M750 300 L750 200" },
    { d: "M320 246 L320 232 M450 246 L450 232 M580 246 L580 232 M710 246 L710 232" },
    { d: "M175 300 L865 300", w: 1.4 },
  ];
  const shelves = [
    { d: "M170 424 L300 424 M170 400 L300 400 M170 376 L300 376 M170 352 L300 352" },
    { d: "M176 402 L176 424 M186 404 L186 424 M196 400 L196 424 M208 406 L208 424 M218 402 L218 424 M230 404 L230 424 M242 400 L242 424 M254 406 L254 424 M266 402 L266 424 M278 404 L278 424 M290 400 L290 424" },
    { d: "M176 378 L176 400 M188 380 L188 400 M200 376 L200 400 M212 382 L212 400 M224 378 L224 400 M238 380 L238 400 M252 376 L252 400 M266 382 L266 400 M280 378 L280 400" },
    { d: "M176 354 L176 376 M190 356 L190 376 M204 352 L204 376 M218 358 L218 376 M232 354 L232 376 M248 356 L248 376 M264 352 L264 376 M280 358 L280 376" },
    { d: "M340 424 L470 424 M340 400 L470 400 M340 376 L470 376" },
    { d: "M346 402 L346 424 M358 404 L358 424 M370 400 L370 424 M384 406 L384 424 M398 402 L398 424 M412 404 L412 424 M426 400 L426 424 M440 406 L440 424 M454 402 L454 424" },
    { d: "M346 378 L346 400 M360 380 L360 400 M374 376 L374 400 M390 382 L390 400 M404 378 L404 400 M420 380 L420 400 M436 376 L436 400 M452 382 L452 400" },
    { d: "M500 424 L620 424 M500 402 L620 402 M506 404 L506 424 M520 406 L520 424 M534 402 L534 424 M548 404 L548 424 M562 400 L562 424 M578 406 L578 424 M594 402 L594 424 M608 404 L608 424" },
    { d: "M640 452 L740 452 L740 420 L640 420 Z M640 436 L740 436 M660 420 L660 452 M700 420 L700 452" },
    { d: "M652 414 L662 414 L662 404 L652 404 Z M676 414 L692 414 M712 414 L728 414" },
  ];
  const furniture = [
    { d: "M210 464 L268 464 L268 468 L210 468 Z M216 468 L216 480 M262 468 L262 480" },
    { d: "M196 462 L196 448 L208 448 L208 462 M196 470 L208 470 L208 480 M196 470 L196 480" },
    { d: "M276 462 L276 448 L288 448 L288 462 M276 470 L288 470 L288 480 M276 470 L276 480" },
    { d: "M330 464 L392 464 L392 468 L330 468 Z M336 468 L336 480 M386 468 L386 480" },
    { d: "M316 462 L316 448 L328 448 L328 462 M316 470 L328 470 L328 480" },
    { d: "M400 462 L400 448 L412 448 L412 462 M400 470 L412 470 L412 480" },
    { d: "M470 466 L540 466 L540 470 L470 470 Z M476 470 L476 482 M534 470 L534 482" },
    { d: "M456 464 L456 450 L468 450 L468 464 M456 472 L468 472 L468 482" },
    { d: "M548 464 L548 450 L560 450 L560 464 M548 472 L560 472 L560 482" },
    { d: "M600 468 L672 468 L672 472 L600 472 Z M606 472 L606 484 M666 472 L666 484" },
    { d: "M588 466 L588 452 L600 452 L600 466 M588 474 L600 474 L600 484" },
    { d: "M680 466 L680 452 L692 452 L692 466 M680 474 L692 474 L692 484" },
    { d: "M494 460 L508 460 L505 466 L497 466 Z M624 462 L636 462 L633 468 L627 468 Z" },
  ];
  const people = [
    { d: "M240 480 L240 452 M240 452 L233 438 M240 452 L248 440 M240 436 A6.5 6.5 0 1 1 240 423 A6.5 6.5 0 1 1 240 436 M240 436 L240 452" },
    { d: "M356 480 L350 456 L364 456 L358 480 M357 456 L357 438 M357 438 A6.5 6.5 0 1 1 357 425 A6.5 6.5 0 1 1 357 438" },
    { d: "M446 482 L446 456 L458 456 L458 482 M452 456 L452 438 A6.5 6.5 0 1 1 452 425 A6.5 6.5 0 1 1 452 438" },
    { d: "M516 482 L510 458 L524 458 L518 482 M517 458 L517 440 A6.5 6.5 0 1 1 517 427 A6.5 6.5 0 1 1 517 440" },
    { d: "M644 484 L644 458 M644 458 L636 444 M644 458 L653 446 M644 442 A6.5 6.5 0 1 1 644 429 A6.5 6.5 0 1 1 644 442" },
    { d: "M702 484 L696 460 L710 460 L704 484 M703 460 L703 442 A6.5 6.5 0 1 1 703 429 A6.5 6.5 0 1 1 703 442" },
    { d: "M96 500 L96 474 M96 474 L88 460 M96 474 L105 462 M96 458 A6 6 0 1 1 96 446 A6 6 0 1 1 96 458" },
    { d: "M930 496 L930 470 L942 470 L942 496 M936 470 L936 452 A6 6 0 1 1 936 440 A6 6 0 1 1 936 452" },
    { d: "M296 254 L296 232 M296 232 L290 220 M296 232 L303 222 M296 218 A5 5 0 1 1 296 208 A5 5 0 1 1 296 218" },
    { d: "M556 254 L550 234 L562 234 L558 254 M556 234 L556 218 A5 5 0 1 1 556 208 A5 5 0 1 1 556 218" },
    { d: "M690 252 L690 232 L700 232 L700 252 M695 232 L695 216 A5 5 0 1 1 695 206 A5 5 0 1 1 695 216" },
  ];
  return (
    <motion.svg
      viewBox="0 0 1000 560"
      className="w-full h-auto"
      style={{ opacity: contrast }}
      role="img"
      aria-label="Sketsa arsitektur Satu Langkah Library"
    >
      {/* Bayangan halus */}
      <Soft progress={progress} start={0.9} end={1}>
        <ellipse cx="500" cy="512" rx="430" ry="10" fill="hsl(var(--text-heading))" opacity="0.07" />
        <rect x="160" y="330" width="700" height="142" fill="hsl(var(--text-heading))" opacity="0.035" />
        <path d="M180 170 L860 170 L860 300 L180 300 Z" fill="hsl(var(--text-heading))" opacity="0.05" />
      </Soft>

      <g className={ink}>{rangeLines(foundation, 0, 0.14, progress, ink)}</g>
      <g>{rangeLines(columns, 0.14, 0.29, progress, inkSoft)}</g>
      <g>{rangeLines(walls, 0.29, 0.44, progress, ink)}</g>
      <g>{rangeLines(roof, 0.44, 0.59, progress, ink)}</g>
      <g>{rangeLines(windows, 0.59, 0.735, progress, inkSoft)}</g>
      <g>{rangeLines(shelves, 0.735, 0.84, progress, inkSoft)}</g>
      <g>{rangeLines(furniture, 0.84, 0.93, progress, inkSoft)}</g>
      <g>{rangeLines(people, 0.93, 0.99, progress, ink)}</g>

      {/* Tanaman & detail lembut */}
      <Soft progress={progress} start={0.92} end={1}>
        <g className="stroke-[hsl(var(--gold))]" fill="none" strokeWidth="1.4" strokeLinecap="round">
          <path d="M70 500 L70 380 M70 430 Q40 412 34 372 M70 430 Q100 410 108 370 M70 396 Q48 384 42 356 M70 396 Q92 384 98 358" />
          <path d="M980 500 L980 360 M980 420 Q948 400 942 358 M980 420 Q1012 400 1018 358 M980 384 Q958 370 952 344" />
          <path d="M136 486 L136 468 L156 468 L152 486 Z M146 468 Q136 456 132 442 M146 468 Q158 456 162 442 M146 468 L146 448" />
          <path d="M756 486 L756 468 L776 468 L772 486 Z M766 468 Q756 456 752 442 M766 468 Q778 456 782 442" />
          <path d="M320 486 Q320 470 308 462 M320 486 Q320 472 332 464 M320 486 L320 466" />
          <path d="M620 486 Q620 470 632 462 M620 486 Q620 472 608 464" />
        </g>
      </Soft>

      {/* Tipografi pada dinding — muncul terakhir */}
      <Soft progress={progress} start={0.94} end={1}>
        <text
          x="786"
          y="368"
          className="fill-[hsl(var(--text-heading))]"
          fontSize="17"
          letterSpacing="1.4"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="600"
        >
          SATU LANGKAH
        </text>
        <text
          x="786"
          y="388"
          className="fill-[hsl(var(--text-heading))]"
          fontSize="17"
          letterSpacing="1.4"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="600"
        >
          LIBRARY
        </text>
        {["Books.", "Coffee.", "Community.", "Conversations."].map((t, i) => (
          <text
            key={t}
            x="786"
            y={414 + i * 16}
            className="fill-[hsl(var(--text-heading))]/70"
            fontSize="11"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            {t}
          </text>
        ))}
      </Soft>
    </motion.svg>
  );
};

/** Wrapper: mengikat gambar ke progres scroll section. */
export const useBlueprintProgress = (ref: React.RefObject<HTMLElement>) => {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 });
};

export default LibraryBlueprint;
