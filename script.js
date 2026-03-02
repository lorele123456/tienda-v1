const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const NUMERO_WA = "51987173565";
const ENVIO_LIMA = 12;

let inventario = [];
let carrito = [];

// 1. Cargar datos del Excel
async function cargarInventario() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    try {
        const res = await fetch(url);
        const data = await res.text();
        const filas = data.split(/\r?\n/).slice(1);
        
        inventario = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            
            // Convertir link de Drive
            let img = c[4] || '';
            if (img.includes('drive.google.com')) {
                const id = img.split('/d/')[1]?.split('/')[0] || img.split('id=')[1]?.split('&')[0];
                img = `http://googleusercontent.com/profile/picture/6{id}`;
            }

            return {
                id: c[0],
                nombre: c[1],
                precio: parseFloat(c[2]) || 0,
                descripcion: c[3] || 'Pieza exclusiva de Pietra & Co.', // Columna D para descripción
                imagen: img
            };
        }).filter(p => p.nombre);

        mostrarProductos();
    } catch (e) { console.error("Error cargando Excel", e); }
}

// 2. Mostrar productos con zoom y descripción
function mostrarProductos() {
    const listado = document.getElementById('product-list');
    listado.innerHTML = '';
    
    inventario.forEach(p => {
        listado.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <img src="${p.imagen}" alt="${p.nombre}">
                </div>
                <h3>${p.nombre}</h3>
                <p class="price">S/ ${p.precio.toFixed(2)}</p>
                
                <span class="desc-toggle" onclick="toggleDesc(this)">▼ Ver detalles</span>
                <div class="desc-text">${p.descripcion}</div>

                <button class="btn-add" onclick="agregarAlCarrito('${p.id}')">Añadir a Selección</button>
            </div>
        `;
    });
}

// 3. Funciones del Carrito
function agregarAlCarrito(id) {
    const producto = inventario.find(p => p.id === id);
    if (producto) {
        carrito.push(producto);
        actualizarUI();
        toggleCart(true);
    }
}

function actualizarUI() {
    const listado = document.getElementById('cart-items');
    const subtotalTxt = document.getElementById('subtotal');
    const totalTxt = document.getElementById('total-final');
    const countTxt = document.getElementById('cart-count');
    
    listado.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((p, index) => {
        subtotal += p.precio;
        listado.innerHTML += `
            <div class="cart-item">
                <span>${p.nombre}</span>
                <span>S/ ${p.precio.toFixed(2)} <button onclick="quitar(${index})" style="border:none;background:none;color:red;cursor:pointer">✕</button></span>
            </div>
        `;
    });

    subtotalTxt.innerText = subtotal.toFixed(2);
    totalTxt.innerText = (subtotal + ENVIO_LIMA).toFixed(2);
    countTxt.innerText = carrito.length;
}

function quitar(index) {
    carrito.splice(index, 1);
    actualizarUI();
}

function toggleCart(open = null) {
    const cart = document.getElementById('cart-drawer');
    if (open === true) cart.classList.add('open');
    else if (open === false) cart.classList.remove('open');
    else cart.classList.toggle('open');
}

function toggleDesc(btn) {
    const text = btn.nextElementSibling;
    text.classList.toggle('show');
    btn.innerText = text.classList.contains('show') ? '▲ Cerrar' : '▼ Ver detalles';
}

// 4. WhatsApp
function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Carrito vacío");
    let msg = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => msg += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    msg += `\n*Envío Lima:* S/ ${ENVIO_LIMA}\n*TOTAL:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`, '_blank');
}

cargarInventario();