const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Check if API key is available
const hasValidApiKey =
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "your_gemini_api_key_here" &&
  process.env.GEMINI_API_KEY.length > 20;

if (!hasValidApiKey) {
  console.error(
    "❌ GEMINI_API_KEY is not configured properly - using mock responses"
  );
  console.error("💡 API Key status:", {
    exists: !!process.env.GEMINI_API_KEY,
    length: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    startsWith: process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY.substring(0, 10) + "..."
      : "N/A",
  });
} else {
  console.log("✅ GEMINI_API_KEY is configured");
  console.log(
    "🔑 API Key starts with:",
    process.env.GEMINI_API_KEY.substring(0, 10) + "..."
  );
}

// Initialize Gemini AI only if we have a valid key
const genAI = hasValidApiKey
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Dream interpretation route is working",
    hasApiKey: hasValidApiKey,
    apiKeyLength: process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY.length
      : 0,
    apiKeyStartsWith: process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY.substring(0, 10) + "..."
      : "N/A",
    mode: hasValidApiKey ? "AI" : "Mock",
    environment: process.env.NODE_ENV,
    configPath:
      process.env.NODE_ENV === "production"
        ? "./config.production.env"
        : "./config.env",
  });
});

// Mock dream interpretations for testing
const mockInterpretations = [
  {
    dream: "нисэх",
    interpretation: `1. Товч тайлал:
Энэ зүүд нь таны эрх чөлөө, мөрөөдөл, боломжуудыг илэрхийлж байна. Та өндөр зорилготой, амбицтай хүн байна.

2. Дэлгэрэнгүй тайлал:
Нисэж байгаа зүүд нь таны сэтгэл хөдөлгөөнийг илэрхийлдэг. Та одоогийн нөхцөл байдлаас гарах, шинэ өндөрт хүрэхийг хүсэж байна. Энэ нь таны доторх хүч, итгэл, боломжуудыг харуулж байна. Та өөрчлөлтийг хүсэж байгаа бөгөөд илүү сайн ирээдүйг харж байна.

3. Зөвлөмж:
- Таны мөрөөдөл, зорилготой байх нь сайн зүйл юм
- Өөрчлөлтийг хийхэд бэлэн байгаарай
- Таны боломжууд хязгааргүй гэдгийг санаарай`,
  },
  {
    dream: "ус",
    interpretation: `1. Товч тайлал:
Усны зүүд нь таны сэтгэл хөдөлгөөн, цэвэрлэгээ, шинэ эхлэлтэй холбоотой.

2. Дэлгэрэнгүй тайлал:
Ус нь сэтгэл хөдөлгөөнийг илэрхийлдэг. Таны зүүдэнд гарч байгаа ус нь таны доторх сэтгэл хөдөлгөөнийг харуулж байна. Энэ нь танд цэвэрлэгээ, шинэ эхлэлт хэрэгтэй байгааг илэрхийлж байна. Та өнгөрсөн үеийн сэтгэл хөдөлгөөнүүдээсээ гарах, шинээр эхлэхийг хүсэж байна.

3. Зөвлөмж:
- Сэтгэл хөдөлгөөнүүдээ цэвэрлэх цаг ирлээ
- Шинэ эхлэлт хийхэд бэлэн байгаарай
- Өөрчлөлтийг хүлээн аваарай`,
  },
  {
    dream: "амьтан",
    interpretation: `1. Товч тайлал:
Амьтны зүүд нь таны инстинкт, хүч, шинж чанаруудтай холбоотой.

2. Дэлгэрэнгүй тайлал:
Амьтны зүүд нь таны доторх инстинкт, хүч, шинж чанаруудыг илэрхийлдэг. Энэ нь таны хэрхэн амьдралтай харьцаж байгааг харуулж байна. Таны зүүдэнд гарч байгаа амьтан нь таны шинж чанар, хүч, боломжуудыг илэрхийлж байна. Энэ нь танд заавар, сургамж өгч байна.

3. Зөвлөмж:
- Таны инстинкт, хүчийг ашиглаарай
- Өөрийн шинж чанарыг хүлээн зөвшөөрөөрэй
- Хүч чадлаа ашиглах цаг ирлээ`,
  },
];

router.post("/interpret", async (req, res) => {
  try {
    const { dream } = req.body;

    if (!dream || !dream.trim()) {
      return res.status(400).json({
        success: false,
        message: "Зүүдний тайлбар шаардлагатай",
      });
    }

    // If no valid API key, use mock response
    if (!hasValidApiKey) {
      console.log("🤖 Using mock response (no API key configured)");

      // Find relevant mock interpretation or use a generic one
      const dreamLower = dream.toLowerCase();
      let mockResponse = mockInterpretations[0].interpretation; // Default

      for (const mock of mockInterpretations) {
        if (dreamLower.includes(mock.dream)) {
          mockResponse = mock.interpretation;
          break;
        }
      }

      // Add a note about the mock response
      mockResponse +=
        "\n\n💡 Энэ бол туршилтын хариулт юм. Жинхэнэ AI тайлалд Gemini API түлхүүр шаардлагатай.";

      return res.json({
        success: true,
        interpretation: mockResponse,
        isMock: true,
      });
    }

    // Create Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Та бол зүүдний тайлагч мэргэжилтэн. Монгол хэлээр зүүдний тайлал хийнэ үү.
    
    Зүүд: ${dream}
    
    Дараах форматаар хариулна уу:
    1. Товч тайлал (2-3 өгүүлбэр)
    2. Дэлгэрэнгүй тайлал (5-7 өгүүлбэр)
    3. Зөвлөмж (2-3 зөвлөмж)
    
    Хариултыг зөвхөн Монгол хэлээр бичнэ үү. Хариулт нь эерэг, урам зоригтой байх ёстой.
    `;

    console.log("🤖 Sending request to Gemini AI...");
    console.log("📝 Dream:", dream.substring(0, 100) + "...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interpretation = response.text();

    console.log("✅ Gemini AI response received");
    console.log("📄 Response length:", interpretation.length);

    res.json({
      success: true,
      interpretation: interpretation,
      isMock: false,
    });
  } catch (error) {
    console.error("❌ Dream interpretation error:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
    });

    // Provide more specific error messages
    let errorMessage = "Зүүдний тайлалд алдаа гарлаа. Дахин оролдоно уу.";
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
