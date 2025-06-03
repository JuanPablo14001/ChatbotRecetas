
let ingredientes = [];

function agregarIngrediente() {
    const input = document.getElementById("ingredienteInput");
    if (input.value.trim()) {
        ingredientes.push(input.value.trim().toLowerCase());
        mostrarIngredientes();
        input.value = "";
    }
}

function mostrarIngredientes() {
    const lista = document.getElementById("listaIngredientes");
    lista.innerHTML = "";
    ingredientes.forEach(i => {
        const li = document.createElement("li");
        li.textContent = i;
        lista.appendChild(li);
    });
}

function buscarRecetas() {
    fetch("http://127.0.0.1:5000/api/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientes: ingredientes })
    })
    .then(res => res.json())
    .then(data => mostrarRecetas(data));
}

function mostrarRecetas(recetas) {
    const contenedor = document.getElementById("resultados");
    contenedor.innerHTML = "";
    if (recetas.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron recetas 😕</p>";
        return;
    }

    recetas.forEach(receta => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${receta.nombre}</h3>
            <img src="${receta.imagen}" alt="Imagen de receta">
            <p>${receta.instrucciones}</p>
        `;
        contenedor.appendChild(div);
    });
}
