const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const GID_BANNERS = '338089071';
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventarioCompleto = [];
let carrito = [];
let favoritos = [];
let currentSlide = 0;

// Función para arreglar los links de Drive
function arreglarLinkDrive(url) {
    if (!url) return "https://placehold.co/400x500?text=PIETRA";
    let id = "";
    if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0];
    else if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    return id ? `https://lh3.googleusercontent.com/u/0/d/${id}` : url;
}

async function obtenerDatos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);

        inventarioCompleto = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            return {
                id: c[0],
                nombre: c[1],
                precio: parseFloat(c[2]) || 0,
                imagen: arreglarLinkDrive(c[4]),
                categoria: (c[5] || 'todos').toLowerCase()
            };
        }).filter(p => p.nombre);

        renderizar(inventarioCompleto);
    } catch (e) { console.error(e); }
}

async function cargarBanners() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_BANNERS}&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        const track = document.getElementById('banner-track');
        if (!track) return;

        filas.forEach(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            const img = arreglarLinkDrive(c[0]);
            track.innerHTML += `<div class="slide"><img src="${img}"></div>`;
        });
        if (filas.length > 0) setInterval(() => {
            const slides = document.querySelectorAll('.slide');
            currentSlide = (currentSlide + 1) % slides.length;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 4000);
    } catch (e) { console.error(e); }
}

function renderizar(lista) {
    const contenedor = document.getElementById('product-list');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    lista.forEach(p => {
        const esFav = favoritos.includes(p.id);
        contenedor.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <div class="fav-btn-item ${esFav ? 'active' : ''}" onclick="toggleFavorito('${p.id}')">
                        ${esFav ? '❤️' : '♡'}
                    </div>
                    <img src="${p.imagen}">
                </div>
                <div class="product-info" style="padding:10px 0;">
                    <h3>${p.nombre}</h3>
                    <p style="color:var(--oro); font-weight:600;">S/ ${p.precio.toFixed(2)}</p>
                    <button class="btn-add" onclick="agregarCarrito('${p.id}')" style="width:100%; margin-top:10px; background:var(--verde); color:white; border:none; padding:10px; cursor:pointer;">Añadir</button>
                </div>
            </div>`;
    });
}

function ejecutarBusqueda() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtrados = inventarioCompleto.filter(p => p.nombre.toLowerCase().includes(query));
    renderizar(filtrados);
}

function toggleFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index > -1) favoritos.splice(index, 1); else favoritos.push(id);
    document.getElementById('fav-count').innerText = favoritos.length;
    renderizar(inventarioCompleto);
}

function agregarCarrito(id) {
    const p = inventarioCompleto.find(i => i.id === id);
    if (p) { carrito.push(p); actualizarUI(); toggleCart(true); }
}

function actualizarUI() {
    const listaHtml = document.getElementById('cart-items');
    let sub = 0;
    listaHtml.innerHTML = '';
    carrito.forEach((p, i) => {
        sub += p.precio;
        listaHtml.innerHTML += `
            <div class="cart-item">
                <img src="${p.imagen}">
                <div style="flex:1;"><p>${p.nombre}</p><p>S/ ${p.precio.toFixed(2)}</p></div>
                <button onclick="carrito.splice(${i},1); actualizarUI();" style="background:none; border:none; cursor:pointer;">✕</button>
            </div>`;
    });
    document.getElementById('subtotal').innerText = sub.toFixed(2);
    document.getElementById('total-final').innerText = (sub > 0 ? sub + COSTO_ENVIO : 0).toFixed(2);
    document.getElementById('cart-count').innerText = carrito.length;
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function toggleCart(force) { 
    const c = document.getElementById('cart-drawer');
    if(force === true) c.classList.add('open'); else c.classList.toggle('open'); 
}

function enviarWhatsApp() {
    let mensaje = `*PEDIDO PIETRA*\n\n`;
    carrito.forEach(p => mensaje += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    mensaje += `\n*TOTAL:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(mensaje)}`);
}

window.onload = () => { obtenerDatos(); cargarBanners(); };