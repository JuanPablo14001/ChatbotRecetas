from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Cargar recetas desde archivo local
with open('recetas.json', 'r', encoding='utf-8') as f:
    recetas = json.load(f)

def limpiar_ingredientes(lista):
    return [i.lower().strip() for i in lista]

@app.route('/buscar_recetas', methods=['POST'])
def buscar_recetas():
    data = request.get_json()
    ingredientes_usuario = limpiar_ingredientes(data.get('ingredientes', []))
    restricciones_usuario = [r.lower().strip() for r in data.get('restricciones', [])]
    
    resultados = []

    for receta in recetas:
        ingredientes_receta = limpiar_ingredientes(receta["ingredientes"])
        
        # Quitar ingredientes opcionales (terminan con *)
        obligatorios = [i for i in ingredientes_receta if not i.endswith("*")]
        coincidencias = [i for i in obligatorios if i in ingredientes_usuario]
        porcentaje = (len(coincidencias) / len(obligatorios)) * 100 if obligatorios else 0
        
        # Verificar restricciones
        cumple_restricciones = all(
            receta.get("restricciones", {}).get(r, False) if isinstance(receta["restricciones"].get(r), bool)
            else True
            for r in restricciones_usuario
        )

        if porcentaje >= 80 and cumple_restricciones:
            resultados.append({
                "receta": receta,
                "porcentaje": porcentaje
            })

    # Ordenar por prioridad: primero los de 100%, luego por menor faltante
    resultados.sort(key=lambda r: (-r["porcentaje"]))

    # Solo devolver la receta, no el porcentaje
    return jsonify([r["receta"] for r in resultados])

if __name__ == '__main__':
    app.run(debug=True)
