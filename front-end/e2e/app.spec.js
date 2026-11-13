const {test,expect} = require("@playwright/test");
const groupFor={
  "Таро дэлгэмэл":"Таро","Нэг карт":"Таро","78 карт":"Таро","Таро сурах":"Таро",
  "Орд":"Зурхай","Төрсөн үеийн тэнгэр":"Зурхай","Сарны календарь":"Зурхай",
  "Өдрийн карт":"Өдөр тутам","Өдрийн санаа":"Өдөр тутам","Зүүд":"Өдөр тутам","Удирдамж":"Өдөр тутам",
  "Миний түүх":"Тэмдэглэл","Offline карт":"Офлайн","Хувийн тохиргоо":"Офлайн",
};
async function openView(page,name){
  const group=groupFor[name];
  if(!group)throw new Error("Unknown view: "+name);
  await page.getByRole("button",{name:group,exact:true}).click();
  await page.getByRole("button",{name,exact:true}).click();
}


test("offline-first tarot: three-card spread, sequential reveal and history",async({page})=>{
  const external=[];
  page.on("request",req=>{
    if(/onrender\.com|generativelanguage\.googleapis\.com|api\.openai\.com/.test(req.url()))external.push(req.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Уламжлалт таро"})).toBeVisible();
  await page.locator("button").filter({hasText:"Өнгөрсөн • Одоо • Боломжит чиглэл"}).click();
  await page.getByRole("button",{name:/Хольж, хөзөр сугалах/}).click();
  for(let i=0;i<3;i++){
    await page.getByRole("button",{name:/Дараагийн картыг нээх/}).click();
  }
  await expect(page.getByRole("heading",{name:"Таны уншилтын тайлал"})).toBeVisible();
  await expect(page.getByText(/Картуудын холбоо/)).toBeVisible();
  await page.locator("#reading-notes").fill("E2E тэмдэглэл");
  await page.getByRole("button",{name:/Төхөөрөмж дээр хадгалах/}).click();
  await expect(page.getByText(/энэ төхөөрөмж дээр уншилтыг хадгаллаа/i)).toBeVisible();
  await openView(page,"Миний түүх");
  await expect(page.getByRole("heading",{name:"Уншилтын түүх"})).toBeVisible();
  await page.getByRole("button",{name:"Дэлгэрэнгүй"}).first().click();
  await expect(page.getByRole("textbox",{name:"Тэмдэглэл засах"})).toHaveValue("E2E тэмдэглэл");
  await page.locator('textarea[id^="history-notes-"]').fill("Edited E2E note");
  await page.getByRole("button",{name:"Тэмдэглэл хадгалах"}).click();
  await expect(page.getByRole("textbox",{name:"Тэмдэглэл засах"})).toHaveValue("Edited E2E note");
  expect(external).toEqual([]);
});
test("all 78 local card images are discoverable",async({page})=>{
  await page.goto("/");
  await openView(page,"78 карт");
  await expect(page.locator("main button img[alt]")).toHaveCount(78);
  await page.getByRole("button",{name:/The Fool/}).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button",{name:"Хаах"}).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("one-card draw, date zodiac and dream reflection work without API",async({page})=>{
  await page.goto("/");
  await openView(page,"Нэг карт");
  await page.getByRole("button",{name:"Санамсаргүй нэг карт сугалах"}).click();
  await expect(page.getByRole("heading",{name:"Эргэцүүлэх тайлал"})).toBeVisible();
  await openView(page,"Орд");
  await page.locator("#horoscope-birth-date").fill("2024-02-29");
  await page.getByRole("button",{name:"Ордны тайлбар харах"}).click();
  await expect(page.getByText(/Загас \(Ус\)/)).toBeVisible();
  await openView(page,"Зүүд");
  await page.locator("#dream-text").fill("Би далайд сэлж байсан");
  await page.getByRole("button",{name:"Бэлгэдлийг тайлбарлах"}).click();
  await expect(page.getByText(/Ус: мэдрэмж/)).toBeVisible();
});
test("natal chart computes 10 bodies, ascendant and whole-sign houses locally",async({page})=>{
  await page.goto("/");
  await openView(page,"Төрсөн үеийн тэнгэр");
  await page.locator("#natal-date").fill("2024-03-20");
  await page.locator("#natal-time").fill("11:06");
  await page.locator("#natal-offset").fill("8");
  await page.locator("#natal-lat").fill("47.9");
  await page.locator("#natal-lon").fill("106.9");
  await page.getByRole("button",{name:"Тэнгэрийн зураг тооцоолох"}).click();
  await expect(page.locator("table tbody tr")).toHaveCount(10);
  await expect(page.getByText(/Whole Sign Houses/)).toBeVisible();
  await expect(page.locator("p").filter({hasText:/Ascendant:/}).first()).toBeVisible();
});
test("mobile navigation reaches daily card and learning mode",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  await openView(page,"Өдрийн карт");
  await expect(page.getByRole("heading",{name:"Өнөөдрийн карт"})).toBeVisible();
  await openView(page,"Таро сурах");
  await expect(page.getByRole("heading",{name:"Таро сурах"})).toBeVisible();
  await page.getByRole("button",{name:"Дасгал эхлүүлэх"}).click();
  await expect(page.getByText("Энэ ямар карт вэ?")).toBeVisible();
});
test("PWA reloads the app shell with networking disabled after first install",async({page,context,browserName})=>{
  test.skip(browserName!=="chromium","Service worker offline integration is validated by Chromium; other browsers run online smoke tests.");
  await page.goto("/");
  await page.evaluate(async()=>{
    if(!("serviceWorker" in navigator))throw new Error("PWA not supported");
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload({waitUntil:"domcontentloaded"});
  await expect(page.getByRole("heading",{name:"Уламжлалт таро"})).toBeVisible();
  await context.setOffline(false);
});

test("custom tarot spread uses user's card count and labeled positions",async({page})=>{
  await page.goto("/");
  await page.locator("#custom-card-count").selectOption("4");
  await page.locator("#custom-position-0").fill("Зорилго");
  await page.locator("#custom-position-1").fill("Боломж");
  await page.getByRole("button",{name:"Миний дэлгэмлийг эхлүүлэх"}).click();
  await expect(page.getByText("Миний 4 картын дэлгэмэл")).toBeVisible();
  await page.getByRole("button",{name:/Хольж, хөзөр сугалах/}).click();
  for(let i=0;i<4;i++)await page.getByRole("button",{name:/Дараагийн картыг нээх/}).click();
  await expect(page.getByText("Таны уншилтын тайлал")).toBeVisible();
  await expect(page.getByText(/Зорилго —/)).toBeVisible();
  await expect(page.getByText(/Боломж —/)).toBeVisible();
});

test("opt-in offline card pack saves all 78 images and survives an offline library visit",async({page,context,browserName})=>{
  test.skip(browserName!=="chromium","Cache Storage integration is validated by Chromium; other browsers run online smoke tests.");
  test.setTimeout(90000);
  await page.goto("/");
  await openView(page,"Offline карт");
  await expect(page.getByRole("heading",{name:"Офлайн картын сан"})).toBeVisible();
  await page.getByRole("button",{name:"78 зураг offline татах"}).click();
  await expect(page.getByRole("progressbar",{name:"Offline карт таталтын явц"}))
    .toHaveAttribute("aria-valuenow","78",{timeout:70000});
  await expect(page.getByText("78 / 78")).toBeVisible();
  await context.setOffline(true);
  await openView(page,"78 карт");
  await expect(page.locator("main button img")).toHaveCount(78);
  const first=page.locator("main button img").first();
  await expect.poll(()=>first.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  await context.setOffline(false);
});

test("deep links and browser back restore the correct grouped view",async({page})=>{
  await page.goto("/?view=natal");
  await expect(page.getByRole("heading",{name:"Төрсөн үеийн тэнгэрийн зураг"})).toBeVisible();
  await openView(page,"78 карт");
  await expect(page).toHaveURL(/view=library/);
  await expect(page.getByRole("heading",{name:"78 картын сан"})).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/view=natal/);
  await expect(page.getByRole("heading",{name:"Төрсөн үеийн тэнгэрийн зураг"})).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("heading",{name:"78 картын сан"})).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading",{name:"78 картын сан"})).toBeVisible();
});

test("save a custom spread template and reuse it after returning to spread selection",async({page})=>{
  await page.goto("/");
  await page.locator("#custom-spread-name").fill("Миний тестийн дэлгэмэл");
  await page.locator("#custom-card-count").selectOption("2");
  await page.locator("#custom-position-0").fill("Өмнөх нөхцөл");
  await page.locator("#custom-position-1").fill("Одоогийн алхам");
  await page.getByRole("button",{name:"Дэлгэмлийг хадгалах"}).click();
  await expect(page.getByText("Дэлгэмлийг энэ төхөөрөмж дээр хадгаллаа.")).toBeVisible();
  await page.getByRole("button",{name:/Миний тестийн дэлгэмэл.*карт/}).click();
  await expect(page.getByRole("heading",{name:"Миний тестийн дэлгэмэл"})).toBeVisible();
  await page.getByRole("button",{name:"Дэлгэмэл солих"}).click();
  await expect(page.getByText("Миний тестийн дэлгэмэл")).toBeVisible();
});
test("journal favorites filter and search work on saved readings",async({page})=>{
  await page.goto("/");
  await openView(page,"Нэг карт");
  await page.getByRole("button",{name:"Санамсаргүй нэг карт сугалах"}).click();
  await page.locator("#single-card-notes").fill("Unique favorite journal search token");
  await page.getByRole("button",{name:"Хадгалах",exact:true}).click();
  await openView(page,"Миний түүх");
  await page.getByRole("button",{name:"Дуртайд нэмэх"}).click();
  await page.getByLabel("Зөвхөн дуртай уншилт").check();
  await page.getByRole("searchbox",{name:"Уншилт хайх"}).fill("Unique favorite journal");
  await page.getByRole("button",{name:"Дэлгэрэнгүй"}).click();
  await expect(page.getByRole("textbox",{name:"Тэмдэглэл засах"})).toHaveValue("Unique favorite journal search token");
  await page.getByRole("searchbox",{name:"Уншилт хайх"}).fill("no such result anywhere");
  await expect(page.getByText("Шүүлтүүрт тохирох уншилт олдсонгүй.")).toBeVisible();
});
test("IANA city natal chart selection computes without entering UTC offset",async({page})=>{
  await page.goto("/");
  await openView(page,"Төрсөн үеийн тэнгэр");
  await page.locator("#natal-city").selectOption("ulaanbaatar");
  await page.locator("#natal-date").fill("2024-11-01");
  await page.locator("#natal-time").fill("10:00");
  await page.getByRole("button",{name:"Тэнгэрийн зураг тооцоолох"}).click();
  await expect(page.locator("table tbody tr")).toHaveCount(10);
  await expect(page.getByText(/2024-11-01T02:00:00/)).toBeVisible();
});

test("reading preferences persist and upright-only card draw respects setting",async({page})=>{
  await page.goto("/");
  await openView(page,"Хувийн тохиргоо");
  await page.getByLabel("Урвуу карт оруулах").uncheck();
  await page.locator("#back-style").selectOption("moon");
  await expect(page.getByText("Тохиргоог зөвхөн энэ төхөөрөмж дээр хадгаллаа.")).toBeVisible();
  await openView(page,"Нэг карт");
  await page.getByRole("button",{name:"Санамсаргүй нэг карт сугалах"}).click();
  await expect(page.getByText("Урвуу", {exact:true})).toHaveCount(0);
  await openView(page,"Хувийн тохиргоо");
  await expect(page.getByLabel("Урвуу карт оруулах")).not.toBeChecked();
  await expect(page.locator("#back-style")).toHaveValue("moon");
});

test("legacy account JSON can be imported locally without a backend request",async({page})=>{
  const external=[];
  page.on("request",req=>{
    if(req.url().includes("/api/"))external.push(req.url());
  });
  await page.goto("/");
  await openView(page,"Миний түүх");
  page.on("dialog",dialog=>void dialog.accept());
  const payload={readings:[{
    id:"old17",cardId:6,cardName:"The Lovers",cardMeaning:"Хуучин картын тайлал",
    question:"Миний хуучин асуулт",notes:"Өмнөх тэмдэглэл",isFavorite:true,
    readingDate:"2024-05-02T13:40:00.000Z"
  }]};
  await page.locator('input[aria-label="Хуучин account export JSON"]').setInputFiles({
    name:"legacy.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(payload))
  });
  await expect(page.getByText(/1 хуучин уншилт импортлогдлоо/)).toBeVisible();
  await expect(page.getByText("Миний хуучин асуулт")).toBeVisible();
  await expect(page.getByText("Нийт уншилт")).toBeVisible();
  expect(external).toEqual([]);
});

test("lazy-loaded natal chart works without internet after full PWA shell install",async({page,context,browserName})=>{
  test.skip(browserName!=="chromium","Offline PWA integration is tested on Chromium.");
  await page.goto("/");
  await page.evaluate(async()=>navigator.serviceWorker.ready);
  await context.setOffline(true);
  await openView(page,"Төрсөн үеийн тэнгэр");
  await expect(page.getByRole("heading",{name:"Төрсөн үеийн тэнгэрийн зураг"})).toBeVisible();
  await page.locator("#natal-city").selectOption("ulaanbaatar");
  await page.locator("#natal-date").fill("2024-11-01");
  await page.locator("#natal-time").fill("10:00");
  await page.getByRole("button",{name:"Тэнгэрийн зураг тооцоолох"}).click();
  await expect(page.locator("table tbody tr")).toHaveCount(10);
  await context.setOffline(false);
});

test("complete offline backup can export and restore settings without network calls",async({page})=>{
  await page.goto("/");
  await openView(page,"Хувийн тохиргоо");
  await page.getByLabel("Урвуу карт оруулах").uncheck();
  await page.locator("#back-style").selectOption("moon");
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Бүх data export"}).click();
  const download=await downloadPromise;
  const backupFile=await download.path();
  await page.getByLabel("Урвуу карт оруулах").check();
  await page.locator("#back-style").selectOption("star");
  page.on("dialog",dialog=>void dialog.accept());
  await page.locator('input[aria-label="Бүх data import JSON"]').setInputFiles(backupFile);
  await expect(page.getByLabel("Урвуу карт оруулах")).not.toBeChecked();
  await expect(page.locator("#back-style")).toHaveValue("moon");
});

test("spaced-repetition quiz persists study progress and complete backup v3",async({page})=>{
  await page.goto("/");
  await openView(page,"Таро сурах");
  await page.getByRole("button",{name:"Дасгал эхлүүлэх"}).click();
  await expect(page.getByText("Энэ ямар карт вэ?")).toBeVisible();
  const candidates=page.locator("section .grid button");
  await expect(candidates).toHaveCount(4);
  await candidates.first().click();
  await expect(page.getByText(/Энэ удаагийн оноо: [01] \/ 1/)).toBeVisible();
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("pocket-tarot-study-v1")||"[]"));
  expect(progress).toHaveLength(1);
  expect(progress[0].seen).toBe(1);
  await page.reload();
  await openView(page,"Таро сурах");
  await expect(page.getByText("1/78")).toBeVisible();
  await openView(page,"Хувийн тохиргоо");
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Бүх data export"}).click();
  const download=await downloadPromise;
  const file=await download.path();
  const buffer=require("node:fs").readFileSync(file,"utf8");
  const backup=JSON.parse(buffer);
  expect(backup.version).toBe(3);
  expect(backup.study).toHaveLength(1);
});

test("offline lunar calendar renders a month and changes months without API calls",async({page})=>{
  const api=[];
  page.on("request",request=>{if(request.url().includes("/api/"))api.push(request.url());});
  await page.goto("/");
  await openView(page,"Сарны календарь");
  await expect(page).toHaveURL(/view=moon/);
  await expect(page.getByRole("heading",{name:"Сарны фазын календарь"})).toBeVisible();
  const dates=page.locator('div[aria-label="Сарны фазын өдрийн календарь"] button');
  expect(await dates.count()).toBeGreaterThanOrEqual(28);
  const firstMonth=await page.locator("h2").first().innerText();
  await page.getByRole("button",{name:"Дараагийн сар"}).click();
  const secondMonth=await page.locator("h2").first().innerText();
  expect(secondMonth).not.toBe(firstMonth);
  await dates.first().click();
  await expect(page.getByText(/Ойролцоох гэрэлтэлт:/)).toBeVisible();
  expect(api).toEqual([]);
});

test("tarot library filters all 56 minors by suit and shows educational details",async({page})=>{
  await page.goto("/");
  await openView(page,"78 карт");
  await page.locator("#library-suit").selectOption("Cups");
  await expect(page.getByText("Нийт 14 / 78 карт харагдаж байна.")).toBeVisible();
  await expect(page.locator("main button img[alt]")).toHaveCount(14);
  await page.locator("#library-element").selectOption("Ус");
  await expect(page.locator("main button img[alt]")).toHaveCount(14);
  await page.locator("main button").filter({has:page.locator("img[alt]")}).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("dt").filter({hasText:"Элемент"})).toBeVisible();
  await page.getByRole("button",{name:"Хаах"}).click();
  await page.getByRole("button",{name:"Шүүлтүүр цэвэрлэх"}).click();
  await expect(page.locator("main button img[alt]")).toHaveCount(78);
});

test("keyboard-only skip link and library dialog restore focus on Escape",async({page})=>{
  await page.goto("/?view=library");
  await expect(page.getByRole("heading",{name:"78 картын сан"})).toBeVisible();
  const skip=page.getByRole("link",{name:"Үндсэн агуулга руу очих"});
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  const firstCard=page.locator("main button").filter({has:page.locator("img[alt]")}).first();
  await firstCard.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button",{name:"Хаах"})).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(firstCard).toBeFocused();
});

test("Celtic Cross has a spatial crossing and 10 accessible numbered cards",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:/Келтийн загалмай/}).click();
  await page.getByRole("button",{name:/Хольж, хөзөр сугалах/}).click();
  await expect(page.getByRole("region",{name:/Келтийн загалмайн визуал байршил/})).toBeVisible();
  await expect(page.getByRole("listitem").filter({has:page.getByText(/10\. Нийт чиглэл/)})).toHaveCount(1);
  for(let i=0;i<10;i++)
    await page.getByRole("button",{name:/Дараагийн картыг нээх/}).click();
  await expect(page.getByRole("heading",{name:"Таны уншилтын тайлал"})).toBeVisible();
});
test("IndexedDB journal supports more than 100 readings with pagination and export",async({page})=>{
  await page.goto("/");
  await openView(page,"Миний түүх");
  const readings=Array.from({length:105},(_,i)=>({
    id:"large-"+String(i).padStart(3,"0"),
    date:new Date(Date.UTC(2024,10,1,12,i%60)).toISOString(),
    spread:"Archive test",question:"Archive test #"+i,
    reading:"Local archive without backend",notes:"Record "+i,
    cards:[{id:i%78,reversed:false,position:1}]
  }));
  const payload={format:"pocket-tarot-readings",version:2,readings};
  await page.locator('input[aria-label="JSON уншилт импортлох"]').setInputFiles({
    name:"journal-v2.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(payload))
  });
  await expect(page.getByText("105 уншилт импортлогдлоо.")).toBeVisible();
  await expect(page.getByText(/1 \/ 6 хуудас/)).toBeVisible();
  await page.getByRole("button",{name:"Дараах"}).click();
  await expect(page.getByText(/2 \/ 6 хуудас/)).toBeVisible();
  const downloadEvent=page.waitForEvent("download");
  await page.getByRole("button",{name:"JSON export"}).click();
  const downloaded=await downloadEvent;
  const backup=JSON.parse(require("node:fs").readFileSync(await downloaded.path(),"utf8"));
  expect(backup.readings).toHaveLength(105);
  expect(backup.version).toBe(2);
});
test("daily journal note draft survives leaving the section",async({page})=>{
  await page.goto("/");
  await openView(page,"Өдрийн карт");
  const notes=page.locator("#daily-notes");
  await notes.fill("Unique draft memory 2026");
  await openView(page,"Орд");
  await openView(page,"Өдрийн карт");
  await expect(page.locator("#daily-notes")).toHaveValue("Unique draft memory 2026");
  const keys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith("pocket-tarot-draft-v1:daily-")));
  expect(keys).toHaveLength(1);
});
