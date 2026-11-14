const API_KEY = " api key here";
const API = "https://api.restcountries.com/countries/v5";
const CAMPOS = "response_fields=names.common,capitals,region,population,codes.alpha_2";

async function buscarPais(nombre) {
    const url = `${API}/name?q=${encodeURIComponent(nombre)}&${CAMPOS}`;

    const respuesta = await fetch(url, {
        method: "GET",
        headers: { "Authorization": `Bearer ${API_KEY}` }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        if (respuesta.status === 401) throw new Error("La clave de API no es válida.");
        if (respuesta.status === 403) throw new Error("Acceso denegado (cuenta congelada o sin permiso).");
        if (respuesta.status === 429) throw new Error("Demasiadas solicitudes. Espera unos segundos.");
        if (respuesta.status === 404) throw new Error("No se encontró ningún país con ese nombre.");
        throw new Error(`Error del servidor (código ${respuesta.status}).`);
    }

    return datos.data.objects;
    
}

function mostrarPais(paises) {
    const resultado = document.getElementById("resultados");
    resultado.innerHTML = "";

    paises.forEach(pais => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";
        const nombre = pais.names?.common || "N/A";
        const capital = pais.capitals?.[0]?.name || "N/A";
        const region = pais.region || "N/A";
        const poblacion = pais.population != null ? pais.population.toLocaleString("es-Mx") : "N/A";
        const codigo = pais.codes?.alpha_2?.toLowerCase() || "N/A";
        const banderaUrl = codigo ? `https://flags.restcountries.com/v5/w320/${codigo}.png` : "https://via.placeholder.com/320x200?text=No+Flag";

        tarjeta.innerHTML = `
            <img src="${banderaUrl}" alt="Bandera de ${nombre}">
            <h2>${nombre}</h2>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Región:</strong> ${region}</p>
            <p><strong>Población:</strong> ${poblacion}</p>
        `;
        resultado.appendChild(tarjeta);
    });
}

const form = document.getElementById("formBuscar");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nombre = document.getElementById("txtPais").value.trim();
    
    if (!nombre) {
        mensaje.textContent = "Escribe el nombre de un país.";
        return;
    }
    
    mensaje.textContent = "Cargando...";
    document.getElementById("resultados").innerHTML = "";

    try {
        const paises = await buscarPais(nombre);
        if (paises.length === 0) {
            mensaje.textContent = "No se encontró ningún país con ese nombre.";
            return;
        }
        mostrarPais(paises);
        mensaje.textContent = `${paises.length} país(es) encontrado(s).`;
    } catch (error) {
        document.getElementById("resultados").innerHTML = "";
        if (error instanceof TypeError) {
            mensaje.textContent = "Error de red. Verifica tu conexión a Internet.";
        } else {
            mensaje.textContent = error.message;
        }
        mensaje.textContent = error.message;
    }
});
