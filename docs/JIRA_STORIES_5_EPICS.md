# Jira Stories por Epica (5 Epicas)

Este documento define las **5 epicas** del proyecto, con sus **stories**, definicion funcional y **tareas** para completar cada story con enfoque simetrico (API, DB, UI, QA, Observabilidad).

## EPIC-01 Reportes y Publicacion

### Story 1.1 Contrato de Reporte Simetrico (Lost/Found)
**Definicion:** Como usuario/anónimo, quiero crear reportes de mascota perdida o hallada con el mismo contrato base para que el sistema sea consistente y escalable.

**Tareas:**
- Definir contrato JSON comun para `lost` y `found`.
- Validar campos obligatorios: fotos, sexo, especie/raza, fecha `dd/mm/yyyy`, lat/lng, barrio, contacto.
- Estandarizar errores 400 de validacion.
- Documentar request/response y ejemplos.
- Agregar casos de prueba de payload valido/invalido.

### Story 1.2 Publicacion Anonima con Verificacion
**Definicion:** Como persona sin cuenta, quiero publicar un reporte para pedir ayuda de la comunidad, con verificacion por email para reducir spam.

**Tareas:**
- Permitir alta de reporte sin autenticacion.
- Marcar reporte como `PENDING_VERIFICATION` al crear.
- Integrar flujo de verificacion por token.
- Publicar automaticamente al verificar email (`PUBLISHED`).
- Probar expiracion y token invalido.

### Story 1.3 Alta por Usuario Registrado
**Definicion:** Como usuario registrado, quiero publicar reportes con visibilidad rapida para mejorar tiempos de busqueda.

**Tareas:**
- Asociar reporte a estado de usuario verificado.
- Marcar `isRegisteredReporter` y `emailVerified`.
- Permitir `PUBLISHED` inmediato si email ya verificado.
- Validar compatibilidad con publicaciones anonimas.
- Agregar pruebas de regresion de ambos flujos.

### Story 1.4 Estado de Publicacion y Moderacion Base
**Definicion:** Como sistema, quiero manejar estados de publicacion para controlar visibilidad y trazabilidad.

**Tareas:**
- Implementar enum de estado: `PENDING_VERIFICATION`, `PUBLISHED`, `ARCHIVED`.
- Filtrar listados por `onlyPublished`.
- Agregar accion de archivado (API interna o admin futura).
- Asegurar indices para consultas por estado/fecha.
- Medir cantidad de reportes por estado.

### Story 1.5 QA E2E de Reportes
**Definicion:** Como equipo, queremos validar el ciclo completo de reporte para reducir defectos en produccion.

**Tareas:**
- E2E: crear reporte anonimo, verificar email, visualizar publicado.
- E2E: crear reporte registrado y verificar visibilidad.
- Verificar validaciones de fecha y coordenadas.
- Verificar error handling 400/500.
- Registrar evidencia de pruebas en Jira.

---

## EPIC-02 Registro y Verificacion Email

### Story 2.1 Signup por Email
**Definicion:** Como nuevo usuario, quiero registrarme con email para acceder a funcionalidades avanzadas.

**Tareas:**
- Crear `POST /api/auth/signup`.
- Normalizar y validar email.
- Crear usuario si no existe (upsert).
- Generar token de verificacion con expiracion.
- Loguear eventos de signup.

### Story 2.2 Verificacion de Email
**Definicion:** Como usuario, quiero verificar mi correo para activar mi cuenta y publicar con mayor confianza.

**Tareas:**
- Crear `POST /api/auth/verify-email`.
- Validar token, expiracion y uso previo.
- Marcar usuario como `emailVerified`.
- Retornar respuesta idempotente de verificacion.
- Probar escenarios de token invalido/expirado.

### Story 2.3 Politica de Seguridad Basica
**Definicion:** Como plataforma, queremos controles minimos para evitar abuso en endpoints publicos.

**Tareas:**
- Definir rate limit para signup/verify.
- Limitar frecuencia de generacion de tokens por email.
- Evitar filtrado de existencia de usuario por mensajes.
- Agregar auditoria basica de intentos fallidos.
- Documentar politicas en README tecnico.

### Story 2.4 Integracion con Flujo de Publicacion
**Definicion:** Como sistema, quiero usar el estado de verificacion para decidir visibilidad de reportes.

**Tareas:**
- Conectar `emailVerified` con reglas de publicacion.
- Reflejar estado en respuesta de APIs de reportes.
- Mantener compatibilidad con reportes ya existentes.
- Probar transicion `pending -> published`.
- Verificar no regresion en listados.

### Story 2.5 QA y Observabilidad de Auth Lite
**Definicion:** Como equipo, queremos monitorear conversion de verificacion para optimizar onboarding.

**Tareas:**
- Medir `signup -> verified` conversion rate.
- Medir latencia p95 de endpoints auth.
- Alertar sobre aumento de tokens invalidos.
- Probar errores transaccionales de DB.
- Publicar dashboard minimo de auth.

---

## EPIC-03 Matching IA Asincrono

### Story 3.1 Cola de Jobs de Matching
**Definicion:** Como sistema, quiero encolar trabajos de matching al crear/actualizar reportes para escalar sin bloquear la API.

**Tareas:**
- Crear entidad `match_jobs` con estado y reintentos.
- Encolar job al crear reporte lost/found.
- Definir estados: `PENDING`, `RUNNING`, `DONE`, `FAILED`.
- Persistir ultimo error y cantidad de intentos.
- Probar concurrencia basica.

### Story 3.2 Motor de Similaridad Inicial
**Definicion:** Como usuario, quiero recibir sugerencias de coincidencias para acelerar el reencuentro con mi mascota.

**Tareas:**
- Implementar estrategia inicial (heuristica/especie-raza-barrio).
- Persistir candidatos en `pet_matches` con score.
- Evitar duplicados por par `lostPetId + foundPetId`.
- Parametrizar umbral de score.
- Probar ordenamiento por relevancia.

### Story 3.3 API de Recompute y Consulta
**Definicion:** Como sistema/cliente, quiero recomputar y consultar matches para operar en tiempo diferido.

**Tareas:**
- Implementar `POST /api/matches/recompute`.
- Implementar `GET /api/matches?lostPetId=...`.
- Validar parametros y errores.
- Limitar cantidad de resultados por consulta.
- Agregar ejemplos de uso.

### Story 3.4 Evolucion a Reconocimiento de Imagen
**Definicion:** Como producto, queremos incorporar modelo de imagen para mejorar precision frente a heuristica.

**Tareas:**
- Diseñar interfaz de proveedor IA (adapter pattern).
- Definir pipeline: extraer embedding, comparar, persistir score.
- Soportar fallback a heuristica si IA no disponible.
- Registrar version de algoritmo por match.
- Probar precision offline con dataset de muestra.

### Story 3.5 QA Tecnico y Metricas de Matching
**Definicion:** Como equipo, queremos controlar calidad del matching para iterar de forma basada en datos.

**Tareas:**
- Medir tiempo de proceso por job.
- Medir tasa de jobs fallidos y reintentos.
- Medir precision operacional (matches utiles).
- Crear suite de pruebas de regresion de scores.
- Documentar playbook de incidentes.

---

## EPIC-04 Mapa, Filtros y Geocodificacion

### Story 4.1 Filtros en API y UI
**Definicion:** Como usuario, quiero filtrar mascotas por barrio, raza, fecha y zona de mapa para enfocar la busqueda.

**Tareas:**
- Soportar filtros en `GET /api/lost-pets` y `GET /api/found-pets`.
- Agregar filtros por `neighborhood`, `breed`, `fromDate`, `toDate`.
- Agregar filtros por bbox (`minLat/maxLat/minLng/maxLng`).
- Conectar filtros del frontend con query params.
- Probar combinaciones de filtros.

### Story 4.2 Integracion con Leaflet
**Definicion:** Como usuario, quiero visualizar reportes en mapa con interaccion fluida para encontrar coincidencias cercanas.

**Tareas:**
- Renderizar marcadores lost/found en Leaflet.
- Sincronizar viewport con filtro bbox.
- Mantener import CSS Leaflet en `src/app/page.tsx`.
- Mantener iconos via CDN con `L.Icon.Default.mergeOptions`.
- Probar mobile/desktop.

### Story 4.3 Reverse Geocoding de Barrio
**Definicion:** Como usuario, quiero autocompletar/verificar barrio desde coordenadas para mejorar calidad de datos.

**Tareas:**
- Consumir `nominatim.openstreetmap.org/reverse`.
- Mapear respuesta a campo `neighborhood`.
- Definir fallback cuando no haya barrio.
- Cachear respuestas frecuentes (opcional fase 2).
- Probar limites y errores de red.

### Story 4.4 Actualizacion Periodica (Tiempo Casi Real)
**Definicion:** Como usuario, quiero ver nuevos reportes sin recargar toda la pagina.

**Tareas:**
- Implementar polling inicial configurable.
- Refrescar lista y mapa de forma incremental.
- Evitar parpadeos y duplicados en UI.
- Registrar timestamp de ultima sincronizacion.
- Evaluar roadmap a SSE/WebSocket.

### Story 4.5 QA de Mapa y Geodatos
**Definicion:** Como equipo, queremos asegurar precision geoespacial y buena UX de navegacion.

**Tareas:**
- Probar precision de coordenadas y barrio.
- Probar filtros en limites extremos de bbox.
- Medir tiempo de respuesta de listados filtrados.
- Verificar accesibilidad de controles de mapa.
- Adjuntar evidencias en Jira.

---

## EPIC-05 Mensajeria y Contacto Seguro

### Story 5.1 Contacto Desde Detalle de Mascota
**Definicion:** Como usuario, quiero iniciar contacto desde un reporte para coordinar rapidamente.

**Tareas:**
- Mantener CTA de chat en detalle de reporte DB.
- Asegurar creacion/recuperacion de conversacion.
- Mostrar historial al abrir modal.
- Soportar envio de texto e imagen.
- Probar flujo completo entre dos participantes.

### Story 5.2 Identidad de Remitente
**Definicion:** Como usuario, quiero que los mensajes muestren remitente real para generar confianza.

**Tareas:**
- Reemplazar remitente fijo `Usuario` por identidad real.
- Asociar mensaje a userId o contacto verificado.
- Definir fallback para anonimos.
- Evitar exposicion innecesaria de datos sensibles.
- Probar consistencia de identidad en historial.

### Story 5.3 Reglas Basicas de Seguridad
**Definicion:** Como plataforma, queremos minimizar abuso y proteger datos compartidos por la comunidad.

**Tareas:**
- Validar tipo/tamano de imagen en uploads.
- Definir rate limit para envio de mensajes.
- Sanitizar contenido de texto.
- Agregar logs de actividad sospechosa.
- Documentar politicas de moderacion basica.

### Story 5.4 Experiencia de Conversacion
**Definicion:** Como usuario, quiero una experiencia clara de conversacion para sostener interacciones utiles.

**Tareas:**
- Mejorar estados de carga y errores en chat.
- Agregar feedback visual al enviar imagen.
- Preparar estructura para evolucion a tiempo real.
- Optimizar render de listas largas de mensajes.
- Probar UX en mobile.

### Story 5.5 QA y Metricas de Contacto
**Definicion:** Como equipo, queremos medir efectividad del canal de contacto para mejorar reunion mascota-dueño.

**Tareas:**
- Medir tasa de conversaciones iniciadas por reporte.
- Medir tasa de respuesta inicial.
- Medir errores de upload y envio.
- Definir KPI proxy de reencuentro (contactos efectivos).
- Publicar reporte mensual de calidad.

---

## Criterios Globales de Cierre
- Cada story debe tener subtareas: `API`, `DB/Prisma`, `UI`, `QA`, `Observabilidad`.
- DoD minimo: validaciones, logs, pruebas y documentacion.
- Todo cambio backend debe respetar arquitectura modular `src/modules`.
- `src/app` debe mantenerse como entrypoint fino (rutas/handlers).
