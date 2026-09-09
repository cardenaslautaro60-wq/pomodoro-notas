/* Duelo Orbital — juego local para 2 jugadores en pantalla dividida.
   Jugador 1 abajo (dueño del menú), jugador 2 arriba con controles invertidos
   para que todo se sienta natural desde su lado de la mesa. */

(() => {
  'use strict';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const menuEl = document.getElementById('menu');
  const pauseEl = document.getElementById('pause');
  const pauseTitle = document.getElementById('pause-title');
  const pauseText = document.getElementById('pause-text');

  const COLORS = { p1: '#38bdf8', p2: '#fb7185' };
  const HP_MAX = 5;

  const config = { rondas: 3, velocidad: 1, powerups: 1, sonido: 1 };

  // En pantallas táctiles los mandos ocupan una franja en cada borde:
  // ni el HUD ni las naves se meten debajo.
  const TACTIL = matchMedia('(pointer: coarse)').matches;
  const banda = TACTIL ? 100 : 0;

  let W = 0, H = 0;
  let estado = 'menu'; // menu | jugando | pausa | fin
  let ronda = 1;
  let mensaje = null;      // { texto, hasta }
  let congelado = 0;       // cuenta atrás antes de cada ronda
  let stars = [];
  let balas = [];
  let mejoras = [];
  let restos = [];
  let proximaMejora = 0;
  let ultimo = 0;

  // ---------- Jugadores ----------
  function nuevoJugador(id) {
    return {
      id,
      color: id === 1 ? COLORS.p1 : COLORS.p2,
      x: 0, y: 0, ang: 0, vx: 0, vy: 0,
      hp: HP_MAX, puntos: 0,
      cooldown: 0, escudo: 0, triple: 0, turbo: 0, rapido: 0,
      invulnerable: 0
    };
  }

  const jugadores = [nuevoJugador(1), nuevoJugador(2)];

  function colocar() {
    const p1 = jugadores[0], p2 = jugadores[1];
    p1.x = W / 2; p1.y = Math.min(H * 0.82, H - 40 - banda); p1.ang = -Math.PI / 2;
    p2.x = W / 2; p2.y = Math.max(H * 0.18, 40 + banda); p2.ang = Math.PI / 2;
    for (const p of jugadores) {
      p.vx = p.vy = 0;
      p.hp = HP_MAX;
      p.cooldown = 0; p.escudo = 0; p.triple = 0; p.turbo = 0; p.rapido = 0;
      p.invulnerable = 1.2;
    }
    balas = [];
    mejoras = [];
    proximaMejora = 4;
  }

  // ---------- Entrada ----------
  const teclas = new Set();
  const MAPA = {
    1: { izq: 'KeyA', der: 'KeyD', arriba: 'KeyW', abajo: 'KeyS', fuego: 'Space' },
    2: { izq: 'ArrowLeft', der: 'ArrowRight', arriba: 'ArrowUp', abajo: 'ArrowDown', fuego: 'Slash' }
  };

  addEventListener('keydown', (e) => {
    if (['Space', 'Slash', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;
    if (e.code === 'KeyP' || e.code === 'Escape') { alternarPausa(); return; }
    if (e.code === 'Enter' && estado === 'menu') { empezar(); return; }
    teclas.add(e.code);
  });
  addEventListener('keyup', (e) => teclas.delete(e.code));
  addEventListener('blur', () => teclas.clear());

  // Botones táctiles: se comportan como teclas virtuales.
  document.querySelectorAll('.pad').forEach((btn) => {
    const code = btn.dataset.key;
    const on = (e) => { e.preventDefault(); teclas.add(code); };
    const off = (e) => { e.preventDefault(); teclas.delete(code); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('pointerleave', off);
  });
  if (!TACTIL) document.body.classList.add('no-touch');

  // ---------- Sonido ----------
  let audio = null;
  function sonar(freq, dur = 0.08, tipo = 'square', vol = 0.05) {
    if (!config.sonido) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = tipo;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + dur);
    } catch (_) { /* sin audio disponible */ }
  }

  // ---------- Tamaño ----------
  function redimensionar() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.5 + 0.2
    }));
    if (estado === 'menu') colocar();
  }
  addEventListener('resize', redimensionar);
  addEventListener('orientationchange', () => setTimeout(redimensionar, 120));

  // ---------- Menú ----------
  document.querySelectorAll('.opts').forEach((grupo) => {
    grupo.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      grupo.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
      btn.classList.add('on');
      config[grupo.dataset.setting] = parseFloat(btn.dataset.value);
    });
  });

  document.getElementById('play').addEventListener('click', empezar);
  document.getElementById('resume').addEventListener('click', () => {
    if (estado === 'fin') { empezar(); return; }
    pauseEl.classList.add('hidden');
    estado = 'jugando';
  });
  document.getElementById('tomenu').addEventListener('click', () => {
    pauseEl.classList.add('hidden');
    menuEl.classList.remove('hidden');
    estado = 'menu';
    colocar();
  });

  function empezar() {
    jugadores.forEach((p) => { p.puntos = 0; });
    ronda = 1;
    colocar();
    congelado = 3;
    mensaje = null;
    menuEl.classList.add('hidden');
    pauseEl.classList.add('hidden');
    estado = 'jugando';
    ultimo = performance.now();
  }

  function alternarPausa() {
    if (estado === 'jugando') {
      estado = 'pausa';
      pauseTitle.textContent = 'Pausa';
      pauseText.textContent = `Ronda ${ronda} · ${jugadores[0].puntos} — ${jugadores[1].puntos}`;
      document.getElementById('resume').textContent = 'Continuar';
      pauseEl.classList.remove('hidden');
    } else if (estado === 'pausa') {
      pauseEl.classList.add('hidden');
      estado = 'jugando';
      ultimo = performance.now();
    }
  }

  // ---------- Lógica ----------
  function disparar(p) {
    const v = 430 * config.velocidad;
    const angulos = p.triple > 0 ? [-0.22, 0, 0.22] : [0];
    for (const off of angulos) {
      const a = p.ang + off;
      balas.push({
        x: p.x + Math.cos(a) * 16,
        y: p.y + Math.sin(a) * 16,
        vx: Math.cos(a) * v + p.vx * 0.3,
        vy: Math.sin(a) * v + p.vy * 0.3,
        due: p.id, vida: 2.4, rebotes: 2
      });
    }
    p.cooldown = p.rapido > 0 ? 0.14 : 0.32;
    sonar(p.id === 1 ? 620 : 480, 0.05, 'square', 0.04);
  }

  function actualizarJugador(p, dt) {
    const k = MAPA[p.id];
    const giro = 3.4 * dt;
    if (teclas.has(k.izq)) p.ang -= giro;
    if (teclas.has(k.der)) p.ang += giro;

    const empuje = (teclas.has(k.arriba) ? 1 : 0) - (teclas.has(k.abajo) ? 0.5 : 0);
    if (empuje !== 0) {
      const acc = 340 * config.velocidad * (p.turbo > 0 ? 1.6 : 1) * empuje;
      p.vx += Math.cos(p.ang) * acc * dt;
      p.vy += Math.sin(p.ang) * acc * dt;
      if (empuje > 0) restos.push({
        x: p.x - Math.cos(p.ang) * 14, y: p.y - Math.sin(p.ang) * 14,
        vx: -Math.cos(p.ang) * 60, vy: -Math.sin(p.ang) * 60,
        vida: 0.35, color: p.color, r: 2
      });
    }

    const roce = Math.pow(0.22, dt);
    p.vx *= roce; p.vy *= roce;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Paredes laterales
    const r = 14;
    if (p.x < r) { p.x = r; p.vx = Math.abs(p.vx) * 0.5; }
    if (p.x > W - r) { p.x = W - r; p.vx = -Math.abs(p.vx) * 0.5; }

    // Cada nave vive en su propia mitad
    const mitad = H / 2;
    const fondo = r + banda;
    if (p.id === 1) {
      if (p.y < mitad + r) { p.y = mitad + r; p.vy = Math.abs(p.vy) * 0.5; }
      if (p.y > H - fondo) { p.y = H - fondo; p.vy = -Math.abs(p.vy) * 0.5; }
    } else {
      if (p.y > mitad - r) { p.y = mitad - r; p.vy = -Math.abs(p.vy) * 0.5; }
      if (p.y < fondo) { p.y = fondo; p.vy = Math.abs(p.vy) * 0.5; }
    }

    for (const campo of ['escudo', 'triple', 'turbo', 'rapido', 'invulnerable']) {
      if (p[campo] > 0) p[campo] = Math.max(0, p[campo] - dt);
    }
    if (p.cooldown > 0) p.cooldown -= dt;

    if (teclas.has(k.fuego) && p.cooldown <= 0) disparar(p);
  }

  const TIPOS = [
    { id: 'triple', color: '#facc15', icono: '≡' },
    { id: 'escudo', color: '#4ade80', icono: '◎' },
    { id: 'rapido', color: '#c084fc', icono: '»' },
    { id: 'turbo', color: '#f97316', icono: '↑' },
    { id: 'vida', color: '#f87171', icono: '+' }
  ];

  function soltarMejora() {
    const t = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    mejoras.push({
      x: 40 + Math.random() * (W - 80),
      y: H / 2 + (Math.random() * 2 - 1) * H * 0.18,
      tipo: t, vida: 11, giro: 0
    });
  }

  function golpe(p, dano) {
    if (p.invulnerable > 0) return;
    if (p.escudo > 0) { p.escudo = 0; sonar(300, 0.12, 'sine', 0.05); return; }
    p.hp -= dano;
    p.invulnerable = 0.35;
    sonar(180, 0.14, 'sawtooth', 0.05);
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      restos.push({ x: p.x, y: p.y, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, vida: 0.5, color: p.color, r: 2.4 });
    }
    if (p.hp <= 0) terminarRonda(p.id === 1 ? jugadores[1] : jugadores[0]);
  }

  function terminarRonda(ganador) {
    ganador.puntos++;
    sonar(760, 0.2, 'triangle', 0.05);
    if (ganador.puntos >= config.rondas) {
      estado = 'fin';
      pauseTitle.textContent = `¡Gana el jugador ${ganador.id}!`;
      pauseText.textContent = `Resultado final ${jugadores[0].puntos} — ${jugadores[1].puntos}`;
      document.getElementById('resume').textContent = 'Revancha';
      pauseEl.classList.remove('hidden');
    } else {
      ronda++;
      mensaje = { texto: `Punto para el jugador ${ganador.id}`, hasta: 1.4 };
      colocar();
      congelado = 3;
    }
  }

  function actualizar(dt) {
    if (congelado > 0) {
      congelado -= dt;
      restos = restos.filter((d) => (d.vida -= dt) > 0);
      return;
    }
    if (mensaje) { mensaje.hasta -= dt; if (mensaje.hasta <= 0) mensaje = null; }

    jugadores.forEach((p) => actualizarJugador(p, dt));

    // Balas
    for (const b of balas) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vida -= dt;
      if (b.x < 0 || b.x > W) {
        if (b.rebotes-- > 0) { b.vx *= -1; b.x = Math.max(2, Math.min(W - 2, b.x)); }
        else b.vida = 0;
      }
      if (b.y < 0 || b.y > H) b.vida = 0;
      for (const p of jugadores) {
        if (p.id === b.due || b.vida <= 0) continue;
        if (Math.hypot(p.x - b.x, p.y - b.y) < 15) { b.vida = 0; golpe(p, 1); }
      }
    }
    balas = balas.filter((b) => b.vida > 0);

    // Mejoras
    if (config.powerups) {
      proximaMejora -= dt;
      if (proximaMejora <= 0) { soltarMejora(); proximaMejora = 6 + Math.random() * 4; }
    }
    for (const m of mejoras) {
      m.vida -= dt;
      m.giro += dt * 2;
      for (const p of jugadores) {
        if (m.vida <= 0) continue;
        if (Math.hypot(p.x - m.x, p.y - m.y) < 22) {
          m.vida = 0;
          sonar(900, 0.1, 'triangle', 0.05);
          if (m.tipo.id === 'vida') p.hp = Math.min(HP_MAX, p.hp + 1);
          else p[m.tipo.id] = 7;
        }
      }
    }
    mejoras = mejoras.filter((m) => m.vida > 0);

    for (const d of restos) { d.x += d.vx * dt; d.y += d.vy * dt; d.vida -= dt; }
    restos = restos.filter((d) => d.vida > 0);
  }

  // ---------- Dibujo ----------
  function nave(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.ang);
    if (p.invulnerable > 0 && Math.floor(p.invulnerable * 12) % 2 === 0) ctx.globalAlpha = 0.4;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-11, 9);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-11, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (p.escudo > 0) {
      ctx.save();
      ctx.strokeStyle = '#4ade80';
      ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 120) * 0.2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function hud(p) {
    const arriba = p.id === 2;
    ctx.save();
    if (arriba) { ctx.translate(W, H / 2); ctx.rotate(Math.PI); }
    else ctx.translate(0, H / 2);
    // ahora (0,0) es la esquina "superior izquierda" desde el punto de vista del jugador
    const y = H / 2 - 26 - banda;
    ctx.fillStyle = p.color;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`JUGADOR ${p.id}`, 16, y - 14);
    for (let i = 0; i < HP_MAX; i++) {
      ctx.globalAlpha = i < p.hp ? 1 : 0.18;
      ctx.fillRect(16 + i * 18, y, 13, 7);
    }
    ctx.globalAlpha = 1;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(String(p.puntos), 16 + HP_MAX * 18 + 14, y + 8);
    ctx.restore();
  }

  function textoCentral(texto, sub) {
    ctx.save();
    ctx.textAlign = 'center';
    for (const arriba of [false, true]) {
      ctx.save();
      if (arriba) { ctx.translate(W, H); ctx.rotate(Math.PI); }
      ctx.fillStyle = '#e8eefc';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText(texto, W / 2, H * 0.72);
      if (sub) {
        ctx.font = '14px system-ui, sans-serif';
        ctx.globalAlpha = 0.7;
        ctx.fillText(sub, W / 2, H * 0.72 + 26);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function dibujar() {
    ctx.fillStyle = '#070b16';
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#9fb3d9';
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    // Línea divisoria de la pantalla partida
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const m of mejoras) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(Math.sin(m.giro) * 0.3);
      ctx.globalAlpha = m.vida < 2 ? 0.3 + Math.abs(Math.sin(m.vida * 8)) * 0.7 : 1;
      ctx.strokeStyle = m.tipo.color;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-15, -15, 30, 30, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = m.tipo.color;
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.tipo.icono, 0, 1);
      ctx.restore();
    }
    ctx.textBaseline = 'alphabetic';

    for (const d of restos) {
      ctx.globalAlpha = Math.max(0, d.vida * 2);
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.r, d.r);
    }
    ctx.globalAlpha = 1;

    for (const b of balas) {
      ctx.fillStyle = b.due === 1 ? COLORS.p1 : COLORS.p2;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    jugadores.forEach(nave);
    jugadores.forEach(hud);

    if (congelado > 0) {
      const n = Math.ceil(congelado);
      textoCentral(String(n), `Ronda ${ronda}`);
    } else if (mensaje) {
      textoCentral(mensaje.texto, '');
    }
  }

  // ---------- Bucle ----------
  function bucle(t) {
    const dt = Math.min((t - ultimo) / 1000, 0.05);
    ultimo = t;
    if (estado === 'jugando') actualizar(dt);
    dibujar();
    requestAnimationFrame(bucle);
  }

  redimensionar();
  colocar();
  requestAnimationFrame((t) => { ultimo = t; bucle(t); });
})();
