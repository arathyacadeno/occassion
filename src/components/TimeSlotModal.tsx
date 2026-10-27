"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import styles from "./TimeSlotModal.module.css";
import {
  resolveDeliverySchedule,
  SUNDAY_TIME_SLOTS,
  REGULAR_TIME_SLOTS,
} from "@/lib/delivery/schedule";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onConfirm: (deliveryType: string, slot: string, price: number | "FREE") => void;
}

export default function TimeSlotModal({
  isOpen,
  onClose,
  selectedDate,
  onConfirm,
}: TimeSlotModalProps) {
  const schedule = resolveDeliverySchedule(selectedDate || undefined);
  const slotsToDisplay = schedule.availableSlots;

  const [selectedSlot, setSelectedSlot] = useState<string>(schedule.defaultSlot);

  // Synchronize slot if selectedDate changes between Sunday and non-Sunday
  useEffect(() => {
    if (isOpen) {
      const updatedSchedule = resolveDeliverySchedule(selectedDate || undefined);
      if (!updatedSchedule.availableSlots.includes(selectedSlot)) {
        setSelectedSlot(updatedSchedule.defaultSlot);
      }
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  // Format date for display: "Sunday, 11 October"
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Select Date";

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm("Custom", selectedSlot, "FREE");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Choose Time-slot</h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
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

        {/* Time Slots List */}
        {schedule.isSunday ? (
          <div className={styles.singleSundayCol}>
            {slotsToDisplay.map((slot) => {
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
          <div className={styles.slotsOnlyCol}>
            {slotsToDisplay.map((slot) => {
              const isChecked = selectedSlot === slot;
              return (
                <label key={slot} className={styles.radioLabel}>
                  <span className={styles.slotText}>{slot}</span>
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

