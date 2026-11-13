export interface TarotPosition {
  position: number;
  name: string;
  description: string;
}
export interface TarotSpread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: TarotPosition[];
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "general" | "love" | "career" | "spiritual";
}
const source: Array<{
  id: string; name: string; description: string; category: TarotSpread["category"];
  difficulty: TarotSpread["difficulty"]; items: [string, string][];
}> = [
  {
    "id": "one-card",
    "name": "Нэг карт",
    "description": "Одоогийн нөхцөлд анхаарах нэг сэдэв",
    "category": "general",
    "difficulty": "beginner",
    "items": [
      [
        "Өнөөдрийн сэдэв",
        "Таны анхаарч болох гол асуудал"
      ]
    ]
  },
  {
    "id": "three-card",
    "name": "Өнгөрсөн • Одоо • Боломжит чиглэл",
    "description": "Цаг хугацааны гурван өнцгийг харьцуулж эргэцүүлэх",
    "category": "general",
    "difficulty": "beginner",
    "items": [
      [
        "Өнгөрсөн",
        "Одоогийн нөхцөлд нөлөөлсөн өмнөх үйл явдал"
      ],
      [
        "Одоо",
        "Одоо анхаарах шаардлагатай зүйл"
      ],
      [
        "Боломжит чиглэл",
        "Одоогийн хэв маяг үргэлжилбэл анзаарах боломж"
      ]
    ]
  },
  {
    "id": "love",
    "name": "Харилцааны таван карт",
    "description": "Хайр ба харилцааны талаар өөрийгөө эргэцүүлэх",
    "category": "love",
    "difficulty": "intermediate",
    "items": [
      [
        "Миний байр суурь",
        "Өөрийн мэдрэмж ба хүлээлт"
      ],
      [
        "Нөгөө талын өнцөг",
        "Нөгөө хүний талаар таамаглал биш, харилцаанд ажиглаж болох зүйл"
      ],
      [
        "Холбооны хүч",
        "Тогтвортой тал"
      ],
      [
        "Сорилт",
        "Ярилцаж шийдэх саад"
      ],
      [
        "Зөвлөмж",
        "Дараагийн эрүүл алхам"
      ]
    ]
  },
  {
    "id": "career",
    "name": "Ажил, карьерын зургаан карт",
    "description": "Мэргэжлийн шийдвэрээ олон талаас харах",
    "category": "career",
    "difficulty": "intermediate",
    "items": [
      [
        "Одоогийн ажил",
        "Таны одоогийн байр суурь"
      ],
      [
        "Давуу тал",
        "Ашиглаж болох чадвар"
      ],
      [
        "Саад",
        "Шалгах шаардлагатай хязгаарлалт"
      ],
      [
        "Боломж",
        "Хөгжүүлж болох чиглэл"
      ],
      [
        "Бодит алхам",
        "Одоо хийх жижиг үйлдэл"
      ],
      [
        "Урт хугацааны чиглэл",
        "Тогтвортой хөгжлийн тухай эргэцүүлэл"
      ]
    ]
  },
  {
    "id": "celtic-cross",
    "name": "Келтийн загалмай",
    "description": "Уламжлалт арван картын өргөн хүрээтэй уншилт",
    "category": "general",
    "difficulty": "advanced",
    "items": [
      [
        "Гол нөхцөл",
        "Асуултын төв"
      ],
      [
        "Хөндлөн нөлөө",
        "Саад эсвэл боломж"
      ],
      [
        "Ухамсарт зорилго",
        "Таны мэдэж буй хүсэл"
      ],
      [
        "Гүн суурь",
        "Далд хандлага эсвэл үндэс"
      ],
      [
        "Өнгөрсөн",
        "Ард үлдэж буй нөлөө"
      ],
      [
        "Ойрын чиглэл",
        "Үүсэж болох дараагийн нөхцөл"
      ],
      [
        "Өөрийн байр суурь",
        "Таны хандлага, оролцоо"
      ],
      [
        "Орчин",
        "Хүрээлж буй хүмүүс ба нөхцөл"
      ],
      [
        "Найдвар ба айдас",
        "Хүсэл болон болгоомжлол"
      ],
      [
        "Нийт чиглэл",
        "Бусад картын сэдэвт тулгуурласан дүгнэлт"
      ]
    ]
  }
];
export const tarotSpreads: TarotSpread[] = source.map((item) => ({
  id: item.id, name: item.name, description: item.description,
  category: item.category, difficulty: item.difficulty,
  cardCount: item.items.length,
  positions: item.items.map(([name, description], index) => ({
    position: index + 1, name, description,
  })),
}));
export const getSpreadById = (id: string): TarotSpread | undefined =>
  tarotSpreads.find((spread) => spread.id === id);
