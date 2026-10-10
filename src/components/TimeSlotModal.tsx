"use client";

import React, { useState } from "react";
import { X, Truck } from "lucide-react";
import styles from "./TimeSlotModal.module.css";

const TIME_SLOTS = [
  "9:00 AM – 2:00 PM (FREE)",
  "2:00 PM – 7:00 PM (FREE)",
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
  const [selectedSlot, setSelectedSlot] = useState<string>("9:00 AM – 2:00 PM (FREE)");

  if (!isOpen) return null;

  // Format date for display: "Tomorrow, 11 October"
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
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

        {/* Banner */}
        <div className={styles.banner}>
          <Truck size={15} className={styles.bannerIcon} />
          <span>Want it free? Pick a slot with the <strong>FREE</strong> tag.</span>
        </div>

        {/* Date Row */}
        <div className={styles.dateRow}>
          <span>Delivery: <strong>{formattedDate}</strong></span>
        </div>

        {/* Flat List: Time Slots only */}
        <div className={styles.slotsOnlyCol}>
          {TIME_SLOTS.map((slot) => {
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
