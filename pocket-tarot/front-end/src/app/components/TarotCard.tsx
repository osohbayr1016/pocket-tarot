"use client";

import { useState } from "react";
import { TarotCard as TarotCardType } from "../data/tarotCards";

interface TarotCardProps {
  card: TarotCardType;
  isRevealed?: boolean;
  onClick?: () => void;
  userQuestion?: string;
}

export default function TarotCard({
  card,
  isRevealed = false,
  onClick,
  userQuestion,
}: TarotCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isRevealed) {
    return (
      <div
        className="relative w-64 h-96 cursor-pointer transform transition-all duration-500 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Card back */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 rounded-lg shadow-2xl border-2 border-purple-400/30 transform transition-transform duration-300 hover:rotate-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">🔮</div>
              <div className="text-2xl font-semibold text-purple-100">
                Pocket Tarot
              </div>
              <div className="text-sm text-purple-200 mt-2">
                Илчлэхийн тулд дар
              </div>
            </div>
          </div>
          {/* Mystical symbols */}
          <div className="absolute top-4 left-4 text-purple-300 text-lg">
            ✨
          </div>
          <div className="absolute top-4 right-4 text-purple-300 text-lg">
            ⭐
          </div>
          <div className="absolute bottom-4 left-4 text-purple-300 text-lg">
            🌙
          </div>
          <div className="absolute bottom-4 right-4 text-purple-300 text-lg">
            🔮
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-64 h-96 transform transition-all duration-700 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card front */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 rounded-lg shadow-2xl border-2 border-amber-400/50 transform transition-transform duration-300 hover:rotate-1">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent rounded-lg"></div>

        {/* Card header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-t-lg flex items-center justify-center">
          <h3 className="text-white font-bold text-lg">{card.name}</h3>
        </div>

        {/* Card content */}
        <div className="absolute top-16 left-0 right-0 bottom-0 p-4 flex flex-col items-center justify-center">
          {/* Emoji */}
          <div className="text-3xl mb-2 animate-bounce">{card.emoji}</div>

          {/* User Question */}
          {userQuestion && (
            <div className="text-center mb-3">
              <h4 className="text-purple-700 font-bold text-sm mb-1">
                ❓ Таны Асуулт ❓
              </h4>
              <p className="text-gray-600 text-xs leading-tight font-medium">
                "{userQuestion}"
              </p>
            </div>
          )}

          {/* Card Meaning */}
          <div className="text-center">
            <h4 className="text-purple-700 font-extrabold text-base mb-2">
              ✨ Картын Хариулт ✨
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed font-semibold">
              {card.meaning}
            </p>
          </div>
        </div>

        {/* Mystical border elements */}
        <div className="absolute top-2 left-2 text-purple-500 text-sm">✨</div>
        <div className="absolute top-2 right-2 text-purple-500 text-sm">⭐</div>
        <div className="absolute bottom-2 left-2 text-purple-500 text-sm">
          🌙
        </div>
        <div className="absolute bottom-2 right-2 text-purple-500 text-sm">
          🔮
        </div>
      </div>

      {/* Glow effect on hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-lg blur-sm animate-pulse"></div>
      )}
    </div>
  );
}
