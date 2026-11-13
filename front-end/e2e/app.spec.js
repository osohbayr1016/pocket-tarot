const {test,expect} = require("@playwright/test");

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
  await page.getByRole("button",{name:"Миний түүх"}).click();
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
  await page.getByRole("button",{name:"78 карт"}).click();
  await expect(page.locator("main button img[alt]")).toHaveCount(78);
  await page.getByRole("button",{name:/The Fool/}).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button",{name:"Хаах"}).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("one-card draw, date zodiac and dream reflection work without API",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Нэг карт",exact:true}).click();
  await page.getByRole("button",{name:"Санамсаргүй нэг карт сугалах"}).click();
  await expect(page.getByRole("heading",{name:"Эргэцүүлэх тайлал"})).toBeVisible();
  await page.getByRole("button",{name:"Орд",exact:true}).click();
  await page.locator("#horoscope-birth-date").fill("2024-02-29");
  await page.getByRole("button",{name:"Ордны тайлбар харах"}).click();
  await expect(page.getByText(/Загас \(Ус\)/)).toBeVisible();
  await page.getByRole("button",{name:"Зүүд",exact:true}).click();
  await page.locator("#dream-text").fill("Би далайд сэлж байсан");
  await page.getByRole("button",{name:"Бэлгэдлийг тайлбарлах"}).click();
  await expect(page.getByText(/Ус: мэдрэмж/)).toBeVisible();
});
test("natal chart computes 10 bodies, ascendant and whole-sign houses locally",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Төрсөн үеийн тэнгэр"}).click();
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
  await page.getByRole("button",{name:"Өдрийн карт"}).click();
  await expect(page.getByRole("heading",{name:"Өнөөдрийн карт"})).toBeVisible();
  await page.getByRole("button",{name:"Таро сурах"}).click();
  await expect(page.getByRole("heading",{name:"Таро сурах"})).toBeVisible();
  await page.getByRole("button",{name:"Дасгал эхлүүлэх"}).click();
  await expect(page.getByText("Энэ ямар карт вэ?")).toBeVisible();
});
test("PWA reloads the app shell with networking disabled after first install",async({page,context})=>{
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

test("opt-in offline card pack saves all 78 images and survives an offline library visit",async({page,context})=>{
  test.setTimeout(90000);
  await page.goto("/");
  await page.getByRole("button",{name:"Offline карт"}).click();
  await expect(page.getByRole("heading",{name:"Офлайн картын сан"})).toBeVisible();
  await page.getByRole("button",{name:"78 зураг offline татах"}).click();
  await expect(page.getByRole("progressbar",{name:"Offline карт таталтын явц"}))
    .toHaveAttribute("aria-valuenow","78",{timeout:70000});
  await expect(page.getByText("78 / 78")).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button",{name:"78 карт"}).click();
  await expect(page.locator("main button img")).toHaveCount(78);
  const first=page.locator("main button img").first();
  await expect.poll(()=>first.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  await context.setOffline(false);
});
