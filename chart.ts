import { IncomingMessage, ServerResponse } from 'http';
import { launch } from 'puppeteer-core';
import { parse } from 'url';

const chrome = require('chrome-aws-lambda');
const chartSelector = '.uk-width-small-1-1.uk-width-large-1-2 .chart';

const getScreenshot = async (token: string, userId: string, space: string) => {
  const browser = await launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();

  await page.goto(`https://app.storyblok.com/#!/external_login?access_token=${token}&user_id=${userId}`, {waitUntil: 'networkidle2'});
  await page.goto(`https://app.storyblok.com/#!/me/spaces/${space}/dashboard`, {waitUntil: 'networkidle2'});

  await page.waitFor(chartSelector);
  page.setViewport({width: 1440, height: 600, deviceScaleFactor: 2});
  await page.waitFor(1000);

  async function screenshotDOMElement(se: any, paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0) {
    const rect = await page.evaluate((selector: any) => {
      const element = document.querySelector(selector);
      const {x, y, width, height} = element.getBoundingClientRect();
      return {left: x, top: y, width, height, id: element.id};
    }, se);

    return page.screenshot({
      clip: {
        x: rect.left - paddingLeft,
        y: rect.top - paddingTop,
        width: rect.width + paddingLeft + paddingRight,
        height: rect.height + paddingTop + paddingBottom
      }
    });
  }

  const file = await screenshotDOMElement(chartSelector, 40, 10, 10, 10);
  await browser.close();

  return file;
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { query } = parse(req.url, true)
  const {token, userId, space} = query as {[key: string]: string};

  const file = await getScreenshot(token, userId, space);
  res.statusCode = 200;
  res.setHeader('Content-Type', `image/png`);
  res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`);
  res.end(file);
}
