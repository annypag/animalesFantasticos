# Jira Integration Blueprint (Epic -> Story -> Sub-task)

## Workflow Estandar
`Backlog -> Refinado -> In Progress -> Code Review -> QA -> Done`

## Tipos y Simetria
- Epic: capacidad de negocio (ej: Matching IA).
- Story: entregable vertical funcional.
- Sub-task: API, DB/Prisma, UI, QA, Observabilidad.

## Plantilla Story (obligatoria)
- Objetivo:
- Criterios de aceptacion:
- Contrato API:
- Impacto DB:
- Metricas:
- Riesgos:
- Plan de pruebas:

## Jerarquia inicial sugerida
- EPIC-01 Reportes y Publicacion
- EPIC-02 Registro Verificacion Email
- EPIC-03 Matching IA Asincrono
- EPIC-04 Mapa Filtros Geocodificacion
- EPIC-05 Mensajeria y Contacto Seguro
- EPIC-06 Calidad Metricas Operacion

## Historias base por Epic (simetricas)
Para cada epic crear estas 5 stories:
1. Contrato y validaciones API
2. Persistencia Prisma + indices
3. UI/UX y estados
4. QA funcional + tecnico
5. Observabilidad + metricas

## Definicion de Done
- Tests passing.
- Validaciones de payload y errores 400/500.
- Logs operativos minimos.
- Documentacion de contrato y demo.
- Trazabilidad de PR vinculada a Story.
