"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export interface ServiceGalleryItem {
  image_url: string;
  title: string;
  alt_text?: string;
  description?: string;
  price?: number;
}

export interface ServiceShowcaseProps {
  slug: string;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  coverImage: string;
  startingPrice: number;
  features: string[];
  gallery: ServiceGalleryItem[];
  whatsappText: string;
  seoH1: string;
  seoH2: string;
  seoContent: string[];
  breadcrumbs: { name: string; url: string }[];
}

export default function ServiceShowcaseView({
  slug,
  title,
  badge,
  subtitle,
  description,
  coverImage,
  startingPrice,
  features,
  gallery,
  whatsappText,
  seoH1,
  seoH2,
  seoContent,
  breadcrumbs,
}: ServiceShowcaseProps) {
  const [selectedImage, setSelectedImage] = useState<string>(coverImage);
  const whatsAppUrl = `https://wa.me/918606464700?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF7F5", color: "#1F2937", fontFamily: "inherit" }}>
      <Header />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24, fontSize: 13, color: "#6B7280" }}>
          <ol style={{ display: "flex", alignItems: "center", gap: 8, listStyle: "none", padding: 0, margin: 0, flexWrap: "wrap" }}>
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.url} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {idx > 0 && <ChevronRight size={14} color="#9CA3AF" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span style={{ color: "#FF4D88", fontWeight: 600 }}>{crumb.name}</span>
                ) : (
                  <Link href={crumb.url} style={{ color: "#4B5563", textDecoration: "none" }}>
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 40,
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: "clamp(24px, 4vw, 44px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            border: "1px solid #F3E8E2",
            marginBottom: 48,
          }}
        >
          {/* Main Visual */}
          <div>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 420,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#F9FAFB",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              }}
            >
              <img
                src={selectedImage || coverImage}
                alt={`${title} - Occasions Calicut`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  backgroundColor: "rgba(255, 77, 136, 0.92)",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "6px 14px",
                  borderRadius: 999,
                  backdropFilter: "blur(4px)",
                }}
              >
                {badge}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {gallery && gallery.length > 1 && (
              <div style={{ display: "flex", gap: 12, marginTop: 16, overflowX: "auto", paddingBottom: 6 }}>
                {gallery.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(item.image_url)}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: selectedImage === item.image_url ? "2px solid #FF4D88" : "1px solid #E5E7EB",
                      padding: 0,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    aria-label={`View photo ${i + 1} of ${title}`}
                  >
                    <img
                      src={item.image_url}
                      alt={item.alt_text || `${title} photo ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Booking CTAs */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#FF4D88", fontSize: 13, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Sparkles size={16} />
              <span>Occasions Calicut Atelier</span>
            </div>

            {/* H1 SEO Heading */}
            <h1
              style={{
                fontSize: "clamp(26px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.25,
                margin: "0 0 12px",
              }}
            >
              {seoH1}
            </h1>

            <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.6, margin: "0 0 20px" }}>
              {subtitle}
            </p>

            {/* Price Badge */}
            {startingPrice > 0 && (
              <div style={{ display: "inline-block", backgroundColor: "#FFF1F5", border: "1px solid #FCE7F0", borderRadius: 12, padding: "8px 18px", marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Starting Package: </span>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#FF4D88" }}>
                  ₹ {startingPrice.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}> (Onwards)</span>
              </div>
            )}

            {/* Feature Highlights */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 12px" }}>
                Included in This Service:
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {features.map((feat, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4B5563" }}>
                    <CheckCircle size={16} color="#10B981" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: "#25D366",
                  color: "#FFFFFF",
                  padding: "14px 28px",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                <MessageCircle size={18} />
                <span>WhatsApp Order &amp; Enquiry</span>
              </a>

              <a
                href="tel:+918606464700"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: "#111827",
                  color: "#FFFFFF",
                  padding: "14px 24px",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Phone size={18} />
                <span>Call Florist</span>
              </a>
            </div>

            <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", marginTop: 14 }}>
              <ShieldCheck size={14} color="#10B981" />
              <span>100% Fresh Flower Guarantee • On-Site Setup in Calicut, Kozhikode &amp; Kerala</span>
            </p>
          </div>
        </div>

        {/* Local SEO Informational Content & H2 Section */}
        <section
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: "clamp(28px, 4vw, 44px)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.03)",
            border: "1px solid #F3E8E2",
          }}
        >
          <h2 style={{ fontSize: "clamp(22px, 2.5vw, 28px)", fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>
            {seoH2}
          </h2>

          <div style={{ color: "#4B5563", fontSize: 15, lineHeight: 1.8 }}>
            {seoContent.map((paragraph, i) => (
              <p key={i} style={{ marginBottom: 16 }}>
                {paragraph}
              </p>
            ))}
          </div>

          <div
            style={{
              marginTop: 32,
              padding: "20px 24px",
              backgroundColor: "#FFF8F6",
              borderRadius: 16,
              border: "1px solid #FFE4E6",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 16, marginBottom: 4 }}>
                Ready to book your {title} in Calicut?
              </div>
              <div style={{ fontSize: 14, color: "#6B7280" }}>
                Connect with our florist atelier on Kannur Road, Calicut for custom dates &amp; themes.
              </div>
            </div>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#FF4D88",
                color: "#FFFFFF",
                padding: "10px 22px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>Contact Us</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
