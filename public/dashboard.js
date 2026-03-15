/**
 * MANEJO DE ESTADOS Y RENDERIZADO DINÁMICO
 */

import { obtenerUsuarios, obtenerPostsDeUsuario } from './api.js';

// --- ELEMENTOS DEL DOM ---
const contenedor = document.getElementById('contenedor-usuarios');
const spinner = document.getElementById('spinner');
const estado = document.getElementById('estado');
const busquedaInput = document.getElementById('busqueda');
const btnCargar = document.getElementById('btnCargar');
const btnLimpiar = document.getElementById('btnLimpiar');
const canvas = document.getElementById('particles-js');

// --- LÓGICA DE PARTÍCULAS (Fondo Animado) ---
const ctx = canvas.getContext('2d');
let particles = [];

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? '#a855f7' : '#ec4899'
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.fillStyle = p.color; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}

// --- FUNCIONES AUXILIARES DE UI ---

function mostrarEstado(msg, tipo = 'info') {
    if (!msg) { estado.classList.add('hidden'); return; }
    estado.textContent = `> SYSTEM_LOG: ${msg.toUpperCase()}`;
    estado.className = `mt-4 p-2 rounded border text-[10px] font-tech block bg-black/60 ${tipo === 'error' ? 'text-red-500 border-red-500/50' : 'text-purple-400 border-purple-500/30'}`;
    estado.classList.remove('hidden');
}

/**
 * Renderiza dinámicamente la tarjeta de un usuario
 */
function renderizarTarjeta(usuario) {
    const card = document.createElement('article');
    card.className = 'glass-panel rounded-2xl p-6 neon-border group cursor-default';
    card.innerHTML = `
        <div class="flex items-center space-x-4 mb-6">
            <div class="bg-gradient-to-br from-purple-600 to-pink-600 p-[2px] rounded-full shadow-lg shadow-purple-500/20">
                <div class="bg-black rounded-full h-12 w-12 flex items-center justify-center font-tech text-xl text-white">
                    ${usuario.name.charAt(0)}
                </div>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">${usuario.name}</h3>
                <p class="text-xs text-purple-400 opacity-70">${usuario.email.toLowerCase()}</p>
            </div>
        </div>
        
        <div class="space-y-3 mb-6 text-sm text-gray-400">
            <div class="flex items-center gap-3">
                <span class="text-pink-500 text-xs font-tech">WEB:</span>
                <span class="hover:text-white transition-colors cursor-pointer">${usuario.website}</span>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-pink-500 text-xs font-tech">CORP:</span>
                <span class="italic">${usuario.company.name}</span>
            </div>
        </div>

        <button class="btn-posts w-full bg-purple-900/30 hover:bg-purple-600 text-purple-100 py-3 rounded-lg text-xs font-tech tracking-tighter transition-all border border-purple-500/20" data-id="${usuario.id}">
            [ VER ACCIONES ]
        </button>
        <div class="posts-container mt-4 pt-4 border-t border-purple-500/10 space-y-3 hidden"></div>
    `;

    // Evento dinámico para cargar posts
    card.querySelector('.btn-posts').addEventListener('click', async (e) => {
        const postsDiv = card.querySelector('.posts-container');
        const btn = e.currentTarget;

        if (!postsDiv.classList.contains('hidden')) {
            postsDiv.classList.add('hidden');
            btn.textContent = '[ VER ACCIONES ]';
            return;
        }

        postsDiv.classList.remove('hidden');
        btn.textContent = '[ COLAPSAR ]';
        postsDiv.innerHTML = '<div class="py-2 animate-pulse text-[10px] text-pink-500 font-tech">AI TRADUCIENDO PUBLICACIONES...</div>';

        try {
            const posts = await obtenerPostsDeUsuario(usuario.id);
            postsDiv.innerHTML = posts.map(p => `
                <div class="bg-black/40 p-3 rounded-lg border-l-2 border-pink-500">
                    <p class="text-[11px] font-semibold text-gray-200 capitalize leading-relaxed">${p.title}</p>
                </div>
            `).join('');
        } catch (err) {
            postsDiv.innerHTML = `<span class="text-red-500 text-[10px] font-tech uppercase">Error: ${err.message}</span>`;
        }
    });

    return card;
}

// --- MANEJADORES DE EVENTOS ---

btnCargar.addEventListener('click', async () => {
    spinner.classList.remove('hidden');
    spinner.classList.add('flex');
    contenedor.innerHTML = '';
    mostrarEstado('Inicializando protocolo de descarga...', 'info');

    try {
        const usuarios = await obtenerUsuarios();
        usuarios.forEach(u => contenedor.appendChild(renderizarTarjeta(u)));
        mostrarEstado(`${usuarios.length} registros cargados en memoria.`, 'ok');
    } catch (err) {
        mostrarEstado(`Falla de conexión: ${err.message}`, 'error');
    } finally {
        spinner.classList.add('hidden');
        spinner.classList.remove('flex');
    }
});

btnLimpiar.addEventListener('click', () => {
    contenedor.innerHTML = '';
    busquedaInput.value = '';
    mostrarEstado(null);
});

busquedaInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('article').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
});

// --- INICIALIZACIÓN ---
window.onload = () => {
    window.addEventListener('resize', initParticles);
    initParticles();
    animateParticles();
};