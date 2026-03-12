// Funciones de Interfaz
function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('active');
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
}

// Lógica de Productos (Ejemplo)
const productos = [
    { id: 1, nombre: "Vela Terra", categoria: "portavelas", precio: 45, img: "https://via.placeholder.com/400" },
    { id: 2, nombre: "Bandeja Marmolada", categoria: "bandejas", precio: 65, img: "https://via.placeholder.com/400" }
];

let carrito = [];

function renderProductos(items) {
    const container = document.getElementById('product-list');
    container.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="img-container"><img src="${p.img}" alt="${p.nombre}"></div>
            <h3>${p.nombre}</h3>
            <p class="price">S/ ${p.precio.toFixed(2)}</p>
            <button class="btn-add" onclick="agregarAlCarrito(${p.id})">Añadir</button>
        </div>
    `).join('');
}

function filtrar(cat) {
    if(cat === 'todos') return renderProductos(productos);
    const filtrados = productos.filter(p => p.categoria === cat);
    renderProductos(filtrados);
}

// Inicializar
renderProductos(productos);

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    carrito.push(prod);
    actualizarCarrito();
}

function actualizarCarrito() {
    document.getElementById('cart-count').innerText = carrito.length;
    // Aquí añadirías la lógica para renderizar los items dentro del drawer
}

function enviarWhatsApp() {
    const mensaje = encodeURIComponent("Hola Pietra & Co., deseo realizar un pedido.");
    window.open(`https://wa.me/51987173565?text=${mensaje}`);
}