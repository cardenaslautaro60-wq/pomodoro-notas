# ESTADO — memoria compartida entre chats

**Última actualización:** 2026-09-10 · actualizado desde la sesión `👽Área creativa`

## Para qué existe este archivo

Los chats no se leen entre sí. No hay ninguna herramienta que permita a una
sesión abrir el historial de otra: se ve el título, el estado y un resumen de
una línea, nada más.

Este archivo es el puente. Vive en el repo, en `main`, así que **cualquier
sesión nueva lo tiene apenas clona**. Es la única memoria compartida real
entre conversaciones.

Regla: si un dato importa en más de un chat, va acá. Si vive sólo en el
historial de un chat, se pierde.

---

## Registro de sesiones

| Sesión | ID | Estado | Rama | Qué es |
|---|---|---|---|---|
| 🧠 CEREBRO NICO | `session_01GXESuaN5qsrcB9Lw1m7kLE` | idle | `claude/weekly-workflow-organization-h2jc30` | Sistema operativo personal de Nicolás, formato RPG de vida |
| 👽 Área creativa | `session_01H94bjwamZnLoYKvoCTQLQb` | activa | `claude/determined-hypatia-q8wajc` | Captura y evaluación de ideas → puente a la vida real |
| Pruebacollage | `session_01LzjpQFqYJahzopvwB5Rpgz` | archivada | — | Sin verificar si tiene relación con "Collage · base de datos y panel" |
| Collage · base de datos y panel | *(desconocido)* | — | — | **No aparece en el listado de sesiones.** Ver abajo. |

---

## 🧠 Cerebro Nico

**Verificado.** Es una sesión real, creada el 2026-09-09, sobre este mismo repo.

Marco: **RPG de vida** — la vida propia tratada como personaje con ficha,
rachas y límites. Incluye un flujo de "conexión con Dios".

Paneles publicados (viven en claude.ai, no en el repo):

- **La Ficha** — `7526c1cd-15e1-4f20-bf4e-ea17109c168b`
- **Racha de Nicolás** — `1571c8d5-418a-4bb5-81e5-c7537412a1e7`
- **Piso y Techo** — `65d40629-2df2-47a4-b905-ab0d508a50f2`

Pendientes declarados por esa sesión:

- [ ] Filas fantasma en Notion
- [ ] Rutina de auto-claim
- [ ] Notificaciones push

### ⚠️ Riesgo abierto

La rama `claude/weekly-workflow-organization-h2jc30` **nunca se pusheó**. No
está en el remoto. Todo lo que esa sesión escribió en archivos vive sólo en su
contenedor, que es efímero. Sobreviven los tres paneles y nada más.

Acción sugerida: entrar a esa sesión y pushear la rama antes de seguir.

---

## Collage · base de datos y panel

No aparece en el listado de sesiones accesible desde acá. Dos explicaciones
posibles, ninguna confirmada:

1. Es un chat de claude.ai (no una sesión de Claude Code) — no listable.
2. Es una sesión en una carpeta cuyo filtro de listado está deshabilitado
   del lado del servidor.

Lo único registrado del proyecto Collage: **base de datos + panel**. La
pregunta abierta de ese chat era qué parte adaptarle a Cerebro Nico.

Hipótesis (sin confirmar): lo que le falta a Cerebro Nico no es panel —ya
tiene tres— sino la **capa de base de datos**, que es justo lo que sus tres
pendientes tienen en común (filas fantasma, auto-claim, push: todos problemas
de datos, no de interfaz).

---

## Preguntas abiertas

- [ ] ¿Nicolás es cliente, o sos vos en tercera persona?
- [ ] ¿Dónde vive el chat de Collage y cómo se le llega?
- [ ] ¿Qué se adapta de Collage a Cerebro Nico — base de datos, panel, ambos?
- [ ] Título del proyecto nuevo (pendiente desde el chat de Collage)
