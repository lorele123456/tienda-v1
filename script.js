const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const GID_BANNERS = '338089071';
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventarioCompleto = [];
let carrito = [];
let favoritos = [];
let currentSlide = 0;

// FUNCIÓN CLAVE: Convierte links de Drive para que la web los pueda mostrar
function obtenerUrlDirecta(url) {
    if (!url) return "https://placehold.co/400x500?text=PIETRA";
    let id = "";
    if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0];
    else if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
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
                imagen: obtenerUrlDirecta(c[4]),
                categoria: (c[5] || 'todos').toLowerCase()
            };
        }).filter(p => p.nombre);

        renderizar(inventarioCompleto);
    } catch (e) { console.error("Error cargando productos", e); }
}

async function cargarCarrusel() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_BANNERS}&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        const track = document.getElementById('banner-track');
        if (!track) return;

        filas.forEach(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            const img = obtenerUrlDirecta(c[0]);
            if(img) track.innerHTML += `<div class="slide"><img src="${img}"></div>`;
        });

        if (filas.length > 0) {
            setInterval(() => {
                const slides = document.querySelectorAll('.slide');
                if (slides.length === 0) return;
                currentSlide = (currentSlide + 1) % slides.length;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }, 4000);
        }
    } catch (e) { console.error("Error carrusel", e); }
}

function renderizar(lista) {
    const contenedor = document.getElementById('product-list');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    lista.forEach(p => {
        contenedor.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <img src="${p.imagen}" onerror="this.src='https://placehold.co/400x500?text=Error+Carga'">
                </div>
                <div class="product-info" style="padding-top:15px;">
                    <h3 style="font-family:'Playfair Display';">${p.nombre}</h3>
                    <p style="color:var(--oro); font-weight:bold; margin:5px 0;">S/ ${p.precio.toFixed(2)}</p>
                    <button class="btn-add" onclick="agregarCarrito('${p.id}')" style="width:100%; padding:10px; background:var(--verde); color:white; border:none; cursor:pointer;">Añadir</button>
                </div>
            </div>`;
    });
}

// Funciones Auxiliares (Menú, Carrito, etc)
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function toggleCart(force) { 
    const c = document.getElementById('cart-drawer');
    if(force === true) c.classList.add('open'); else c.classList.toggle('open'); 
}

function agregarCarrito(id) {
    const p = inventarioCompleto.find(i => i.id === id);
    if (p) { carrito.push(p); actualizarCarrito(); toggleCart(true); }
}

function actualizarCarrito() {
    const lista = document.getElementById('cart-items');
    let sub = 0;
    lista.innerHTML = '';
    carrito.forEach((p, i) => {
        sub += p.precio;
        lista.innerHTML += `<div style="display:flex; gap:10px; margin-bottom:10px; align-items:center;">
            <img src="${p.imagen}" style="width:50px; height:50px; object-fit:cover;">
            <div style="flex:1;"><p style="font-size:0.8rem;">${p.nombre}</p></div>
            <button onclick="carrito.splice(${i},1); actualizarCarrito();" style="border:none; background:none; cursor:pointer;">✕</button>
        </div>`;
    });
    document.getElementById('subtotal').innerText = sub.toFixed(2);
    document.getElementById('total-final').innerText = (sub > 0 ? sub + COSTO_ENVIO : 0).toFixed(2);
    document.getElementById('cart-count').innerText = carrito.length;
}

function enviarWhatsApp() {
    let msg = `*PEDIDO PIETRA*\n\n`;
    carrito.forEach(p => msg += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    msg += `\n*TOTAL:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`);
}

window.onload = () => { obtenerDatos(); cargarCarrusel(); };