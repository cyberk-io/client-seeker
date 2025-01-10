const puppeteer = require("puppeteer");

puppeteer.launch({ headless: false }).then(async (browser) => {
  const page = await browser.newPage();
  const link = "http://www.jan3.com/";
  await page.goto(link);

  const links = await page.$$eval("a[href]", (anchors, link) =>
    anchors
      .filter((anchor) => !anchor.href.includes(link))
      .map((anchor) => anchor.href)
  );

  console.log(links);
  await browser.close();
});
