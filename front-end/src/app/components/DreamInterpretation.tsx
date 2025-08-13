"use client";

import { useState } from "react";
import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://pocket-tarot-slp7.onrender.com"
    : "http://localhost:5001";

export default function DreamInterpretation() {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [isMock, setIsMock] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const analyzeDream = async () => {
    if (!dream.trim()) return;

    setIsAnalyzing(true);
    setError("");
    setInterpretation("");
    setIsMock(false);
    setShowResult(false);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/dreams/interpret`,
        { dream: dream.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success) {
        setTimeout(() => {
          setInterpretation(data.interpretation);
          setIsMock(Boolean(data.isMock));
          setShowResult(true);
          setIsAnalyzing(false);
        }, 1200);
      } else {
        setError(data.message);
        setShowResult(false);
        setIsAnalyzing(false);
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 2xx
        setError(
          error.response.data.message ||
            `Серверийн алдаа: ${error.response.status}`
        );
      } else if (error.request) {
        // No response received
        setError("Серверээс хариу ирсэнгүй. Сүлжээний алдаа байж магадгүй.");
      } else {
        // Something else happened
        setError("Алдаа: " + error.message);
      }
      setShowResult(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          💭 Зүүдний Тайлал 💭
        </h2>
        <p className="text-xl text-purple-200">
          Зүүднээс нууц утгыг нээ, ирээдүйн замыг ол
        </p>
      </div>

      <div className="space-y-8">
        {/* Dream Input */}
        <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
          <h3 className="text-2xl font-semibold mb-4 text-purple-200">
            🌙 Зүүднээ Тайлбарла 🌙
          </h3>
          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="Зүүднээ дэлгэрэнгүй тайлбарлана уу... Жишээ: Би нисэж байсан, тэнгэрт хөөрч байсан..."
            rows={6}
            className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <button
            onClick={analyzeDream}
            disabled={!dream.trim() || isAnalyzing}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Зүүдийг Тайлж Байна...
              </div>
            ) : (
              "🔮 Зүүдийг Тайл 🔮"
            )}
          </button>
        </div>

        {/* Show loading spinner while analyzing */}
        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
            <p className="text-pink-200 text-lg">Зүүдийг тайлж байна...</p>
          </div>
        )}

        {/* Show result only if interpretation exists and not loading */}
        {showResult && interpretation && (
          <div className="bg-gradient-to-r from-pink-800/30 to-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-pink-400/20 animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-pink-200">
              ✨ Зүүдний Утга ✨
            </h3>
            <div className="text-left">
              <pre className="text-lg text-pink-100 leading-relaxed whitespace-pre-wrap font-sans">
                {interpretation}
              </pre>
            </div>
            {isMock && (
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
        )}

        {/* Show error if exists and not loading */}
        {!isAnalyzing && error && (
          <div className="text-center text-red-400 font-semibold py-4">
            {error}
          </div>
        )}

        {/* Dream Tips */}
        <div className="bg-indigo-800/30 backdrop-blur-sm rounded-lg p-6 border border-indigo-400/20">
          <h3 className="text-xl font-semibold mb-4 text-indigo-200">
            💡 Зүүдний Тайлалын Зөвлөмж 💡
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🎯 Зүүднээ Бүртгэ
              </h4>
              <p className="text-sm text-indigo-100">
                Зүүднээ сэрэхэд нэн даруй бичээд үлдээ. Дэлгэрэнгүй байх тусам
                тайлал илүү үнэн зөв болно.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🌙 Сэтгэл хөдөлгөөн
              </h4>
              <p className="text-sm text-indigo-100">
                Зүүдэнд таны хэрхэн сэтгэл хөдөлгөөн төрсөнийг анзаар. Энэ нь
                чухал утгатай.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">🔄 Давталт</h4>
              <p className="text-sm text-indigo-100">
                Давтагдаж байгаа зүүднүүд нь таны амьдралд чухал ач
                холбогдолтой.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">⚡ Интуици</h4>
              <p className="text-sm text-indigo-100">
                Зүүдний тайлалд таны интуици чухал. Сэтгэлээсээ юу мэдэрч
                байгааг итгэ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
