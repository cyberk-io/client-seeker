const puppeteer = require("puppeteer");

puppeteer.launch({ headless: false }).then(async (browser) => {
  const page = await browser.newPage();
  await page.goto("https://cryptorank.io/price/jan-3");

  const links = await page.$$eval(
    "div.sc-a1033891-0.hOpBIt a[href]",
    (anchors) => anchors.map((anchor) => anchor.href)
  );

  console.log(links);
  await browser.close();
});
