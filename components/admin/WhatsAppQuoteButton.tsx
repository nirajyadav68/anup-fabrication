"use client";

type Props = {
  phone?: string | null;
  whatsapp?: string | null;
  quoteNumber: string;
  customerName: string;
  amount?: number | null;
};

export default function WhatsAppQuoteButton({
  phone,
  whatsapp,
  quoteNumber,
  customerName,
  amount,
}: Props) {
  const number = whatsapp || phone;

  if (!number) {
    return null;
  }

  function handleWhatsApp() {
    const cleanNumber = number!.replace(/\D/g, "");

    const message = [
      `Hello ${customerName},`,
      "",
      `Your quotation ${quoteNumber} from Anup Fabrication Works is ready.`,
      amount
        ? `Estimated amount: ₹${Number(amount).toLocaleString("en-IN")}`
        : "",
      "",
      "Please find the quotation attached.",
      "",
      "Thank you,",
      "Anup Fabrication Works",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  }

  return (
    <button
      type="button"
      onClick={handleWhatsApp}
      className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
    >
      WhatsApp Customer
    </button>
  );
}