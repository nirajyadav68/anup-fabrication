"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatProductPrice, type PublicProduct } from "@/lib/data/products";

const STOCK_LABEL: Record<string, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
  made_to_order: "Made to Order",
};

interface LiveState {
  price: number | null;
  priceType: PublicProduct["priceType"];
  stockStatus: PublicProduct["stockStatus"];
}

/**
 * Shows price + availability for one product, live. If the admin changes
 * the price, stock status, or price type while someone is looking at this
 * page, it updates in place — no reload. Scoped to a single product row
 * (not a blanket "watch all products" subscription), since that's the
 * only place a live price actually matters to a visitor.
 */
export default function ProductAvailability({
  productId,
  initial,
}: {
  productId: string;
  initial: LiveState;
}) {
  const [state, setState] = useState<LiveState>(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`product-${productId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products", filter: `id=eq.${productId}` },
        (payload) => {
          const row = payload.new as {
            price: number | null;
            price_type: PublicProduct["priceType"];
            stock_status: PublicProduct["stockStatus"];
          };
          setState({ price: row.price, priceType: row.price_type, stockStatus: row.stock_status });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return (
    <div>
      <p className="font-mono text-xl font-semibold text-signal-600">
        {formatProductPrice(state.priceType, state.price)}
      </p>
      <p className="mt-1 text-sm text-steel-500">{STOCK_LABEL[state.stockStatus]}</p>
    </div>
  );
}
