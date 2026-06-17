import { Suspense } from "react";
import { InboxScreen } from "@/features/messaging/pages/inbox-screen";

export const metadata = {
  title: "Centro de mensajes - Animales Fantásticos",
  description: "Tus conversaciones sobre mascotas encontradas y perdidas.",
};

export default function MensajesPage() {
  return (
    <Suspense fallback={null}>
      <InboxScreen />
    </Suspense>
  );
}
