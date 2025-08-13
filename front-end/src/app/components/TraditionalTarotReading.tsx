"use client";

import { useState, useEffect } from "react";
import { TarotCard as TarotCardType } from "../data/tarotCards";
import { TarotSpread, getSpreadById, tarotSpreads } from "../data/tarotSpreads";
import TarotCard from "./TarotCard";
import AuthModal from "./AuthModal";
import axios from "axios";

interface TraditionalTarotReadingProps {
  onReset: () => void;
  user?: any;
  onLogin?: (token: string, user: any) => void;
  userQuestion?: string;
}

interface ReadingCard {
  card: TarotCardType;
  position: number;
  isReversed: boolean;
  positionName: string;
  positionDescription: string;
}

export default function TraditionalTarotReading({
  onReset,
  user,
  onLogin,
  userQuestion,
}: TraditionalTarotReadingProps) {
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(
    null
  );
  const [readingCards, setReadingCards] = useState<ReadingCard[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("тодорхойгүй");
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [isGettingAiInterpretation, setIsGettingAiInterpretation] =
    useState(false);
  const [showAiInterpretation, setShowAiInterpretation] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isAiMock, setIsAiMock] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showSpreadSelection, setShowSpreadSelection] = useState(true);

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://pocket-tarot-slp7.onrender.com"
      : "http://localhost:5001";

  // Import tarot cards dynamically to avoid circular dependency
  const [tarotCards, setTarotCards] = useState<TarotCardType[]>([]);

  useEffect(() => {
    import("../data/tarotCards").then((module) => {
      setTarotCards(module.tarotCards);
    });
  }, []);

  const selectSpread = (spread: TarotSpread) => {
    setSelectedSpread(spread);
    setShowSpreadSelection(false);
    setQuestion(userQuestion || "");
  };

  const shuffleAndDrawCards = () => {
    if (!selectedSpread || !tarotCards.length) return;

    setShuffling(true);
    setCurrentCardIndex(0);
    setReadingCards([]);

    // Simulate shuffling
    setTimeout(() => {
      const shuffledCards = [...tarotCards].sort(() => Math.random() - 0.5);
      const drawnCards: ReadingCard[] = [];

      for (let i = 0; i < selectedSpread.cardCount; i++) {
        const card = shuffledCards[i];
        const position = selectedSpread.positions[i];
        const isReversed = Math.random() > 0.7; // 30% chance of reversed

        drawnCards.push({
          card,
          position: position.position,
          isReversed,
          positionName: position.name,
          positionDescription: position.description,
        });
      }

      setReadingCards(drawnCards);
      setShuffling(false);
      setIsReading(true);
    }, 2000);
  };

  const getAiInterpretation = async () => {
    if (!selectedSpread || readingCards.length === 0) return;

    setIsGettingAiInterpretation(true);
    setAiError("");
    setAiInterpretation("");
    setIsAiMock(false);
    setShowAiInterpretation(false);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/traditional-tarot`,
        {
          spread: selectedSpread,
          cards: readingCards,
          question: question || userQuestion,
          userContext: notes,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success) {
        setTimeout(() => {
          setAiInterpretation(data.interpretation);
          setIsAiMock(Boolean(data.isMock));
          setShowAiInterpretation(true);
          setIsGettingAiInterpretation(false);
        }, 1200);
      } else {
        setAiError(data.message);
        setShowAiInterpretation(false);
        setIsGettingAiInterpretation(false);
      }
    } catch (error: any) {
      if (error.response) {
        setAiError(
          error.response.data.message ||
            `Серверийн алдаа: ${error.response.status}`
        );
      } else if (error.request) {
        setAiError("Серверээс хариу ирсэнгүй. Сүлжээний алдаа байж магадгүй.");
      } else {
        setAiError("Алдаа: " + error.message);
      }
      setShowAiInterpretation(false);
      setIsGettingAiInterpretation(false);
    }
  };

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
          spread: selectedSpread,
          cards: readingCards,
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

  const resetReading = () => {
    setSelectedSpread(null);
    setReadingCards([]);
    setIsReading(false);
    setShowSpreadSelection(true);
    setQuestion("");
    setNotes("");
    setAiInterpretation("");
    setShowAiInterpretation(false);
    setCurrentCardIndex(0);
  };

  if (showSpreadSelection) {
    return (
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🔮 Уламжлалт Таро Уншилт 🔮
          </h2>
          <p className="text-xl text-purple-200">
            Уламжлалт таро уншилтын арга барилаар хувь заяагаа нээ
          </p>
        </div>

        {/* Question Input */}
        <div className="mb-8">
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4 text-purple-200">
              🔮 Асуултаа Асуу 🔮
            </h3>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Жишээ: Миний ирээдүй ямар байх вэ? Миний хайр ямар байх вэ? Миний ажил ямар байх вэ?"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-lg"
            />
          </div>
        </div>

        {/* Spread Selection */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-purple-200">
            Уншилтын Арга Барилаа Сонго
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tarotSpreads.map((spread) => (
              <div
                key={spread.id}
                onClick={() => selectSpread(spread)}
                className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20 cursor-pointer hover:bg-purple-700/40 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-3">
                  {spread.cardCount === 1
                    ? "🃏"
                    : spread.cardCount === 3
                    ? "🎴"
                    : "🔮"}
                </div>
                <h4 className="text-xl font-semibold mb-2 text-purple-200">
                  {spread.name}
                </h4>
                <p className="text-sm text-purple-300 mb-3">
                  {spread.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-purple-600/50 px-2 py-1 rounded">
                    {spread.cardCount} карт
                  </span>
                  <span className="text-xs bg-blue-600/50 px-2 py-1 rounded">
                    {spread.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSpread) return null;

  return (
    <div className="max-w-6xl mx-auto text-center">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          🔮 {selectedSpread.name} 🔮
        </h2>
        <p className="text-xl text-purple-200 mb-4">
          {selectedSpread.description}
        </p>
        {question && (
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20 max-w-2xl mx-auto">
            <p className="text-purple-200">
              <strong>Асуулт:</strong> {question}
            </p>
          </div>
        )}
      </div>

      {/* Shuffle and Draw */}
      {!isReading && (
        <div className="mb-8">
          <button
            onClick={shuffleAndDrawCards}
            disabled={shuffling}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {shuffling ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Картуудыг Холиж Байна...
              </div>
            ) : (
              "🔄 Картуудыг Холиж Уншилт Эхлэх 🔄"
            )}
          </button>
        </div>
      )}

      {/* Reading Display */}
      {isReading && readingCards.length > 0 && (
        <div className="space-y-8">
          {/* Cards Layout */}
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
            <h3 className="text-2xl font-semibold mb-6 text-purple-200">
              🎴 Уншилтын Картууд 🎴
            </h3>

            <div
              className="grid gap-4 md:gap-6"
              style={{
                gridTemplateColumns:
                  selectedSpread.id === "celtic-cross"
                    ? "repeat(3, minmax(160px, 1fr))"
                    : selectedSpread.cardCount <= 3
                    ? `repeat(${selectedSpread.cardCount}, minmax(160px, 1fr))`
                    : "repeat(auto-fit, minmax(140px, 1fr))",
              }}
            >
              {readingCards.map((readingCard, index) => (
                <div key={index} className="text-center">
                  <div className="mb-4">
                    <TarotCard
                      card={readingCard.card}
                      isRevealed={true}
                      userQuestion={readingCard.positionName}
                      isReversed={readingCard.isReversed}
                      size={
                        selectedSpread.cardCount === 1
                          ? "lg"
                          : selectedSpread.cardCount <= 3
                          ? "md"
                          : "sm"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-200">
                      {readingCard.positionName}
                    </h4>
                    <p className="text-sm text-purple-300">
                      {readingCard.positionDescription}
                    </p>
                    {readingCard.isReversed && (
                      <div className="text-xs bg-red-600/50 px-2 py-1 rounded text-red-200">
                        🔄 Урвуу
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Interpretation */}
          <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 backdrop-blur-sm rounded-lg p-6 border border-blue-400/20">
            <h3 className="text-2xl font-semibold mb-4 text-blue-200">
              🤖 AI Уламжлалт Тайлал 🤖
            </h3>

            {!showAiInterpretation && !isGettingAiInterpretation && (
              <div className="text-center">
                <p className="text-blue-100 mb-4">
                  AI-ийн тусламжтайгаар уламжлалт таро уншилтын дэлгэрэнгүй
                  тайлал авах
                </p>
                <button
                  onClick={getAiInterpretation}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  🤖 AI Тайлал Авах
                </button>
              </div>
            )}

            {isGettingAiInterpretation && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-blue-200 text-lg">AI тайлал хийж байна...</p>
              </div>
            )}

            {showAiInterpretation && aiInterpretation && (
              <div className="text-left">
                <pre className="text-lg text-blue-100 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiInterpretation}
                </pre>
              </div>
            )}

            {!isGettingAiInterpretation && aiError && (
              <div className="text-center text-red-400 font-semibold py-4">
                {aiError}
              </div>
            )}

            {isAiMock && (
              <div className="mt-4 p-3 bg-yellow-800/30 rounded-lg border border-yellow-400/20">
                <p className="text-yellow-200 text-sm">
                  💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI тайлалд Gemini API
                  түлхүүр шаардлагатай.
                  <br />
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 underline hover:text-yellow-100"
                  >
                    API түлхүүр авах
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Save Reading */}
          <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm rounded-lg p-6 border border-green-400/20">
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
                    onClick={resetReading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🔮 Шинэ Уншилт 🔮
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
