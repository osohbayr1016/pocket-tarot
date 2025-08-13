const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Check if API key is available
const hasValidApiKey =
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "your_gemini_api_key_here" &&
  process.env.GEMINI_API_KEY.length > 20;

// Initialize Gemini AI only if we have a valid key
const genAI = hasValidApiKey
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI routes are working",
    hasApiKey: hasValidApiKey,
    apiKeyLength: process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY.length
      : 0,
    apiKeyStartsWith: process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY.substring(0, 10) + "..."
      : "N/A",
    mode: hasValidApiKey ? "AI" : "Mock",
    environment: process.env.NODE_ENV,
  });
});

// @route   POST /api/ai/horoscope
// @desc    Get AI-powered horoscope
// @access  Public
router.post("/horoscope", async (req, res) => {
  try {
    const { zodiacSign, birthDate, userContext } = req.body;

    if (!zodiacSign) {
      return res.status(400).json({
        success: false,
        message: "Зурхайн тэмдэг шаардлагатай",
      });
    }

    const zodiacSigns = {
      aries: { name: "Хонь", emoji: "♈", element: "Гал", planet: "Марс" },
      taurus: { name: "Үхэр", emoji: "♉", element: "Газар", planet: "Сугар" },
      gemini: { name: "Ихэр", emoji: "♊", element: "Агаар", planet: "Буд" },
      cancer: { name: "Мэлхий", emoji: "♋", element: "Ус", planet: "Сар" },
      leo: { name: "Арслан", emoji: "♌", element: "Гал", planet: "Нар" },
      virgo: { name: "Охин", emoji: "♍", element: "Газар", planet: "Буд" },
      libra: {
        name: "Жинлүүр",
        emoji: "♎",
        element: "Агаар",
        planet: "Сугар",
      },
      scorpio: { name: "Хилэнц", emoji: "♏", element: "Ус", planet: "Плутон" },
      sagittarius: {
        name: "Нум",
        emoji: "♐",
        element: "Гал",
        planet: "Бархасбадь",
      },
      capricorn: {
        name: "Матар",
        emoji: "♑",
        element: "Газар",
        planet: "Санчир",
      },
      aquarius: { name: "Хумх", emoji: "♒", element: "Агаар", planet: "Уран" },
      pisces: { name: "Загас", emoji: "♓", element: "Ус", planet: "Нептун" },
    };

    const sign = zodiacSigns[zodiacSign];
    if (!sign) {
      return res.status(400).json({
        success: false,
        message: "Буруу зурхайн тэмдэг",
      });
    }

    // If no valid API key, use enhanced static response
    if (!hasValidApiKey) {
      console.log("🤖 Using enhanced static horoscope (no API key configured)");

      const staticHoroscopes = [
        "Өнөөдөр танд амжилттай өдөр байна. Шинэ боломжууд нээгдэж, таны хүсэл мөрөөдөл биелэх боломжтой.",
        "Одоогийн байдлаар тайвшрал хэрэгтэй. Төвлөрөл, тэвчээртэй байснаар амжилтд хүрнэ.",
        "Таны харилцааны хэлбэр сайжирч байна. Хүмүүстэй уулзалт, яриа чухал болно.",
        "Мэргэжлийн амьдралд өөрчлөлт ирэх боломжтой. Шинэ санаа, төсөл хэрэгтэй.",
        "Эрүүл мэндээ анхаар. Амрах цаг гаргаж, сэтгэл санаагаа цэвэрлэ.",
      ];

      const randomHoroscope =
        staticHoroscopes[Math.floor(Math.random() * staticHoroscopes.length)];

      const enhancedHoroscope = `
⭐ ${sign.name} ${sign.emoji} - Өнөөдрийн Зурлага ⭐

1. Ерөнхий зурлага:
${randomHoroscope}

2. Азтай тоонууд: ${Math.floor(Math.random() * 9) + 1}, ${
        Math.floor(Math.random() * 9) + 10
      }, ${Math.floor(Math.random() * 9) + 20}

3. Азтай өнгө: ${
        ["Улаан", "Ногоон", "Цэнхэр", "Шар", "Нил ягаан"][
          Math.floor(Math.random() * 5)
        ]
      }

4. Зөвлөмж:
- ${sign.element} элементийн энергийг ашиглаарай
- ${sign.planet} гаригийн нөлөөг анзаарна уу
- Өнөөдөр ${sign.name}-ийн шинж чанараа илүү сайн ашиглаарай

💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI зурлагад Gemini API түлхүүр шаардлагатай.
      `;

      return res.json({
        success: true,
        horoscope: enhancedHoroscope,
        isMock: true,
      });
    }

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Та бол зурхайн мэргэжилтэн. Монгол хэлээр зурхайн зурлага хийнэ үү.
    
    Зурхайн тэмдэг: ${sign.name} ${sign.emoji}
    Элемент: ${sign.element}
    Гариг: ${sign.planet}
    ${birthDate ? `Төрсөн огноо: ${birthDate}` : ""}
    ${userContext ? `Хэрэглэгчийн нэмэлт мэдээлэл: ${userContext}` : ""}
    
    Дараах форматаар хариулна уу:
    1. Ерөнхий зурлага (3-4 өгүүлбэр)
    2. Амьдралын хэлбэрүүд (харилцаа, мэргэжил, эрүүл мэнд, санхүү)
    3. Азтай тоонууд, өнгөнүүд
    4. Зөвлөмж (2-3 зөвлөмж)
    
    Хариултыг зөвхөн Монгол хэлээр бичнэ үү. Хариулт нь эерэг, урам зоригтой байх ёстой.
    ${sign.name}-ийн шинж чанар, ${sign.element} элементийн энерги, ${
      sign.planet
    } гаригийн нөлөөг харгалзан зурлага хийнэ үү.
    `;

    console.log("🤖 Sending horoscope request to Gemini AI...");
    console.log("📝 Zodiac Sign:", sign.name);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const horoscope = response.text();

    console.log("✅ Gemini AI horoscope received");
    console.log("📄 Response length:", horoscope.length);

    res.json({
      success: true,
      horoscope: horoscope,
      isMock: false,
    });
  } catch (error) {
    console.error("❌ Horoscope error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    // Provide more specific error messages
    let errorMessage = "Зурхайн зурлагад алдаа гарлаа. Дахин оролдоно уу.";
    let statusCode = 500;

    if (
      error.message.includes("API_KEY") ||
      error.message.includes("authentication")
    ) {
      errorMessage = "Gemini API түлхүүр буруу байна. Тохиргоог шалгана уу.";
    } else if (
      error.message.includes("quota") ||
      error.message.includes("rate limit")
    ) {
      errorMessage =
        "Gemini API хязгаарт хүрсэн байна. Дараа дахин оролдоно уу.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage = "Сүлжээний алдаа. Интернэт холболтоо шалгана уу.";
    } else if (error.message.includes("model")) {
      errorMessage = "Gemini загварт холбогдоход алдаа гарлаа.";
    } else if (
      error.message.includes("503 Service Unavailable") ||
      error.status === 503 ||
      error.statusText === "Service Unavailable"
    ) {
      errorMessage =
        "AI үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу.";
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/tarot-interpret
// @desc    Get AI-powered tarot card interpretation
// @access  Public
router.post("/tarot-interpret", async (req, res) => {
  try {
    const { card, question, userContext } = req.body;

    if (!card || !card.name) {
      return res.status(400).json({
        success: false,
        message: "Картын мэдээлэл шаардлагатай",
      });
    }

    // If no valid API key, use enhanced static response
    if (!hasValidApiKey) {
      console.log(
        "🤖 Using enhanced static tarot interpretation (no API key configured)"
      );

      const enhancedInterpretation = `
🔮 ${card.name} - AI Тайлал 🔮

1. Товч тайлал:
${card.meaning}

2. Дэлгэрэнгүй тайлал:
${card.description}

3. Ирээдүйн таамаглал:
${card.future}

4. Зөвлөмж:
- Энэ картын утгыг амьдралдаа хэрэгжүүлэх боломжийг хай
- ${card.keywords.join(", ")} гэсэн түлхүүр үгнүүдэд анхаар
- Өөрчлөлтийг хүлээн авах бэлэн байгаарай

💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI тайлалд Gemini API түлхүүр шаардлагатай.
      `;

      return res.json({
        success: true,
        interpretation: enhancedInterpretation,
        isMock: true,
      });
    }

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Та бол тарт картын тайлагч мэргэжилтэн. Монгол хэлээр тарт картын тайлал хийнэ үү.
    
    Карт: ${card.name} ${card.emoji}
    Картын үндсэн утга: ${card.meaning}
    Картын дэлгэрэнгүй тайлбар: ${card.description}
    Ирээдүйн таамаглал: ${card.future}
    Түлхүүр үгнүүд: ${card.keywords.join(", ")}
    
    ${question ? `Хэрэглэгчийн асуулт: ${question}` : ""}
    ${userContext ? `Хэрэглэгчийн нэмэлт мэдээлэл: ${userContext}` : ""}
    
    Дараах форматаар хариулна уу:
    1. Товч тайлал (2-3 өгүүлбэр)
    2. Дэлгэрэнгүй тайлал (5-7 өгүүлбэр)
    3. Ирээдүйн таамаглал (3-4 өгүүлбэр)
    4. Зөвлөмж (2-3 зөвлөмж)
    
    Хариултыг зөвхөн Монгол хэлээр бичнэ үү. Хариулт нь эерэг, урам зоригтой байх ёстой.
    Хэрэв асуулт эсвэл нэмэлт мэдээлэл өгөгдсөн бол тэдгээрийг харгалзан хувийн тайлал хийнэ үү.
    `;

    console.log("🤖 Sending tarot interpretation request to Gemini AI...");
    console.log("📝 Card:", card.name);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interpretation = response.text();

    console.log("✅ Gemini AI tarot interpretation received");
    console.log("📄 Response length:", interpretation.length);

    res.json({
      success: true,
      interpretation: interpretation,
      isMock: false,
    });
  } catch (error) {
    console.error("❌ Tarot interpretation error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    // Provide more specific error messages
    let errorMessage = "Тарт картын тайлалд алдаа гарлаа. Дахин оролдоно уу.";
    let statusCode = 500;

    if (
      error.message.includes("API_KEY") ||
      error.message.includes("authentication")
    ) {
      errorMessage = "Gemini API түлхүүр буруу байна. Тохиргоог шалгана уу.";
    } else if (
      error.message.includes("quota") ||
      error.message.includes("rate limit")
    ) {
      errorMessage =
        "Gemini API хязгаарт хүрсэн байна. Дараа дахин оролдоно уу.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage = "Сүлжээний алдаа. Интернэт холболтоо шалгана уу.";
    } else if (error.message.includes("model")) {
      errorMessage = "Gemini загварт холбогдоход алдаа гарлаа.";
    } else if (
      error.message.includes("503 Service Unavailable") ||
      error.status === 503 ||
      error.statusText === "Service Unavailable"
    ) {
      errorMessage =
        "AI үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу.";
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/daily-fortune
// @desc    Get AI-powered daily fortune
// @access  Public
router.post("/daily-fortune", async (req, res) => {
  try {
    const { birthMonth, birthDay, userContext } = req.body;

    if (!birthMonth || !birthDay) {
      return res.status(400).json({
        success: false,
        message: "Төрсөн сар, өдөр шаардлагатай",
      });
    }

    // If no valid API key, use enhanced static response
    if (!hasValidApiKey) {
      console.log(
        "🤖 Using enhanced static daily fortune (no API key configured)"
      );

      const staticFortunes = [
        "Өнөөдөр танд маш амжилттай өдөр байна! Шинэ боломжууд нээгдэж, таны хүсэл мөрөөдөл биелэх боломжтой.",
        "Одоогийн байдлаар тайвшрал, төвлөрөл хэрэгтэй. Тэвчээртэй байснаар амжилтд хүрнэ.",
        "Таны харилцааны хэлбэр сайжирч байна. Хүмүүстэй уулзалт, яриа чухал болно.",
        "Мэргэжлийн амьдралд өөрчлөлт ирэх боломжтой. Шинэ санаа, төсөл хэрэгтэй.",
        "Эрүүл мэндээ анхаар. Амрах цаг гаргаж, сэтгэл санаагаа цэвэрлэ.",
      ];

      const randomFortune =
        staticFortunes[Math.floor(Math.random() * staticFortunes.length)];

      const enhancedFortune = `
🎯 ${birthMonth}-р сарын ${birthDay} - Өнөөдрийн Хувь 🎯

1. Ерөнхий хувь:
${randomFortune}

2. Азтай тоонууд: ${Math.floor(Math.random() * 9) + 1}, ${
        Math.floor(Math.random() * 9) + 10
      }, ${Math.floor(Math.random() * 9) + 20}

3. Азтай өнгө: ${
        ["Улаан", "Ногоон", "Цэнхэр", "Шар", "Нил ягаан", "Улбар шар"][
          Math.floor(Math.random() * 6)
        ]
      }

4. Азтай чиглэл: ${
        ["Зүүн", "Баруун", "Умард", "Өмнөд"][Math.floor(Math.random() * 4)]
      }

5. Зөвлөмж:
- Өнөөдөр ${birthMonth}-р сарын ${birthDay}-ны энергийг ашиглаарай
- Азтай тоонууд, өнгөнүүдийг амьдралдаа хэрэгжүүлэх боломжийг хай
- Эерэг сэтгэл хөдөлгөөнтэй байгаарай

💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI хувьд Gemini API түлхүүр шаардлагатай.
      `;

      return res.json({
        success: true,
        fortune: enhancedFortune,
        isMock: true,
      });
    }

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Та бол хувийн зурхайн мэргэжилтэн. Монгол хэлээр өдрийн хувь хийнэ үү.
    
    Төрсөн огноо: ${birthMonth}-р сарын ${birthDay}
    ${userContext ? `Хэрэглэгчийн нэмэлт мэдээлэл: ${userContext}` : ""}
    
    Дараах форматаар хариулна уу:
    1. Ерөнхий хувь (3-4 өгүүлбэр)
    2. Амьдралын хэлбэрүүд (харилцаа, мэргэжил, эрүүл мэнд, санхүү)
    3. Азтай тоонууд, өнгөнүүд, чиглэлүүд
    4. Зөвлөмж (2-3 зөвлөмж)
    
    Хариултыг зөвхөн Монгол хэлээр бичнэ үү. Хариулт нь эерэг, урам зоригтой байх ёстой.
    ${birthMonth}-р сарын ${birthDay}-ны тоонологийн утгыг харгалзан хувийн зурлага хийнэ үү.
    `;

    console.log("🤖 Sending daily fortune request to Gemini AI...");
    console.log("📝 Birth Date:", `${birthMonth}-${birthDay}`);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fortune = response.text();

    console.log("✅ Gemini AI daily fortune received");
    console.log("📄 Response length:", fortune.length);

    res.json({
      success: true,
      fortune: fortune,
      isMock: false,
    });
  } catch (error) {
    console.error("❌ Daily fortune error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    // Provide more specific error messages
    let errorMessage = "Өдрийн хувьд алдаа гарлаа. Дахин оролдоно уу.";
    let statusCode = 500;

    if (
      error.message.includes("API_KEY") ||
      error.message.includes("authentication")
    ) {
      errorMessage = "Gemini API түлхүүр буруу байна. Тохиргоог шалгана уу.";
    } else if (
      error.message.includes("quota") ||
      error.message.includes("rate limit")
    ) {
      errorMessage =
        "Gemini API хязгаарт хүрсэн байна. Дараа дахин оролдоно уу.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage = "Сүлжээний алдаа. Интернэт холболтоо шалгана уу.";
    } else if (error.message.includes("model")) {
      errorMessage = "Gemini загварт холбогдоход алдаа гарлаа.";
    } else if (
      error.message.includes("503 Service Unavailable") ||
      error.status === 503 ||
      error.statusText === "Service Unavailable"
    ) {
      errorMessage =
        "AI үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу.";
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/traditional-tarot
// @desc    Get AI-powered traditional tarot reading with spreads
// @access  Public
router.post("/traditional-tarot", async (req, res) => {
  try {
    const { spread, cards, question, userContext } = req.body;

    if (!spread || !cards || !Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        message: "Уншилтын арга барил болон картууд шаардлагатай",
      });
    }

    // If no valid API key, use enhanced static response
    if (!hasValidApiKey) {
      console.log(
        "🤖 Using enhanced static traditional tarot reading (no API key configured)"
      );

      let enhancedInterpretation = `🔮 ${spread.name} - Уламжлалт Таро Уншилт 🔮\n\n`;

      cards.forEach((readingCard, index) => {
        const card = readingCard.card;
        const position = readingCard.positionName;
        const isReversed = readingCard.isReversed;

        enhancedInterpretation += `${index + 1}. ${position}:\n`;
        enhancedInterpretation += `   Карт: ${card.name} ${card.emoji}\n`;
        enhancedInterpretation += `   ${
          isReversed ? "🔄 Урвуу: " : "✨ Шулуун: "
        }`;
        enhancedInterpretation += `${
          isReversed && card.reversedMeaning
            ? card.reversedMeaning
            : card.meaning
        }\n\n`;
      });

      enhancedInterpretation += `💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI уншилтд Gemini API түлхүүр шаардлагатай.`;

      return res.json({
        success: true,
        interpretation: enhancedInterpretation,
        isMock: true,
      });
    }

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const cardsDescription = cards
      .map((readingCard, index) => {
        const card = readingCard.card;
        return `${index + 1}. ${readingCard.positionName}: ${card.name} ${
          card.emoji
        } (${readingCard.isReversed ? "Урвуу" : "Шулуун"})`;
      })
      .join("\n");

    const prompt = `
    Та бол уламжлалт таро уншилтын мэргэжилтэн. Монгол хэлээр уламжлалт таро уншилт хийнэ үү.
    
    Уншилтын арга барил: ${spread.name}
    Уншилтын тайлбар: ${spread.description}
    ${question ? `Хэрэглэгчийн асуулт: ${question}` : ""}
    ${userContext ? `Хэрэглэгчийн нэмэлт мэдээлэл: ${userContext}` : ""}
    
    Уншилтын картууд:
    ${cardsDescription}
    
    Дараах форматаар хариулна уу:
    1. Ерөнхий уншилт (2-3 өгүүлбэр)
    2. Карт бүрийн дэлгэрэнгүй тайлал (карт бүрт 2-3 өгүүлбэр)
    3. Картуудын хоорондын холбоо, уялдаа
    4. Ерөнхий зөвлөмж (2-3 зөвлөмж)
    
    Хариултыг зөвхөн Монгол хэлээр бичнэ үү. Хариулт нь эерэг, урам зоригтой байх ёстой.
    Урвуу картуудын утгыг тусгайлан тайлбарлаж, эерэг талыг нь онцлон үзүүлнэ үү.
    `;

    console.log("🤖 Sending traditional tarot reading request to Gemini AI...");
    console.log("📝 Spread:", spread.name);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interpretation = response.text();

    console.log("✅ Gemini AI traditional tarot reading received");
    console.log("📄 Response length:", interpretation.length);

    res.json({
      success: true,
      interpretation: interpretation,
      isMock: false,
    });
  } catch (error) {
    console.error("❌ Traditional tarot reading error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    // Provide more specific error messages
    let errorMessage =
      "Уламжлалт таро уншилтд алдаа гарлаа. Дахин оролдоно уу.";
    let statusCode = 500;

    if (
      error.message.includes("API_KEY") ||
      error.message.includes("authentication")
    ) {
      errorMessage = "Gemini API түлхүүр буруу байна. Тохиргоог шалгана уу.";
    } else if (
      error.message.includes("quota") ||
      error.message.includes("rate limit")
    ) {
      errorMessage =
        "Gemini API хязгаарт хүрсэн байна. Дараа дахин оролдоно уу.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage = "Сүлжээний алдаа. Интернэт холболтоо шалгана уу.";
    } else if (error.message.includes("model")) {
      errorMessage = "Gemini загварт холбогдоход алдаа гарлаа.";
    } else if (
      error.message.includes("503 Service Unavailable") ||
      error.status === 503 ||
      error.statusText === "Service Unavailable"
    ) {
      errorMessage =
        "AI үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу.";
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/ai/life-guidance
// @desc    Get AI-powered personalized life guidance
// @access  Public
router.post("/life-guidance", async (req, res) => {
  try {
    const {
      birthDate,
      zodiacSign,
      currentSituation,
      goals,
      challenges,
      questions,
    } = req.body;

    if (!birthDate || !currentSituation) {
      return res.status(400).json({
        success: false,
        message: "Төрсөн огноо болон одоогийн нөхцөл байдал шаардлагатай",
      });
    }

    // If no valid API key, use enhanced static response
    if (!hasValidApiKey) {
      console.log(
        "🤖 Using enhanced static life guidance (no API key configured)"
      );

      const enhancedGuidance = `
🌟 Хувийн Амьдралын Зөвлөмж 🌟

1. Ерөнхий шинжилгээ:
Таны төрсөн огноо ${birthDate} нь танд онцгой энерги өгдөг. Одоогийн нөхцөл байдалд тайвшрал, төвлөрөл хэрэгтэй байна.

2. Амьдралын хэлбэрүүд:
- Харилцаа: Хүмүүстэй уулзалт, яриа чухал болно
- Мэргэжил: Шинэ боломжууд нээгдэж байна
- Эрүүл мэнд: Амрах цаг гаргаж, сэтгэл санаагаа цэвэрлэ
- Санхүү: Ухаалгаар хөрөнгөө удирдаарай

3. Зорилготой амьдрал:
${goals ? `Таны зорилго: ${goals}` : "Зорилгоо тодорхой болгох цаг ирлээ"}

4. Саад бэрхшээл:
${
  challenges
    ? `Одоогийн саад: ${challenges}`
    : "Саад бэрхшээлүүдээ даван туулах боломжтой"
}

5. Зөвлөмж:
- Өдөр тутмын медитаци хийх
- Эерэг сэтгэл хөдөлгөөнтэй байх
- Зорилгоо бичиж, төлөвлөлт хийх
- Хүмүүстэй уулзалт, яриа хийх

💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI зөвлөмжид Gemini API түлхүүр шаардлагатай.
      `;

      return res.json({
        success: true,
        guidance: enhancedGuidance,
        isMock: true,
      });
    }

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Та бол амьдралын зөвлөгч мэргэжилтэн. Монгол хэлээр хувийн амьдралын зөвлөмж хийнэ үү.
    
    Төрсөн огноо: ${birthDate}
    ${zodiacSign ? `Зурхайн тэмдэг: ${zodiacSign}` : ""}
    Одоогийн нөхцөл байдал: ${currentSituation}
    ${goals ? `Зорилго: ${goals}` : ""}
    ${challenges ? `Саад бэрхшээл: ${challenges}` : ""}
    ${questions ? `Асуултууд: ${questions}` : ""}
    
    Дараах форматаар хариулна уу:
    1. Ерөнхий шинжилгээ (3-4 өгүүлбэр)
    2. Амьдралын хэлбэрүүд (харилцаа, мэргэжил, эрүүл мэнд, санхүү)
    3. Зорилготой амьдрал
    4. Саад бэрхшээлүүдийг даван туулах арга
    5. Практик зөвлөмж (3-4 зөвлөмж)
    
    Хариултыг зөвхөн Монгол хэлээр бичнэ үү. Хариулт нь эерэг, урам зоригтой, практик байх ёстой.
    Хэрэглэгчийн төрсөн огноо, зурхайн тэмдэг, одоогийн нөхцөл байдлыг харгалзан хувийн зөвлөмж хийнэ үү.
    `;

    console.log("🤖 Sending life guidance request to Gemini AI...");
    console.log("📝 Birth Date:", birthDate);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const guidance = response.text();

    console.log("✅ Gemini AI life guidance received");
    console.log("📄 Response length:", guidance.length);

    res.json({
      success: true,
      guidance: guidance,
      isMock: false,
    });
  } catch (error) {
    console.error("❌ Life guidance error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    // Provide more specific error messages
    let errorMessage = "Амьдралын зөвлөмжид алдаа гарлаа. Дахин оролдоно уу.";
    let statusCode = 500;

    if (
      error.message.includes("API_KEY") ||
      error.message.includes("authentication")
    ) {
      errorMessage = "Gemini API түлхүүр буруу байна. Тохиргоог шалгана уу.";
    } else if (
      error.message.includes("quota") ||
      error.message.includes("rate limit")
    ) {
      errorMessage =
        "Gemini API хязгаарт хүрсэн байна. Дараа дахин оролдоно уу.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage = "Сүлжээний алдаа. Интернэт холболтоо шалгана уу.";
    } else if (error.message.includes("model")) {
      errorMessage = "Gemini загварт холбогдоход алдаа гарлаа.";
    } else if (
      error.message.includes("503 Service Unavailable") ||
      error.status === 503 ||
      error.statusText === "Service Unavailable"
    ) {
      errorMessage =
        "AI үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу.";
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
