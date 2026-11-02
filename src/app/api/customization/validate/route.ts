import { NextResponse } from "next/server";
import { calculateCustomizationPrice } from "@/data/customizationConfig";
import { CATALOG_PRODUCTS } from "@/data/catalog";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      sizeId = "small",
      wrappingId = "craft-natural",
      ribbonId = "champagne-gold",
      decorationIds = [],
      flowerVarietyId,
      category = "roses",
    } = body;

    const product = CATALOG_PRODUCTS.find(
      (p) => p.id === productId || p.slug === productId
    );

    const basePrice = product ? product.price : (Number(body.basePrice) || 900);

    const breakdown = calculateCustomizationPrice(
      basePrice,
      sizeId,
      wrappingId,
      ribbonId,
      decorationIds,
      flowerVarietyId,
      category
    );

    return NextResponse.json({
      success: true,
      productId: product?.id || productId,
      breakdown,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to validate customization" },
      { status: 400 }
    );
  }
}

