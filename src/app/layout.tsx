import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://occassionscalicut.com"),
  title: "Occassions - Do it with flowers | Premier Florist & Event Decor, Calicut",
  description:
    "Occassions Florist Calicut by Sreejesh K.V. Handcrafted bridal bouquets, stage decoration, car decoration, church decoration, and fresh flower & cake delivery across Calicut (Kozhikode).",
  keywords: [
    "Occassions florist",
    "Occassions do it with flowers",
    "florist in Calicut",
    "flower delivery Calicut",
    "wedding stage decoration Calicut",
    "car decoration Calicut",
    "bridal bouquets Kozhikode",
    "Sreejesh KV florist",
    "YMCA junction flower shop",
  ],
  openGraph: {
    title: "Occassions - Do it with flowers | Calicut",
    description: "Stage Decoration, Bridal Bouquets, Car Decoration, and Fresh Flower Delivery in Calicut.",
    images: ["/images/slide1-flower.jpg"],
  },
};

import { CartProvider } from "@/context/CartContext";

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
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          id="dom-safety-guard"
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
      </head>
      <body suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
