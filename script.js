const SHEET_ID = '1BoWQQk73dRJdH3NTHautP-aixEbDr3uRWgXfmlbUP20';
const WHATSAPP_NUMBER = "51987173565";

async function obtenerInventario() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
    const contenedor = document.getElementById('product-list');
    
    try {
        const respuesta = await fetch(url);
        const texto = await respuesta.text();
        
        // Separamos por filas
        const filas = texto.split(/\r?\n/).slice(1); 
        
        contenedor.innerHTML = ''; 

        filas.forEach(fila => {
            // Este regex es mágico: separa por comas pero ignora las que están dentro de comillas
            const c = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(x => 
                x.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
            );
            
            if (c[1]) { // Si hay un nombre de producto (columna B)
                // Conversor de Google Drive para tus fotos
                let linkFoto = c[4] || '';
                if (linkFoto.includes('drive.google.com')) {
                    const id = linkFoto.split('/d/')[1]?.split('/')[0] || linkFoto.split('id=')[1]?.split('&')[0];
                    linkFoto = `https://lh3.googleusercontent.com/d/${id}`;
                }

                contenedor.innerHTML += `
                    <div class="product-card">
                        <img src="${linkFoto}" alt="${c[1]}" onerror="this.src='https://via.placeholder.com/400x500/1A3933/F5F5DC?text=Pietra+%26+Co'">
                        <h3>${c[1]}</h3>
                        <p class="price">S/ ${parseFloat(c[2]).toFixed(2)}</p>
                        <button class="btn-order" onclick="agregarAlCarrito('${c[1]}', '${c[2]}')">AÑADIR A SELECCIÓN</button>
                    </div>`;
            }
        });

    } catch (e) {
        contenedor.innerHTML = "<h3>Cargando catálogo...</h3>";
        console.error("Error:", e);
    }
}

function agregarAlCarrito(nombre, precio) {
    alert("Añadido: " + nombre);
}

obtenerInventario();