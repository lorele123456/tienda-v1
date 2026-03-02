// --- CONFIGURACIÓN ---
const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const MI_WHATSAPP = "51987173565";
const ENVIO_LIMA = 12.00; // Monto solicitado

let productos_db = []; // Donde guardaremos el inventario
let carrito = [];      // Donde guardaremos la selección del cliente

// 1. CARGAR DATOS DEL EXCEL
async function obtenerInventario() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    
    try {
        const respuesta = await fetch(url);
        const csv = await respuesta.text();
        const filas = csv.split(/\r?\n/).slice(1); // Ignorar primera fila
        
        productos_db = filas.map(fila => {
            const columnas = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            
            // Convertir link de Drive a imagen directa
            let imagen = columnas[4] || '';
            if (imagen.includes('drive.google.com')) {
                const id = imagen.split('/d/')[1]?.split('/')[0] || imagen.split('id=')[1];
                imagen = `http://googleusercontent.com/profile/picture/5{id}`;
            }

            return {
                id: columnas[0],
                nombre: columnas[1],
                precio: parseFloat(columnas[2]) || 0,
                imagen: imagen
            };
        }).filter(p => p.nombre);

        pintarProductos();
    } catch (e) {
        console.error("Error al conectar con Google Sheets", e);
    }
}

// 2. MOSTRAR PRODUCTOS EN EL HTML
function pintarProductos() {
    const listado = document.getElementById('product-list');
    listado.innerHTML = '';

    productos_db.forEach(p => {
        listado.innerHTML += `
            <div class="product-card">
                <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/400x500/1A3933/F5F5DC?text=PIETRA'">
                <h3>${p.nombre}</h3>
                <p class="price">S/ ${p.precio.toFixed(2)}</p>
                <button class="btn-add" onclick="añadirAlCarrito('${p.id}')">Añadir a Selección</button>
            </div>
        `;
    });
}

// 3. FUNCIONES DEL CARRITO
function añadirAlCarrito(id) {
    const item = productos_db.find(p => p.id === id);
    if (item) {
        carrito.push(item);
        actualizarCarritoUI();
        toggleCart(true); // Abre el carrito al añadir
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const listaHtml = document.getElementById('cart-items');
    const subtotalHtml = document.getElementById('subtotal');
    const totalHtml = document.getElementById('total-final');
    const contadorHtml = document.getElementById('cart-count');

    listaHtml.innerHTML = '';
    let subtotal = 0;

    carrito.forEach((p, index) => {
        subtotal += p.precio;
        listaHtml.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <span>${p.nombre}</span>
                <span>S/ ${p.precio.toFixed(2)} <button onclick="eliminarDelCarrito(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px;">✕</button></span>
            </div>
        `;
    });

    const totalFinal = subtotal > 0 ? subtotal + ENVIO_LIMA : 0;
    
    subtotalHtml.innerText = subtotal.toFixed(2);
    totalHtml.innerText = totalFinal.toFixed(2);
    contadorHtml.innerText = carrito.length;
}

// Abrir y cerrar panel lateral
function toggleCart(abrir = false) {
    const cart = document.getElementById('cart-drawer');
    if (abrir === true) cart.classList.add('open');
    else cart.classList.toggle('open');
}

// 4. ENVÍO DE DATOS A WHATSAPP
function enviarWhatsApp() {
    if (carrito.length === 0) return alert("Tu selección está vacía.");

    let texto = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach((p, i) => {
        texto += `${i+1}. ${p.nombre} - S/ ${p.precio.toFixed(2)}\n`;
    });

    const sub = parseFloat(document.getElementById('subtotal').innerText);
    const total = parseFloat(document.getElementById('total-final').innerText);

    texto += `\n*Subtotal:* S/ ${sub.toFixed(2)}`;
    texto += `\n*Envío Lima:* S/ ${ENVIO_LIMA.toFixed(2)}`;
    texto += `\n*TOTAL:* S/ ${total.toFixed(2)}`;
    texto += `\n\n_Deseo confirmar stock para realizar el pago._`;

    const url = `https://wa.me/${MI_WHATSAPP}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// Iniciar proceso
obtenerInventario();