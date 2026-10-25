import { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Occasions Florist & Cakes, Calicut",
  description:
    "Find answers to common questions about ordering fresh flowers, custom cakes, same-day delivery, scheduled timings, and gifting in Calicut from Occasions.",
  openGraph: {
    title: "Frequently Asked Questions | Occasions Calicut",
    description:
      "Answers to your questions about ordering, customization, same-day delivery, and payments at Occasions.",
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
