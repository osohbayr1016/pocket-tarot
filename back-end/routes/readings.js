const express = require("express");
const { body, validationResult } = require("express-validator");
const Reading = require("../models/Reading");
const User = require("../models/User");

const router = express.Router();

// Validation middleware
const validateReading = [
  body("card.id")
    .isInt({ min: 0, max: 21 })
    .withMessage("Картын ID 0-21 хооронд байх ёстой"),
  body("card.name").notEmpty().withMessage("Картын нэр шаардлагатай"),
  body("card.emoji").notEmpty().withMessage("Картын эмодзи шаардлагатай"),
  body("card.description")
    .notEmpty()
    .withMessage("Картын тайлбар шаардлагатай"),
  body("card.meaning").notEmpty().withMessage("Картын утга шаардлагатай"),
  body("card.future").notEmpty().withMessage("Ирээдүйн таамаглал шаардлагатай"),
  body("card.keywords")
    .isArray({ min: 1 })
    .withMessage("Хамгийн багадаа 1 түлхүүр үг шаардлагатай"),
  body("question")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Асуулт хамгийн ихдээ 500 тэмдэгт байж болно"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Тэмдэглэл хамгийн ихдээ 1000 тэмдэгт байж болно"),
  body("mood")
    .optional()
    .isIn(["сайн", "дунд", "муу", "тодорхойгүй"])
    .withMessage("Зөв сэтгэл хөдөлгөөн сонгоно уу"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Тагууд массив хэлбэртэй байх ёстой"),
];

// @route   POST /api/readings
// @desc    Save new reading
// @access  Private
router.post("/", validateReading, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Оролтын алдаа",
        errors: errors.array(),
      });
    }

    const { card, question, notes, mood, tags, isPublic } = req.body;

    // Create new reading
    const reading = new Reading({
      user: req.user._id,
      card,
      question,
      notes,
      mood: mood || "тодорхойгүй",
      tags: tags || [],
      isPublic: isPublic || false,
    });

    await reading.save();

    // Update user's reading count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { readingCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Уншилт амжилттай хадгалагдлаа",
      data: {
        reading: {
          id: reading._id,
          card: reading.card,
          question: reading.question,
          notes: reading.notes,
          mood: reading.mood,
          tags: reading.tags,
          isFavorite: reading.isFavorite,
          isPublic: reading.isPublic,
          readingDate: reading.formattedDate,
          createdAt: reading.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Save reading error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   GET /api/readings
// @desc    Get user's readings with pagination and filters
// @access  Private
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-readingDate",
      mood,
      isFavorite,
      cardName,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { user: req.user._id };

    if (mood && mood !== "бүгд") {
      filter.mood = mood;
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite === "true";
    }

    if (cardName) {
      filter["card.name"] = { $regex: cardName, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { "card.name": { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Get readings
    const readings = await Reading.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Reading.countDocuments(filter);

    // Format readings
    const formattedReadings = readings.map((reading) => ({
      id: reading._id,
      card: reading.card,
      question: reading.question,
      notes: reading.notes,
      mood: reading.mood,
      tags: reading.tags,
      isFavorite: reading.isFavorite,
      isPublic: reading.isPublic,
      readingDate: new Date(reading.readingDate).toLocaleDateString("mn-MN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: reading.createdAt,
    }));

    res.json({
      success: true,
      data: {
        readings: formattedReadings,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReadings: total,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get readings error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   GET /api/readings/:id
// @desc    Get specific reading
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const reading = await Reading.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Уншилт олдсонгүй",
      });
    }

    res.json({
      success: true,
      data: {
        reading: {
          id: reading._id,
          card: reading.card,
          question: reading.question,
          notes: reading.notes,
          mood: reading.mood,
          tags: reading.tags,
          isFavorite: reading.isFavorite,
          isPublic: reading.isPublic,
          readingDate: reading.formattedDate,
          createdAt: reading.createdAt,
          updatedAt: reading.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get reading error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   PUT /api/readings/:id
// @desc    Update reading
// @access  Private
router.put(
  "/:id",
  [
    body("question")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Асуулт хамгийн ихдээ 500 тэмдэгт байж болно"),
    body("notes")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Тэмдэглэл хамгийн ихдээ 1000 тэмдэгт байж болно"),
    body("mood")
      .optional()
      .isIn(["сайн", "дунд", "муу", "тодорхойгүй"])
      .withMessage("Зөв сэтгэл хөдөлгөөн сонгоно уу"),
    body("tags")
      .optional()
      .isArray()
      .withMessage("Тагууд массив хэлбэртэй байх ёстой"),
    body("isFavorite")
      .optional()
      .isBoolean()
      .withMessage("Таалагдсан утга boolean байх ёстой"),
    body("isPublic")
      .optional()
      .isBoolean()
      .withMessage("Нийтэд нээлттэй утга boolean байх ёстой"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Оролтын алдаа",
          errors: errors.array(),
        });
      }

      const { question, notes, mood, tags, isFavorite, isPublic } = req.body;

      // Find and update reading
      const reading = await Reading.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id,
        },
        {
          ...(question !== undefined && { question }),
          ...(notes !== undefined && { notes }),
          ...(mood !== undefined && { mood }),
          ...(tags !== undefined && { tags }),
          ...(isFavorite !== undefined && { isFavorite }),
          ...(isPublic !== undefined && { isPublic }),
        },
        { new: true, runValidators: true }
      );

      if (!reading) {
        return res.status(404).json({
          success: false,
          message: "Уншилт олдсонгүй",
        });
      }

      res.json({
        success: true,
        message: "Уншилт амжилттай шинэчлэгдлээ",
        data: {
          reading: {
            id: reading._id,
            card: reading.card,
            question: reading.question,
            notes: reading.notes,
            mood: reading.mood,
            tags: reading.tags,
            isFavorite: reading.isFavorite,
            isPublic: reading.isPublic,
            readingDate: reading.formattedDate,
            updatedAt: reading.updatedAt,
          },
        },
      });
    } catch (error) {
      console.error("Update reading error:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа",
      });
    }
  }
);

// @route   DELETE /api/readings/:id
// @desc    Delete reading
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const reading = await Reading.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Уншилт олдсонгүй",
      });
    }

    // Update user's reading count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { readingCount: -1 },
    });

    res.json({
      success: true,
      message: "Уншилт амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Delete reading error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   GET /api/readings/stats/summary
// @desc    Get user's reading statistics
// @access  Private
router.get("/stats/summary", async (req, res) => {
  try {
    const stats = await Reading.getUserStats(req.user._id);

    // Get favorite cards
    const favoriteCards = await Reading.aggregate([
      { $match: { user: req.user._id, isFavorite: true } },
      {
        $group: {
          _id: "$card.name",
          count: { $sum: 1 },
          emoji: { $first: "$card.emoji" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get mood distribution
    const moodStats = await Reading.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: stats,
        favoriteCards,
        moodStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

module.exports = router;
