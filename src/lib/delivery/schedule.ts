/**
 * Delivery Scheduling and Cutoff Rules
 *
 * Rules:
 * - Sundays have special operating hours: 8:00 AM – 10:00 AM only.
 * - For Sunday deliveries, the only available time slot is "8:00 AM – 10:00 AM".
 * - If an order is placed on Sunday after 10:00 AM, same-day Sunday delivery is closed.
 *   The delivery date is automatically moved to the next day (Monday), with a clear reason
 *   presented to the customer.
 */

export const SUNDAY_TIME_SLOTS = ["8:00 AM – 10:00 AM"];

export const REGULAR_TIME_SLOTS = [
  "9:00 AM – 2:00 PM",
  "2:00 PM – 7:00 PM",
  "9:00 – 10:00 AM",
  "10:00 – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 – 1:00 PM",
  "1:00 – 2:00 PM",
  "2:00 – 3:00 PM",
  "3:00 – 4:00 PM",
  "4:00 – 5:00 PM",
  "5:00 – 6:00 PM",
  "6:00 – 7:00 PM",
];

export const SUNDAY_REASON_MESSAGE =
  "Sunday deliveries operate strictly between 8:00 AM and 10:00 AM. Since it is past 10:00 AM, your delivery has been automatically scheduled for Monday.";

export const SUNDAY_NOTICE_MESSAGE =
  "Sunday deliveries operate exclusively from 8:00 AM to 10:00 AM.";

export interface DeliveryScheduleCheck {
  isSunday: boolean;
  isTodaySundayPastCutoff: boolean;
  effectiveDate: string; // YYYY-MM-DD
  wasAutoAdjusted: boolean;
  reason?: string;
  notice?: string;
  availableSlots: string[];
  defaultSlot: string;
}

/**
 * Safely parse YYYY-MM-DD into a Date at local noon
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0];
  const m = parts[1] || 1;
  const d = parts[2] || 1;
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get current time in Indian Standard Time (IST / Asia/Kolkata)
 */
export function getNowIST(): {
  date: Date;
  dateString: string;
  isSunday: boolean;
  isPast10Am: boolean;
  hour: number;
  minute: number;
} {
  const now = new Date();

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      weekday: "short",
    });

    const parts = formatter.formatToParts(now);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const year = parseInt(map.year, 10);
    const month = parseInt(map.month, 10);
    const day = parseInt(map.day, 10);
    let hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(map.minute, 10);

    const isSunday = map.weekday === "Sun";
    const isPast10Am = isSunday && (hour > 10 || (hour === 10 && minute > 0));
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      date: new Date(year, month - 1, day, hour, minute),
      dateString,
      isSunday,
      isPast10Am,
      hour,
      minute,
    };
  } catch {
    const isSunday = now.getDay() === 0;
    const isPast10Am = isSunday && (now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() > 0));
    return {
      date: now,
      dateString: formatDateString(now),
      isSunday,
      isPast10Am,
      hour: now.getHours(),
      minute: now.getMinutes(),
    };
  }
}

/**
 * Checks whether a requested date is Sunday, checks Sunday 10:00 AM cutoff,
 * and automatically adjusts to Monday if past cutoff.
 */
export function resolveDeliverySchedule(requestedDateStr?: string | null): DeliveryScheduleCheck {
  const ist = getNowIST();

  let targetStr = requestedDateStr?.trim();
  if (!targetStr) {
    if (ist.isPast10Am) {
      const mon = parseDateString(ist.dateString);
      mon.setDate(mon.getDate() + 1);
      targetStr = formatDateString(mon);
      return {
        isSunday: false,
        isTodaySundayPastCutoff: true,
        effectiveDate: targetStr,
        wasAutoAdjusted: true,
        reason: SUNDAY_REASON_MESSAGE,
        availableSlots: REGULAR_TIME_SLOTS,
        defaultSlot: "9:00 AM – 2:00 PM",
      };
    } else {
      targetStr = ist.dateString;
    }
  }

  const targetDate = parseDateString(targetStr);
  const isSunday = targetDate.getDay() === 0;
  const isToday = targetStr === ist.dateString;

  if (isSunday) {
    // If it's today Sunday and past 10 AM:
    if (isToday && ist.isPast10Am) {
      const monday = new Date(targetDate);
      monday.setDate(monday.getDate() + 1);
      const mondayStr = formatDateString(monday);

      return {
        isSunday: false,
        isTodaySundayPastCutoff: true,
        effectiveDate: mondayStr,
        wasAutoAdjusted: true,
        reason: SUNDAY_REASON_MESSAGE,
        availableSlots: REGULAR_TIME_SLOTS,
        defaultSlot: "9:00 AM – 2:00 PM",
      };
    }

    // A valid Sunday (either today before 10 AM or upcoming Sunday)
    return {
      isSunday: true,
      isTodaySundayPastCutoff: false,
      effectiveDate: targetStr,
      wasAutoAdjusted: false,
      notice: SUNDAY_NOTICE_MESSAGE,
      availableSlots: SUNDAY_TIME_SLOTS,
      defaultSlot: "8:00 AM – 10:00 AM",
    };
  }

  // Regular day (Monday to Saturday)
  return {
    isSunday: false,
    isTodaySundayPastCutoff: false,
    effectiveDate: targetStr,
    wasAutoAdjusted: false,
    availableSlots: REGULAR_TIME_SLOTS,
    defaultSlot: "9:00 AM – 2:00 PM",
  };
}
