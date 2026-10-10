"use client";

import React, { useState } from "react";
import { X, Truck } from "lucide-react";
import styles from "./TimeSlotModal.module.css";

interface DeliveryOption {
  id: string;
  name: string;
  price: number | "FREE";
  slots: string[];
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "fixed",
    name: "Fixed Time Delivery",
    price: 99,
    slots: [
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
    ],
  },
  {
    id: "earliest",
    name: "Earliest Delivery",
    price: 49,
    slots: [
      "10:00 am - 2:00 pm",
      "2:00 pm - 6:00 pm",
      "6:00 pm - 11:00 pm",
    ],
  },
  {
    id: "morning",
    name: "Morning Delivery",
    price: 150,
    slots: ["7:00 am - 9:00 am", "8:00 am - 10:00 am"],
  },
  {
    id: "free",
    name: "Free Delivery",
    price: "FREE",
    slots: ["9:00 AM – 2:00 PM", "2:00 PM – 7:00 PM"],
  },
  {
    id: "midnight",
    name: "Pre-Midnight Delivery",
    price: 199,
    slots: ["11:00 pm - 11:59 pm"],
  },
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
  const [activeTab, setActiveTab] = useState<string>("earliest");
  const [selectedSlot, setSelectedSlot] = useState<string>("2:00 pm - 6:00 pm");

  if (!isOpen) return null;

  // Format date for display: "Tomorrow, 11 October"
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      })
    : "Select Date";

  const activeOption = DELIVERY_OPTIONS.find((opt) => opt.id === activeTab);

  const handleConfirm = () => {
    if (activeOption && selectedSlot) {
      onConfirm(activeOption.name, selectedSlot, activeOption.price);
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

        {/* Layout: Tabs on left, Slots on right */}
        <div className={styles.splitLayout}>
          {/* Left Column: Delivery Types */}
          <div className={styles.tabsCol}>
            {DELIVERY_OPTIONS.map((opt) => {
              const isActive = activeTab === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.tabBtn} ${isActive ? styles.activeTabBtn : ""}`}
                  onClick={() => {
                    setActiveTab(opt.id);
                    setSelectedSlot(opt.slots[0]); // Reset slot to first of new tab
                  }}
                >
                  <div className={styles.tabContent}>
                    <span className={styles.tabName}>{opt.name}</span>
                    <span
                      className={`${styles.tabPrice} ${
                        opt.price === "FREE" ? styles.freeText : ""
                      }`}
                    >
                      {opt.price === "FREE" ? "FREE" : `₹${opt.price}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Time Slots */}
          <div className={styles.slotsCol}>
            {activeOption?.slots.map((slot) => {
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
