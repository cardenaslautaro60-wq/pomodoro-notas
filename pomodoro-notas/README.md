# Pomodoro + Notas

Una app web simple que combina un temporizador Pomodoro con una lista de notas rápidas. Todo se ejecuta en el navegador, sin dependencias ni backend.

## Funcionalidades

- **Temporizador Pomodoro** con tres modos: Enfoque (25 min), Descanso corto (5 min) y Descanso largo (15 min).
- Cambio automático de modo al terminar cada ciclo, con sonido de aviso.
- Contador de ciclos completados, guardado en `localStorage`.
- **Área recreativa**: al entrar en cualquiera de los dos descansos, la app propone algo concreto para hacer con ese rato, distinto según duren 5 o 15 minutos. El botón "Otra idea" cambia la propuesta. No lleva puntaje ni registro a propósito: medir el recreo lo convertiría en otra tarea.
- **Notas rápidas**: agregá tareas, marcalas como hechas o eliminalas. Se guardan en `localStorage`.
- **Tema claro/oscuro** con detección automática de preferencia del sistema.

## Uso

Abrí `index.html` en tu navegador. No requiere instalación ni servidor.

## Estructura

- `index.html` — marcado de la interfaz.
- `style.css` — estilos y temas (claro/oscuro).
- `script.js` — lógica del temporizador y las notas.
