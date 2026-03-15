const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const GID_BANNERS = '338089071';
const GID_COLECCIONES = '1042206871'; // Tu nuevo GID
const GID_MENU_EXTRA = '804444273';      // Hoja Menu_Principal
const GID_CONTENIDO = '1199133365';      // Hoja Contenido_Paginas
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventario = [];
let carrito = [];
let favoritos = [];
let currentSlide = 0;

function limpiarLink(url) {
    if (!url) return "https://placehold.co/400x600?text=PIETRA";
    let id = "";
    if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0];
    else if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    return id ? `https://lh3.googleusercontent.com/u/0/d/${id}` : url;
}

async function inicializar() {
    await obtenerProductos();
    await cargarBanners();
    await cargarMenuColecciones();
    await cargarMenuExtra();
}

// REEMPLAZA cargarMenuExtra con esta:
async function cargarMenuExtra() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_MENU_EXTRA}&cb=${Date.now()}`;
    const contenedor = document.getElementById('menu-dinamico-excel');
    if (!contenedor) return;

    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        
        let html = '';
        filas.forEach(f => {
            const c = f.split(',').map(x => x.replace(/^"|"$/g, '').trim());
            const nombre = c[0];
            const tipo = c[1] ? c[1].toUpperCase() : '';
            const destino = c[2];

            if (nombre && tipo) {
                if (tipo === 'PAGINA') {
                    html += `<a href="#" class="menu-link" onclick="cargarPaginaTexto('${destino}')">${nombre}</a>`;
                } else if (tipo === 'LINK') {
                    html += `<a href="${destino}" target="_blank" class="menu-link">${nombre}</a>`;
                }
            }
        });
        contenedor.innerHTML = html;
    } catch (e) { console.error("Error menú:", e); }
}

async function cargarPaginaTexto(idDestino) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_CONTENIDO}&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        const datos = filas.map(f => f.split(/,(?=(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/"/g, '')))
                          .find(col => col[0] === idDestino);
        if (datos) {
            const [id, titulo, cuerpo, imagen] = datos;
            const cont = document.getElementById('product-list');
            if(document.querySelector('.banner-carousel')) document.querySelector('.banner-carousel').style.display = 'none';
            if(document.querySelector('.hero')) document.querySelector('.hero').style.display = 'none';
            cont.innerHTML = `
                <div class="pagina-dinamica" style="padding: 40px 5%; max-width: 800px; margin: auto;">
                    <h1 style="font-family:'Cormorant Garamond'; font-size: 2.8rem; color: var(--verde); text-align: center;">${titulo}</h1>
                    <div style="border-top: 1px solid var(--oro); width: 50px; margin: 20px auto 40px;"></div>
                    ${imagen ? `<img src="${limpiarLink(imagen)}" style="width:100%; margin-bottom:30px;">` : ''}
                    <div style="line-height: 1.8; color: #333; font-size: 1.1rem; text-align: justify;">
                        ${cuerpo.replace(/\n/g, '<br>')}
                    </div>
                    <div style="text-align: center; margin-top: 50px;">
                        <button onclick="window.location.reload()" style="background:var(--verde); color:white; border:none; padding:12px 25px; cursor:pointer;">VOLVER A LA TIENDA</button>
                    </div>
                </div>`;
            window.scrollTo(0,0);
            toggleMenu();
        }
    } catch (e) { console.error("Error en página texto", e); }
}



async function obtenerProductos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        
        inventario = filas.map(f => {
            // Dividimos por coma de forma simple
            const c = f.split(',').map(x => x.replace(/^"|"$/g, '').trim());
            return { 
                id: c[0], 
                nombre: c[1], 
                precio: parseFloat(c[2]) || 0, 
                imagen: limpiarLink(c[4]), 
                categoria: (c[5]||'').toLowerCase() 
            };
        }).filter(p => p.nombre);
        
        renderizar(inventario);
    } catch (e) { console.error("Error productos:", e); }
}

async function cargarMenuColecciones() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_COLECCIONES}&cb=${Date.now()}`;
    const submenu = document.getElementById('submenu-colecciones');
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        submenu.innerHTML = `<a href="#" onclick="renderizar(inventario); toggleMenu();">Ver Todo</a>`;
        filas.forEach(f => {
            const nombre = f.replace(/"/g, '').trim();
            if(nombre) submenu.innerHTML += `<a href="#" onclick="filtrarCategoria('${nombre.toLowerCase()}')">${nombre}</a>`;
        });
    } catch (e) { console.error(e); }
}

function renderizar(lista) {
    const cont = document.getElementById('product-list');
    cont.innerHTML = '';
    lista.forEach(p => {
        const esFav = favoritos.includes(p.id);
        cont.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <div class="fav-btn-item ${esFav ? 'active' : ''}" onclick="toggleFavorito('${p.id}')">
                        ${esFav ? '❤️' : '♡'}
                    </div>
                    <img src="${p.imagen}" onerror="this.src='https://placehold.co/400x600?text=PIETRA+&CO.'">
                </div>
                <div class="product-info" style="padding-top:15px;">
                    <h3 style="font-family:'Cormorant Garamond';">${p.nombre}</h3>
                    <p style="color:var(--oro); font-weight:bold;">S/ ${p.precio.toFixed(2)}</p>
                    <button class="btn-add" onclick="agregarCarrito('${p.id}')" style="width:100%; padding:10px; background:var(--verde); color:white; border:none; cursor:pointer; margin-top:10px;">Añadir</button>
                </div>
            </div>`;
    });
}

function ejecutarBusqueda() {
    const q = document.getElementById('search-input').value.toLowerCase();
    const filtrados = inventario.filter(p => p.nombre.toLowerCase().includes(q));
    renderizar(filtrados);
}

function filtrarCategoria(cat) {
    // Aseguramos que el banner y hero se vean de nuevo
    if(document.querySelector('.banner-carousel')) document.querySelector('.banner-carousel').style.display = 'block';
    if(document.querySelector('.hero')) document.querySelector('.hero').style.display = 'block';
    
    const filtrados = inventario.filter(p => p.categoria.includes(cat));
    renderizar(filtrados);
    toggleMenu();
}

function toggleFavorito(id) {
    const idx = favoritos.indexOf(id);
    if (idx > -1) favoritos.splice(idx, 1); else favoritos.push(id);
    document.getElementById('fav-count').innerText = favoritos.length;
    renderizar(inventario);
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
        lista.innerHTML += `<div class="cart-item">
            <img src="${p.imagen}">
            <div style="flex:1;"><p style="font-size:0.85rem; font-weight:600;">${p.nombre}</p><b>S/ ${p.precio.toFixed(2)}</b></div>
            <button onclick="carrito.splice(${i},1); actualizarCarrito();" style="background:none; border:none; cursor:pointer;">✕</button>
        </div>`;
    });
    document.getElementById('subtotal').innerText = sub.toFixed(2);
    document.getElementById('total-final').innerText = (sub > 0 ? sub + COSTO_ENVIO : 0).toFixed(2);
    document.getElementById('cart-count').innerText = carrito.length;
}

function toggleMenu() { document.getElementById('side-menu').classList.toggle('active'); }
function toggleSubmenu() { document.getElementById('submenu-colecciones').classList.toggle('show'); }
function toggleCart(f) { const c = document.getElementById('cart-drawer'); if(f===true) c.classList.add('open'); else c.classList.toggle('open'); }

async function cargarBanners() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_BANNERS}&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        const track = document.getElementById('banner-track');
        
        if (!track) return;
        track.innerHTML = ''; // Limpia antes de cargar

        filas.forEach(f => {
            const imgUrl = f.replace(/"/g, '').trim();
            if(imgUrl) {
                const imgFinal = limpiarLink(imgUrl);
                track.innerHTML += `<div class="slide"><img src="${imgFinal}" alt="Banner Pietra & Co"></div>`;
            }
        });

        // Inicia el movimiento solo si hay más de una imagen
        const slides = document.querySelectorAll('.slide');
        if (slides.length > 1) {
            setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }, 2000); // Cambia cada 2 segundos
        }
    } catch (e) { 
        console.error("Error al cargar banners:", e); 
    }
}
function enviarWhatsApp() {
    let msg = `*PEDIDO PIETRA & CO.*\n\n`;
    carrito.forEach(p => msg += `• ${p.nombre} (S/ ${p.precio.toFixed(2)})\n`);
    msg += `\n*TOTAL CON ENVÍO:* S/ ${document.getElementById('total-final').innerText}`;
    window.open(`https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(msg)}`);
}

window.onload = inicializar;