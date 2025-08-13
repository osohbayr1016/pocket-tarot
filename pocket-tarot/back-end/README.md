# 🔮 Tarot Backend API

Монгол хэл дээрх таро уншилтын вэбсайтын backend API. Хэрэглэгчийн бүртгэл, нэвтрэлт, таро уншилтыг хадгалах боломжтой.

## 🚀 Онцлогууд

- **JWT Authentication** - Аюулгүй нэвтрэлт
- **PostgreSQL Database** - Уншилтыг хадгалах
- **User Management** - Хэрэглэгчийн бүртгэл, профайл
- **Reading Storage** - Таро уншилтыг хадгалах, унших
- **Statistics** - Уншилтын статистик
- **Mongolian Language** - Бүх мессежүүд монгол хэл дээр

## 📋 Шаардлага

- Node.js 16+
- PostgreSQL
- npm эсвэл yarn

## 🛠 Суулгах

1. **Dependencies суулгах:**

```bash
cd back-end
npm install
```

2. **Environment тохируулах:**

```bash
cp config.env.example config.env
# config.env файлыг засах
```

3. **PostgreSQL эхлүүлэх:**

# PostgreSQL суулгасан байх ёстой

# (see official docs for install)

4. **Server эхлүүлэх:**

```bash
DATABASE_URL=postgresql://neondb_owner:npg_I3Lz1EFbauod@ep-old-fog-a13y66d0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
# Development
npm run dev

# Production
npm start
```

## 🔧 Environment Variables

`config.env` файлд дараах тохиргоонуудыг оруулна:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_I3Lz1EFbauod@ep-old-fog-a13y66d0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`

Хэрэглэгч бүртгэх

**Request Body:**

```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Бат",
  "lastName": "Дорж",
  "birthDate": "1990-01-01"
}
```

#### POST `/api/auth/login`

Нэвтрэх

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`

Одоогийн хэрэглэгчийн мэдээлэл

**Headers:**

```
Authorization: Bearer <token>
```

#### PUT `/api/auth/profile`

Профайл шинэчлэх

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "firstName": "Бат",
  "lastName": "Дорж",
  "birthDate": "1990-01-01",
  "profileImage": "image_url"
}
```

### Reading Endpoints

#### POST `/api/readings`

Уншилт хадгалах

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "card": {
    "id": 0,
    "name": "Тэнэг",
    "emoji": "🤡",
    "description": "Шинэ эхлэл, цэвэр ариун байдал, санамсаргүй байдал",
    "meaning": "Тэнэг нь шинэ аяллууд, эрсдэл авах...",
    "future": "Таны амьдралд шинэ бүлэг эхлэх гэж байна...",
    "keywords": ["шинэ эхлэл", "цэвэр ариун байдал", "аялал"]
  },
  "question": "Миний ирээдүй ямар байх вэ?",
  "notes": "Энэ уншилт маш чухал байсан",
  "mood": "сайн",
  "tags": ["чухал", "амьдрал"],
  "isPublic": false
}
```

#### GET `/api/readings`

Уншилтуудыг авах (pagination, filter)

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` - Хуудас (default: 1)
- `limit` - Хязгаар (default: 10)
- `sort` - Эрэмбэ (default: -readingDate)
- `mood` - Сэтгэл хөдөлгөөн (сайн, дунд, муу, тодорхойгүй)
- `isFavorite` - Таалагдсан (true/false)
- `cardName` - Картын нэр
- `search` - Хайлт

#### GET `/api/readings/:id`

Тодорхой уншилт авах

#### PUT `/api/readings/:id`

Уншилт шинэчлэх

#### DELETE `/api/readings/:id`

Уншилт устгах

#### GET `/api/readings/stats/summary`

Уншилтын статистик

## 🗄 Database Models

### User Model

```javascript
{
  username: String,        // Хэрэглэгчийн нэр
  email: String,          // И-мэйл
  password: String,       // Нууц үг (hash)
  firstName: String,      // Нэр
  lastName: String,       // Овог
  birthDate: Date,        // Төрсөн огноо
  profileImage: String,   // Профайл зураг
  isActive: Boolean,      // Идэвхтэй эсэх
  lastLogin: Date,        // Сүүлд нэвтэрсэн
  readingCount: Number    // Уншилтын тоо
}
```

### Reading Model

```javascript
{
  user: ObjectId,         // Хэрэглэгчийн ID
  card: {                 // Картын мэдээлэл
    id: Number,
    name: String,
    emoji: String,
    description: String,
    meaning: String,
    future: String,
    keywords: [String]
  },
  question: String,       // Асуулт
  notes: String,          // Тэмдэглэл
  isFavorite: Boolean,    // Таалагдсан эсэх
  tags: [String],         // Тагууд
  mood: String,           // Сэтгэл хөдөлгөөн
  readingDate: Date,      // Уншилтын огноо
  isPublic: Boolean       // Нийтэд нээлттэй эсэх
}
```

## 🔒 Security Features

- **JWT Authentication** - Токен суурьтай нэвтрэлт
- **Password Hashing** - bcrypt ашиглан нууц үг hash
- **Input Validation** - Оролтын баталгаажуулалт
- **Rate Limiting** - Хүсэлтийн хязгаарлалт
- **CORS Protection** - Cross-origin хамгаалалт
- **Helmet Security** - HTTP header хамгаалалт

## 🚀 Production Deployment

1. **Environment тохируулах:**

```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_I3Lz1EFbauod@ep-old-fog-a13y66d0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secure-secret
```
