"use client";

import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import styles from "./TimeSlotModal.module.css";
import {
  resolveDeliverySchedule,
  STANDARD_TIME_SLOTS,
  SPECIFIC_ONE_HOUR_SLOTS,
  isSpecificOrCustomSlot,
  isSlotPassedToday,
  getNowIST,
} from "@/lib/delivery/schedule";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  currentSlot?: string;
  onConfirm: (deliveryType: string, slot: string, price: number | "FREE") => void;
}

export default function TimeSlotModal({
  isOpen,
  onClose,
  selectedDate,
  currentSlot,
  onConfirm,
}: TimeSlotModalProps) {
  const ist = getNowIST();
  const schedule = resolveDeliverySchedule(selectedDate || undefined);
  const isToday = schedule.effectiveDate === ist.dateString;

  const [selectedSlot, setSelectedSlot] = useState<string>(currentSlot || "");

  // Synchronize slot when opened
  useEffect(() => {
    if (isOpen) {
      if (currentSlot && schedule.availableSlots.includes(currentSlot)) {
        setSelectedSlot(currentSlot);
      } else if (!currentSlot) {
        setSelectedSlot("");
      }
    }
  }, [isOpen, currentSlot, schedule.availableSlots]);

  if (!isOpen) return null;

  // Format date for display: "Wednesday, 28 October"
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Select Date";

  const handleConfirm = () => {
    if (selectedSlot) {
      const isSpecific = isSpecificOrCustomSlot(selectedSlot);
      onConfirm(
        isSpecific ? "Specific" : "Standard",
        selectedSlot,
        isSpecific ? 100 : "FREE"
      );
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Choose Time-slot</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Date Row */}
        <div className={styles.dateRow}>
          <span>Delivery: <strong>{formattedDate}</strong></span>
        </div>

        {/* Sunday Notification Banner */}
        {schedule.isSunday && (
          <div className={styles.sundayBanner}>
            <Clock size={16} className={styles.sundayBannerIcon} />
            <span>
              <strong>Sunday Delivery Hours:</strong> Sunday orders are delivered strictly between <strong>8:00 AM and 10:00 AM</strong>.
            </span>
          </div>
        )}

        {/* Time Slots */}
        {schedule.isSunday ? (
          <div className={styles.singleSundayCol}>
            {schedule.availableSlots.map((slot) => {
              const isChecked = selectedSlot === slot;
              return (
                <label key={slot} className={styles.sundaySlotPill}>
                  <div>
                    <strong style={{ color: "#e4004b", display: "block", fontSize: "0.95rem" }}>
                      {slot}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Exclusive Sunday Morning Delivery Slot
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot}
                    checked={isChecked}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.customRadio}></span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className={styles.slotsContainer}>
            {/* Standard Slots: Morning & Afternoon */}
            <div className={styles.slotSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Standard Slots</span>
                <span className={styles.includedTag}>Standard</span>
              </div>
              <div className={styles.slotsGrid}>
                {STANDARD_TIME_SLOTS.map((slot) => {
                  const isPassed = isToday && isSlotPassedToday(slot, ist.hour, ist.minute);
                  const isChecked = selectedSlot === slot;
                  return (
                    <label
                      key={slot}
                      className={`${styles.radioLabel} ${isPassed ? styles.slotPassed : ""}`}
                    >
                      <span className={styles.slotText}>
                        {slot}
                        {isPassed && <span className={styles.passedBadge}>(Passed)</span>}
                      </span>
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot}
                        checked={isChecked}
                        disabled={isPassed}
                        onChange={(e) => {
                          if (!isPassed) setSelectedSlot(e.target.value);
                        }}
                        className={styles.radioInput}
                      />
                      <span className={styles.customRadio}></span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Specific Time Slots: One-hour slots (9:00 AM to 7:00 PM) */}
            <div className={styles.slotSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Specific Time Slots</span>
                <span className={styles.addonTag}>+₹100 Add-on</span>
              </div>
              <div className={styles.slotsGrid}>
                {SPECIFIC_ONE_HOUR_SLOTS.map((slot) => {
                  const isPassed = isToday && isSlotPassedToday(slot, ist.hour, ist.minute);
                  const isChecked = selectedSlot === slot;
                  return (
                    <label
                      key={slot}
                      className={`${styles.radioLabel} ${isPassed ? styles.slotPassed : ""}`}
                    >
                      <span className={styles.slotText}>
                        {slot}
                        {isPassed && <span className={styles.passedBadge}>(Passed)</span>}
                      </span>
                      <input
                        type="radio"
                        name="timeSlot"
                        value={slot}
                        checked={isChecked}
                        disabled={isPassed}
                        onChange={(e) => {
                          if (!isPassed) setSelectedSlot(e.target.value);
                        }}
                        className={styles.radioInput}
                      />
                      <span className={styles.customRadio}></span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedSlot}
          >
            Confirm time-slot
          </button>
        </div>
      </div>
    </div>
  );
}
