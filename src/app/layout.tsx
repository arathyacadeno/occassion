import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL("https://occasionswithflowers.com"),
  title: {
    default: "Flower Shop in Calicut | Occasions Calicut",
    template: "%s | Occasions Calicut",
  },
  description:
    "Premier flower shop in Calicut. Enjoy online flower and cake delivery in Kozhikode, luxury bouquets, gift shop items & event decoration by Occasions Calicut.",
  keywords: [
    "Flower shop in Calicut",
    "flower and cake delivery Calicut",
    "flower shop Kozhikode",
    "gift shop Calicut",
    "event decoration Calicut",
    "online flower delivery Kozhikode",
    "online cake delivery in Calicut",
    "buy flower bouquet online in Calicut",
    "wedding car decoration in Calicut",
    "wedding garlands in Calicut",
    "funeral wreath in Calicut",
    "Occasions Calicut",
  ],
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://occasionswithflowers.com",
    siteName: "Occasions Calicut",
    title: "Flower Shop in Calicut | Occasions Calicut",
    description:
      "Premier flower shop in Calicut. Fresh flowers, online cake delivery, wedding car, stage & church decorations across Kozhikode.",
    images: [
      {
        url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
        width: 1200,
        height: 630,
        alt: "Occasions Calicut - Flower Shop and Event Decoration in Calicut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flower Shop in Calicut | Occasions Calicut",
    description:
      "Premier flower shop in Calicut. Fresh flowers, online cake delivery, wedding car & stage decorations in Kozhikode.",
    images: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { StoreSettingsProvider } from "@/context/StoreSettingsContext";
import { AddonsProvider } from "@/context/AddonsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="dom-safety-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof Node !== 'undefined' && Node.prototype) {
                  var origRemove = Node.prototype.removeChild;
                  Node.prototype.removeChild = function(child) {
                    if (!child || child.parentNode !== this) {
                      return child;
                    }
                    return origRemove.apply(this, arguments);
                  };
                  var origInsert = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function(newNode, referenceNode) {
                    if (referenceNode && referenceNode.parentNode !== this) {
                      return newNode;
                    }
                    return origInsert.apply(this, arguments);
                  };
                }
              })();
            `,
          }}
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getLocalBusinessSchema()),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <StoreSettingsProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AddonsProvider>
                  <CheckoutProvider>{children}</CheckoutProvider>
                </AddonsProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
