/**
 * 1. CONFIGURACIÓN GLOBAL
 */
const SHEET_ID = 'TU_ID_DE_GOOGLE_SHEETS'; // Reemplaza con tu ID real
const GID_BANNERS = 'ID_DE_TU_HOJA_DE_BANNERS'; // Reemplaza con tu ID real
const NUMERO_WA = "51987173565";
const COSTO_ENVIO = 12.00;

let inventarioCompleto = [];
let carrito = [];
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
            
            // --- CORRECCIÓN DE IMÁGENES DE GOOGLE DRIVE ---
            let imgId = "";
            let linkOriginal = c[4] || ""; // Asumiendo que la columna 5 (índice 4) es la imagen
            
            // Extraer ID de diferentes formatos de enlace de Drive
            if (linkOriginal.includes('/d/')) {
                imgId = linkOriginal.split('/d/')[1].split('/')[0];
            } else if (linkOriginal.includes('id=')) {
                imgId = linkOriginal.split('id=')[1].split('&')[0];
            }
            
            // Construir URL de visualización directa
            const imgFinal = imgId ? `https://lh3.googleusercontent.com/u/0/d/${imgId}` : "https://placehold.co/400x500?text=PIETRA";

            return {
                id: c[0],
                nombre: c[1],
                precio: parseFloat(c[2]) || 0,
                imagen: imgFinal, // Usar la URL corregida
                categoria: (c[5] || 'Otros').trim().toLowerCase()
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
            const imgUrl = c[0]; // Asumiendo que la primera columna es la imagen
            
            if(imgUrl) {
                // --- CORRECCIÓN DE IMÁGENES DE GOOGLE DRIVE PARA CARRUSEL ---
                let imgId = "";
                if (imgUrl.includes('/d/')) {
                    imgId = imgUrl.split('/d/')[1].split('/')[0];
                } else if (imgUrl.includes('id=')) {
                    imgId = imgUrl.split('id=')[1].split('&')[0];
                }
                
                const finalImg = imgId ? `https://lh3.googleusercontent.com/u/0/d/${imgId}` : imgUrl;

                track.innerHTML += `
                    <div class="slide">
                        <img src="${finalImg}" alt="Pietra Banner">
                    </div>`;
            }
        });

        if (document.querySelectorAll('.slide').length > 1) {
            setInterval(nextSlide, 4000); 
        }
    } catch (e) { 
        console.error("Error carrusel:", e); 
    }
}

/**
 * 3. RENDERIZADO Y LÓGICA DE PRODUCTOS
 */
function renderizar(lista) {
    const contenedor = document.getElementById('product-list');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    lista.forEach(p => {
        contenedor.innerHTML += `
            <div class="product-card">
                <div class="img-container">
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

function nextSlide() {
    const track = document.getElementById('banner-track');
    const slides = document.querySelectorAll('.slide');
    if (!track || slides.length === 0) return;

    currentSlide = (currentSlide + 1) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Inicialización
window.onload = () => {
    obtenerDatos(); 
    inicializarCarrusel();
};