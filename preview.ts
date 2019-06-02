import { IncomingMessage, ServerResponse } from 'http';
import { launch } from 'puppeteer-core';
import { parse } from 'url';

const chrome = require('chrome-aws-lambda');

const getScreenshot = async (url: string, full?: string) => {
  const browser = await launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});
  page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 2});
  await page.waitFor(1000);

  const file = await page.screenshot({fullPage: Boolean(full)});
  await browser.close();

  return file;
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  const { query } = parse(req.url, true)
  const {url, full} = query as {[key: string]: string};

  const file = await getScreenshot(url, full);
  res.statusCode = 200;
  res.setHeader('Content-Type', `image/png`);
  res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`);
  res.end(file);
}
