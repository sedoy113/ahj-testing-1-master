import puppetteer from 'puppeteer';
import { fork } from 'child_process';

jest.setTimeout(30000); // default puppeteer timeout

describe('Credit Card Validator form', () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = 'http://localhost:8080';

  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppetteer.launch({
      // headless: false, // show gui
      // slowMo: 100,
      // devtools: true, // show devTools
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test('valid card number', async () => {
    await page.goto(baseUrl);
    const form = await page.$('.validator .card_form');
    const input = await form.$('.card_input');
    await input.type('4111111111111111');
    const submit = await form.$('.card_form button');
    submit.click();
    await page.waitFor('.validity .valid');
  });

  test('invalid card number', async () => {
    await page.goto(baseUrl);
    const form = await page.$('.validator .card_form');
    const input = await form.$('.card_input');
    await input.type('41111111111111');
    const submit = await form.$('.card_form button');
    submit.click();
    await page.waitFor('.validity .invalid');
  });
});
