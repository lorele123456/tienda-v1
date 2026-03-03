// CONFIGURACIÓN GLOBAL
const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00; // Envío a Lima

let db_productos = [];
let carrito = [];

// 1. CARGAR DATOS DEL EXCEL
async function obtenerDatos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    try {
        const respuesta = await fetch(url);
        const csv = await respuesta.text();
        const filas = csv.split(/\r?\n/).slice(1); // Ignorar cabecera

        db_productos = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            
            // Conversor de ID de Google Drive para imágenes
            let imgId = "";
            let linkOriginal = c[4] || "";
            if (linkOriginal.includes('/d/')) imgId = linkOriginal.split('/d/')[1].split('/')[0];
            else if (linkOriginal.includes('id=')) imgId = linkOriginal.split('id=')[1].split('&')[0];
            
            // URL Directa para visualización
            const imgFinal = imgId ? `https://lh3.googleusercontent.com/d/${imgId}` : "https://via.placeholder.com/400x500?text=PIETRA";


            return {
    id: c[0], 
    nombre: c[1], 
    precio: parseFloat(c[2]) || 0,
    descripcion: c[3] || '', 
    imagen: imgId ? `https://lh3.googleusercontent.com/d/${imgId}` : "https://via.placeholder.com/400",
    categoria: c[5] || 'Otros' // Esto le dice al código: "Toma lo que hay en la Columna F"
};
            
        }).filter(p => p.nombre);

        renderizarGaleria();
    } catch (e) {
        console.error("Error al cargar inventario", e);
    }
}

// 2. MOSTRAR PRODUCTOS EN EL GRID
function renderizarGaleria() {
    const contenedor = document.getElementById('product-list');
    contenedor.innerHTML = '';
    
    db_productos.forEach(p => {
        contenedor.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <img src="${p.imagen}" alt="${p.nombre}">
                </div>
                <h3>${p.nombre}</h3>
                <p class="price">S/ ${p.precio.toFixed(2)}</p>
                
                <span class="desc-toggle" onclick="toggleDetalles(this)">▼ Detalles</span>
                <div class="desc-text">${p.descripcion}</div>

                <button class="btn-add" onclick="agregarCarrito('${p.id}')">Añadir a Selección</button>
            </div>
        `;
    });
}

// 3. LÓGICA DEL CARRITO
function agregarCarrito(id) {
    const p = db_productos.find(item => item.id === id);
    if (p) {
        carrito.push(p);
        actualizarUI();
        toggleCart(true); // Abrir carrito al añadir
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

// Asegúrate de que el map incluya la columna F (índice 5)
async function cargarDatos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    try {
        const res = await fetch(url);
        const data = await res.text();
        const filas = data.split(/\r?\n/).slice(1);
        
        inventarioCompleto = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            let imgId = "";
            if(c[4] && c[4].includes('/d/')) imgId = c[4].split('/d/')[1].split('/')[0];
            
            return {
                id: c[0], 
                nombre: c[1], 
                precio: parseFloat(c[2]) || 0,
                descripcion: c[3] || '', 
                imagen: imgId ? `https://lh3.googleusercontent.com/d/${imgId}` : "https://via.placeholder.com/400",
                categoria: c[5] || 'Otros' // <--- Lee la columna F del Excel
            };
        }).filter(p => p.nombre);

        renderizar(inventarioCompleto);
    } catch (e) { console.error("Error", e); }
}

// 1. Función para filtrar (Corregida)
function filtrar(cat) {
    // Esto quita la clase 'active' de todos los botones y se la pone al que clickeaste
    const botones = document.querySelectorAll('.filter-btn');
    botones.forEach(b => b.classList.remove('active'));
    
    // Usamos event.currentTarget para asegurar que capturemos el botón
    if(event) event.currentTarget.classList.add('active');

    if (cat === 'todos') {
        renderizar(inventarioCompleto);
    } else {
        // Filtramos comparando el texto de la columna F (c[5]) con la categoría elegida
        const filtrados = inventarioCompleto.filter(p => 
            p.categoria.trim().toLowerCase() === cat.trim().toLowerCase()
        );
        renderizar(filtrados);
    }
}

// 2. Función para renderizar (Asegúrate de que limpie el contenedor)
function renderizar(lista) {
    const contenedor = document.getElementById('product-list');
    
    // IMPORTANTE: Esta línea borra los productos anteriores antes de poner los nuevos
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
                <span class="desc-toggle" onclick="this.nextElementSibling.classList.toggle('show')">▼ Ver Detalles</span>
                <div class="desc-text">${p.descripcion}</div>
                <button class="btn-add" onclick="agregar('${p.id}')">Añadir</button>
            </div>`;
    });
}
// 4. FUNCIONES DE INTERFAZ
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

// 5. WHATSAPP
function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Tu selección está vacía");
    
    let mensaje = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => mensaje += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    
    const sub = parseFloat(document.getElementById('subtotal').innerText);
    const tot = document.getElementById('total-final').innerText;
    
    mensaje += `\n*Subtotal:* S/ ${sub.toFixed(2)}`;
    mensaje += `\n*Envío Lima:* S/ ${COSTO_ENVIO.toFixed(2)}`;
    mensaje += `\n*TOTAL A PAGAR:* S/ ${tot}`;
    
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// INICIAR
obtenerDatos();