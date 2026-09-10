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
| 🧠 CEREBRO NICO | `session_01GXESuaN5qsrcB9Lw1m7kLE` | idle | `claude/weekly-workflow-organization-h2jc30` ✅ | OS personal de Lautaro: su manera de pensar y estructurar su vida |
| 👽 Área creativa | `session_01H94bjwamZnLoYKvoCTQLQb` | activa | `claude/determined-hypatia-q8wajc` | Captura y evaluación de ideas → puente a la vida real |
| Collage · gestión | *por crear* | — | — | Gestión de Collage: espacio cultural real en Belgrano 1053 |

---

## 🧠 Cerebro Nico ✅

**Rama pusheada.** Ya está segura en el remoto.

El sistema operativo personal de Lautaro — cómo piensa y estructura su vida.

Paneles publicados (viven en claude.ai):

- **La Ficha** — `7526c1cd-15e1-4f20-bf4e-ea17109c168b`
- **Racha de Nicolás** — `1571c8d5-418a-4bb5-81e5-c7537412a1e7`
- **Piso y Techo** — `65d40629-2df2-47a4-b905-ab0d508a50f2`

Pendientes declarados:

- [ ] Filas fantasma en Notion
- [ ] Rutina de auto-claim
- [ ] Notificaciones push

---

## 🎪 Collage — espacio cultural real

**Ubicación:** Belgrano 1053, Comodoro Rivadavia

**Infraestructura:**
- Sala Teatro Alfredo Zitarrosa (40 personas) — gestión: Nico Nafarrate
- Sala Principal
- Galpón

**Gestión:**
- Dueño general: Nico
- Encargado Zitarrosa: Nico Nafarrate

**Oferta:**
- Eventos: teatro, música, circo, magia, ferias, documentales
- Clases y talleres: telas/acrobacias aéreas, macramé, teatro, calistenia

**Actual:**
- Entradas: venta por Entrada Web
- Clases: inscripción por WhatsApp

**Próximo paso:**
Base de datos + panel para centralizar: calendario de eventos, inscripciones de clases, ocupación de salas, contactos.

---

## Conexiones pendientes

**¿Cómo Cerebro Nico se conecta con la gestión de Collage?**

Hipótesis:
- Collage es un proyecto/responsabilidad en tu vida que conviene trackear en tu OS personal
- Cerebro Nico podría incluir: % de tiempo asignado a Collage, ciclos de Collage, métricas de ocupación
- O viceversa: Collage necesita datos de Cerebro Nico (ej. cuándo Lautaro está disponible para eventos)

Sin confirmar.

---

## Preguntas abiertas

- [x] ¿Nicolás es tu OS personal? **Sí.**
- [x] ¿Qué es Collage? **Espacio cultural real en Belgrano 1053, Comodoro Rivadavia.**
- [ ] ¿Cómo se conectan Cerebro Nico y Collage?
- [ ] ¿Armar sesión para gestión de Collage (base de datos + panel)?
- [ ] ¿Routine cada 3 días para mantener este archivo al día? **Sí.**

