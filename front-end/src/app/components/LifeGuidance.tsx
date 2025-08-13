"use client";

import { useState } from "react";
import axios from "axios";

export default function LifeGuidance() {
  const [birthDate, setBirthDate] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [currentSituation, setCurrentSituation] = useState("");
  const [goals, setGoals] = useState("");
  const [challenges, setChallenges] = useState("");
  const [questions, setQuestions] = useState("");
  const [guidance, setGuidance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMock, setIsMock] = useState(false);

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://pocket-tarot-slp7.onrender.com"
      : "http://localhost:5001";

  const zodiacSigns = [
    { id: "aries", name: "Хонь", emoji: "♈", dates: "3.21-4.19" },
    { id: "taurus", name: "Үхэр", emoji: "♉", dates: "4.20-5.20" },
    { id: "gemini", name: "Ихэр", emoji: "♊", dates: "5.21-6.20" },
    { id: "cancer", name: "Мэлхий", emoji: "♋", dates: "6.21-7.22" },
    { id: "leo", name: "Арслан", emoji: "♌", dates: "7.23-8.22" },
    { id: "virgo", name: "Охин", emoji: "♍", dates: "8.23-9.22" },
    { id: "libra", name: "Жинлүүр", emoji: "♎", dates: "9.23-10.22" },
    { id: "scorpio", name: "Хилэнц", emoji: "♏", dates: "10.23-11.21" },
    { id: "sagittarius", name: "Нум", emoji: "♐", dates: "11.22-12.21" },
    { id: "capricorn", name: "Матар", emoji: "♑", dates: "12.22-1.19" },
    { id: "aquarius", name: "Хумх", emoji: "♒", dates: "1.20-2.18" },
    { id: "pisces", name: "Загас", emoji: "♓", dates: "2.19-3.20" },
  ];

  const getLifeGuidance = async () => {
    if (!birthDate || !currentSituation.trim()) {
      alert("Төрсөн огноо болон одоогийн нөхцөл байдлаа оруулна уу!");
      return;
    }

    setIsLoading(true);
    setError("");
    setGuidance("");
    setIsMock(false);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/life-guidance`,
        {
          birthDate,
          zodiacSign,
          currentSituation: currentSituation.trim(),
          goals: goals.trim(),
          challenges: challenges.trim(),
          questions: questions.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success) {
        setTimeout(() => {
          setGuidance(data.guidance);
          setIsMock(Boolean(data.isMock));
          setIsLoading(false);
        }, 1200);
      } else {
        setError(data.message);
        setIsLoading(false);
      }
    } catch (error: any) {
      if (error.response) {
        setError(
          error.response.data.message ||
            `Серверийн алдаа: ${error.response.status}`
        );
      } else if (error.request) {
        setError("Серверээс хариу ирсэнгүй. Сүлжээний алдаа байж магадгүй.");
      } else {
        setError("Алдаа: " + error.message);
      }
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBirthDate("");
    setZodiacSign("");
    setCurrentSituation("");
    setGoals("");
    setChallenges("");
    setQuestions("");
    setGuidance("");
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          🌟 Хувийн Амьдралын Зөвлөмж 🌟
        </h2>
        <p className="text-xl text-purple-200">
          AI-ийн тусламжтайгаар амьдралын замыг ол, зорилгоо биелүүл
        </p>
      </div>

      <div className="space-y-8">
        {/* Input Form */}
        {!guidance && (
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-8 border border-purple-400/20">
            <h3 className="text-2xl font-semibold mb-6 text-purple-200">
              📝 Мэдээллээ Оруулна Уу 📝
            </h3>

            <div className="space-y-6">
              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Төрсөн огноо *
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Zodiac Sign */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Зурхайн тэмдэг (сонгох боломжтой)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {zodiacSigns.map((sign) => (
                    <button
                      key={sign.id}
                      onClick={() => setZodiacSign(sign.id)}
                      className={`p-3 rounded-lg transition-all duration-300 ${
                        zodiacSign === sign.id
                          ? "bg-purple-600 text-white shadow-lg scale-105"
                          : "bg-purple-700/30 text-purple-200 hover:bg-purple-600/50 hover:scale-105"
                      }`}
                    >
                      <div className="text-xl mb-1">{sign.emoji}</div>
                      <div className="text-xs font-semibold">{sign.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Situation */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Одоогийн нөхцөл байдал *
                </label>
                <textarea
                  value={currentSituation}
                  onChange={(e) => setCurrentSituation(e.target.value)}
                  placeholder="Одоогийн амьдралын нөхцөл байдал, ажлын хэлбэр, харилцааны нөхцөл байдал..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Зорилго, мөрөөдөл (сонгох боломжтой)
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Биелүүлэхийг хүсэж буй зорилго, мөрөөдөл..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Challenges */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Саад бэрхшээл (сонгох боломжтой)
                </label>
                <textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Одоогийн саад бэрхшээл, асуудал..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Questions */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Асуултууд (сонгох боломжтой)
                </label>
                <textarea
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder="Амьдралын талаар асуух асуултууд..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={getLifeGuidance}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Зөвлөмж Бэлтгэж Байна...
                  </div>
                ) : (
                  "🌟 Амьдралын Зөвлөмж Авах 🌟"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-center text-red-400 font-semibold py-4">
            {error}
          </div>
        )}

        {/* Guidance Result */}
        {guidance && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm rounded-lg p-8 border border-green-400/20 animate-fade-in">
              <h3 className="text-3xl font-bold mb-6 text-green-200">
                ✨ Таны Амьдралын Зөвлөмж ✨
              </h3>
              <div className="text-left">
                <pre className="text-xl text-green-100 leading-relaxed mb-8 whitespace-pre-wrap font-sans">
                  {guidance}
                </pre>
              </div>

              {/* Mock notice */}
              {isMock && (
                <div className="mt-4 p-3 bg-yellow-800/30 rounded-lg border border-yellow-400/20">
                  <p className="text-yellow-200 text-sm">
                    💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI зөвлөмжид Gemini
                    API түлхүүр шаардлагатай.
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

              {/* Reset Button */}
              <div className="mt-8">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors"
                >
                  🔄 Дахин Зөвлөмж Авах
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-indigo-800/30 backdrop-blur-sm rounded-lg p-6 border border-indigo-400/20">
          <h3 className="text-xl font-semibold mb-4 text-indigo-200">
            💫 Амьдралын Зөвлөмжийн Зөвлөмж 💫
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🎯 Зорилго Тодорхой
              </h4>
              <p className="text-sm text-indigo-100">
                Зорилгоо тодорхой, тодорхой болгох нь амжилттай болгохын эхний
                алхам юм.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🌱 Өсөлт Хөгжил
              </h4>
              <p className="text-sm text-indigo-100">
                Өөрчлөлтийг хүлээн авах, шинэ зүйл сурах нь амьдралын чухал
                хэсэг юм.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🤝 Харилцаа
              </h4>
              <p className="text-sm text-indigo-100">
                Хүмүүстэй уулзалт, яриа нь амьдралын утга, урам зориг өгдөг.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">⚖️ Тэнцвэр</h4>
              <p className="text-sm text-indigo-100">
                Ажлын болон хувийн амьдралын тэнцвэр нь аз жаргалтай амьдралын
                түлхүүр юм.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
