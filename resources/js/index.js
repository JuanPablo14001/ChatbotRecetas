
document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    sendIngredients();
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
            li.className = "bg-green-100 hover:bg-green-200 text-sm px-3 py-1 rounded cursor-pointer";
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
            span.className = "bg-gray-200 text-sm text-gray-800 px-3 py-1 rounded-full flex items-center";
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
    messageDiv.className = `shadow-md rounded-lg p-4 w-full max-w-xl mb-2`;

    if (type === 'user') {
        messageDiv.classList.add('bg-green-100', 'ml-auto');
    } else {
        messageDiv.classList.add('bg-gray-200', 'mr-auto');
    }

    const messageContent = document.createElement('div');
    messageContent.className = `flex items-start gap-3 ${type === 'user' ? 'justify-end' : 'justify-start'}`;

    // Contenedor donde TypeIt escribirá (importante: debe estar vacío)
    const textContainer = document.createElement('div');
    textContainer.className = 'text-gray-800';

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
    if (type === 'bot' && success) {
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
        return {
            success: false,
            message: "¡Lo siento! 😞 No pude encontrar una receta con las instrucciones dadas."
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
            <a href="receta.html?id=${receta.id}" class="ver-receta-link bg-green-500 rounded-full px-4 py-2 inline-block mt-2">👀 Ver receta</a>
        </div>
        `;
    });

    const message = mensajeInicial + mensajes.join("<br>");

    return {
        success: true,
        message: message
    };
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
    "frijoles", "lentejas", "garbanzos", "soya", "edamame", "alubias", "habas", "guisantes",

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