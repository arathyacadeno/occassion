"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Truck, AlertCircle, Clock } from "lucide-react";
import styles from "./DateModal.module.css";
import {
  resolveDeliverySchedule,
  getNowIST,
  formatDateString,
  parseDateString,
  SUNDAY_REASON_MESSAGE,
} from "@/lib/delivery/schedule";

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onConfirm: (date: string) => void;
}

export default function DateModal({
  isOpen,
  onClose,
  selectedDate,
  onConfirm,
}: DateModalProps) {
  const ist = getNowIST();

  // Use resolved date to initialize calendar
  const initialSchedule = resolveDeliverySchedule(selectedDate || undefined);
  const initialDate = parseDateString(initialSchedule.effectiveDate);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selected, setSelected] = useState<Date>(initialDate);
  const [reasonNotice, setReasonNotice] = useState<string | null>(
    initialSchedule.wasAutoAdjusted ? (initialSchedule.reason || SUNDAY_REASON_MESSAGE) : null
  );

  useEffect(() => {
    if (isOpen) {
      const schedule = resolveDeliverySchedule(selectedDate || undefined);
      setSelected(parseDateString(schedule.effectiveDate));
      if (schedule.wasAutoAdjusted) {
        setReasonNotice(schedule.reason || SUNDAY_REASON_MESSAGE);
        // Persist the adjusted Monday date back up
        onConfirm(schedule.effectiveDate);
      } else {
        setReasonNotice(null);
      }
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysOfWeek = ["S", "M", "T", "W", "Th", "F", "S"];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const clickedDateStr = formatDateString(clickedDate);
    const schedule = resolveDeliverySchedule(clickedDateStr);

    if (schedule.wasAutoAdjusted) {
      // It was today's Sunday after 10 AM -> auto-shift to Monday and show reason
      setReasonNotice(schedule.reason || SUNDAY_REASON_MESSAGE);
      const adjustedDate = parseDateString(schedule.effectiveDate);
      setSelected(adjustedDate);
      onConfirm(schedule.effectiveDate);
    } else {
      setReasonNotice(null);
      setSelected(clickedDate);
      onConfirm(schedule.effectiveDate);
    }
  };

  const renderCells = () => {
    const cells = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className={styles.emptyCell}></div>);
    }
    
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isPast = date < today;
      const dateStr = formatDateString(date);
      const isTodaySundayPast10 =
        date.getDay() === 0 &&
        dateStr === ist.dateString &&
        ist.isPast10Am;

      const isSelected = selected && 
                         selected.getDate() === d && 
                         selected.getMonth() === month && 
                         selected.getFullYear() === year;

      cells.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateClick(d)}
          disabled={isPast || isTodaySundayPast10}
          title={
            isTodaySundayPast10
              ? "Sunday deliveries close after 10:00 AM. Click to schedule for Monday."
              : undefined
          }
          className={`${styles.dayCell} ${
            isPast || isTodaySundayPast10 ? styles.disabledDay : ""
          } ${isSelected ? styles.selectedDay : ""}`}
        >
          {d < 10 ? `0${d}` : d}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Choose Date</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Reason banner when Sunday past 10 AM was automatically changed */}
        {reasonNotice && (
          <div className={styles.sundayAlertNotice}>
            <AlertCircle size={18} className={styles.sundayAlertIcon} />
            <div>
              <strong>Order rescheduled to Monday:</strong> {reasonNotice}
            </div>
          </div>
        )}

        {/* Calendar Card */}
        <div className={styles.calendarCard}>
          <div className={styles.calendarHeader}>
            <button type="button" onClick={handlePrevMonth} className={styles.monthNavBtn}>
              <ChevronLeft size={20} />
            </button>
            <div className={styles.monthLabel}>
              {monthNames[month]} {year}
            </div>
            <button type="button" onClick={handleNextMonth} className={styles.monthNavBtn}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.daysOfWeekRow}>
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className={styles.dayOfWeekHeader}>{day}</div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {renderCells()}
          </div>
          
          <div className={styles.bottomBanner}>
            <Clock size={18} className={styles.bannerIcon} />
            <span>
              Sunday deliveries: <strong>8:00 AM – 10:00 AM only</strong> (orders after 10 AM shift to Monday). Mon–Sat: 9:00 AM – 6:30 PM.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

