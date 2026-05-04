import "leaflet/dist/leaflet.css";
import { NewReportScreen } from "@/features/report/pages/new-report-screen";

// Route entrypoint for "/nuevoReporte". UI and state live in features/report.
export default function NewReportPage() {
  return <NewReportScreen />;
}
