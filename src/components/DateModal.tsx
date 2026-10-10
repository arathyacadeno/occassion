"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Truck } from "lucide-react";
import styles from "./DateModal.module.css";

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
  // Use today's date to initialize calendar
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDate = selectedDate ? new Date(selectedDate) : today;
  
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null);

  if (!isOpen) return null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysOfWeek = ["S", "M", "T", "W", "Th", "F", "S"];

  // Calendar logic
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
    if (clickedDate >= today) {
      setSelected(clickedDate);
      
      // Auto confirm on date select
      const localDateString = new Date(clickedDate.getTime() - (clickedDate.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];
      onConfirm(localDateString);
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
      const isSelected = selected && 
                         selected.getDate() === d && 
                         selected.getMonth() === month && 
                         selected.getFullYear() === year;

      cells.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateClick(d)}
          disabled={isPast}
          className={`${styles.dayCell} ${isPast ? styles.disabledDay : ""} ${isSelected ? styles.selectedDay : ""}`}
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
            <Truck size={18} className={styles.bannerIcon} />
            <span>Earliest delivery available by <strong>10 AM</strong> or choose your preferred delivery slot in the next step.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
