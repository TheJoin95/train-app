// @ts-ignore
import { connect } from "puppeteer-real-browser";
import { type Browser, type Page, connect as connectMaster } from "puppeteer";
import * as fs from "fs/promises";
import { TravelData } from "./omio/extractor";

type StationsMap = {
  [type: string]: string;
};

const Locators: Record<string, string> = {
  checkBoxToggle: '[data-e2e="searchCheckbox"] .react-toggle',
  searchButton: '[data-e2e="buttonSearch"]',
  gdprButton: '[data-element="gdpr-banner-button-accept"]',
  oneTapContainer: "#credential_picker_container",
  suggestionLocator: '[data-e2e="positionSuggestion"]',
  currentCalendar:
    '[data-e2e="calendar"] [data-e2e*="calendarMonth-"]:nth-of-type(2)',
  calendarDay: '[data-e2e="calendarDay"]',
  calendarNextMonthButton: '[data-e2e="calendar"] div div svg',
  calendarFirstSelectedDay:
    '[data-e2e="calendarDay"][data-cy="firstSelectedDay"]',
};

class DynamicLocators {
  static stationLocator(mode: string): string {
    return `[data-id="${mode}Position"]`;
  }

  static dateLocator(mode: string): string {
    return `[data-e2e="button${mode}Date"]`;
  }
}

const STATIONS: StationsMap = {
  departure: "Paris",
  arrival: "Strasbourg",
};

connect({
  headless: 'auto',
  turnstile: true,
}).then(async (response: any) => {
  const { page, browser }: { page: Page; browser: Browser } = response;

  // @ts-ignore
  await page.goto(process.env.OMIO_BASE_URL, { waitUntil: "domcontentloaded" });

  await checkCookieBanner(page);
  await page.click(Locators.checkBoxToggle);

  await setStation(page, "departure");
  await setStation(page, "arrival");

  // 10 - November
  await setTime(page, "Departure", 27, 9);

  await page.locator(Locators.searchButton).click();

  const result = await page.waitForResponse(
    (response) => {
      if (
        response.url().includes(process.env.OMIO_RESULT_URL) &&
        response.status() === 200
      )
        return response;
    },
    { timeout: 5000 }
  );

  await fs.writeFile(
    "logs/response.json",
    JSON.stringify(TravelData.fromJSON(JSON.stringify(await result.json())))
  );
  await browser.close();
});

const checkCookieBanner = async (page: Page) => {
  if (await page.locator(Locators.gdprButton)) {
    await page.locator(Locators.gdprButton).click();
  }
};

const setStation = async (page: Page, mode: string) => {
  const stationLoc = await page.locator(DynamicLocators.stationLocator(mode));
  await stationLoc.click();
  await stationLoc.fill(STATIONS[mode]);
  await page.evaluate(() => setTimeout(() => false), 200);
  await selectFirstElementInStationList(page, mode);
};

const selectFirstElementInStationList = async (page: Page, mode: string) => {
  await page.locator(Locators.suggestionLocator).click();
};

const setTime = async (
  page: Page,
  mode: string,
  day = new Date().getDate(),
  month: number = new Date().getMonth() + 1,
  year: string = "2024"
) => {
  const time = await page.locator(DynamicLocators.dateLocator(mode));
  await time.click();

  // set month
  let selectedMonth, selectedDay;
  do {
    [selectedMonth, selectedDay] = await getSelectedMonthDay(page);

    if (month === selectedMonth) {
      await page.waitForSelector(Locators.currentCalendar);
      const calendarElement = await page.$(Locators.currentCalendar);

      const days = await calendarElement?.$$(Locators.calendarDay);
      const dayIndex = day - 1; // Convert to 0-based index

      if (days && dayIndex >= 0 && dayIndex < days.length) {
        await days[dayIndex].click();
      }
    }

    if (month > selectedMonth) {
      const nextMonthBtn = await page.$$(Locators.calendarNextMonthButton);
      await nextMonthBtn[1].click();
    }
  } while (selectedMonth !== month && selectedDay !== day);
};

const getSelectedMonthDay = async (
  page: Page
): Promise<number[] | undefined> => {
  const monthCalendar = await page.$(Locators.currentCalendar);
  const monthValue =
    (await monthCalendar?.evaluate((node) => node.getAttribute("data-e2e"))) ||
    "";
  const month = parseInt(monthValue.replace("calendarMonth-", "")) + 1;

  let day = 0;
  try {
    const dayLocator = await monthCalendar?.$(
      Locators.calendarFirstSelectedDay
    );
    day = dayLocator
      ? parseInt(await dayLocator.evaluate((node) => node.innerHTML))
      : 0;
  } catch (err) {}

  return [month, day];
};
