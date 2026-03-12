/**
 * 1. CONFIGURACIÓN GLOBAL
 */
const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const GID_BANNERS = '338089071'; 
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventarioCompleto = [];
let carrito = [];
let favoritos = [];
let currentSlide = 0;

/**
 * 2. CARGA DE DATOS (PRODUCTOS Y BANNERS)
 */
async function obtenerDatos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cachebuster=${Date.now()}`;
    
    try {
        const respuesta = await fetch(url);
        const csv = await respuesta.text();
        
        const separador = csv.includes('","') ? ',' : (csv.includes('";"') ? ';' : ',');
        const filas = csv.split(/\r?\n/).slice(1);

        inventarioCompleto = filas.map(f => {
            const c = f.split(separador).map(x => x.replace(/^"|"$/g, '').trim());
            
            let imgId = "";
            let linkOriginal = c[4] || "";
            if (linkOriginal.includes('/d/')) imgId = linkOriginal.split('/d/')[1].split('/')[0];
            else if (linkOriginal.includes('id=')) imgId = linkOriginal.split('id=')[1].split('&')[0];
            
            const imgFinal = imgId ? `https://lh3.googleusercontent.com/d/${imgId}` : "https://placehold.co/400x500?text=PIETRA";

            return {
                id: c[0],
                nombre: c[1],
                precio: parseFloat(c[2]) || 0,
                descripcion: c[3] || '',
                imagen: imgFinal,
                categoria: (c[5] || 'Otros').trim().toLowerCase(),
                precioAnterior: parseFloat(c[6]) || null 
            };
        }).filter(p => p.nombre);

        renderizar(inventarioCompleto);
    } catch (e) {
        console.error("Error cargando productos:", e);
    }
}

async function inicializarCarrusel() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_BANNERS}&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        const track = document.getElementById('banner-track');
        if (!track) return;

        track.innerHTML = ''; 
        filas.forEach(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            const imgUrl = c[0]; 
            if(imgUrl) {
                let imgId = "";
                if (imgUrl.includes('/d/')) imgId = imgUrl.split('/d/')[1].split('/')[0];
                const finalImg = imgId ? `https://lh3.googleusercontent.com/d/${imgId}` : imgUrl;
                track.innerHTML += `<div class="slide"><img src="${finalImg}" alt="Pietra Banner"></div>`;
            }
        });
        if (document.querySelectorAll('.slide').length > 1) setInterval(nextSlide, 4000);
    } catch (e) { console.error("Error carrusel:", e); }
}

/**
 * 3. BUSCADOR Y FAVORITOS
 */
function ejecutarBusqueda() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtrados = inventarioCompleto.filter(p => 
        p.nombre.toLowerCase().includes(query) || 
        p.categoria.toLowerCase().includes(query)
    );
    renderizar(filtrados);
}

function toggleFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index > -1) {
        favoritos.splice(index, 1);
    } else {
        favoritos.push(id);
    }
    document.getElementById('fav-count').innerText = favoritos.length;
    renderizar(inventarioCompleto); 
}

/**
 * 4. RENDERIZADO DE PRODUCTOS
 */
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
                    <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
                </div>
                <div class="product-info">
                    <span class="brand-label">PIETRA - Minimalismo Artesanal</span>
                    <h3>${p.nombre}</h3>
                    <div class="price-row">
                        <span class="current-price">S/ ${p.precio.toFixed(2)}</span>
                    </div>
                    <button class="btn-add" onclick="agregarCarrito('${p.id}')">Añadir a Selección</button>
                </div>
            </div>`;
    });
}

function filtrar(catRecibida) {
    const botones = document.querySelectorAll('.filter-btn');
    botones.forEach(b => b.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    const catBusqueda = catRecibida.toLowerCase().trim();
    const filtrados = catBusqueda === 'todos' 
        ? inventarioCompleto 
        : inventarioCompleto.filter(p => p.categoria === catBusqueda);
    renderizar(filtrados);
}

/**
 * 5. GESTIÓN DEL CARRITO
 */
function agregarCarrito(id) {
    const p = inventarioCompleto.find(item => item.id === id);
    if (p) { 
        carrito.push(p); 
        actualizarUI(); 
        toggleCart(true); 
    }
}

function quitarCarrito(index) {
    carrito.splice(index, 1);
    actualizarUI();
}

function actualizarUI() {
    const listaHtml = document.getElementById('cart-items');
    if (!listaHtml) return;
    listaHtml.innerHTML = '';
    let sub = 0;

    carrito.forEach((p, i) => {
        sub += p.precio;
        listaHtml.innerHTML += `
            <div class="cart-item">
                <img src="${p.imagen}" alt="${p.nombre}">
                <div class="cart-info">
                    <p style="font-weight:600; font-size:0.85rem; margin:0;">${p.nombre}</p>
                    <p style="font-size:0.8rem; color:var(--oro); margin:0;">S/ ${p.precio.toFixed(2)}</p>
                </div>
                <button onclick="quitarCarrito(${i})" style="border:none; background:none; cursor:pointer; color:#999;">✕</button>
            </div>`;
    });

    const final = sub > 0 ? sub + COSTO_ENVIO : 0;
    document.getElementById('subtotal').innerText = sub.toFixed(2);
    document.getElementById('total-final').innerText = final.toFixed(2);
    document.getElementById('cart-count').innerText = carrito.length;
}

/**
 * 6. UTILIDADES DE INTERFAZ
 */
function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function toggleCart(open = null) {
    const cart = document.getElementById('cart-drawer');
    if (open === true) cart.classList.add('open');
    else if (open === false) cart.classList.remove('open');
    else cart.classList.toggle('open');
}

function nextSlide() {
    const track = document.getElementById('banner-track');
    const slides = document.querySelectorAll('.slide');
    if (!track || slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Tu selección está vacía");
    let mensaje = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => mensaje += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    mensaje += `\n*Envío Lima:* S/ ${COSTO_ENVIO.toFixed(2)}\n*TOTAL:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

window.onload = () => {
    obtenerDatos(); 
    inicializarCarrusel();
};