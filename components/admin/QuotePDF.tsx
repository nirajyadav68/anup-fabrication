"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

type QuoteData = {
  quoteNumber: string;
  createdAt: string;

  customerName: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;

  productOrProject?: string | null;
  serviceType?: string | null;
  material?: string | null;
  approximateSize?: string | null;
  quantity?: number | null;

  estimatedPrice?: number | null;
  budget?: number | null;

  description?: string | null;
};

type Props = {
  quote: QuoteData;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },

  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 15,
    marginBottom: 20,
  },

  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  companySubtitle: {
    marginTop: 4,
    fontSize: 9,
    color: "#6b7280",
  },

  quotationTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  quotationMeta: {
    marginTop: 5,
    fontSize: 9,
    color: "#6b7280",
  },

  section: {
    marginTop: 18,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  row: {
    flexDirection: "row",
    marginBottom: 7,
  },

  label: {
    width: 125,
    fontWeight: "bold",
    color: "#374151",
  },

  value: {
    flex: 1,
    color: "#4b5563",
  },

  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    padding: 8,
  },

  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  colDescription: {
    flex: 3,
  },

  colQuantity: {
    flex: 1,
    textAlign: "center",
  },

  colPrice: {
    flex: 1.5,
    textAlign: "right",
  },

  totalBox: {
    marginTop: 15,
    alignSelf: "flex-end",
    width: 230,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  totalLabel: {
    fontSize: 10,
    color: "#4b5563",
  },

  totalValue: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  terms: {
    marginTop: 25,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  termsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },

  termsText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: "#6b7280",
  },

  signature: {
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  signatureBox: {
    width: 180,
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    paddingTop: 6,
  },

  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
});

function money(value?: number | null) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "₹0";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function safe(value?: string | number | null) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
}

function QuotationDocument({
  quote,
}: Props) {
  const total =
    quote.estimatedPrice ??
    quote.budget ??
    0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.companyName}>
            ANUP FABRICATION WORKS
          </Text>

          <Text style={styles.companySubtitle}>
            MS | SS | Gates | Windows | Doors |
            Railings | Welding
          </Text>

          <Text style={styles.companySubtitle}>
            Patna, Bihar
          </Text>

          <Text style={styles.quotationTitle}>
            QUOTATION
          </Text>

          <Text style={styles.quotationMeta}>
            Quotation No: {safe(quote.quoteNumber)}
          </Text>

          <Text style={styles.quotationMeta}>
            Date:{" "}
            {new Date(
              quote.createdAt
            ).toLocaleDateString("en-IN")}
          </Text>
        </View>

        {/* CUSTOMER */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Customer Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Customer Name
            </Text>

            <Text style={styles.value}>
              {safe(quote.customerName)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Phone
            </Text>

            <Text style={styles.value}>
              {safe(quote.phone)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Email
            </Text>

            <Text style={styles.value}>
              {safe(quote.email)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              City
            </Text>

            <Text style={styles.value}>
              {safe(quote.city)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Address
            </Text>

            <Text style={styles.value}>
              {safe(quote.address)}
            </Text>
          </View>
        </View>

        {/* PROJECT */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Project Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Product / Project
            </Text>

            <Text style={styles.value}>
              {safe(quote.productOrProject)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Service
            </Text>

            <Text style={styles.value}>
              {safe(quote.serviceType)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Material
            </Text>

            <Text style={styles.value}>
              {safe(quote.material)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Approximate Size
            </Text>

            <Text style={styles.value}>
              {safe(quote.approximateSize)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Quantity
            </Text>

            <Text style={styles.value}>
              {safe(quote.quantity)}
            </Text>
          </View>
        </View>

        {/* PRICE TABLE */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quotation Summary
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>
                Description
              </Text>

              <Text style={styles.colQuantity}>
                Qty
              </Text>

              <Text style={styles.colPrice}>
                Amount
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.colDescription}>
                {safe(
                  quote.productOrProject
                )}
              </Text>

              <Text style={styles.colQuantity}>
                {safe(quote.quantity || 1)}
              </Text>

              <Text style={styles.colPrice}>
                {money(total)}
              </Text>
            </View>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>
              Estimated Total
            </Text>

            <Text style={styles.totalValue}>
              {money(total)}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}

        {quote.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Description
            </Text>

            <Text style={styles.value}>
              {quote.description}
            </Text>
          </View>
        )}

        {/* TERMS */}

        <View style={styles.terms}>
          <Text style={styles.termsTitle}>
            Terms & Conditions
          </Text>

          <Text style={styles.termsText}>
            1. This quotation is based on the
            information provided by the customer.
            {"\n"}
            2. Final pricing may vary depending
            on final measurements, material
            selection and site requirements.
            {"\n"}
            3. Fabrication work will begin after
            customer confirmation and applicable
            advance payment.
            {"\n"}
            4. Delivery and installation timelines
            depend on project requirements.
            {"\n"}
            5. Any additional work outside the
            quoted scope may be charged separately.
          </Text>
        </View>

        {/* SIGNATURE */}

        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <Text>
              Customer Signature
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <Text>
              Authorized Signature
            </Text>
          </View>
        </View>

        {/* FOOTER */}

        <Text style={styles.footer}>
          ANUP FABRICATION WORKS • Patna, Bihar
        </Text>
      </Page>
    </Document>
  );
}

export default function QuotePDF({
  quote,
}: Props) {
  const fileName = `Quotation-${quote.quoteNumber}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <QuotationDocument
          quote={quote}
        />
      }
      fileName={fileName}
      className="inline-flex items-center justify-center rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-600"
    >
      {({ loading }) =>
        loading
          ? "Preparing PDF..."
          : "Download Quotation PDF"
      }
    </PDFDownloadLink>
  );
}