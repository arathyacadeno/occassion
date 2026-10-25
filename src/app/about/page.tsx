import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | Occasions - Premier Florist & Event Decor, Calicut",
  description:
    "Bringing happiness, one bloom and bite at a time. Learn about Occasions, our passion for handcrafted floral bouquets, delicious cakes, and unforgettable celebrations in Calicut.",
};

export default function AboutPage() {
  return <AboutClient />;
}
