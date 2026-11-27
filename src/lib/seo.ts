export const SITE_URL = "https://occasionswithflowers.com";
export const BRAND_NAME = "Occasions Calicut";
export const STORE_PHONE = "+91 86064 64700";
export const STORE_EMAIL = "occasionswithflowers@gmail.com";
export const STORE_ADDRESS = {
  streetAddress: "Near CH Flyover, Kannur Road, Vandipetta, Nadakkavu",
  addressLocality: "Calicut",
  addressRegion: "Kerala",
  postalCode: "673011",
  addressCountry: "IN",
};

/**
 * Generate LocalBusiness / Florist Schema for Rich Snippets in Google
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Florist", "LocalBusiness", "Store"],
    "@id": `${SITE_URL}/#store`,
    name: "Occasions Calicut - Flower & Cake Shop",
    alternateName: ["Occasions Flowers", "Occasions Florist Calicut", "Occasions - Do it with flowers"],
    url: SITE_URL,
    logo: "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647444/occasions/branding/uploads-pink-rose-bud-logo-icon.png",
    image: [
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647380/occasions/products/flower-bouquet/flower-bouquet-rose-garden-bliss.png",
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647424/occasions/products/stage-decor/stage-decor-7.jpg",
      "https://res.cloudinary.com/hm2hbrdd/image/upload/v1794647418/occasions/products/general/highlight-car-decorations.jpg",
    ],
    telephone: STORE_PHONE,
    email: STORE_EMAIL,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, Debit Card, UPI, Net Banking, Razorpay",
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE_ADDRESS.streetAddress,
      addressLocality: STORE_ADDRESS.addressLocality,
      addressRegion: STORE_ADDRESS.addressRegion,
      postalCode: STORE_ADDRESS.postalCode,
      addressCountry: STORE_ADDRESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 11.2662,
      longitude: 75.7766,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "22:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Floral & Event Services in Calicut",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Fresh Flower Bouquets & Baskets",
        },
        {
          "@type": "OfferCatalog",
          name: "Online Cake Delivery Calicut",
        },
        {
          "@type": "OfferCatalog",
          name: "Wedding Car, Church & Stage Decoration",
        },
        {
          "@type": "OfferCatalog",
          name: "Funeral Wreaths & Condolence Flowers",
        },
      ],
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Calicut",
      },
      {
        "@type": "AdministrativeArea",
        name: "Kozhikode",
      },
      {
        "@type": "AdministrativeArea",
        name: "Kerala",
      },
    ],
    sameAs: [
      "https://www.instagram.com/occasions_flowers_calicut",
      "https://wa.me/918606464700",
      "https://ifaflorist.com",
    ],
  };
}

/**
 * Generate BreadcrumbList Schema for Google Search Hierarchy
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Product Schema for eCommerce Product Pages
 */
export function getProductSchema(product: {
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  rating?: number;
  reviewsCount?: number;
  url: string;
  sku?: string;
}) {
  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: allImages,
    sku: product.sku || product.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      url: product.url.startsWith("http") ? product.url : `${SITE_URL}${product.url}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: BRAND_NAME,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
          addressRegion: "Kerala",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviewsCount || 18,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

/**
 * Generate FAQPage Schema for Rich FAQ Snippets
 */
export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
