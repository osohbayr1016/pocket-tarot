/** Names only. All astronomical coordinates come from astroChart, never translations. */
const bodies:Record<string,string>={
 "Нар":"Sun","Сар":"Moon","Буд":"Mercury","Сугар":"Venus",
 "Ангараг":"Mars","Бархасбадь":"Jupiter","Санчир":"Saturn",
 "Тэнгэрийн ван":"Uranus","Далай ван":"Neptune","Плутон":"Pluto"
};
const signs:Record<string,string>={
 "Хонь":"Aries","Үхэр":"Taurus","Ихэр":"Gemini","Мэлхий":"Cancer",
 "Арслан":"Leo","Охин":"Virgo","Жинлүүр":"Libra","Хилэнц":"Scorpio",
 "Нум":"Sagittarius","Матар":"Capricorn","Хумх":"Aquarius","Загас":"Pisces"
};
const aspects:Record<string,string>={
 "Нэгдэл":"Conjunction","Секстиль":"Sextile","Квадрат":"Square",
 "Трин":"Trine","Эсрэгцэл":"Opposition"
};
export const englishAstroBody=(name:string)=>bodies[name]||name;
export const englishAstroSign=(name:string)=>signs[name]||name;
export const englishAstroAspect=(name:string)=>aspects[name]||name;
