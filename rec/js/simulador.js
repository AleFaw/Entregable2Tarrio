// ====== VARIABLES GLOBALES ======
let nombreJugador = "";
let cartas = [];
let primeraCarta = null;
let segundaCarta = null;
let bloqueo = false;
let movimientos = 0;
let tiempo = 0;
let temporizador = null;
let juegoIniciado = false;

// ====== REFERENCIAS DOM ======
const paneles = {
  menu: document.getElementById("menu"),
  nombre: document.getElementById("pantallaNombre"),
  juego: document.getElementById("juego"),
  ranking: document.getElementById("ranking")
};

const tablero = document.getElementById("tablero");
const nombreJugadorSpan = document.getElementById("nombreJugador");
const movSpan = document.getElementById("movimientos");
const tiempoSpan = document.getElementById("tiempo");

// ====== MODALES ======
const modalVictoria = document.getElementById("modalVictoria");
const modalSalir = document.getElementById("modalSalir");

// ====== BOTONES ======
document.getElementById("btnJugar").addEventListener("click", () => mostrarPanel("nombre"));
document.getElementById("btnRanking").addEventListener("click", mostrarRanking);
document.getElementById("btnVolverMenu1").addEventListener("click", () => mostrarPanel("menu"));
document.getElementById("btnVolverMenu2").addEventListener("click", () => mostrarPanel("menu"));
document.getElementById("btnConfirmarNombre").addEventListener("click", iniciarJuego);
document.getElementById("btnReiniciar").addEventListener("click", reiniciarJuego);
document.getElementById("btnSalir").addEventListener("click", () => modalSalir.classList.remove("oculto"));

document.getElementById("confirmSalir").addEventListener("click", () => {
  modalSalir.classList.add("oculto");
  mostrarPanel("menu");
  detenerTemporizador();
});

document.getElementById("cancelSalir").addEventListener("click", () => modalSalir.classList.add("oculto"));

document.getElementById("btnVolverMenuVictory").addEventListener("click", () => {
  modalVictoria.classList.add("oculto");
  mostrarPanel("menu");
});

document.getElementById("btnJugarOtra").addEventListener("click", () => {
  modalVictoria.classList.add("oculto");
  reiniciarJuego();
});

document.getElementById("btnBorrarRanking").addEventListener("click", () => {
  localStorage.removeItem("ranking");
  mostrarRanking();
});

// ====== FUNCIONES PRINCIPALES ======
function mostrarPanel(nombre) {
  for (let p in paneles) paneles[p].classList.remove("visible");
  paneles[nombre].classList.add("visible");
}

function iniciarJuego() {
  const input = document.getElementById("inputNombre");
  nombreJugador = input.value.trim();
  if (!nombreJugador) {
    input.focus();
    return;
  }

  movimientos = 0;
  tiempo = 0;
  movSpan.textContent = "0";
  tiempoSpan.textContent = "00:00";
  nombreJugadorSpan.textContent = nombreJugador;
  detenerTemporizador();
  juegoIniciado = false;

  generarCartas();
  mostrarPanel("juego");
}

function generarCartas() {
  tablero.innerHTML = "";
  const totalCartas = 15;
  let pares = [];

  for (let i = 1; i <= totalCartas; i++) {
    pares.push(i, i);
  }

  for (let i = pares.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pares[i], pares[j]] = [pares[j], pares[i]];
  }

  cartas = pares.map((num) => crearCarta(num));
  cartas.forEach((c) => tablero.appendChild(c));
}

function crearCarta(num) {
  const carta = document.createElement("div");
  carta.classList.add("carta");
  carta.dataset.valor = num;

  const frente = document.createElement("div");
  frente.classList.add("frente");
  frente.style.backgroundImage = `url('rec/img/carta${num}.png')`;
  const reverso = document.createElement("div");
  reverso.classList.add("reverso");

  carta.appendChild(reverso);
  carta.appendChild(frente);

  carta.addEventListener("click", () => girarCarta(carta));

  return carta;
}



function girarCarta(carta) {
  if (bloqueo || carta.classList.contains("acertada") || carta === primeraCarta) return;

  if (!juegoIniciado) {
    iniciarTemporizador();
    juegoIniciado = true;
  }

  carta.classList.add("girada");

  if (!primeraCarta) {
    primeraCarta = carta;
  } else {
    segundaCarta = carta;
    movimientos++;
    movSpan.textContent = movimientos;
    bloqueo = true;

    if (primeraCarta.dataset.valor === segundaCarta.dataset.valor) {
      primeraCarta.classList.add("acertada");
      segundaCarta.classList.add("acertada");
      reproducirSonido("true");
      resetGiro();
      verificarVictoria();
    } else {
      reproducirSonido("false");
      setTimeout(() => {
        primeraCarta.classList.remove("girada");
        segundaCarta.classList.remove("girada");
        resetGiro();
      }, 800);
    }
  }
}

function resetGiro() {
  [primeraCarta, segundaCarta, bloqueo] = [null, null, false];
}

function verificarVictoria() {
  const todasAcertadas = [...document.querySelectorAll(".carta")].every(c => c.classList.contains("acertada"));
  if (todasAcertadas) {
    detenerTemporizador();
    reproducirSonido("win");
    mostrarVictoria();
    guardarResultado();
  }
}

function mostrarVictoria() {
  document.getElementById("victoriaTiempo").textContent = formatearTiempo(tiempo);
  document.getElementById("victoriaMov").textContent = movimientos;
  modalVictoria.classList.remove("oculto");
}

function reiniciarJuego() {
  detenerTemporizador();
  juegoIniciado = false;
  movimientos = 0;
  tiempo = 0;
  movSpan.textContent = "0";
  tiempoSpan.textContent = "00:00";
  generarCartas();
}

function iniciarTemporizador() {
  detenerTemporizador();
  temporizador = setInterval(() => {
    tiempo++;
    tiempoSpan.textContent = formatearTiempo(tiempo);
  }, 1000);
}

function detenerTemporizador() {
  clearInterval(temporizador);
}

function formatearTiempo(segundos) {
  const min = Math.floor(segundos / 60).toString().padStart(2, "0");
  const seg = (segundos % 60).toString().padStart(2, "0");
  return `${min}:${seg}`;
}

function guardarResultado() {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push({ nombre: nombreJugador, movimientos, tiempo });
  ranking.sort((a, b) => a.movimientos - b.movimientos || a.tiempo - b.tiempo);
  ranking = ranking.slice(0, 20);
  localStorage.setItem("ranking", JSON.stringify(ranking));
}

function mostrarRanking() {
  mostrarPanel("ranking");
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  const podio = document.getElementById("podio");
  const lista = document.getElementById("listaRanking");
  podio.innerHTML = "";
  lista.innerHTML = "";

  if (ranking.length === 0) {
    lista.innerHTML = "<li>No hay registros aún</li>";
    return;
  }

  const oro = ranking[0];
  const plata = ranking[1];
  const bronce = ranking[2];
  podio.innerHTML = `
    ${plata ? `<div class="plata">🥈<br>${plata.nombre}<br>${plata.movimientos} mov<br>${formatearTiempo(plata.tiempo)}</div>` : ""}
    ${oro ? `<div class="oro">🥇<br>${oro.nombre}<br>${oro.movimientos} mov<br>${formatearTiempo(oro.tiempo)}</div>` : ""}
    ${bronce ? `<div class="bronce">🥉<br>${bronce.nombre}<br>${bronce.movimientos} mov<br>${formatearTiempo(bronce.tiempo)}</div>` : ""}
  `;

  ranking.slice(3).forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 4}. ${p.nombre} - ${p.movimientos} mov - ${formatearTiempo(p.tiempo)}`;
    lista.appendChild(li);
  });
}

function reproducirSonido(nombre) {
  try {
    const audio = new Audio(`rec/snd/${nombre}.mp3`);

    audio.play().catch(() => {});
  } catch (e) {
    console.warn("No se encontró el sonido:", nombre);
  }
}