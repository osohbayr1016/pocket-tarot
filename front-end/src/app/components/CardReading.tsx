"use client";

import { useState, useEffect } from "react";
import TarotCard from "./TarotCard";
import { TarotCard as TarotCardType } from "../data/tarotCards";
import AuthModal from "./AuthModal";
import axios from "axios";

interface CardReadingProps {
  card: TarotCardType;
  onReset: () => void;
  user?: any;
  onLogin?: (token: string, user: any) => void;
  userQuestion?: string;
}

export default function CardReading({
  card,
  onReset,
  user,
  onLogin,
  userQuestion,
}: CardReadingProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showReading, setShowReading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("тодорхойгүй");

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://pocket-tarot-slp7.onrender.com"
      : "http://localhost:5001";

  useEffect(() => {
    // Reveal the card after a short delay
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 500);

    // Show the reading after card is revealed
    const readingTimer = setTimeout(() => {
      setShowReading(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(readingTimer);
    };
  }, []);

  const handleSaveReading = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("tarot_token");
      const response = await axios.post(
        `${BASE_URL}/api/readings`,
        {
          card,
          question,
          notes,
          mood,
          tags: [],
          isPublic: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Save reading error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-center">
      {/* Card display */}
      <div className="mb-8 flex justify-center">
        <TarotCard
          card={card}
          isRevealed={isRevealed}
          userQuestion={userQuestion}
        />
      </div>

      {/* Choose Again Button */}
      <div className="text-center mb-8">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          🔮 Өөр Карт Сонго 🔮
        </button>
      </div>

      {/* Future prediction - moved to top */}
      {showReading && (
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-pink-800/30 to-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-pink-400/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-pink-200">
              🔮 Таны Ирээдүй 🔮
            </h2>
            <p className="text-lg text-pink-100 leading-relaxed">
              {card.future}
            </p>
          </div>
        </div>
      )}

      {/* Reading content */}
      {showReading && (
        <div className="space-y-8 animate-fade-in">
          {/* Save reading form */}
          <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm rounded-lg p-6 border border-green-400/20 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-green-200">
              📄 Уншилтыг Хадгалах 📄
            </h3>

            {!user ? (
              <div className="text-center">
                <p className="text-green-100 mb-4">
                  Уншилтаа хадгалахын тулд нэвтэрнэ үү
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  🔐 Нэвтрэх
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Асуулт (сонгох боломжтой)
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Жишээ: Миний ирээдүй ямар байх вэ?"
                    className="w-full px-3 py-2 bg-white/10 border border-green-400/30 rounded-md text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Тэмдэглэл
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Энэ уншилтын талаар тэмдэглэл..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-green-400/30 rounded-md text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-200 mb-2">
                    Сэтгэл хөдөлгөөн
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-green-400/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="тодорхойгүй">Тодорхойгүй</option>
                    <option value="сайн">Сайн</option>
                    <option value="дунд">Дунд</option>
                    <option value="муу">Муу</option>
                  </select>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleSaveReading}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Хадгалж байна..." : "💾 Хадгалах"}
                  </button>

                  <button
                    onClick={onReset}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🔮 Өөр Карт Унш 🔮
                  </button>
                </div>

                {saveSuccess && (
                  <div className="text-center text-green-300 font-semibold">
                    ✅ Уншилт амжилттай хадгалагдлаа!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mystical message */}
          <div className="text-center text-purple-300 italic">
            <p className="text-lg">
              "Картууд ярьсан. Тэдний мэргэн ухаанд итгэж, зүрхний удирдамжийг
              дага."
            </p>
          </div>
        </div>
      )}

      {/* Loading animation while revealing */}
      {!showReading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Картуудыг уншиж байна...</p>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && onLogin && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={onLogin}
        />
      )}
    </div>
  );
}
