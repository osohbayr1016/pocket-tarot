# Pocket Tarot 🔮

A mystical tarot reading website with AI-powered dream interpretation, built with Next.js, Express.js, and MongoDB.

## ✨ Features

- 🔮 **Tarot Card Reading**: Interactive tarot card selection and readings
- 💭 **AI Dream Interpretation**: Powered by Google Gemini AI in Mongolian
- ⭐ **Horoscope**: Daily horoscope readings (coming soon)
- 🎯 **Daily Fortune**: Daily fortune predictions (coming soon)
- 🔐 **User Authentication**: Secure login system (coming soon)
- 📱 **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini AI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pocket-tarot.git
cd pocket-tarot

# Install all dependencies
npm run install:all

# Set up environment variables
cp back-end/config.env back-end/.env
# Edit back-end/.env with your configuration

# Start development servers
npm run dev
```

### Environment Variables

#### Backend (`back-end/.env`)

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/pocket-tarot
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

#### Frontend (`front-end/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                    # Start both frontend and backend
npm run dev:frontend          # Start frontend only
npm run dev:backend           # Start backend only

# Building
npm run build                 # Build frontend for production
npm run build:frontend        # Build frontend only
npm run build:backend         # Build backend only

# Production
npm start                     # Start backend in production
npm run start:frontend        # Start frontend in production

# Installation
npm run install:all          # Install dependencies for all packages
```

### Project Structure

```
pocket-tarot/
├── front-end/                 # Next.js frontend
│   ├── src/app/              # App router pages
│   ├── src/app/components/   # React components
│   ├── src/app/data/         # Static data (tarot cards)
│   └── public/               # Static assets
├── back-end/                 # Express.js backend
│   ├── routes/               # API routes
│   ├── models/               # MongoDB models
│   ├── middleware/           # Express middleware
│   └── config/               # Configuration files
├── package.json              # Root package.json
└── DEPLOYMENT_GUIDE.md       # Deployment instructions
```

## 🌐 API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Dream Interpretation

- `POST /api/dreams/interpret` - AI-powered dream interpretation

### Authentication (Coming Soon)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tarot Readings (Coming Soon)

- `POST /api/readings` - Save tarot reading
- `GET /api/readings` - Get user readings

## 🎨 Technologies Used

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library

### Backend

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Google Gemini AI** - AI integration
- **JWT** - Authentication
- **Passport.js** - OAuth strategies

### Development Tools

- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

### Quick Deploy

#### Frontend (Vercel)

```bash
cd front-end
vercel --prod
```

#### Backend (Railway/Render/Heroku)

```bash
cd back-end
# Follow platform-specific deployment steps
```

## 🔧 Configuration

### MongoDB Setup

1. Create a MongoDB Atlas account or use local MongoDB
2. Update `MONGODB_URI` in your environment variables

### Gemini AI Setup

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your environment variables

### CORS Configuration

The backend is configured to accept requests from:

- Development: `http://localhost:3000`, `http://localhost:3001`
- Production: Vercel domains and custom frontend URL

## 🧪 Testing

### API Testing

```bash
# Health check
curl http://localhost:5001/api/health

# Dream interpretation
curl -X POST http://localhost:5001/api/dreams/interpret \
  -H "Content-Type: application/json" \
  -d '{"dream":"Би нисэж байсан"}'
```

### Frontend Testing

```bash
cd front-end
npm run build
npm start
# Visit http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for dream interpretation
- Tarot card data and interpretations
- Next.js and Express.js communities
- All contributors and supporters

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment help
- Review the API documentation above

---

**Pocket Tarot** - Discover your destiny with mystical wisdom ✨
