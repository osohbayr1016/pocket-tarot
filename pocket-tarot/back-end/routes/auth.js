const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const User = require("../models/User");
const { generateToken, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Хэрэглэгчийн нэр 3-30 тэмдэгт байх ёстой")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Хэрэглэгчийн нэр зөвхөн үсэг, тоо, доогуур зураас агуулж болно"
    ),
  body("email")
    .isEmail()
    .withMessage("Зөв и-мэйл хаяг оруулна уу")
    .normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой"),
  body("firstName")
    .isLength({ min: 2, max: 50 })
    .withMessage("Нэр 2-50 тэмдэгт байх ёстой"),
  body("lastName")
    .isLength({ min: 2, max: 50 })
    .withMessage("Овог 2-50 тэмдэгт байх ёстой"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Зөв төрсөн огноо оруулна уу"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Зөв и-мэйл хаяг оруулна уу")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Нууц үг оруулна уу"),
];

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", validateRegistration, async (req, res) => {
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

    const { username, email, password, firstName, lastName, birthDate } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Хэрэглэгч аль хэдийн бүртгэлтэй байна",
      });
    }

    // Create new user
    const user = new User({
      username: username || email.split("@")[0] + "_" + Date.now(),
      email,
      password,
      firstName,
      lastName,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      authProvider: "local",
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: "Хэрэглэгч амжилттай бүртгэгдлээ",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          readingCount: user.readingCount,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
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

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "И-мэйл эсвэл нууц үг буруу",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Хэрэглэгчийн эрх идэвхгүй болсон",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "И-мэйл эсвэл нууц үг буруу",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Амжилттай нэвтэрлээ",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          readingCount: user.readingCount,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.getFullName(),
          birthDate: req.user.birthDate,
          profileImage: req.user.profileImage,
          readingCount: req.user.readingCount,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Нэр 2-50 тэмдэгт байх ёстой"),
    body("lastName")
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage("Овог 2-50 тэмдэгт байх ёстой"),
    body("birthDate")
      .optional()
      .isISO8601()
      .withMessage("Зөв төрсөн огноо оруулна уу"),
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

      const { firstName, lastName, birthDate, profileImage } = req.body;

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(birthDate && { birthDate: new Date(birthDate) }),
          ...(profileImage && { profileImage }),
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Профайл амжилттай шинэчлэгдлээ",
        data: {
          user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            fullName: updatedUser.getFullName(),
            birthDate: updatedUser.birthDate,
            profileImage: updatedUser.profileImage,
            readingCount: updatedUser.readingCount,
          },
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа",
      });
    }
  }
);

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get(
  "/google",
  (req, res, next) => {
    console.log("Google OAuth initiated");
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("Callback URL:", "/api/auth/google/callback");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);

      // Redirect to frontend with token
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3002"
        }/auth-callback?token=${token}&success=true`
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3002"
        }/auth-callback?success=false&error=Authentication failed`
      );
    }
  }
);

// @route   GET /api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// @route   GET /api/auth/facebook/callback
// @desc    Facebook OAuth callback
// @access  Public
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);

      // Redirect to frontend with token
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3002"
        }/auth-callback?token=${token}&success=true`
      );
    } catch (error) {
      console.error("Facebook callback error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3002"
        }/auth-callback?success=false&error=Authentication failed`
      );
    }
  }
);

// @route   GET /api/auth/social-user
// @desc    Get social auth user data
// @access  Public
router.get("/social-user", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.getFullName(),
          profileImage: req.user.profileImage,
          authProvider: req.user.authProvider,
          readingCount: req.user.readingCount,
        },
        token: generateToken(req.user._id),
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
});

module.exports = router;
