const fs = require("fs");

// Read the tarot cards file
const filePath = "front-end/src/app/data/tarotCards.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add missing properties to all cards
const cards = [
  {
    id: 3,
    element: "Ус",
    astrologicalSign: "Мэлхий",
    planet: "Венера",
    numerology: 3,
  },
  {
    id: 4,
    element: "Гал",
    astrologicalSign: "Арслан",
    planet: "Нар",
    numerology: 4,
  },
  {
    id: 5,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Меркури",
    numerology: 5,
  },
  {
    id: 6,
    element: "Агаар",
    astrologicalSign: "Жинлүүр",
    planet: "Венера",
    numerology: 6,
  },
  {
    id: 7,
    element: "Гал",
    astrologicalSign: "Арслан",
    planet: "Марс",
    numerology: 7,
  },
  {
    id: 8,
    element: "Гал",
    astrologicalSign: "Арслан",
    planet: "Марс",
    numerology: 8,
  },
  {
    id: 9,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Меркури",
    numerology: 9,
  },
  {
    id: 10,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Юпитер",
    numerology: 10,
  },
  {
    id: 11,
    element: "Агаар",
    astrologicalSign: "Жинлүүр",
    planet: "Венера",
    numerology: 11,
  },
  {
    id: 12,
    element: "Ус",
    astrologicalSign: "Загас",
    planet: "Нептун",
    numerology: 12,
  },
  {
    id: 13,
    element: "Ус",
    astrologicalSign: "Загас",
    planet: "Плутон",
    numerology: 13,
  },
  {
    id: 14,
    element: "Ус",
    astrologicalSign: "Загас",
    planet: "Нептун",
    numerology: 14,
  },
  {
    id: 15,
    element: "Гал",
    astrologicalSign: "Хонь",
    planet: "Марс",
    numerology: 15,
  },
  {
    id: 16,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Уран",
    numerology: 16,
  },
  {
    id: 17,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Меркури",
    numerology: 17,
  },
  {
    id: 18,
    element: "Ус",
    astrologicalSign: "Загас",
    planet: "Нептун",
    numerology: 18,
  },
  {
    id: 19,
    element: "Гал",
    astrologicalSign: "Арслан",
    planet: "Нар",
    numerology: 19,
  },
  {
    id: 20,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Меркури",
    numerology: 20,
  },
  {
    id: 21,
    element: "Агаар",
    astrologicalSign: "Ихэр",
    planet: "Сатурн",
    numerology: 21,
  },
];

// Add reversed meanings and other properties
const reversedMeanings = [
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
  "Хэт их эрх мэдэл, дээрэмдэх, эсвэл хэт их хяналт. Эрх мэдэлээ зөв ашиглахгүй байх.",
];

// Find each card and add missing properties
cards.forEach((card, index) => {
  const cardPattern = new RegExp(`\\{\\s*id:\\s*${card.id},[^}]+\\}`, "s");
  const match = content.match(cardPattern);

  if (match) {
    const cardContent = match[0];
    const updatedCard = cardContent.replace(
      /keywords:\s*\[[^\]]+\],\s*$/m,
      `keywords: [${cardContent.match(/keywords:\s*\[([^\]]+)\]/)[1]}],
    reversedMeaning: "${reversedMeanings[index]}",
    element: "${card.element}",
    astrologicalSign: "${card.astrologicalSign}",
    planet: "${card.planet}",
    numerology: ${card.numerology},`
    );

    content = content.replace(cardPattern, updatedCard);
  }
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content, "utf8");
console.log("Tarot cards updated successfully!");
