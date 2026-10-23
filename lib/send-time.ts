import { addDays, parseDate } from "@/lib/format";
import { hash } from "@/lib/mock-data/campaigns";

export interface SendTimeAdvice {
  /** The suggested send, as a local date-time. */
  at: string;
  /** "Tuesday at 10:00 AM" */
  label: string;
  /** Relative opens for each hour of the day, 0 to 1. */
  hours: number[];
  /** The busiest hour. */
  peak: number;
  /** Estimated gain in opens against a 9:00 AM default. */
  liftPercent: number;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hour12 = (h: number) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? "AM" : "PM"}`;

/**
 * The best time to reach an audience, from when its contacts opened past sends. In this demo the
 * pattern is generated from the audience selection, so the same audience always gets the same advice.
 * `today` is the earliest day the send could start from (it picks the next matching weekday after it).
 */
export function sendTimeAdvice(seed: string, today: string): SendTimeAdvice {
  const h = hash(`send-time:${seed}`);
  const peak = 9 + (h % 3); // 9, 10 or 11
  const evening = 19 + ((h >> 3) % 2);
  const hours = Array.from({ length: 24 }, (_, i) => {
    const morning = Math.exp(-((i - peak) ** 2) / 6);
    const night = 0.45 * Math.exp(-((i - evening) ** 2) / 5);
    return Math.max(0.03, Math.min(1, morning + night));
  });
  const weekday = 2 + ((h >> 5) % 3); // Tuesday to Thursday
  let date = addDays(today, 1);
  for (let i = 0; i < 7 && parseDate(date).getDay() !== weekday; i++) date = addDays(date, 1);
  const base = hours[9];
  const liftPercent = Math.max(4, Math.round(((hours[peak] - base) / Math.max(base, 0.1)) * 100 * 0.35 + 6 + ((h >> 7) % 5)));
  return { at: `${date}T${String(peak).padStart(2, "0")}:00:00`, label: `${DAYS[weekday]} at ${hour12(peak)}`, hours, peak, liftPercent };
}

export { hour12 };
