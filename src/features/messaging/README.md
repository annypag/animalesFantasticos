# Mensajería (base mínima)

Implementación acotada a la tarea: **interfaz de chat con envío de imágenes** para ayudar a identificar la mascota.

## Qué funciona hoy

- Botón **Chatear** solo en publicaciones guardadas en DB (`db-*` / `db-lost-*`), con sesión iniciada; el nombre sale de `user.fullName`.
- Una conversación por reporte (`Conversation` + `Message` en Prisma).
- Mensajes de texto y subida de imagen (`POST /api/messaging/uploads` + `imageUrl` en el mensaje).
- Listado de mensajes al abrir el chat; actualización cada 5 s mientras el modal está abierto (polling).
- Nombre del remitente = usuario logueado (sin prompt manual).
- Mensajes propios alineados a la derecha; Enter envía, Shift+Enter nueva línea.

## Qué falta (para continuar con la feature de la mensajeria) 

- [ ] Tiempo real con WebSocket o SSE (hoy hay polling liviano).
- [ ] Varias conversaciones por mascota o inbox global.
- [ ] Notificaciones, moderación, borrado de mensajes.
- [ ] Storage en la nube (hoy las imágenes van a `public/assets/chat/`).
- [x] Notificación al otro participante del chat (dueño o quien escribió) con mensajes agrupados por conversación.
- [x] Chat abierto en publicaciones **perdidas** y **encontradas** mientras el caso siga activo.
- [x] El dueño puede marcar la publicación como resuelta; ahí se cierra el chat y deja de aparecer en el mapa.

## Archivos clave

| Capa | Ruta |
|------|------|
| UI | `src/features/messaging/components/chat-modal.tsx` |
| API entry | `src/app/api/conversations/`, `src/app/api/messaging/uploads/` |
| Dominio | `src/modules/messaging/` |

Tras cambiar el schema: `npx prisma generate` y `npx prisma db push`.
