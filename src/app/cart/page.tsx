"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./cart.module.css";
import { useCart } from "@/context/CartContext";
import { BOUQUETS_DATA } from "@/data/bouquets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Trash2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Gift,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  X,
} from "lucide-react";

const CALICUT_AREAS = [
  "Nadakkavu, Calicut",
  "Mavoor Road, Calicut",
  "Kozhikode Beach / South Beach",
  "Palayam & SM Street",
  "Chevayur & Medical College",
  "Pottammal & Eranhipalam",
  "West Hill & Bilathikulam",
  "Thondayad Bypass",
  "Feroke & Ramanattukara",
  "Kallayi & Meenchanda",
];

const ADDONS = [
  {
    id: "addon-cake",
    name: "Dutch Truffle Birthday Cake (500g)",
    price: 599,
    image: "/images/bouquet-2.jpg",
  },
  {
    id: "addon-choc",
    name: "Ferrero Rocher Box (16 Pcs)",
    price: 799,
    image: "/images/slide1-flower.jpg",
  },
  {
    id: "addon-vase",
    name: "Hand-Blown Crystal Vase",
    price: 299,
    image: "/images/slide2-flower.jpg",
  },
  {
    id: "addon-candle",
    name: "Organic Rose Botanical Candle",
    price: 349,
    image: "/images/slide3-flower.jpg",
  },
];

export default function CartPage() {
  const {
    items,
    updateQty,
    removeItem,
    updateItem,
    clearCart,
    subtotal,
    cartCount,
    addItem,
  } = useCart();

  // Delivery options state
  const [deliveryDate, setDeliveryDate] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState({
    id: "standard",
    name: "Standard Daytime",
    time: "9:00 AM – 7:00 PM",
    price: 0,
  });
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryArea, setDeliveryArea] = useState(CALICUT_AREAS[0]);
  const [streetAddress, setStreetAddress] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState("");

  // Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  // Free shipping threshold: ₹1,999
  const FREE_SHIPPING_THRESHOLD = 1999;
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const isFreeDeliveryUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Delivery calculation
  const deliveryFee = isFreeDeliveryUnlocked ? 0 : selectedSlot.price > 0 ? selectedSlot.price : 99;
  const grandTotal = Math.max(0, subtotal - appliedDiscount + deliveryFee);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "OCCASSIONS10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMessage("🎉 Coupon OCCASSIONS10 applied: 10% off!");
    } else if (code === "CALICUT150") {
      setAppliedDiscount(150);
      setCouponMessage("🎉 Coupon CALICUT150 applied: ₹150 off!");
    } else if (code === "FREEDELIVERY") {
      setAppliedDiscount(deliveryFee);
      setCouponMessage("🎉 Free Delivery code applied!");
    } else {
      setCouponMessage("❌ Invalid code. Try 'OCCASSIONS10' or 'CALICUT150'");
      setAppliedDiscount(0);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `OCC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrderId(orderId);
    setIsSuccessModalOpen(true);
  };

  const generateWhatsAppLink = () => {
    const itemsText = items
      .map(
        (i, idx) =>
          `${idx + 1}. ${i.bouquet.name} (${i.selectedSize})${i.vaseOption ? " + Vase" : ""} x${i.quantity} = ₹${i.bouquet.price * i.quantity}`
      )
      .join("\n");

    const message = `Hello Occassions Florist Calicut! 🌸\n\nI would like to place an order:\n\n*Items:*\n${itemsText}\n\n*Subtotal:* ₹${subtotal}\n*Delivery Slot:* ${deliveryDate} (${selectedSlot.name} ${selectedSlot.time})\n*Delivery Area:* ${deliveryArea}\n*Address:* ${streetAddress || "Calicut"}\n*Recipient:* ${recipientName || "Self"} (${recipientPhone || "Contact on WhatsApp"})\n*Grand Total:* ₹${grandTotal}\n\nPlease confirm availability and payment details. Thank you!`;

    return `https://wa.me/918606464700?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={styles.cartPageWrapper}>
      <Header />

      <main className={styles.mainContent}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/#collections" className={styles.breadcrumbLink}>
            Floral Collections
          </Link>
          <ChevronRight size={14} />
          <span className={styles.breadcrumbCurrent}>Shopping Basket ({cartCount})</span>
        </nav>

        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div className={styles.tagline}>Do it with flowers</div>
          <h1 className={styles.pageTitle}>Your Floral Basket</h1>
          <p className={styles.pageSubtitle}>
            Hand-tied fresh blooms &amp; gourmet celebration gifts delivered across Kozhikode
          </p>
        </header>

        {/* Free Shipping Progress Indicator */}
        <section className={styles.shippingBanner} aria-label="Delivery perk">
          <div className={styles.shippingMessage}>
            <Truck size={20} className={styles.shippingIcon} />
            {remainingForFreeShipping > 0 ? (
              <span>
                Add <strong>₹{remainingForFreeShipping}</strong> more to unlock <strong>Complimentary White-Glove Hand Courier in Calicut!</strong>
              </span>
            ) : (
              <span style={{ color: "#be185d", fontWeight: 700 }}>
                🎉 You have unlocked Free White-Glove Hand Courier in Calicut!
              </span>
            )}
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className={styles.emptyCard}>
            <div className={styles.emptyEmoji}>💐</div>
            <h2 className={styles.emptyTitle}>Your Basket is Empty</h2>
            <p className={styles.emptyDesc}>
              Discover our signature bridal bouquets, romantic red roses, and celebration hampers to bring nature’s romance to your special moment.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/#collections" className={styles.emptyActionBtn}>
                <span>Explore Signature Bouquets</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className={styles.emptyActionBtn}
                style={{ background: "#111827" }}
                onClick={() => {
                  addItem(BOUQUETS_DATA[0]);
                  addItem(BOUQUETS_DATA[1]);
                }}
              >
                <span>Add Bestseller Duo (Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Two Column Cart Layout */
          <div className={styles.cartGrid}>
            {/* Left Column: Cart Items & Delivery Customizer */}
            <div className={styles.itemsSection}>
              <div className={styles.sectionHeadingRow}>
                <h2 className={styles.sectionHeading}>
                  Selected Arrangements ({items.length})
                </h2>
                <button
                  type="button"
                  className={styles.clearCartBtn}
                  onClick={clearCart}
                  aria-label="Clear all items"
                >
                  <Trash2 size={15} />
                  <span>Clear basket</span>
                </button>
              </div>

              {/* Items List */}
              {items.map((item, index) => {
                let unitPrice = item.bouquet.price;
                if (item.selectedSize === "Petite") unitPrice = Math.round(item.bouquet.price * 0.8);
                if (item.selectedSize === "Grand Deluxe") unitPrice = Math.round(item.bouquet.price * 1.35);
                const vasePrice = item.vaseOption ? 299 : 0;
                const lineTotal = (unitPrice + vasePrice) * item.quantity;

                return (
                  <article key={`${item.bouquet.id}-${index}`} className={styles.itemCard}>
                    {/* Thumbnail */}
                    <div className={styles.imageWrap}>
                      <img
                        src={item.bouquet.image}
                        alt={item.bouquet.name}
                        className={styles.itemImage}
                      />
                      {item.bouquet.badge && (
                        <span className={styles.badgePill}>{item.bouquet.badge}</span>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className={styles.detailsCol}>
                      <div className={styles.itemTitleRow}>
                        <div>
                          <h3 className={styles.itemName}>{item.bouquet.name}</h3>
                          <p className={styles.itemSubtitle}>{item.bouquet.subtitle}</p>
                        </div>
                      </div>

                      <p className={styles.stemsList}>
                        <strong>Stems:</strong> {item.bouquet.stems.slice(0, 3).join(", ")}...
                      </p>

                      {/* Size Selector & Vase Toggle */}
                      <div className={styles.optionsGroup}>
                        <div className={styles.sizeSelector} role="radiogroup" aria-label="Select bouquet size">
                          {(["Petite", "Signature", "Grand Deluxe"] as const).map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={`${styles.sizeBtn} ${
                                item.selectedSize === size ? styles.sizeBtnActive : ""
                              }`}
                              onClick={() => updateItem(index, { selectedSize: size })}
                            >
                              {size}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className={`${styles.vaseToggle} ${
                            item.vaseOption ? styles.vaseToggleActive : ""
                          }`}
                          onClick={() => updateItem(index, { vaseOption: !item.vaseOption })}
                        >
                          <Gift size={14} />
                          <span>{item.vaseOption ? "Vase Included (+₹299)" : "Add Crystal Vase (+₹299)"}</span>
                        </button>
                      </div>

                      {/* Custom Greeting Note Accordion */}
                      <div className={styles.noteArea}>
                        <div className={styles.noteHeader}>
                          <span>💌 Complimentary Greeting Card Note</span>
                        </div>
                        <input
                          type="text"
                          className={styles.noteInput}
                          placeholder="Write your heartfelt message for the wax-sealed card..."
                          value={item.customNote || ""}
                          onChange={(e) => updateItem(index, { customNote: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Price and Quantity Column */}
                    <div className={styles.priceActionCol}>
                      <div>
                        <div className={styles.itemTotal}>₹{lineTotal.toLocaleString("en-IN")}</div>
                        <div className={styles.itemUnit}>
                          ₹{(unitPrice + vasePrice).toLocaleString("en-IN")} each
                        </div>
                      </div>

                      <div className={styles.qtyControl}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(index, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQty(index, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeItem(index)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}

              {/* Delivery Details Card */}
              <section className={styles.deliveryCard}>
                <h3 className={styles.deliveryCardTitle}>
                  <Clock size={20} color="#db2777" />
                  <span>Delivery Date &amp; Calicut Time Slot</span>
                </h3>

                <form onSubmit={handleCheckoutSubmit}>
                  <div className={styles.formGrid}>
                    {/* Delivery Date */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Select Delivery Date</label>
                      <select
                        className={styles.selectInput}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      >
                        <option value="Today">Today (Express Same-Day)</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="Day After Tomorrow">Day After Tomorrow</option>
                        <option value="Weekend Special">This Weekend</option>
                      </select>
                    </div>

                    {/* Calicut Area */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Kozhikode Delivery Area</label>
                      <select
                        className={styles.selectInput}
                        value={deliveryArea}
                        onChange={(e) => setDeliveryArea(e.target.value)}
                      >
                        {CALICUT_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Slot Selection */}
                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Choose Time Slot</label>
                      <div className={styles.slotChipsGrid}>
                        {[
                          { id: "standard", name: "Standard Daytime", time: "9:00 AM – 7:00 PM", price: 0 },
                          { id: "morning", name: "Early Morning", time: "6:30 AM – 9:00 AM", price: 150 },
                          { id: "fixed", name: "Fixed Hour", time: "Choose 1 hr slot", price: 200 },
                          { id: "midnight", name: "Midnight Surprise 🌙", time: "11:30 PM – 12:15 AM", price: 250 },
                        ].map((slot) => (
                          <div
                            key={slot.id}
                            className={`${styles.slotChip} ${
                              selectedSlot.id === slot.id ? styles.slotChipActive : ""
                            }`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className={styles.slotChipName}>{slot.name}</div>
                            <div className={styles.slotChipTime}>{slot.time}</div>
                            <div className={styles.slotChipPrice}>
                              {slot.price === 0 ? "Complimentary" : `+₹${slot.price}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Recipient Name</label>
                      <input
                        type="text"
                        className={styles.textInput}
                        placeholder="e.g. Anjali Nair"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Recipient Phone Number</label>
                      <input
                        type="tel"
                        className={styles.textInput}
                        placeholder="e.g. 98470 12345"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label className={styles.label}>Street Address / Landmark</label>
                      <input
                        type="text"
                        className={styles.textInput}
                        placeholder="Building / Flat / House Name, Landmark in Calicut"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </form>
              </section>

              {/* Special Add-ons Section */}
              <section className={styles.addonsSection}>
                <h3 className={styles.addonsTitle}>Special Touches &amp; Add-ons</h3>
                <div className={styles.addonsGrid}>
                  {ADDONS.map((addon) => (
                    <div key={addon.id} className={styles.addonCard}>
                      <img src={addon.image} alt={addon.name} className={styles.addonImage} />
                      <div className={styles.addonName}>{addon.name}</div>
                      <div className={styles.addonPrice}>+₹{addon.price}</div>
                      <button
                        type="button"
                        className={styles.addonAddBtn}
                        onClick={() =>
                          addItem(
                            {
                              id: addon.id,
                              name: addon.name,
                              subtitle: "Celebration Add-on",
                              price: addon.price,
                              image: addon.image,
                              occasion: "celebration",
                              rating: 5,
                              reviewsCount: 30,
                              stems: ["Add-on item"],
                              description: addon.name,
                              flowerCount: "1 pc",
                              scent: "Subtle & Sweet",
                              dimensions: "Standard",
                            },
                            "Signature"
                          )
                        }
                      >
                        + Add to Basket
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <aside className={styles.summarySidebar}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>

                <div className={styles.summaryRow}>
                  <span>Arrangements Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Delivery ({selectedSlot.name})</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong style={{ color: "#059669" }}>FREE</strong>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className={styles.summaryRow} style={{ color: "#059669" }}>
                    <span>Promo Discount</span>
                    <span>-₹{appliedDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {/* Promo Code Box */}
                <div className={styles.couponBox}>
                  <input
                    type="text"
                    className={styles.couponInput}
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="button" className={styles.applyCouponBtn} onClick={applyCoupon}>
                    Apply
                  </button>
                </div>
                {couponMessage && <div className={styles.couponSuccess}>{couponMessage}</div>}

                {/* Grand Total */}
                <div className={styles.summaryRowTotal}>
                  <span>Total Payable</span>
                  <span className={styles.grandTotal}>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonsGroup}>
                  {/* WhatsApp Direct Order Button */}
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <MessageCircle size={20} />
                    <span>Order via WhatsApp</span>
                  </a>

                  {/* Standard Checkout Button */}
                  <button
                    type="button"
                    className={styles.checkoutBtn}
                    onClick={handleCheckoutSubmit}
                  >
                    <Sparkles size={18} />
                    <span>Confirm &amp; Place Order</span>
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className={styles.trustCard}>
                <div className={styles.trustItem}>
                  <ShieldCheck size={22} className={styles.trustIcon} />
                  <div>
                    <strong>100% Farm-Fresh Guarantee</strong>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Morning conditioned stems with 10+ days vase life
                    </div>
                  </div>
                </div>

                <div className={styles.trustItem}>
                  <Truck size={22} className={styles.trustIcon} />
                  <div>
                    <strong>Direct White-Glove Hand Courier</strong>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                      Temperature-safe delivery across Kozhikode
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Success Order Confirmation Modal */}
      {isSuccessModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsSuccessModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={42} />
            </div>

            <div className={styles.orderId}>{confirmedOrderId}</div>

            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", margin: "0 0 10px", color: "#111827" }}>
              Order Placed with Occassions!
            </h3>

            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
              Thank you for trusting Occassions Florist, Calicut. Master Florist Sreejesh K.V. and our artisan team will hand-tie your blooms and courier them with care on <strong>{deliveryDate} ({selectedSlot.name})</strong> to <strong>{deliveryArea}</strong>.
            </p>

            <div style={{ background: "#fdf2f8", padding: "16px", borderRadius: "14px", marginBottom: "24px", textAlign: "left", fontSize: "0.85rem", color: "#831843" }}>
              <div><strong>Recipient:</strong> {recipientName || "Valued Customer"} ({recipientPhone || "+91 8606464700"})</div>
              <div><strong>Delivery Slot:</strong> {selectedSlot.time}</div>
              <div><strong>Grand Total:</strong> ₹{grandTotal.toLocaleString("en-IN")} (Cash on Delivery / UPI upon arrival)</div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
                style={{ flex: 1 }}
              >
                <MessageCircle size={18} />
                <span>Track on WhatsApp</span>
              </a>

              <button
                type="button"
                className={styles.emptyActionBtn}
                style={{ flex: 1, padding: "12px 20px", background: "#111827" }}
                onClick={() => {
                  clearCart();
                  setIsSuccessModalOpen(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
