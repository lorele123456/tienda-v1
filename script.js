const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const GID_BANNERS = '338089071';
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventario = [];
let carrito = [];
let currentSlide = 0;

function limpiarLink(url) {
    if (!url) return "https://placehold.co/400x600?text=PIETRA";
    let id = "";
    if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0];
    else if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
}

async function cargarTodo() {
    // Cargar Productos
    const urlProd = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cb=${Date.now()}`;
    try {
        const res = await fetch(urlProd);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        inventario = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            return { id: c[0], nombre: c[1], precio: parseFloat(c[2]) || 0, imagen: limpiarLink(c[4]) };
        }).filter(p => p.nombre);
        renderizar(inventario);
    } catch (e) { console.error("Error productos", e); }

    // Cargar Banners
    const urlBanner = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_BANNERS}&cb=${Date.now()}`;
    try {
        const resB = await fetch(urlBanner);
        const csvB = await resB.text();
        const filasB = csvB.split(/\r?\n/).slice(1);
        const track = document.getElementById('banner-track');
        filasB.forEach(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            const img = limpiarLink(c[0]);
            if(img) track.innerHTML += `<div class="slide"><img src="${img}"></div>`;
        });
        if(filasB.length > 1) setInterval(moverCarrusel, 4000);
    } catch (e) { console.error("Error banners", e); }
}

function renderizar(lista) {
    const cont = document.getElementById('product-list');
    cont.innerHTML = '';
    lista.forEach(p => {
        cont.innerHTML += `
            <div class="product-card">
                <div class="img-container"><img src="${p.imagen}"></div>
                <div class="product-info">
                    <h3>${p.nombre}</h3>
                    <p style="color:var(--oro); font-weight:bold;">S/ ${p.precio.toFixed(2)}</p>
                    <button class="btn-add" onclick="agregarCarrito('${p.id}')">Añadir</button>
                </div>
            </div>`;
    });
}

function moverCarrusel() {
    const track = document.getElementById('banner-track');
    const slides = document.querySelectorAll('.slide');
    currentSlide = (currentSlide + 1) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function agregarCarrito(id) {
    const p = inventario.find(i => i.id === id);
    if (p) { carrito.push(p); actualizarCarrito(); toggleCart(true); }
}

function actualizarCarrito() {
    const lista = document.getElementById('cart-items');
    let sub = 0;
    lista.innerHTML = '';
    carrito.forEach((p, i) => {
        sub += p.precio;
        lista.innerHTML += `<div style="display:flex; gap:10px; margin-bottom:15px;">
            <img src="${p.imagen}" style="width:50px; height:50px; object-fit:cover;">
            <div style="flex:1;"><p style="font-size:0.8rem;">${p.nombre}</p><b>S/ ${p.precio.toFixed(2)}</b></div>
            <button onclick="carrito.splice(${i},1); actualizarCarrito();" style="background:none; border:none; cursor:pointer;">✕</button>
        </div>`;
    });
    document.getElementById('subtotal').innerText = sub.toFixed(2);
    document.getElementById('total-final').innerText = (sub > 0 ? sub + COSTO_ENVIO : 0).toFixed(2);
    document.getElementById('cart-count').innerText = carrito.length;
}

function toggleCart(f) { const c = document.getElementById('cart-drawer'); if(f===true) c.classList.add('open'); else c.classList.toggle('open'); }
function enviarWhatsApp() {
    let msg = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => msg += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    msg += `\n*TOTAL CON ENVÍO:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`);
}

window.onload = cargarTodo;