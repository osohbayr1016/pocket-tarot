"use client";

import { useState } from "react";
import type { TarotCard as TarotCardType } from "../data/tarotCards";

interface TarotCardProps {
  card: TarotCardType;
  isRevealed?: boolean;
  onClick?: () => void;
  userQuestion?: string;
  isReversed?: boolean;
  size?: "sm" | "md" | "lg";
}
const sizes = {sm: "w-32 sm:w-36", md: "w-40 sm:w-44", lg: "w-52 sm:w-60"};

export default function TarotCard({
  card, isRevealed = false, onClick, userQuestion,
  isReversed = false, size = "lg",
}: TarotCardProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageError = failedImage === card.image;
  const widthClass = sizes[size];
  if (!isRevealed) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Таро карт илчлэх"
        className={widthClass + " relative aspect-[2/3] rounded-xl overflow-hidden border border-amber-300/50 bg-[#17112c] shadow-[0_16px_36px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"}
      >
        <div className="absolute inset-2 rounded-lg border border-amber-500/60" />
        <div className="absolute inset-4 rounded-md border border-amber-500/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-100">
          <div className="text-6xl font-serif" aria-hidden="true">✦</div>
          <span className="mt-3 tracking-[0.3em] text-[10px] uppercase">Pocket Tarot</span>
          <span className="mt-2 text-[11px] opacity-70">Илчлэх</span>
        </div>
      </button>
    );
  }
  return (
    <figure className={widthClass + " mx-auto text-left"}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-2 border-amber-400/60 bg-[#f5e6c4] shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
        <img
          src={imageError ? "/tarot/card-placeholder.svg" : card.image}
          alt={card.englishName + (isReversed ? " — урвуу" : "")}
          width={480}
          height={800}
          loading="lazy"
          onError={() => setFailedImage(card.image)}
          className={"h-full w-full object-cover transition-transform duration-700 " + (isReversed ? "rotate-180" : "")}
        />
        {isReversed && (
          <span className="absolute right-2 top-2 rounded bg-[#16132b]/85 px-2 py-1 text-[11px] font-medium text-amber-100">
            Урвуу
          </span>
        )}
      </div>
      <figcaption className="pt-3">
        <h3 className="text-center text-sm font-semibold leading-snug text-amber-100">{card.name}</h3>
        {userQuestion && <p className="mt-1 text-center text-xs text-slate-300">{userQuestion}</p>}
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          {isReversed ? card.reversedMeaning : card.meaning}
        </p>
      </figcaption>
    </figure>
  );
}
