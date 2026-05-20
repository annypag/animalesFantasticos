# Mensajería (base mínima)

Implementación acotada a la tarea: **interfaz de chat con envío de imágenes** para ayudar a identificar la mascota.

## Qué funciona hoy

- Botón **Chatear** en el detalle de un reporte guardado en DB (`db-*` / `db-lost-*`).
- Una conversación por reporte (`Conversation` + `Message` en Prisma).
- Mensajes de texto y subida de imagen (`POST /api/messaging/uploads` + `imageUrl` en el mensaje).
- Listado de mensajes al abrir el chat y después de cada envío.

## Qué falta (para continuar con la feature de la mensajeria) 

- [ ] Autenticación / identidad real del usuario (hoy el remitente es fijo: `"Usuario"`).
- [ ] Tiempo real (WebSocket, SSE o polling).
- [ ] Varias conversaciones por mascota o inbox global.
- [ ] Notificaciones, moderación, borrado de mensajes.
- [ ] Storage en la nube (hoy las imágenes van a `public/uploads/chat/`).
- [ ] Soporte de chat para mocks del mapa (solo reportes en DB).

## Archivos clave

| Capa | Ruta |
|------|------|
| UI | `src/features/messaging/components/chat-modal.tsx` |
| API entry | `src/app/api/conversations/`, `src/app/api/messaging/uploads/` |
| Dominio | `src/modules/messaging/` |

Tras cambiar el schema: `npx prisma generate` y `npx prisma db push`.
