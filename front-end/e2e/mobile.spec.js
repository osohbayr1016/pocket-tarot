const {test,expect}=require("@playwright/test");

test("touch navigation reaches offline install help without page overflow",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Уламжлалт таро"})).toBeVisible();
  await page.getByRole("link",{name:"Офлайн",exact:true}).tap();
  await page.getByRole("link",{name:"Карт татах",exact:true}).tap();
  await expect(page.getByRole("heading",{name:"Офлайн картын сан"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Утсан дээрээ апп шиг суулгах"})).toBeVisible();
  const hasOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
  expect(hasOverflow).toBe(false);
});
test("mobile daily note remains available after switching tabs",async({page})=>{
  await page.goto("/");
  await page.getByRole("link",{name:"Өдөр тутам",exact:true}).tap();
  await page.getByRole("link",{name:"Өдрийн карт",exact:true}).tap();
  const notes=page.locator("#daily-notes");
  await expect(notes).toBeEnabled();
  await notes.fill("Mobile private draft");
  await page.getByRole("link",{name:"Зүүдний тайлал",exact:true}).tap();
  await expect(page.getByRole("heading",{name:/Зүүд/})).toBeVisible();
  await page.getByRole("link",{name:"Өдрийн карт",exact:true}).tap();
  await expect(page.locator("#daily-notes")).toHaveValue("Mobile private draft");
});

test("choose and read on a phone without searching below the deck",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:/Гурван карт/}).tap();
  await page.getByRole("button",{name:"Картаа холих"}).tap();
  const pick=page.getByRole("button",{name:"Ширээнээс 5-р картыг сонгох"});
  await expect(pick).toBeInViewport();
  await pick.tap();
  await expect(page.locator(".meaning-heading")).toBeInViewport();
  await expect(page.locator(".reading-panel")).toBeVisible();
  await page.getByRole("button",{name:"Ширээнээс дахин сонгох"}).tap();
  await expect(page.locator(".pick-card")).toHaveCount(4);
  await expect(page.locator(".table-column")).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test("a selected mobile tarot card fits the table and previous positions remain selectable",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:/Гурван карт/}).tap();
  await page.getByRole("button",{name:"Картаа холих"}).tap();
  await page.locator(".pick-card").last().tap();
  await expect(page.locator(".reading-panel")).toBeVisible();
  await page.getByRole("button",{name:"Ширээнээс дахин сонгох"}).tap();
  await page.locator(".pick-card").first().tap();
  await page.getByRole("button",{name:"Карт",exact:true}).tap();
  await expect(page.locator(".revealed-art .reveal-front img")).toBeVisible();
  const fits=await page.evaluate(()=>{
    const artwork=document.querySelector(".reveal-flip")?.getBoundingClientRect();
    const felt=document.querySelector(".felt")?.getBoundingClientRect();
    return !!artwork&&!!felt&&artwork.left>=felt.left-2&&artwork.right<=felt.right+2&&artwork.top>=felt.top-2&&artwork.bottom<=felt.bottom+2;
  });
  expect(fits).toBe(true);
  await page.locator(".position-list button").first().tap();
  await expect(page.locator(".position-list button").first()).toHaveAttribute("aria-pressed","true");
});
