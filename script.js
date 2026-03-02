const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const NUMERO_WA = "51987173565";
const ENVIO_LIMA = 12;

let inventario = [];
let carrito = [];

// 1. CARGAR EXCEL
async function cargarInventario() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    try {
        const res = await fetch(url);
        const data = await res.text();
        const filas = data.split(/\r?\n/).slice(1);
        
        inventario = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            
            // CONVERSOR SEGURO DE DRIVE
            let idImg = "";
            let imgLink = c[4] || "";
            if (imgLink.includes('/d/')) idImg = imgLink.split('/d/')[1].split('/')[0];
            else if (imgLink.includes('id=')) idImg = imgLink.split('id=')[1].split('&')[0];
            
            const fotoFinal = idImg ? `https://lh3.googleusercontent.com/d/${idImg}` : "https://via.placeholder.com/400x500?text=PIETRA";

            return {
                id: c[0],
                nombre: c[1],
                precio: parseFloat(c[2]) || 0,
                descripcion: c[3] || 'Pieza exclusiva de Pietra & Co.',
                imagen: fotoFinal
            };
        }).filter(p => p.nombre);

        mostrarProductos();
    } catch (e) { console.error("Error cargando inventario", e); }
}

// 2. MOSTRAR PRODUCTOS
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
                <span class="desc-toggle" onclick="toggleDesc(this)">+ Detalles</span>
                <div class="desc-text">${p.descripcion}</div>
                <button class="btn-add" onclick="agregarAlCarrito('${p.id}')">Añadir a Selección</button>
            </div>
        `;
    });
}

// 3. CARRITO
function agregarAlCarrito(id) {
    const p = inventario.find(item => item.id === id);
    if (p) {
        carrito.push(p);
        actualizarCarrito();
        toggleCart(true); // Abrir al añadir
    }
}

function actualizarCarrito() {
    const lista = document.getElementById('cart-items');
    const subTxt = document.getElementById('subtotal');
    const totalTxt = document.getElementById('total-final');
    const countTxt = document.getElementById('cart-count');
    
    lista.innerHTML = '';
    let sub = 0;

    carrito.forEach((p, i) => {
        sub += p.precio;
        lista.innerHTML += `
            <div class="cart-item">
                <span>${p.nombre}</span>
                <span>S/ ${p.precio.toFixed(2)} <button onclick="quitar(${i})" style="color:red; border:none; background:none; cursor:pointer; margin-left:10px;">✕</button></span>
            </div>
        `;
    });

    subTxt.innerText = sub.toFixed(2);
    totalTxt.innerText = (sub > 0 ? sub + ENVIO_LIMA : 0).toFixed(2);
    countTxt.innerText = carrito.length;
}

function quitar(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function toggleCart(open = null) {
    const drawer = document.getElementById('cart-drawer');
    if (open === true) drawer.classList.add('open');
    else if (open === false) drawer.classList.remove('open');
    else drawer.classList.toggle('open');
}

function toggleDesc(btn) {
    const text = btn.nextElementSibling;
    text.classList.toggle('show');
    btn.innerText = text.classList.contains('show') ? '- Cerrar' : '+ Detalles';
}

// 4. WHATSAPP
function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Tu carrito está vacío");
    let msg = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => msg += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    msg += `\n*Envío Lima:* S/ ${ENVIO_LIMA}\n*TOTAL:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`, '_blank');
}

cargarInventario();