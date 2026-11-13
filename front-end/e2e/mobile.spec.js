const {test,expect}=require("@playwright/test");

test("touch navigation reaches offline install help without page overflow",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Уламжлалт таро"})).toBeVisible();
  await page.getByRole("button",{name:"Офлайн",exact:true}).tap();
  await page.getByRole("button",{name:"Offline карт",exact:true}).tap();
  await expect(page.getByRole("heading",{name:"Офлайн картын сан"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Утсан дээрээ апп шиг суулгах"})).toBeVisible();
  const hasOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
  expect(hasOverflow).toBe(false);
});
test("mobile daily note remains available after switching tabs",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Өдөр тутам",exact:true}).tap();
  await page.getByRole("button",{name:"Өдрийн карт",exact:true}).tap();
  const notes=page.locator("#daily-notes");
  await expect(notes).toBeEnabled();
  await notes.fill("Mobile private draft");
  await page.getByRole("button",{name:"Зүүд",exact:true}).tap();
  await expect(page.getByRole("heading",{name:/Зүүд/})).toBeVisible();
  await page.getByRole("button",{name:"Өдрийн карт",exact:true}).tap();
  await expect(page.locator("#daily-notes")).toHaveValue("Mobile private draft");
});
