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
// Versión limpia sin expresiones regulares complejas
async function obtenerProductos() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        
        inventario = filas.map(f => {
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').trim());
            return { 
                id: c[0], 
                nombre: c[1], 
                precio: parseFloat(c[2]) || 0, 
                detalles: c[3] || '', // Nueva: Columna D
                imagen: limpiarLink(c[4]), 
                categoria: (c[5]||'').toLowerCase(),
                precioAnterior: parseFloat(c[6]) || 0 // Nueva: Columna G
            };
        }).filter(p => p.nombre);
        
        renderizar(inventario);
    } catch (e) { console.error("Error cargando productos:", e); }
}

async function cargarMenuExtra() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_MENU_EXTRA}&cb=${Date.now()}`;
    
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        
        let htmlPrimero = '';
        let htmlResto = '';

        filas.forEach((f, index) => {
            // Limpieza mejorada de comas y comillas
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => x.replace(/"/g, '').trim());
            const nombre = c[0];
            const tipo = c[1] ? c[1].toUpperCase() : '';
            const destino = c[2];

            if (nombre && tipo) {
                let enlace = '';
                if (tipo === 'PAGINA') {
                    enlace = `<a href="#" class="menu-link" onclick="cargarPaginaTexto('${destino}')">${nombre}</a>`;
                } else if (tipo === 'LINK') {
                    enlace = `<a href="${destino}" target="_blank" class="menu-link">${nombre}</a>`;
                }

                // Distribución
                if (index === 0) {
                    htmlPrimero = enlace;
                } else {
                    htmlResto += enlace;
                }
            }
        });

        // Inyectamos en los contenedores
        const pContainer = document.getElementById('menu-primero-excel');
        const rContainer = document.getElementById('menu-resto-excel');
        
        if (pContainer) pContainer.innerHTML = htmlPrimero;
        if (rContainer) rContainer.innerHTML = htmlResto;

    } catch (e) {
        console.error("Error cargando el menú del Excel:", e);
    }
}

async function cargarPaginaTexto(idDestino) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID_CONTENIDO}&cb=${Date.now()}`;
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const filas = csv.split(/\r?\n/).slice(1);
        
        const filaDatos = filas.map(f => f.split(',').map(x => x.replace(/^"|"$/g, '').trim()))
                               .find(col => col[0] === idDestino);

        if (filaDatos) {
            const [id, titulo, cuerpo, imagen] = filaDatos;
            const cont = document.getElementById('product-list');
            
            // --- EL TRUCO PARA EL CENTRADO ---
            // Quitamos la clase 'product-grid' para que no se vea a un costado
            cont.classList.remove('product-grid');
            cont.style.display = 'block'; 
            cont.style.width = '100%';

            if(document.querySelector('.banner-carousel')) document.querySelector('.banner-carousel').style.display = 'none';
            if(document.querySelector('.hero')) document.querySelector('.hero').style.display = 'none';

          cont.innerHTML = `
    <div class="pagina-dinamica" style="padding: 60px 5%; max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease; width: 100%; box-sizing: border-box;">
        
        <h1 style="font-family:'Cormorant Garamond'; font-size: 2.8rem; color: var(--verde); text-align: center; letter-spacing: 1px; margin: 0;">
            ${titulo}
        </h1>
        
        <div style="border-top: 1px solid var(--oro); width: 60px; margin: 20px auto 40px;"></div>
        
        ${imagen ? `<img src="${limpiarLink(imagen)}" style="max-height: 400px; width: auto; max-width: 100%; display: block; margin: 0 auto 40px; border-radius: 4px;">` : ''}
        
        <div class="cuerpo-texto" style="line-height: 1.8; color: #444; font-size: 1.1rem; text-align: center; max-width: 700px; margin: 0 auto; font-family:'Montserrat';">
            ${cuerpo ? cuerpo.split('\\n').map(p => {
                // Si el párrafo contiene ":" lo ponemos en negrita antes del punto
                if(p.includes(':')) {
                    let partes = p.split(':');
                    return `<p style="margin-bottom:25px;"><strong>${partes[0]}:</strong>${partes[1]}</p>`;
                }
                return `<p style="margin-bottom:25px;">${p}</p>`;
            }).join('') : 'Contenido en edición...'}
        </div>
        
        <div style="text-align: center; margin-top: 60px;">
            <button onclick="window.location.reload()" style="background:var(--verde); color:white; border:none; padding:15px 40px; cursor:pointer; font-family:'Montserrat'; letter-spacing: 2px; text-transform: uppercase;">
                Volver a la tienda
            </button>
        </div>
    </div>
`;
            
            window.scrollTo(0,0);
            if(typeof toggleMenu === 'function') toggleMenu();
        }
    } catch (e) { 
        console.error("Error cargando página de texto:", e); 
    }
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
        
        let badgeDescuento = '';
        if (p.precioAnterior > p.precio) {
            const porcentaje = Math.round((1 - (p.precio / p.precioAnterior)) * 100);
            badgeDescuento = `<span class="discount-badge">-${porcentaje}%</span>`;
        }

        // --- PROCESADOR DE TEXTO LARGO ---
        // Convierte los saltos de línea en etiquetas de párrafo para que no haya límite
        const detallesFormateados = p.detalles.split('\n').map(linea => `<p style="margin-bottom:8px;">${linea}</p>`).join('');

        cont.innerHTML += `
            <div class="product-card">
                <div class="img-container">
                    <div class="fav-btn-item ${esFav ? 'active' : ''}" onclick="toggleFavorito('${p.id}')">
                        ${esFav ? '❤️' : '♡'}
                    </div>
                    ${badgeDescuento}
                    <img src="${p.imagen}" onerror="this.src='https://placehold.co/400x600?text=PIETRA+&CO.'">
                </div>
                <div class="product-info" style="padding-top:15px; text-align:left;">
                    <span class="brand-tag-card" style="font-size: 0.6rem; letter-spacing: 2px; color: #999; text-transform: uppercase; display: block; margin-bottom: 5px;">PIETRA & CO.</span>
                    <h3 style="font-family:'Cormorant Garamond'; font-size:1.3rem; margin-bottom:5px; color:var(--verde); line-height: 1.1;">${p.nombre}</h3>
                    
                    <details class="custom-details">
                        <summary>Detalles de la pieza</summary>
                        <div class="detalles-contenido">
                            ${detallesFormateados}
                        </div>
                    </details>

                    <div class="price-wrapper" style="display:flex; align-items:center; gap:10px; margin: 15px 0;">
                        <span style="color:var(--verde); font-weight:bold; font-size:1.2rem;">S/ ${p.precio.toFixed(2)}</span>
                        ${p.precioAnterior > p.precio ? `<span style="text-decoration:line-through; color:#aaa; font-size:0.9rem;">S/ ${p.precioAnterior.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="btn-add-luxury" onclick="agregarCarrito('${p.id}')">Agregar</button>
                </div>
            </div>`;
    });
}function renderizar(lista) {
    const cont = document.getElementById('product-list');
    cont.innerHTML = '';
    
    lista.forEach(p => {
        const esFav = favoritos.includes(p.id);
        
        // --- LÓGICA DE AGOTADO ---
        // Asumimos que si el precio es 0, está agotado.
        // Si tienes una columna de Stock, puedes usar: if (p.stock === 0)
        let flagAgotado = '';
        let botonCart = `<button class="btn-add-luxury" onclick="agregarCarrito('${p.id}')">Añadir a selección</button>`;
        
        if (p.precio === 0) {
            flagAgotado = `<div class="sold-out-overlay"><span>AGOTADO</span></div>`;
            botonCart = `<button class="btn-add-luxury sold-out-btn" disabled>Temporalmente Agotado</button>`;
        }

        // --- LÓGICA DE DESCUENTO (Solo si no está agotado) ---
        let badgeDescuento = '';
        if (p.precioAnterior > p.precio && p.precio > 0) {
            const porcentaje = Math.round((1 - (p.precio / p.precioAnterior)) * 100);
            badgeDescuento = `<span class="discount-badge">-${porcentaje}%</span>`;
        }

        const detallesFormateados = p.detalles.split('\n').map(linea => `<p style="margin-bottom:8px;">${linea}</p>`).join('');

        cont.innerHTML += `
            <div class="product-card ${p.precio === 0 ? 'product-sold-out' : ''}">
                <div class="img-container">
                    <div class="fav-btn-item ${esFav ? 'active' : ''}" onclick="toggleFavorito('${p.id}')">
                        ${esFav ? '❤️' : '♡'}
                    </div>
                    ${badgeDescuento}
                    
                    ${flagAgotado}
                    
                    <img src="${p.imagen}" onerror="this.src='https://placehold.co/400x600?text=PIETRA+&CO.'">
                </div>
                <div class="product-info" style="padding-top:15px; text-align:left;">
                    <span class="brand-tag-card" style="font-size: 0.6rem; letter-spacing: 2px; color: #999; text-transform: uppercase; display: block; margin-bottom: 5px;">PIETRA & CO.</span>
                    <h3 style="font-family:'Cormorant Garamond'; font-size:1.3rem; margin-bottom:5px; color:var(--verde); line-height: 1.1;">${p.nombre}</h3>
                    
                    <details class="custom-details">
                        <summary>Detalles de la pieza</summary>
                        <div class="detalles-contenido">
                            ${detallesFormateados}
                        </div>
                    </details>

                    <div class="price-wrapper" style="display:flex; align-items:center; gap:10px; margin: 15px 0;">
                        <span style="color:var(--verde); font-weight:bold; font-size:1.2rem;">${p.precio > 0 ? 'S/ ' + p.precio.toFixed(2) : 'Consultar Stock'}</span>
                        ${(p.precioAnterior > p.precio && p.precio > 0) ? `<span style="text-decoration:line-through; color:#aaa; font-size:0.9rem;">S/ ${p.precioAnterior.toFixed(2)}</span>` : ''}
                    </div>
                    
                    ${botonCart}
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
            }, 6000); // Cambia cada 2 segundos
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