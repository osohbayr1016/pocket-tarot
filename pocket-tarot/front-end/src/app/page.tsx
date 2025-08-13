"use client";

import { useState, useEffect } from "react";
import TarotCard from "./components/TarotCard";
import CardReading from "./components/CardReading";
import AuthModal from "./components/AuthModal";
import Navigation from "./components/Navigation";
import DreamInterpretation from "./components/DreamInterpretation";
import Horoscope from "./components/Horoscope";
import DailyFortune from "./components/DailyFortune";
import { tarotCards, TarotCard as TarotCardType } from "./data/tarotCards";
import axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://pocket-tarot-slp7.onrender.com"
    : "http://localhost:5001";

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState("tarot");

  const [canSelect, setCanSelect] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );
  const [shufflePhase, setShufflePhase] = useState<"idle" | "shuffling">(
    "idle"
  );
  const [userQuestion, setUserQuestion] = useState("");
  const [showQuestionInput, setShowQuestionInput] = useState(true);
  const [authError, setAuthError] = useState("");

  // Example: Get all readings for the logged-in user
  const [readings, setReadings] = useState<any[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [readingsError, setReadingsError] = useState("");
  const [readingsFetched, setReadingsFetched] = useState(false);

  const selectCard = (card: TarotCardType, index: number) => {
    if (shuffling || shufflePhase !== "idle") return; // Prevent selection during shuffling

    setSelectedCardIndex(index);
    setShuffling(true);
    setShowQuestionInput(false);
    setTimeout(() => {
      setSelectedCard(card);
      setIsReading(true);
      setShuffling(false);
      setSelectedCardIndex(null);
    }, 2000);
  };

  const shuffleCards = () => {
    setShuffling(true);
    setSelectedCardIndex(null);
    setShufflePhase("shuffling");

    // Single phase: cards shuffle and return to positions
    setTimeout(() => {
      setShuffling(false);
      setShufflePhase("idle");
    }, 2000);
  };

  const resetReading = () => {
    setSelectedCard(null);
    setIsReading(false);
    setShowQuestionInput(true);
    setUserQuestion("");
  };

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem("tarot_token");
    if (token) {
      // Verify token with backend
      axios
        .get(`${BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((res) => {
          const data = res.data;
          if (data.success) {
            setUser(data.data.user);
          } else {
            localStorage.removeItem("tarot_token");
          }
        })
        .catch(() => {
          localStorage.removeItem("tarot_token");
        });
    }

    // Check for auth error in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("auth_error") === "true") {
      setAuthError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem("tarot_token", token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("tarot_token");
    setUser(null);
  };

  // Example: Update user profile with PUT
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("tarot_token");
      const data = await axios.put(
        `${BASE_URL}/api/auth/profile`,
        { firstName: "ШинэНэр" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      alert("Профайл амжилттай шинэчлэгдлээ!");
    } catch (error: any) {
      alert(
        "Профайл шинэчлэхэд алдаа гарлаа: " +
          (error?.response?.data?.message || error.message)
      );
    }
  };

  // Example: Delete a reading with DELETE
  const handleDeleteReading = async (readingId: string) => {
    try {
      const token = localStorage.getItem("tarot_token");
      await axios.delete(`${BASE_URL}/api/readings/${readingId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert("Уншилт амжилттай устгагдлаа!");
    } catch (error: any) {
      alert(
        "Уншилт устгахад алдаа гарлаа: " +
          (error?.response?.data?.message || error.message)
      );
    }
  };

  // Example: Get all readings for the logged-in user
  const handleGetReadings = async () => {
    setReadingsLoading(true);
    setReadingsError("");
    setReadingsFetched(false);
    try {
      const token = localStorage.getItem("tarot_token");
      const response = await axios.get(`${BASE_URL}/api/readings`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const data = response.data;
      if (data.success && Array.isArray(data.data.readings)) {
        // Add a delay to simulate loading
        setTimeout(() => {
          setReadings(data.data.readings);
          setReadingsFetched(true);
          setReadingsLoading(false);
        }, 1200);
      } else {
        setReadings([]);
        setReadingsFetched(true);
        setReadingsError(data.message || "Уншилтуудыг авахад алдаа гарлаа");
        setReadingsLoading(false);
      }
    } catch (error: any) {
      setReadings([]);
      setReadingsFetched(true);
      setReadingsError(
        "Уншилтуудыг авахад алдаа гарлаа: " +
          (error?.response?.data?.message || error.message)
      );
      setReadingsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white mystical-bg">
      {/* Mystical background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/5 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-400/5 rounded-full blur-lg animate-sparkle"></div>
        <div
          className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-pink-400/5 rounded-full blur-lg animate-sparkle"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Navigation */}
      <Navigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <h1 className="text-5xl md:text-7xl font-bold">Pocket Tarot</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-purple-200 text-sm">
                    Сайн байна, {user.firstName}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-full transition-colors"
                  >
                    Гарах
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full transition-colors"
                >
                  Нэвтрэх
                </button>
              )}
            </div>
          </div>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Pocket Tarot ертөнцийн эртний мэргэн ухаанаар хувь заяагаа нээ.
            Таро, зүүдний тайлал, зурхай, өдрийн хувь.
          </p>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto">
          {activeSection === "tarot" && (
            <>
              {!isReading ? (
                <div className="text-center">
                  {/* Question Input Section */}
                  {showQuestionInput && (
                    <div className="mb-12">
                      <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-8 border border-purple-400/20 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6 text-purple-200">
                          🔮 Асуултаа Асуу 🔮
                        </h2>
                        <p className="text-lg text-purple-200 mb-6">
                          Картуудад асуултаа асуу, тэд танд хариулт өгнө
                        </p>
                        <div className="space-y-4">
                          <textarea
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            placeholder="Жишээ: Миний ирээдүй ямар байх вэ? Миний хайр ямар байх вэ? Миний ажил ямар байх вэ?"
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-lg"
                          />
                          <div className="text-sm text-purple-300">
                            💡 Зөвлөмж: Тодорхой, эерэг асуулт асууна уу
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Tarot Cards Display */}
                  <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-8 text-purple-200">
                      🔮 Нууцлаг Таро Картууд 🔮
                    </h2>
                    <div className="relative grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-3 p-6 bg-purple-900/20 rounded-lg border border-purple-400/20 max-w-5xl mx-auto">
                      {/* Center point indicator during shuffle */}
                      {shufflePhase === "shuffling" && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full opacity-50 animate-pulse z-10"></div>
                      )}
                      {tarotCards.map((card, index) => (
                        <div
                          key={index}
                          onClick={() => selectCard(card, index)}
                          className={`relative cursor-pointer transform transition-all duration-300 hover:scale-110 ${
                            shufflePhase === "shuffling"
                              ? "animate-shuffle"
                              : ""
                          } ${
                            selectedCardIndex === index
                              ? "animate-selected"
                              : ""
                          }`}
                          style={
                            {
                              animationDelay:
                                shufflePhase === "shuffling"
                                  ? `${index * 0.1}s`
                                  : "0s",
                              "--start-x": `${((index % 11) - 5) * 25}px`,
                              "--start-y": `${
                                (Math.floor(index / 11) - 1) * 35
                              }px`,
                            } as React.CSSProperties
                          }
                        >
                          <div className="w-16 h-24 sm:w-18 sm:h-26 md:w-20 md:h-28 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-lg shadow-lg border-2 border-purple-400/30 hover:border-purple-300/50 cursor-pointer transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-lg"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl text-purple-300/30">
                                  ?
                                </div>
                              </div>
                            </div>
                            {/* Mystical overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-200">
                      🔮 Таро Уншилтын Заавар 🔮
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                      <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
                        <div className="text-3xl mb-3">1️⃣</div>
                        <h3 className="font-semibold mb-2">
                          Сэтгэлээ Төвлөрүүл
                        </h3>
                        <p className="text-sm text-purple-200">
                          Бодлоо цэвэрлэж, ирээдүйд талаар юу мэдэхийг хүсэж
                          байгаагаа төвлөрүүл.
                        </p>
                      </div>
                      <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
                        <div className="text-3xl mb-3">2️⃣</div>
                        <h3 className="font-semibold mb-2">Картуудыг Холих</h3>
                        <p className="text-sm text-purple-200">
                          Картуудыг холих товчийг дарж, энергийг цэвэрлэ.
                        </p>
                      </div>
                      <div className="bg-purple-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-400/20">
                        <div className="text-3xl mb-3">3️⃣</div>
                        <h3 className="font-semibold mb-2">Картаа Сонго</h3>
                        <p className="text-sm text-purple-200">
                          Таныг дуудаж байгаа картыг сонго, уншилтаа хүлээн ав.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shuffle and instructions */}
                  <div className="space-y-6">
                    <button
                      onClick={shuffleCards}
                      disabled={shuffling}
                      className="px-8 py-4 bg-gradient-to-r from-blue-950 to-blue-900 hover:from-black hover:to-blue-950 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {shuffling ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {shufflePhase === "shuffling"
                            ? "Картуудыг Холиж Байна..."
                            : ""}
                        </div>
                      ) : (
                        "🔄 Картуудыг Холих 🔄"
                      )}
                    </button>

                    <div className="text-purple-200 text-lg">
                      <p>💫 Бүрэн нууцлаг картуудаас нэгийг сонгоно уу 💫</p>
                      <p className="text-sm mt-2">
                        Сэтгэлээ төвлөрүүлж, таныг дуудаж байгаа картыг сонгоно
                        уу
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedCard ? (
                <CardReading
                  card={selectedCard}
                  onReset={resetReading}
                  user={user}
                  onLogin={handleLogin}
                  userQuestion={userQuestion}
                />
              ) : null}
            </>
          )}

          {activeSection === "dreams" && <DreamInterpretation />}
          {activeSection === "horoscope" && <Horoscope />}
          {activeSection === "fortune" && <DailyFortune />}

          {/* Example buttons for PUT/DELETE/GET */}
          <div className="flex gap-4 justify-center my-8">
            <button
              onClick={handleUpdateProfile}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Профайл шинэчлэх (PUT)
            </button>
            <button
              onClick={() => handleDeleteReading("REPLACE_WITH_READING_ID")}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Уншилт устгах (DELETE)
            </button>
            <button
              onClick={handleGetReadings}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Уншилтуудыг авах (GET)
            </button>
          </div>
          {/* Display readings if loaded */}
          {readingsLoading && (
            <div className="text-center text-lg text-blue-300">
              Уншилтуудыг ачааллаж байна...
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mt-2"></div>
            </div>
          )}
          {readingsFetched && readingsError && (
            <div className="text-center text-lg text-red-400">
              {readingsError}
            </div>
          )}
          {readingsFetched && readings.length > 0 && (
            <div className="max-w-2xl mx-auto my-8">
              <h3 className="text-xl font-bold mb-4 text-purple-200">
                Таны уншилтууд:
              </h3>
              <ul className="space-y-2">
                {readings.map((reading: any) => (
                  <li
                    key={reading.id}
                    className="bg-purple-900/30 rounded p-4 border border-purple-400/20"
                  >
                    <div className="font-semibold text-purple-100">
                      {reading.card && reading.card.name ? (
                        reading.card.name
                      ) : (
                        <span className="italic text-purple-400">
                          Картын нэр байхгүй
                        </span>
                      )}
                    </div>
                    {reading.question && (
                      <div className="text-purple-200 text-sm">
                        {reading.question}
                      </div>
                    )}
                    {reading.readingDate && (
                      <div className="text-purple-300 text-xs">
                        {reading.readingDate}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-purple-300">
          <p className="text-sm">
            ✨ Картууд таны жинхэнэ замыг илчлэх болтугай ✨
          </p>
        </footer>
      </div>

      {/* Auth Error Message */}
      {authError && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{authError}</span>
            <button
              onClick={() => setAuthError("")}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
