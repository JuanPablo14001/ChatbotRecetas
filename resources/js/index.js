document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    sendIngredients();
});

const receta = {
        ingredientes: [],
        restricciones: []
    };

const loadIngredients = () => {
    

    const input = document.querySelector('#messageInput');
    const suggestionsList = document.querySelector('#suggestionsList');
    const ingredientsContainer = document.querySelector('#ingredientsContainer');
    const sendBtn = document.querySelector('#sendBtn');

    // Usar event delegation para los botones de eliminar
    ingredientsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove') || e.target.parentElement.classList.contains('btn-remove')) {
            const span = e.target.closest('span');
            const ing = span.textContent.trim().replace('×', '').trim();
            receta.ingredientes = receta.ingredientes.filter(i => i !== ing);
            span.remove();
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

    const addIngredient = ingredient => {
        if (!receta.ingredientes.includes(ingredient)) {
            receta.ingredientes.push(ingredient);
            updateIngredientTags();
            input.value = "";
            suggestionsList.innerHTML = "";
        }
    }

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

    const verifyIngredients = () => {
        
        if(receta.ingredientes.length < 3){
            sendBtn.disabled = true;
            sendBtn.classList.add('opacity-30');   
        }else{
            sendBtn.disabled = false
            sendBtn.classList.remove('opacity-30');
        }
    }
}


const sendIngredients = () => {
    


}
























const allIngredients = [
    // Carnes
    "res", "cerdo", "pollo", "pavo", "cordero", "ternera", "conejo", "cabrito", "venado", "bisonte", "pato", "ganso", "codorniz", "jabalí",
    "chorizo", "longaniza", "salchicha", "jamón", "tocino", "hígado", "mollejas", "carnitas", "barbacoa", "birria",

    // Pescados y mariscos
    "salmón", "atún", "bacalao", "merluza", "trucha", "sardina", "anchoa", "tilapia", "robalo", "dorado", "lenguado", "pez espada", "anguila",
    "mojarra", "camarón", "langosta", "langostino", "cangrejo", "ostras", "mejillones", "almejas", "calamar", "pulpo", "vieiras", "surimi",

    // Huevos y lácteos
    "huevo", "huevo de gallina", "huevo de codorniz", "huevo de pato",
    "leche", "leche entera", "leche descremada", "leche evaporada", "leche condensada", "leche de almendras", "leche de coco", "leche de soya",
    "yogur", "yogur griego", "queso", "queso cheddar", "queso mozzarella", "queso fresco", "queso panela", "queso oaxaca", "queso cotija", "queso crema", "queso manchego", "quesillo",
    "mantequilla", "nata", "crema agria", "crema batida", "requesón",

    // Legumbres y leguminosas
    "frijoles", "frijoles negros", "frijoles pintos", "frijol peruano", "frijol bayos", "lentejas", "garbanzos", "soya", "edamame", "alubias", "habas", "guisantes",

    // Cereales, harinas y tortillas
    "arroz", "arroz integral", "arroz basmati", "trigo", "trigo sarraceno", "maíz", "avena", "cebada", "centeno", "mijo", "quinoa", "amaranto",
    "harina de trigo", "harina integral", "harina de maíz", "harina de arroz", "harina de avena", "masa de maíz", "fécula de maíz", "almidón de yuca",
    "tortilla de maíz", "tortilla de harina", "tortilla azul",

    // Verduras y hongos
    "zanahoria", "papa", "camote", "cebolla", "ajo", "tomate", "jitomate", "tomate verde", "lechuga", "espinaca", "acelga", "brócoli", "coliflor", "repollo", "col rizada",
    "pepino", "pimiento", "pimiento verde", "pimiento rojo", "berenjena", "calabacín", "calabaza", "calabacita", "apio", "rábano", "nabo", "alcachofa", "chayote", "betabel", "esparrago", "esparragos", "elote",
    "hongo", "seta", "portobello", "champiñón", "champiñones", "hongos", "setas", "okras", "ñame", "palmito", "nopales", "flores de calabaza", "flor de calabaza", "huauzontle", "quelites", "huitlacoche",

    // Frutas comunes y exóticas
    "manzana", "plátano", "naranja", "pera", "uva", "fresa", "kiwi", "mango", "piña", "sandía", "melón", "papaya", "cereza", "durazno",
    "ciruela", "higo", "granada", "guayaba", "limón", "lima", "mandarina", "toronja", "lichi", "tamarindo", "carambola", "maracuyá", "pitahaya", "guanábana", "zapote", "níspero", "arándano", "frambuesa", "mora", "coco", "aguacate",
    "tejocote", "tuna", "xoconostle", "mamey", "chicozapote", "cacao", "café",

    // Frutos secos y semillas
    "almendras", "nueces", "nuez de macadamia", "nuez de Brasil", "nuez pecana", "avellanas", "pistachos", "pistaches", "cacahuates", "anacardos",
    "semillas de girasol", "semillas de calabaza", "semillas de chía", "semillas de lino", "semillas de linaza", "semillas de sésamo", "semillas de amapola", "pepitas",

    // Hierbas, especias y condimentos
    "perejil", "cilantro", "albahaca", "orégano", "tomillo", "romero", "laurel", "menta", "eneldo", "salvia", "epazote", "hoja santa",
    "canela", "clavo", "nuez moscada", "pimienta", "pimienta negra", "pimienta blanca", "comino", "anís", "cúrcuma", "jengibre", "azafrán", "vainilla", "vainilla mexicana", "cardamomo", "paprika", "chile en polvo", "curry", "ajo en polvo", "cebolla en polvo",

    // Chiles y salsas
    "chile jalapeño", "chile serrano", "chile habanero", "chile poblano", "chile manzano", "chile ancho", "chile guajillo", "chile pasilla", "chile de árbol", "chile morita", "chile chipotle", "chile mulato", "chile cascabel", "chile piquín",
    "salsa verde", "salsa roja", "salsa macha", "salsa de molcajete", "salsa taquera", "salsa de tomate", "mole poblano", "mole verde", "adobo", "pipián", "salsa picante",

    // Otros básicos
    "azúcar", "azúcar blanca", "azúcar morena", "azúcar mascabado", "piloncillo", "sal", "sal marina", "sal del Himalaya",
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