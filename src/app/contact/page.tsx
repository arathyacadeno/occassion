import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Connect with Us | Occasions Luxury Florist & Decor, Calicut",
  description:
    "Fill out our inquiry form or connect directly with our floral concierge in Calicut. Reach us via phone, WhatsApp, email, or visit our floral boutique on Kannur Road.",
  openGraph: {
    title: "Connect with Us | Occasions Luxury Florist, Calicut",
    description:
      "Fill out our inquiry form or connect directly with our floral concierge in Calicut. Same-day handcrafted flowers, cakes, and event decor.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
