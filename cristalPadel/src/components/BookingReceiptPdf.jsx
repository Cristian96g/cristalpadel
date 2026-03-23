import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#ffffff",
    fontSize: 12,
    color: "#111827",
  },
  container: {
    border: "1 solid #E5E7EB",
    borderRadius: 12,
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  brand: {
    fontSize: 11,
    color: "#1754cf",
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
  },
  grid: {
    marginTop: 16,
    gap: 10,
  },
  card: {
    backgroundColor: "#F8FAFC",
    border: "1 solid #E5E7EB",
    borderRadius: 10,
    padding: 12,
  },
  label: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: 700,
  },
  value: {
    fontSize: 16,
    fontWeight: 700,
  },
  note: {
    marginTop: 16,
    backgroundColor: "#EEF4FF",
    border: "1 solid #C7D2FE",
    borderRadius: 10,
    padding: 12,
    fontSize: 11,
    color: "#374151",
  },
});

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);

  return dt.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BookingReceiptPdf({ booking }) {
  if (!booking) return null;

  const fullName = `${booking.name} ${booking.lastName || ""}`.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.brand}>Cristal Pádel</Text>
            <Text style={styles.title}>Reserva confirmada</Text>
            <Text style={styles.subtitle}>
              Guardá este comprobante para tener tu turno a mano.
            </Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{fullName}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Cancha</Text>
              <Text style={styles.value}>Cancha {booking.court}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{formatDate(booking.date)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Hora</Text>
              <Text style={styles.value}>{booking.startTime}</Text>
            </View>
          </View>

          <View style={styles.note}>
            <Text>
              Presentá este comprobante si necesitás verificar tu reserva.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}