"use client";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Navigation({
  activeSection,
  onSectionChange,
}: NavigationProps) {
  const sections = [
    { id: "tarot", name: "🔮 Таро Уншилт", icon: "🔮" },
    { id: "dreams", name: "💭 Зүүдний Тайлал", icon: "💭" },
    { id: "horoscope", name: "⭐ Зурхайн Зурлага", icon: "⭐" },
    { id: "fortune", name: "🎯 Өдрийн Хувь", icon: "🎯" },
  ];

  return (
    <nav className="bg-purple-900/50 backdrop-blur-sm border-b border-purple-400/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Pocket Tarot
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-purple-800 to-purple-700 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-purple-600/30"
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-purple-200 hover:text-white p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-purple-800 to-purple-700 text-white shadow-lg"
                    : "text-purple-200 hover:text-white hover:bg-purple-600/30"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{section.icon}</div>
                  <div>{section.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
