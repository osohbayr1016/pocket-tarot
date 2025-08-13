"use client";

import { useState } from "react";

export default function Horoscope() {
  const [selectedSign, setSelectedSign] = useState("");
  const [horoscope, setHoroscope] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const getHoroscope = () => {
    if (!selectedSign) return;

    setIsLoading(true);
    setTimeout(() => {
      const horoscopes = [
        "Өнөөдөр танд амжилттай өдөр байна. Шинэ боломжууд нээгдэж, таны хүсэл мөрөөдөл биелэх боломжтой.",
        "Одоогийн байдлаар тайвшрал хэрэгтэй. Төвлөрөл, тэвчээртэй байснаар амжилтд хүрнэ.",
        "Таны харилцааны хэлбэр сайжирч байна. Хүмүүстэй уулзалт, яриа чухал болно.",
        "Мэргэжлийн амьдралд өөрчлөлт ирэх боломжтой. Шинэ санаа, төсөл хэрэгтэй.",
        "Эрүүл мэндээ анхаар. Амрах цаг гаргаж, сэтгэл санаагаа цэвэрлэ.",
        "Гэр бүлийн хүмүүстэй цагийг өнгөрүүлэх нь чухал. Хайр, дэмжлэг хэрэгтэй.",
        "Санхүүгийн асуудалд болгоомжтой бай. Хэт их зарцуулахаас сэргийл.",
        "Боловсрол, мэдлэгт анхаар. Шинэ зүйл сурах цаг ирлээ.",
        "Аялал, аялгуу танд амжилттай болно. Шинэ газар, хүмүүстэй танилцах боломжтой.",
        "Хувь хөгжлийн цаг. Өөрийгөө сайжруулах, шинэ урлаг сурах цаг.",
      ];

      const randomHoroscope =
        horoscopes[Math.floor(Math.random() * horoscopes.length)];
      setHoroscope(randomHoroscope);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          ⭐ Зурхайн Зурлага ⭐
        </h2>
        <p className="text-xl text-purple-200">
          Оддын заавар, ирээдүйн таамаглал
        </p>
      </div>

      <div className="space-y-8">
        {/* Zodiac Signs Selection */}
        <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
          <h3 className="text-2xl font-semibold mb-6 text-purple-200">
            🌟 Зурхайн Тэмдгээ Сонго 🌟
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign.id)}
                className={`p-4 rounded-lg transition-all duration-300 ${
                  selectedSign === sign.id
                    ? "bg-purple-600 text-white shadow-lg scale-105"
                    : "bg-purple-700/30 text-purple-200 hover:bg-purple-600/50 hover:scale-105"
                }`}
              >
                <div className="text-2xl mb-2">{sign.emoji}</div>
                <div className="text-sm font-semibold">{sign.name}</div>
                <div className="text-xs opacity-75">{sign.dates}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Get Horoscope Button */}
        {selectedSign && (
          <div className="bg-gradient-to-r from-pink-800/30 to-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-pink-400/20">
            <button
              onClick={getHoroscope}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Оддыг Уншиж Байна...
                </div>
              ) : (
                "⭐ Өнөөдрийн Зурлага ⭐"
              )}
            </button>
          </div>
        )}

        {/* Horoscope Result */}
        {horoscope && (
          <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 backdrop-blur-sm rounded-lg p-6 border border-blue-400/20 animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-blue-200">
              ✨ Өнөөдрийн Зурлага ✨
            </h3>
            <p className="text-lg text-blue-100 leading-relaxed">{horoscope}</p>
          </div>
        )}

        {/* Daily Horoscope Tips */}
        <div className="bg-indigo-800/30 backdrop-blur-sm rounded-lg p-6 border border-indigo-400/20">
          <h3 className="text-xl font-semibold mb-4 text-indigo-200">
            💫 Зурхайн Зөвлөмж 💫
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
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                ⭐ Оддын Холбоо
              </h4>
              <p className="text-sm text-indigo-100">
                Таны зурхайн тэмдэгтэй нийцэх хүмүүстэй уулзалт, яриа чухал
                болно.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-200 mb-2">
                🎯 Төвлөрөл
              </h4>
              <p className="text-sm text-indigo-100">
                Зурхайн зөвлөмжийг дагаж, өдөр тутмын ажлаа төлөвлөх нь
                амжилттай болгоно.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
