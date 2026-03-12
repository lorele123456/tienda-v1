const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventarioCompleto = [];
let carrito = [];
let favoritos = [];

async function obtenerDatos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);

        inventarioCompleto = filas.map(f => {
            // Regex para manejar comas dentro de las celdas del Excel
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            return {
                id: c[0],
                nombre: c[1],
                precio: parseFloat(c[2]) || 0,
                imagen: c[4] || "https://placehold.co/400x500?text=PIETRA",
                categoria: (c[5] || 'todos').toLowerCase()
            };
        }).filter(p => p.nombre);

        renderizar(inventarioCompleto);
    } catch (e) { console.error("Error cargando datos:", e); }
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
                    <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://placehold.co/400x500?text=Imagen+No+Disponible'">
                </div>
                <div class="product-info" style="padding:15px 0;">
                    <span style="font-size:0.6rem; color:var(--oro); letter-spacing:1px; text-transform:uppercase;">Pietra - Minimalismo Artesanal</span>
                    <h3 style="font-size:1.1rem; margin: 5px 0; font-family:'Playfair Display';">${p.nombre}</h3>
                    <p style="color:var(--verde); font-weight:600;">S/ ${p.precio.toFixed(2)}</p>
                    <button class="btn-add" onclick="agregarCarrito('${p.id}')" style="width:100%; margin-top:10px; background:var(--verde); color:white; border:none; padding:12px; cursor:pointer; text-transform:uppercase; font-size:0.7rem; letter-spacing:1px;">Añadir</button>
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
    if (index > -1) favoritos.splice(index, 1);
    else favoritos.push(id);
    document.getElementById('fav-count').innerText = favoritos.length;
    renderizar(inventarioCompleto);
}

function agregarCarrito(id) {
    const p = inventarioCompleto.find(i => i.id === id);
    if (p) { 
        carrito.push(p); 
        actualizarUI(); 
        toggleCart(true); 
    }
}

function quitarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarUI();
}

function actualizarUI() {
    const listaHtml = document.getElementById('cart-items');
    let sub = 0;
    listaHtml.innerHTML = '';
    carrito.forEach((p, i) => {
        sub += p.precio;
        listaHtml.innerHTML += `
            <div class="cart-item" style="display:flex; gap:10px; margin-bottom:10px; align-items:center;">
                <img src="${p.imagen}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                <div style="flex:1;">
                    <p style="font-size:0.8rem; font-weight:600; margin:0;">${p.nombre}</p>
                    <p style="font-size:0.75rem; color:var(--oro); margin:0;">S/ ${p.precio.toFixed(2)}</p>
                </div>
                <button onclick="quitarDelCarrito(${i})" style="background:none; border:none; cursor:pointer; color:#ccc;">✕</button>
            </div>`;
    });
    const total = sub > 0 ? sub + COSTO_ENVIO : 0;
    document.getElementById('subtotal').innerText = sub.toFixed(2);
    document.getElementById('total-final').innerText = total.toFixed(2);
    document.getElementById('cart-count').innerText = carrito.length;
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function toggleCart(force) { 
    const c = document.getElementById('cart-drawer');
    if(force === true) c.classList.add('open'); else c.classList.toggle('open'); 
}

function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Selecciona un producto");
    let mensaje = `*PEDIDO PIETRA*\n\n`;
    carrito.forEach(p => mensaje += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    mensaje += `\n*Envío Lima:* S/ ${COSTO_ENVIO.toFixed(2)}\n*TOTAL:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(mensaje)}`);
}

window.onload = obtenerDatos;