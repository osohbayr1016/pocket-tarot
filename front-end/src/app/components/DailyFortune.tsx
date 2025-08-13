"use client";

import { useState } from "react";
import axios from "axios";

export default function DailyFortune() {
  const [fortune, setFortune] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [showBirthInput, setShowBirthInput] = useState(true);
  const [userContext, setUserContext] = useState("");
  const [error, setError] = useState("");
  const [isMock, setIsMock] = useState(false);

  const BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://pocket-tarot-slp7.onrender.com"
      : "http://localhost:5001";

  const getDailyFortune = async () => {
    if (!birthMonth || !birthDay) {
      alert("Төрсөн сар, өдрөө сонгоно уу!");
      return;
    }

    setIsLoading(true);
    setError("");
    setFortune("");
    setIsMock(false);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/daily-fortune`,
        {
          birthMonth,
          birthDay,
          userContext,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.success) {
        setTimeout(() => {
          setFortune(data.fortune);
          setIsMock(Boolean(data.isMock));
          setIsLoading(false);
          setShowBirthInput(false);
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

  const resetFortune = () => {
    setFortune("");
    setShowBirthInput(true);
    setBirthMonth("");
    setBirthDay("");
  };

  const luckyNumbers = [3, 7, 11, 15, 22, 28, 33, 44, 55, 66];
  const luckyColors = [
    "Улаан",
    "Ногоон",
    "Цэнхэр",
    "Шар",
    "Нил ягаан",
    "Улбар шар",
    "Хар",
    "Цагаан",
  ];
  const luckyDirections = ["Зүүн", "Баруун", "Умард", "Өмнөд"];

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          🎯 Өдрийн Хувь 🎯
        </h2>
        <p className="text-xl text-purple-200">
          Өнөөдрийн таны хувь, азтай тоонууд, өнгөнүүд
        </p>
      </div>

      <div className="space-y-8">
        {/* Birth Date Input */}
        {showBirthInput && (
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-8 border border-purple-400/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-purple-200">
              🎂 Төрсөн Огноогоо Оруулна Уу 🎂
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                >
                  <option value="">Сар сонгох</option>
                  <option value="1">1-р сар</option>
                  <option value="2">2-р сар</option>
                  <option value="3">3-р сар</option>
                  <option value="4">4-р сар</option>
                  <option value="5">5-р сар</option>
                  <option value="6">6-р сар</option>
                  <option value="7">7-р сар</option>
                  <option value="8">8-р сар</option>
                  <option value="9">9-р сар</option>
                  <option value="10">10-р сар</option>
                  <option value="11">11-р сар</option>
                  <option value="12">12-р сар</option>
                </select>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                >
                  <option value="">Өдөр сонгох</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Context Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Нэмэлт мэдээлэл (сонгох боломжтой)
                </label>
                <textarea
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  placeholder="Жишээ: Одоогийн амьдралын нөхцөл байдал, хүсэл мөрөөдөл, санаа зовниж буй асуудал..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-400/30 rounded-md text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Get Fortune Button */}
        {showBirthInput && birthMonth && birthDay && (
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
            <button
              onClick={getDailyFortune}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Хувьээ Тооцоолж Байна...
                </div>
              ) : (
                "🔮 Өнөөдрийн Хувь 🔮"
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-center text-red-400 font-semibold py-4">
            {error}
          </div>
        )}

        {/* Fortune Result */}
        {fortune && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm rounded-lg p-8 border border-green-400/20 animate-fade-in">
              <h3 className="text-3xl font-bold mb-6 text-green-200">
                ✨ Өнөөдрийн Хувь ✨
              </h3>
              <div className="text-left">
                <pre className="text-xl text-green-100 leading-relaxed mb-8 whitespace-pre-wrap font-sans">
                  {fortune}
                </pre>
              </div>

              {/* Mock notice */}
              {isMock && (
                <div className="mt-4 p-3 bg-yellow-800/30 rounded-lg border border-yellow-400/20">
                  <p className="text-yellow-200 text-sm">
                    💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI хувьд Gemini API
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

              {/* Lucky Elements */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-200 mb-3">
                    🍀 Азтай Тоонууд
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {luckyNumbers.slice(0, 5).map((num, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-600/50 text-white rounded-full text-sm"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-200 mb-3">
                    🎨 Азтай Өнгөнүүд
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {luckyColors.slice(0, 4).map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600/50 text-white rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-700/30 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-200 mb-3">
                    🧭 Азтай Чиглэл
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {luckyDirections.slice(0, 2).map((direction, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-600/50 text-white rounded-full text-sm"
                      >
                        {direction}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="mt-8">
                <button
                  onClick={resetFortune}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors"
                >
                  🔄 Дахин Тооцоолох
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simple Tips */}
        <div className="bg-indigo-800/30 backdrop-blur-sm rounded-lg p-6 border border-indigo-400/20">
          <h3 className="text-xl font-semibold mb-4 text-indigo-200">
            💫 Өдрийн Зөвлөмж 💫
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🌅 Өглөөний Цаг
              </h4>
              <p className="text-sm text-indigo-100">
                Өглөөний цагт эерэг энерги их байдаг. Энэ цагийг ашиглаж, чухал
                ажлуудаа эхлээрэй.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🌙 Сарын Нөлөө
              </h4>
              <p className="text-sm text-indigo-100">
                Сарын үе шат нь таны сэтгэл хөдөлгөөнд нөлөөлдөг. Шинэ сард шинэ
                эхлэл хийхэд тохиромжтой.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
