

document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    sendIngredients();
    darkMode();
    asideBarEvent();
});

// * Globals

let recetas = [];
const receta = {
    ingredientes: [],
    restricciones: {
        cal_min: 0,
        cal_max: null,
        carbo_min: 0,
        carbo_max: null,
        prote_min: 0,
        prote_max: null,
        grasa_min: 0,
        grasa_max: null,
        azuc_min: 0,
        azuc_max: null,
        vegetariano: false
    }
};
const fullModal = document.querySelector('#fullScreenModal');
const downloadBtn = document.querySelector('#downloadRecipeBtn');
const chatContainer = document.querySelector('#chatContainer');


const modalTitle = fullModal.querySelector('#modalTittle');
const modalImageContainer = fullModal.querySelector('#modalImageContainer');
const modalStepsContainer = fullModal.querySelector('#modalStepsContainer');



//? Delegation for view-moreButtons
chatContainer.addEventListener('click', e => {
    if (e.target.classList.contains('ver-receta-btn')) {
        const id = e.target.dataset.index;
        openModalWithReceta(id);
    }
});



const openModalWithReceta = id => {
    const receta = recetas.find(r => r.id == id);
    if (!receta) return;

    // Configurar el contenido
    modalTitle.textContent = receta.nombre;
    downloadBtn.dataset.id= receta.id;
    modalImageContainer.innerHTML = `
        <div class="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-md">
            <img src="/resources/${receta.imagen}" alt="Imagen de ${receta.nombre}" 
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0"
                onload="this.classList.remove('opacity-0')" />
        </div>
    `;

    const ingredientesList = receta.ingredientes
        .map(ingrediente => `<li class="py-1 px-3 rounded-md transition-colors duration-200"><span class="text-red-500 mr-2">•</span>${ingrediente}</li>`)
        .join('');

    const instruccionesFormateadas = receta.instrucciones
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, i) => `<div class="flex mb-3"><span class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-200 dark:bg-red-300 text-red-500 dark:text-red-600 font-bold mr-3">${i + 1}</span><p class="text-gray-800 dark:text-gray-200">${line}</p></div>`)
        .join('');

    modalStepsContainer.innerHTML = `
        <div class="bg-gray-200 dark:bg-[#2A2A2A] rounded-lg overflow-hidden">
            <button class="accordion-btn  w-full p-4 text-left flex justify-between items-center hover:bg-gray-300 dark:hover:bg-[#1d1d1d] transition-colors duration-200">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-300 flex items-center">
                    <svg class="w-5 h-5 text-[#D32F2F] dark:text-[#C62828] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Ingredientes 
                </h3>
                <svg class="accordion-icon w-5 h-5 text-gray-500 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div class="accordion-content overflow-hidden transition-[max-height] duration-300 ease-in-out max-h-0">
                <div class="px-4 pb-4">
                    <!-- Aquí va tu lista o contenido -->
                    <ul class="space-y-2">${ingredientesList}</ul>
                </div> 
            </div>
        </div>
        <div class="bg-gray-200 dark:bg-[#2A2A2A] rounded-lg overflow-hidden mt-4">
            <button class="accordion-btn  w-full p-4 text-left flex justify-between items-center hover:bg-gray-300 dark:hover:bg-[#1d1d1d] transition-colors duration-200"> 
                <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-300 flex items-center">
                    <svg class="w-5 h-5 text-[#D32F2F] dark:text-[#C62828] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    Preparación
                </h3>
                <svg class="accordion-icon w-5 h-5 text-gray-500 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div class="accordion-content overflow-hidden transition-[max-height] duration-300 ease-in-out max-h-0">
                <div class="px-4 pb-4">
                    <div class="space-y-4">${instruccionesFormateadas}</div>
                </div>
            </div>
        </div>
    `;

    // Mostrar modal con animación
    fullModal.classList.remove('hidden');
    setTimeout(() => {
        fullModal.classList.remove('opacity-0');
        fullModal.classList.remove('translate-y-[-20px]');
        fullModal.querySelector('.container > div').classList.remove('scale-95');
    }, 10);

    // Inicializar acordeones
    initAccordions();
}

function initAccordions() {
    const accordionBtns = document.querySelectorAll('.accordion-btn');

    accordionBtns.forEach(btn => {
        const content = btn.nextElementSibling;
        const icon = btn.querySelector('.accordion-icon');

        // Inicializa en cerrado
        content.style.maxHeight = '0px';
        content.classList.add('overflow-hidden', 'transition-[max-height]', 'duration-300', 'ease-in-out');

        btn.addEventListener('click', () => {
            const isOpen = content.style.maxHeight !== '0px';

            if (isOpen) {
                // Cerrar
                content.style.maxHeight = '0px';
                icon.classList.remove('rotate-180');
            } else {
                // Abrir
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.add('rotate-180');
            }
        });

        // Abrir "Ingredientes" por defecto
        if (btn.textContent.includes('Ingredientes')) {
            btn.click();
        }
    });
}


// Cerrar modal
const closeModal = () => {
    fullModal.classList.add('opacity-0');
    fullModal.classList.add('translate-y-[-20px]');
    fullModal.querySelector('.container > div').classList.add('scale-95');
    setTimeout(() => {
        fullModal.classList.add('hidden');
    }, 300);
}

// Event listeners
closeFullScreenModal.addEventListener('click', closeModal);
closeFullScreenModalBottom.addEventListener('click', closeModal);

// Función para descargar la receta
downloadBtn.addEventListener('click', ()=> {
    console.log("si");
    const recetaId = downloadRecipeBtn.dataset.id;
    const ingredientes = Array.from(
        modalStepsContainer.querySelectorAll("ul li")
    ).map(el => el.textContent.trim());
    const url = 'http://127.0.0.1:5000/api/generar-pdf';
    const body = JSON.stringify({
            id: recetaId,
            ingredientes_modal: ingredientes
        })

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receta${modalTitle.textContent}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }); 
});





// ? Function to serach the ingredients & load on the object
const loadIngredients = () => {
    const input = document.querySelector('#messageInput');
    const suggestionsList = document.querySelector('#suggestionsList');
    const ingredientsContainer = document.querySelector('#ingredientsContainer');
    const sendBtn = document.querySelector('#sendBtn');

    // ? Delegation for the remove Buttons
    ingredientsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove') || e.target.parentElement.classList.contains('btn-remove')) {
            const span = e.target.closest('span');
            const ing = span.textContent.trim().replace('×', '').trim();
            receta.ingredientes = receta.ingredientes.filter(i => i !== ing);
            span.remove();
            verifyIngredients();
        }
    });

    input.addEventListener("input", () => {
        const query = input.value.toLowerCase().trim();
        suggestionsList.innerHTML = "";
        if (query.length === 0) return;
        const filtered = allIngredients.filter(ing =>
            ing.toLowerCase().includes(query) &&
            !receta.ingredientes.includes(ing)
        );

        filtered.forEach(ingredient => {
            const li = document.createElement("li");
            li.textContent = ingredient;
            li.className = "bg-[#FDD8D4] dark:bg-[#992A2A] hover:bg-[#FBB9B2] dark:hover:bg-[#B93C3C]  text-sm px-3 py-1 rounded cursor-pointer";
            li.addEventListener("click", () => addIngredient(ingredient));
            suggestionsList.appendChild(li);
        });
    });

    //? Add the ingredient to the object receta
    const addIngredient = ingredient => {
        if (!receta.ingredientes.includes(ingredient)) {
            receta.ingredientes.push(ingredient);
            updateIngredientTags();
            input.value = "";
            suggestionsList.innerHTML = "";
        }
    }


    //? update the view on the list of ingredients selected
    const updateIngredientTags = () => {
        ingredientsContainer.innerHTML = "";
        receta.ingredientes.forEach(ing => {
            const span = document.createElement("span");
            span.className = "bg-gray-300 dark:bg-[#2E2E2E] text-sm text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full flex items-center";
            span.innerHTML = `${ing}
                <button class="ml-2 text-gray-500 hover:text-red-500 font-bold text-lg btn-remove">×</button>`;
            ingredientsContainer.appendChild(span);
            verifyIngredients();
        });
    }


    //? Verify if the object receta contains more tha 3 ingredients to enable sendButton
    const verifyIngredients = () => {
        if (receta.ingredientes.length < 3) {
            sendBtn.disabled = true;
            sendBtn.classList.add('opacity-30');
        } else {
            sendBtn.disabled = false
            sendBtn.classList.remove('opacity-30');
        }
    }
}

//? Function to all the logic in the moment to sendButton's click
const sendIngredients = () => {
    const sendBtn = document.querySelector('#sendBtn');
    sendBtn.addEventListener('click', () => {
        const isValid = loadRestrictions();
        if (!isValid) return;
        const message = loadMessageUser();
        sendMessage('user', message);
        executeAction();
    });

    const loadRestrictions = () => {
        const fields = [
            { key: 'cal', label: 'Calorías' },
            { key: 'prote', label: 'Proteínas' },
            { key: 'carbo', label: 'Carbohidratos' },
            { key: 'grasa', label: 'Grasas' },
            { key: 'azuc', label: 'Azúcares' }
        ];

        let hasErrors = false;

        fields.forEach(field => {
            const minInput = document.querySelector(`#${field.key}_min`);
            const maxInput = document.querySelector(`#${field.key}_max`);
            const minValue = parseFloat(minInput.value) || 0;
            const maxValue = maxInput.value !== '' ? parseFloat(maxInput.value) : null;

            // Reset
            minInput.classList.remove('border-red-500');
            maxInput.classList.remove('border-red-500');
            removeErrorMessage(minInput);
            removeErrorMessage(maxInput);

            if (maxValue !== null && maxValue <= minValue) {
                hasErrors = true;
                minInput.classList.add('border-red-500');
                maxInput.classList.add('border-red-500');
                showErrorMessage(maxInput, `El valor máximo de ${field.label.toLowerCase()} debe ser mayor que el mínimo`);
            }
        });

        if (hasErrors) return false;

        receta.restricciones = {
            cal_min: parseFloat(document.querySelector('#cal_min').value) || 0,
            cal_max: getNullableValue('#cal_max'),
            carbo_min: parseFloat(document.querySelector('#carbo_min').value) || 0,
            carbo_max: getNullableValue('#carbo_max'),
            prote_min: parseFloat(document.querySelector('#prote_min').value) || 0,
            prote_max: getNullableValue('#prote_max'),
            grasa_min: parseFloat(document.querySelector('#grasa_min').value) || 0,
            grasa_max: getNullableValue('#grasa_max'),
            azuc_min: parseFloat(document.querySelector('#azuc_min').value) || 0,
            azuc_max: getNullableValue('#azuc_max'),
            vegetariano: document.querySelector('#vegetarianToggle')?.checked || false
        };
        return true;
    };

    function showErrorMessage(input, message) {
        const parentWrapper = input.closest('div').parentNode; // div que envuelve el label + div.flex
        const existingError = parentWrapper.querySelector('.input-error');

        if (!existingError) {
            const error = document.createElement('p');
            error.className = 'text-red-500 text-sm mt-1 input-error';
            error.textContent = message;
            parentWrapper.appendChild(error);
        }
    }

    function removeErrorMessage(input) {
        const parentWrapper = input.closest('div').parentNode;
        const error = parentWrapper.querySelector('.input-error');
        if (error) error.remove();
    }
};

function getNullableValue(selector) {
    const val = document.querySelector(selector).value;
    return val === '' ? null : parseFloat(val);
}


const sendMessage = (type, message, success = true) => {
    const input = document.querySelector('#messageInput');
    const chatContainer = document.querySelector('section.flex-1');

    const messageDiv = document.createElement('div');
    messageDiv.className = `shadow-md  rounded-lg p-4 w-full max-w-xl mb-2 shadow-gray-400 dark:shadow-[#ffffff30]`;

    if (type === 'user') {
        messageDiv.classList.add('bg-[#FDD8D4]', 'dark:bg-[#992A2A]', 'ml-auto');
    } else {
        messageDiv.classList.add('bg-gray-200', 'dark:bg-[#2A2A2A]', 'mr-auto');
    }

    const messageContent = document.createElement('div');
    messageContent.className = `flex items-start gap-3 ${type === 'user' ? 'justify-end' : 'justify-start'}`;

    // Contenedor donde TypeIt escribirá (importante: debe estar vacío)
    const textContainer = document.createElement('div');
    textContainer.className = 'text-gray-800 dark:text-gray-200';

    const image = document.createElement('img');
    image.src = type === 'user' ? 'img/logo1.svg' : 'img/logo.svg';
    image.alt = type === 'user' ? 'Tú' : 'Bot';
    image.className = 'w-10 h-10 rounded-full';

    if (type === 'user') {
        // Mensaje de usuario (sin efecto de escritura)
        textContainer.textContent = message;
        messageContent.appendChild(textContainer);
        messageContent.appendChild(image);
    } else {
        messageContent.appendChild(image);
        messageContent.appendChild(textContainer); // TypeIt usará este contenedor
    }

    messageDiv.appendChild(messageContent);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (type === 'user') {
        input.value = '';
        document.querySelector('#sendBtn').disabled = true;
        document.querySelector('#sendBtn').classList.add('opacity-30');
    }

    // Efecto de escritura solo para el bot (con HTML interpretado)
    if (type === 'bot') {
        new TypeIt(textContainer, {
            html: true, // ¡Crucial para que renderice HTML!
            speed: 15,
            lifeLike: true,
            startDelay: 300,
            cursor: false,
        })
            .type(message)
            .go();
    }
};

const executeAction = async () => {
    const url = 'http://127.0.0.1:5000/api/buscar-recetas';
    const method = "POST";
    const headers = {
        "Content-Type": "application/json"
    };

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(receta)
        });

        const data = await response.json();

        const result = loadMessageChef(data);

        // Si quieres que el mensaje HTML se renderice, usa innerHTML en sendMessage
        sendMessage('bot', result.message, result.success);

    } catch (error) {
        console.error("Error al buscar recetas:", error);
        sendMessage('bot', "¡Oops! Hubo un error al buscar recetas.", false);
    }
};


function loadMessageUser() {
    const { ingredientes, restricciones } = receta;
    let message = "Hola Chefsini, tengo ";

    // Ingredientes
    if (ingredientes.length > 0) {
        if (ingredientes.length === 1) {
            message += `${ingredientes[0]}`;
        } else {
            const ult = ingredientes[ingredientes.length - 1];
            const primeros = ingredientes.slice(0, -1);
            message += `${primeros.join(', ')} y ${ult}`;
        }
    } else {
        message += "algunos ingredientes";
    }

    const condiciones = [];

    // Restricciones nutricionales en estilo suave
    if (restricciones.cal_min) condiciones.push(`al menos ${restricciones.cal_min} calorías`);
    if (restricciones.cal_max) condiciones.push(`no más de ${restricciones.cal_max} calorías`);
    if (restricciones.carbo_min) condiciones.push(`mínimo ${restricciones.carbo_min}g de carbohidratos`);
    if (restricciones.carbo_max) condiciones.push(`máximo ${restricciones.carbo_max}g de carbohidratos`);
    if (restricciones.prote_min) condiciones.push(`al menos ${restricciones.prote_min}g de proteína`);
    if (restricciones.prote_max) condiciones.push(`como máximo ${restricciones.prote_max}g de proteína`);
    if (restricciones.grasa_min) condiciones.push(`al menos ${restricciones.grasa_min}g de grasa`);
    if (restricciones.grasa_max) condiciones.push(`como máximo ${restricciones.grasa_max}g de grasa`);
    if (restricciones.azuc_min) condiciones.push(`mínimo ${restricciones.azuc_min}g de azúcar`);
    if (restricciones.azuc_max) condiciones.push(`máximo ${restricciones.azuc_max}g de azúcar`);
    if (restricciones.vegetariano) condiciones.push(`que sea una receta vegetariana`);
    // Agregar restricciones si existen
    if (condiciones.length > 0) {
        message += ", me gustaría una receta que tenga ";
        if (condiciones.length === 1) {
            message += condiciones[0];
        } else if (condiciones.length === 2) {
            message += condiciones.join(' y ');
        } else {
            const ult = condiciones.pop();
            message += `${condiciones.join(', ')} y ${ult}`;
        }
    }

    // Cierre amable
    message += ". ¿Qué me recomiendas preparar con esto?";

    return message;
}

const loadMessageChef = data => {
    if (!data.success) {
        console.log("aqui");
        const mes = `<p>¡Lo siento! 😞 No pude encontrar una receta con las instrucciones dadas.</p>`
        return {
            success: false,
            message: mes
        };
    }

    recetas = data.data;

    let mensajeInicial = `<p>¡Claro! Aquí te dejo unas recetas que puedes hacer con los ingredientes y las restricciones que me diste:</p><br>`;

    const mensajes = recetas.map((receta, index) => {
        const ingredientesTruncados = receta.ingredientes.slice(0, 5).join(', ') +
            (receta.ingredientes.length > 5 ? '...' : '');

        return `
        <div class="receta-preview">
            <strong>${receta.nombre}</strong><br>
            <small>🧂 Ingredientes: ${ingredientesTruncados}</small><br>
            <button class="ver-receta-btn bg-[#D32F2F] dark:bg-[#C62828] hover:bg-[#B71C1C] dark:hover:bg-[#AD1D1D] rounded-2xl px-4 py-2 mt-2 text-white" data-index="${receta.id}">
            👀Ver receta
            </button>
        </div>
        `;
    });

    const message = mensajeInicial + mensajes.join("<br>");

    return {
        success: true,
        message: message
    };
};


const darkMode = () => {
    const toggle = document.querySelector('#darkModeToggle');
    const html = document.documentElement;

    // Si el usuario ya tenía una preferencia
    if (localStorage.getItem('theme') === 'dark') {
        html.classList.add('dark');
        toggle.checked = true;
    }

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}


const asideBarEvent = () => {
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");
    

    toggleBtn.addEventListener("click", () => {
        const isHidden = sidebar.classList.toggle("-translate-x-full");
        toggleBtn.textContent = isHidden ? "☰" : "✕";
    });
};




























const allIngredients = [
    // Carnes
    "res", "cerdo", "pollo", "pavo", "cordero", "ternera", "conejo", "cabrito", "venado", "bisonte", "pato", "ganso", "codorniz", "jabalí",
    "chorizo", "longaniza", "salchicha", "jamón", "tocino", "hígado", "mollejas",

    // Pescados y mariscos
    "salmón", "atún", "bacalao", "merluza", "trucha", "sardina", "anchoa", "tilapia", "robalo", "dorado", "lenguado", "pez espada", "anguila",
    "mojarra", "camarón", "langosta", "langostino", "cangrejo", "ostras", "mejillones", "almejas", "calamar", "pulpo", "vieiras", "surimi",

    // Huevos y lácteos
    "huevo", "huevo de gallina", "huevo de codorniz", "huevo de pato", "matequilla", "margarina",
    "leche", "leche entera", "leche descremada", "leche evaporada", "leche condensada", "leche de almendras", "leche de coco", "leche de soya",
    "yogur", "yogur griego", "queso", "queso cheddar", "queso mozzarella", "queso fresco", "queso panela", "queso oaxaca", "queso cotija", "queso crema", "queso manchego", "quesillo",
    "mantequilla", "nata", "crema agria", "crema batida", "requesón",

    // Legumbres y leguminosas
    "frijoles", "frijoles refritos", "lentejas", "garbanzos", "soya", "edamame", "alubias", "habas", "guisantes",

    // Cereales, harinas y tortillas
    "arroz", "trigo", "maíz", "avena", "cebada", "centeno", "mijo", "quinoa", "amaranto",
    "harina de trigo", "harina integral", "harina de maíz", "harina de arroz", "harina de avena", "masa de maíz", "fécula de maíz", "almidón de yuca",
    "tortillas",

    // Verduras y hongos
    "zanahoria", "papa", "camote", "cebolla", "ajo", "tomate", "jitomate", "tomate verde", "lechuga", "espinaca", "acelga", "brócoli", "coliflor", "repollo", "col rizada",
    "pepino", "pimiento", "pimiento verde", "pimiento rojo", "berenjena", "calabacín", "calabaza", "calabacita", "apio", "rábano", "nabo", "alcachofa", "chayote", "betabel", "esparrago", "esparragos", "elote",
    "hongo", "seta", "portobello", "champiñón", "champiñones", "hongos", "setas", "okras", "ñame", "palmito", "nopales", "flores de calabaza", "flor de calabaza", "huauzontle", "quelites", "huitlacoche",

    // Frutas comunes y exóticas
    "manzana", "plátano", "naranja", "pera", "uva", "fresa", "kiwi", "mango", "piña", "sandía", "melón", "papaya", "cereza", "durazno",
    "ciruela", "higo", "granada", "guayaba", "limón", "lima", "mandarina", "toronja", "lichi", "tamarindo", "carambola", "maracuyá", "pitahaya", "guanábana", "zapote", "níspero", "arándano", "frambuesa", "mora", "coco", "aguacate",
    "tejocote", "tuna", "xoconostle", "mamey", "chicozapote", "cacao", "café", "jicama",

    // Frutos secos y semillas
    "almendras", "nueces", "nuez de macadamia", "nuez de Brasil", "nuez pecana", "avellanas", "pistachos", "pistaches", "cacahuates", "anacardos",
    "semillas de girasol", "semillas de calabaza", "semillas de chía", "semillas de lino", "semillas de linaza", "semillas de sésamo", "semillas de amapola", "pepitas",

    // Hierbas, especias y condimentos
    "perejil", "cilantro", "albahaca", "orégano", "tomillo", "romero", "laurel", "menta", "eneldo", "salvia", "epazote", "hoja santa",
    "canela", "clavo", "nuez moscada", "pimienta", "pimienta negra", "pimienta blanca", "comino", "anís", "cúrcuma", "jengibre", "azafrán", "vainilla", "vainilla mexicana", "cardamomo", "paprika", "chile en polvo", "curry", "ajo en polvo", "cebolla en polvo",

    // Chiles y salsas
    "chiles", "chile verde", "chile de arbol", "chile jalapeño", "chile serrano", "chile habanero", "chile poblano", "chile manzano", "chile ancho", "chile guajillo", "chile pasilla", "chile de árbol", "chile morita", "chile chipotle", "chile mulato", "chile cascabel", "chile piquín",
    "salsa macha", "adobo", "pipián",

    // Otros básicos
    "azúcar", "azúcar blanca", "azúcar morena", "azúcar mascabado", "piloncillo",
    "vinagre blanco", "vinagre de manzana", "vinagre balsámico", "aceite de oliva", "aceite vegetal", "aceite de maíz", "aceite de coco", "aceite de girasol", "manteca de cerdo",
    "miel", "melaza", "jarabe de agave", "jarabe de maple", "stevia",
    "salsa de soya", "salsa inglesa", "mostaza", "mayonesa", "ketchup", "catsup", "sriracha", "tabasco", "hoisin", "teriyaki",
    "bicarbonato", "polvo para hornear", "levadura",

    // Bebidas y fermentados
    "agua", "agua con gas", "agua mineral", "refresco", "cerveza", "vino", "vino tinto", "vino blanco", "sake", "kombucha", "kéfir",
    "té verde", "té negro", "café", "leche de avena", "leche de arroz", "bebida de almendras", "atole", "champurrado", "horchata", "agua de jamaica", "agua de tamarindo", "agua de limón", "aguas frescas",

    // Panes y derivados
    "pan blanco", "pan integral", "pan de centeno", "bagel", "tortilla de maíz", "tortilla de harina", "tortilla azul", "pan pita", "bollos", "croissant", "brioche", "bolillo", "telera", "concha", "cuerno", "pan de muerto", "rosca de reyes",

    // Pastas y masas
    "espagueti", "macarrones", "fideos", "lasagna", "ravioles", "ñoquis", "masa de pizza", "masa de hojaldre", "masa quebrada", "masa para tamales", "masa para empanadas",

    // Platos y preparaciones mexicanas
    "tamales", "tamal", "pozole", "tostadas", "sopes", "gorditas", "tlacoyos", "quesadillas", "chicharrón", "menudo", "pancita", "tripas",

    // Repostería y dulces
    "cajeta", "leche condensada", "mermelada", "dulce de leche", "chocolate abuelita", "chocolate en polvo", "canela en rama", "polvo para hornear", "chispas de chocolate", "cocoa", "gelatina", "flan", "arroz con leche"
];