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

export const MORNING_SLOT = "9:00 AM – 2:00 PM";
export const AFTERNOON_SLOT = "2:00 PM – 7:00 PM";

export const STANDARD_TIME_SLOTS = [
  MORNING_SLOT,
  AFTERNOON_SLOT,
];

export const SPECIFIC_ONE_HOUR_SLOTS = [
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "5:00 PM – 6:00 PM",
  "6:00 PM – 7:00 PM",
];

export const REGULAR_TIME_SLOTS = [
  ...STANDARD_TIME_SLOTS,
  ...SPECIFIC_ONE_HOUR_SLOTS,
];

export const CUSTOM_DELIVERY_FEE = 100;

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

/**
 * Returns whether a slot represents a specific 1-hour slot or custom delivery time
 */
export function isSpecificOrCustomSlot(slot?: string | null): boolean {
  if (!slot) return false;
  return (
    SPECIFIC_ONE_HOUR_SLOTS.includes(slot) ||
    slot.toLowerCase().startsWith("custom") ||
    slot.includes("Specific") ||
    slot.includes("+₹100")
  );
}

/**
 * Parse standard or 1-hour slot string to its starting minute of the day (0-1439).
 */
export function getSlotStartMinutes(slot: string): number | null {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

/**
 * Check if a time slot has already passed for today given current IST hour and minute.
 * For 1-hour specific slots, they pass when the slot start time has arrived.
 * For broad slots (Morning 9am-2pm, Afternoon 2pm-7pm), they pass when the window ends.
 */
export function isSlotPassedToday(
  slot: string,
  istHour: number,
  istMinute: number
): boolean {
  const currentMinutes = istHour * 60 + istMinute;

  // Broad slots cutoff:
  if (slot === MORNING_SLOT) {
    // 2:00 PM = 14:00 (840 mins)
    return currentMinutes >= 14 * 60;
  }
  if (slot === AFTERNOON_SLOT) {
    // 7:00 PM = 19:00 (1140 mins)
    return currentMinutes >= 19 * 60;
  }
  if (slot === "8:00 AM – 10:00 AM") {
    // 10:00 AM = 600 mins
    return currentMinutes >= 10 * 60;
  }

  // One-hour specific slots pass as soon as the start time has arrived
  const startMinutes = getSlotStartMinutes(slot);
  if (startMinutes !== null) {
    return currentMinutes >= startMinutes;
  }

  return false;
}

/**
 * Parse time string like "14:30" or "2:30 PM" into minutes from midnight (0..1439).
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  const clean = timeStr.trim();
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return h * 60 + m;
    }
    return null;
  }

  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const meridiem = match12[3].toUpperCase();
    if (h < 1 || h > 12 || m < 0 || m >= 60) return null;
    if (meridiem === "PM" && h < 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }

  return null;
}

/**
 * Convert minutes from midnight to a 12-hour formatted string (e.g. 870 -> "2:30 PM")
 */
export function formatMinutesTo12Hour(minutes: number): string {
  let h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const meridiem = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  const mStr = String(m).padStart(2, "0");
  return `${h}:${mStr} ${meridiem}`;
}

/**
 * Validates a custom delivery time.
 * For today's delivery: custom time must be strictly after the current IST time ("except current time").
 * Operating hours: 9:00 AM to 7:00 PM (or 8:00 AM to 10:00 AM on Sunday).
 */
export function validateCustomDeliveryTime(
  deliveryDateStr: string,
  timeStr: string
): { isValid: boolean; error?: string; formattedTime?: string; minutes?: number } {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes === null) {
    return { isValid: false, error: "Please enter a valid time (e.g., 2:30 PM)." };
  }

  const ist = getNowIST();
  const schedule = resolveDeliverySchedule(deliveryDateStr);
  const isSunday = schedule.isSunday;

  if (isSunday) {
    const sundayOpen = 8 * 60;
    const sundayClose = 10 * 60;
    if (minutes < sundayOpen || minutes > sundayClose) {
      return {
        isValid: false,
        error: "Sunday delivery time must be between 8:00 AM and 10:00 AM.",
      };
    }
  } else {
    // 9:00 AM to 7:00 PM
    const openMin = 9 * 60;
    const closeMin = 19 * 60;
    if (minutes < openMin || minutes > closeMin) {
      return {
        isValid: false,
        error: "Custom delivery time must be between 9:00 AM and 7:00 PM.",
      };
    }
  }

  // If ordering for TODAY, time must be after the current IST time
  if (schedule.effectiveDate === ist.dateString) {
    const currentMinutes = ist.hour * 60 + ist.minute;
    if (minutes <= currentMinutes) {
      const currentFormatted = formatMinutesTo12Hour(currentMinutes);
      return {
        isValid: false,
        error: `For today's delivery, time must be after the current time (${currentFormatted}).`,
      };
    }
  }

  return {
    isValid: true,
    formattedTime: formatMinutesTo12Hour(minutes),
    minutes,
  };
}

