"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice?: number | null;
  totalPrice?: number | null;
};

type InvoiceData = {
  orderNumber: string;
  createdAt: string;

  customerName: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;

  items: InvoiceItem[];

  total?: number | null;
  paymentStatus: string;
  status: string;

  notes?: string | null;
};

type Props = {
  invoice: InvoiceData;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#111827",
    paddingBottom: 15,
    marginBottom: 20,
  },

  companySection: {
    width: "60%",
  },

  invoiceSection: {
    width: "35%",
    alignItems: "flex-end",
  },

  companyName: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#111827",
  },

  companySubtitle: {
    marginTop: 4,
    fontSize: 8,
    color: "#6b7280",
  },

  invoiceTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  invoiceNumber: {
    marginTop: 5,
    fontSize: 9,
    color: "#4b5563",
  },

  section: {
    marginTop: 15,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },

  customerBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
  },

  customerRow: {
    flexDirection: "row",
    marginBottom: 5,
  },

  label: {
    width: 100,
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
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },

  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  descriptionColumn: {
    flex: 3,
  },

  quantityColumn: {
    flex: 1,
    textAlign: "center",
  },

  priceColumn: {
    flex: 1.5,
    textAlign: "right",
  },

  totalBox: {
    marginTop: 15,
    alignSelf: "flex-end",
    width: 240,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  totalLabel: {
    fontSize: 10,
    color: "#4b5563",
  },

  totalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },

  paymentBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  paymentTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },

  paymentText: {
    fontSize: 9,
    color: "#4b5563",
  },

  notesBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },

  notesText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.5,
  },

  termsBox: {
    marginTop: 20,
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
    color: "#6b7280",
    lineHeight: 1.5,
  },

  signatureSection: {
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

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function InvoiceDocument({
  invoice,
}: Props) {
  const total = Number(invoice.total ?? 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.companySection}>
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
          </View>

          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>
              INVOICE
            </Text>

            <Text style={styles.invoiceNumber}>
              Invoice No: {safe(invoice.orderNumber)}
            </Text>

            <Text style={styles.invoiceNumber}>
              Date:{" "}
              {new Date(
                invoice.createdAt
              ).toLocaleDateString("en-IN")}
            </Text>
          </View>
        </View>

        {/* CUSTOMER */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Bill To
          </Text>

          <View style={styles.customerBox}>
            <View style={styles.customerRow}>
              <Text style={styles.label}>
                Customer
              </Text>

              <Text style={styles.value}>
                {safe(invoice.customerName)}
              </Text>
            </View>

            <View style={styles.customerRow}>
              <Text style={styles.label}>
                Phone
              </Text>

              <Text style={styles.value}>
                {safe(invoice.phone)}
              </Text>
            </View>

            <View style={styles.customerRow}>
              <Text style={styles.label}>
                Email
              </Text>

              <Text style={styles.value}>
                {safe(invoice.email)}
              </Text>
            </View>

            <View style={styles.customerRow}>
              <Text style={styles.label}>
                City
              </Text>

              <Text style={styles.value}>
                {safe(invoice.city)}
              </Text>
            </View>

            <View style={styles.customerRow}>
              <Text style={styles.label}>
                Address
              </Text>

              <Text style={styles.value}>
                {safe(invoice.address)}
              </Text>
            </View>
          </View>
        </View>

        {/* ITEMS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order Items
          </Text>

          <View style={styles.table}>

            <View style={styles.tableHeader}>
              <Text style={styles.descriptionColumn}>
                Description
              </Text>

              <Text style={styles.quantityColumn}>
                Qty
              </Text>

              <Text style={styles.priceColumn}>
                Unit Price
              </Text>

              <Text style={styles.priceColumn}>
                Amount
              </Text>
            </View>

            {invoice.items.map((item) => (
              <View
                key={item.id}
                style={styles.tableRow}
              >
                <Text style={styles.descriptionColumn}>
                  {safe(item.description)}
                </Text>

                <Text style={styles.quantityColumn}>
                  {safe(item.quantity)}
                </Text>

                <Text style={styles.priceColumn}>
                  {money(item.unitPrice)}
                </Text>

                <Text style={styles.priceColumn}>
                  {money(item.totalPrice)}
                </Text>
              </View>
            ))}

          </View>
        </View>

        {/* TOTAL */}

        <View style={styles.totalBox}>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Subtotal
            </Text>

            <Text style={styles.totalValue}>
              {money(total)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              {money(total)}
            </Text>
          </View>

        </View>

        {/* PAYMENT */}

        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>
            Payment Status
          </Text>

          <Text style={styles.paymentText}>
            {formatStatus(
              invoice.paymentStatus
            )}
          </Text>

          <Text style={styles.paymentText}>
            Order Status:{" "}
            {formatStatus(invoice.status)}
          </Text>
        </View>

        {/* NOTES */}

        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>
              Notes
            </Text>

            <Text style={styles.notesText}>
              {invoice.notes}
            </Text>
          </View>
        )}

        {/* TERMS */}

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>
            Terms & Conditions
          </Text>

          <Text style={styles.termsText}>
            1. This invoice is issued for the
            fabrication work mentioned above.
            {"\n"}
            2. Any additional work outside the
            agreed scope may be charged separately.
            {"\n"}
            3. Delivery and installation timelines
            depend on project requirements.
            {"\n"}
            4. Payment is subject to the agreed
            payment terms between the customer and
            Anup Fabrication Works.
            {"\n"}
            5. Please retain this invoice for your
            records.
          </Text>
        </View>

        {/* SIGNATURE */}

        <View style={styles.signatureSection}>
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

export default function InvoicePDF({
  invoice,
}: Props) {
  const fileName = `Invoice-${invoice.orderNumber}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <InvoiceDocument
          invoice={invoice}
        />
      }
      fileName={fileName}
      className="inline-flex items-center justify-center rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-600"
    >
      {({ loading }) =>
        loading
          ? "Preparing Invoice..."
          : "Download Invoice"
      }
    </PDFDownloadLink>
  );
}