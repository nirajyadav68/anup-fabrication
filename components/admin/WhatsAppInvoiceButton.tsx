"use client";

type Props = {
  phone?: string | null;
  whatsapp?: string | null;
  orderNumber: string;
  customerName: string;
  amount?: number | null;
};

export default function WhatsAppInvoiceButton({
  phone,
  whatsapp,
  orderNumber,
  customerName,
  amount,
}: Props) {
  const number = whatsapp || phone;

  if (!number) {
    return null;
  }

  function handleWhatsApp() {
    const cleanNumber = String(number).replace(
      /\D/g,
      ""
    );

    const message = [
      `Hello ${customerName},`,
      "",
      `Your invoice ${orderNumber} from ANUP FABRICATION WORKS is ready.`,
      amount !== null &&
      amount !== undefined
        ? `Invoice Amount: ₹${Number(
            amount
          ).toLocaleString("en-IN")}`
        : "",
      "",
      "Please find the invoice attached.",
      "",
      "Thank you,",
      "ANUP FABRICATION WORKS",
    ]
      .filter(Boolean)
      .join("\n");

    const url =
      `https://wa.me/${cleanNumber}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }

  return (
    <button
      type="button"
      onClick={handleWhatsApp}
      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
    >
      WhatsApp Invoice
    </button>
  );
}