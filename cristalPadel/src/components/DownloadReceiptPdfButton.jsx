import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import BookingReceiptPdf from "./BookingReceiptPdf.jsx";

export default function DownloadReceiptPdfButton({ booking }) {
  async function handleDownload() {
    try {
      const blob = await pdf(
        <BookingReceiptPdf booking={booking} />
      ).toBlob();

      const fileName = `reserva-cancha-${booking.court}-${booking.date}-${booking.startTime}.pdf`;

      saveAs(blob, fileName);
    } catch (error) {
      console.error("download pdf error:", error);
      alert("No se pudo descargar el comprobante");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="w-full rounded-xl bg-primary text-white font-bold px-4 py-3"
    >
      Descargar comprobante PDF
    </button>
  );
}