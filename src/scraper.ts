// @ts-ignore
import { connect } from "puppeteer-real-browser";
import { type Browser, type Page } from "puppeteer";
import * as fs from "fs/promises";
import { TravelData } from "@src/omio/extractor";
import type { JourneyPayload, StationsMap } from "./types";

const Locators: Record<string, string> = {
  qualiModal: '#qual_ol',
  qualiFirstChoice: '.qual_ol_ans_item:nth-of-type(1)',
  qualiSubmitBtn: '#qual_ol_send',
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

export default async function getJourneyPrices(payload: JourneyPayload): Promise<TravelData> {
  return connect({
    headless: 'auto',
    turnstile: true,
  }).then(async (response: any) => {
    const { page, browser }: { page: Page; browser: Browser } = response;

    await page.setDefaultTimeout(15 * 1000);
  
    // @ts-ignore
    await page.goto(process.env.OMIO_BASE_URL, { waitUntil: "domcontentloaded" });
  
    await checkCookieBanner(page);
    await page.click(Locators.checkBoxToggle);
  
    await setStation(page, "departure", payload.stations);
    await setStation(page, "arrival", payload.stations);
    await setTime(page, "Departure", payload.departure.day, payload.departure.month);
  
    await page.locator(Locators.searchButton).click();
  
    const result = await page.waitForResponse(
      async (response) => {
        if (
          response.url().includes(process.env.OMIO_RESULT_URL) &&
          response.status() === 200
        )
          return Object.keys((await response.json()).outbounds).length > 0;
      },
      { timeout: 5000 }
    );
  
    await fs.writeFile(
      "logs/response.json",
      JSON.stringify(TravelData.fromJSON(JSON.stringify(await result.json())))
    );
    await browser.close();
    return TravelData.fromJSON(JSON.stringify(await result.json()));
  });
}

const checkCookieBanner = async (page: Page) => {
  try {
    if (await page.locator(Locators.gdprButton)) {
      await page.locator(Locators.gdprButton).click();
    }

    if (await page.locator(Locators.qualiModal)) {
      await page.evaluate(() => document.querySelector(Locators.qualiModal).style.display = 'none');
    }
  } catch(e) {
    console.log(e);
  }
};

const setStation = async (page: Page, mode: string, stations: StationsMap) => {
  const stationLoc = await page.locator(DynamicLocators.stationLocator(mode));
  await stationLoc.click();
  await stationLoc.fill(stations[mode]);
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
