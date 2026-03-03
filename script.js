// CONFIGURACIÓN GLOBAL
const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00; 

let inventarioCompleto = []; // Usaremos solo esta para evitar confusiones
let carrito = [];

// 1. CARGAR DATOS DEL EXCEL
async function obtenerDatos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cachebuster=${Date.now()}`;
    try {
        const respuesta = await fetch(url);
        const csv = await respuesta.text();
        const filas = csv.split(/\r?\n/).slice(1); 

        inventarioCompleto = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            
            let imgId = "";
            let linkOriginal = c[4] || "";
            if (linkOriginal.includes('/d/')) imgId = linkOriginal.split('/d/')[1].split('/')[0];
            else if (linkOriginal.includes('id=')) imgId = linkOriginal.split('id=')[1].split('&')[0];
            
            const imgFinal = imgId ? `https://lh3.googleusercontent.com/d/${imgId}` : "https://via.placeholder.com/400x500?text=PIETRA";

            return {
                id: c[0], 
                nombre: c[1], 
                precio: parseFloat(c[2]) || 0,
                descripcion: c[3] || '', 
                imagen: imgFinal,
                categoria: (c[5] || 'Otros').trim().toLowerCase() 
            };
        }).filter(p => p.nombre);

        renderizar(inventarioCompleto); // Mostramos todos al inicio
    } catch (e) {
        console.error("Error al cargar inventario", e);
    }
}

// 2. FUNCIÓN PARA FILTRAR
function filtrar(catRecibida) {
    console.log("Filtrando por:", catRecibida);

    const botones = document.querySelectorAll('.filter-btn');
    botones.forEach(b => b.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const catBusqueda = catRecibida.trim().toLowerCase();

    if (catBusqueda === 'todos') {
        renderizar(inventarioCompleto);
    } else {
        const filtrados = inventarioCompleto.filter(p => p.categoria === catBusqueda);
        renderizar(filtrados);
    }
}

// 3. FUNCIÓN PARA RENDERIZAR
function renderizar(lista) {
    const contenedor = document.getElementById('product-list');
    contenedor.innerHTML = ''; 

    if(lista.length === 0) {
        contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 50px; color: #999;">Próximamente más piezas en esta categoría.</p>';
        return;
    }

    lista.forEach(p => {
        contenedor.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <img src="${p.imagen}" alt="${p.nombre}">
                </div>
                <h3>${p.nombre}</h3>
                <p style="color:var(--oro); font-weight:600">S/ ${p.precio.toFixed(2)}</p>
                <span class="desc-toggle" onclick="toggleDetalles(this)">▼ Detalles</span>
                <div class="desc-text">${p.descripcion}</div>
                <button class="btn-add" onclick="agregarCarrito('${p.id}')">Añadir a Selección</button>
            </div>`;
    });
}

// 4. LÓGICA DEL CARRITO
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
    const subHtml = document.getElementById('subtotal');
    const totHtml = document.getElementById('total-final');
    const countHtml = document.getElementById('cart-count');
    
    listaHtml.innerHTML = '';
    let sub = 0;

    carrito.forEach((p, i) => {
        sub += p.precio;
        listaHtml.innerHTML += `
            <div class="cart-item">
                <span>${p.nombre}</span>
                <span>S/ ${p.precio.toFixed(2)} <button onclick="quitarCarrito(${i})" style="color:red; border:none; background:none; cursor:pointer; margin-left:8px;">✕</button></span>
            </div>
        `;
    });

    const final = sub > 0 ? sub + COSTO_ENVIO : 0;
    subHtml.innerText = sub.toFixed(2);
    totHtml.innerText = final.toFixed(2);
    countHtml.innerText = carrito.length;
}

function toggleCart(open = null) {
    const cart = document.getElementById('cart-drawer');
    if (open === true) cart.classList.add('open');
    else if (open === false) cart.classList.remove('open');
    else cart.classList.toggle('open');
}

function toggleDetalles(btn) {
    const texto = btn.nextElementSibling;
    texto.classList.toggle('show');
    btn.innerText = texto.classList.contains('show') ? '▲ Cerrar' : '▼ Detalles';
}

function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Tu selección está vacía");
    let mensaje = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => mensaje += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    const tot = document.getElementById('total-final').innerText;
    mensaje += `\n*Envío Lima:* S/ ${COSTO_ENVIO.toFixed(2)}\n*TOTAL A PAGAR:* S/ ${tot}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// INICIAR ÚNICA FUNCIÓN
obtenerDatos();