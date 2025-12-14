// handler.js
const chromium  = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const { buildHTML } = require('./ganttBuilder');

module.exports.render = async (event) => {
  console.log("📸 Render function triggered");
  const path = await chromium.executablePath();

  // Parse the JSON input
  let tasks = [];
  try {
    const body = JSON.parse(event.body || '{}');
    if (Array.isArray(body.tasks)) {
      tasks = body.tasks;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid or missing tasks array' }) };
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Malformed JSON' }) };
  }

  // Launch headless browser with AWS-compatible Chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: path,
    headless: chromium.headless,
    defaultViewport: chromium.defaultViewport,
  });

  const page = await browser.newPage();
  await page.setContent(buildHTML(tasks), { waitUntil: 'domcontentloaded' });
  const screenshot = await page.screenshot({ type: 'png', fullPage: true });
  await browser.close();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/png' },
    body: screenshot.toString('base64'),
    isBase64Encoded: true,
  };
};
