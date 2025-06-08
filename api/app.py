from flask import Flask, request, jsonify
import json
from math import floor
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open('recetas.json', 'r', encoding='utf-8') as f:
    recetas = json.load(f)


def normalizar_ingrediente(ing):
    if isinstance(ing, str):
        return {
            'nombre': ing.rstrip('*'),
            'sustitutos': [],
            'opcional': ing.endswith('*'),
            'original': ing.rstrip('*')
        }
    return {
        'nombre': ing.get('nombre', '').rstrip('*'),
        'sustitutos': ing.get('sustitutos', []),
        'opcional': ing.get('opcional', False) or ('nombre' in ing and ing['nombre'].endswith('*')),
        'original': ing.get('nombre', '').rstrip('*')
    }


@app.route('/api/buscar-recetas', methods=['POST'])
def buscar_recetas():
    try:
        data = request.json
        ingredientes_busqueda = [ing.rstrip('*') for ing in data.get('ingredientes', [])]
        restricciones = data.get('restricciones', {})

        resultados = []

        for receta in recetas:
            # Primero verificar restricciones (filtro más estricto)
            if not verificar_restricciones(restricciones, receta['restricciones']):
                continue

            # Normalizar ingredientes
            ingredientes_receta = [normalizar_ingrediente(ing) for ing in receta['ingredientes']]

            # Calcular coincidencia (más estricta)
            porcentaje, ingredientes_mostrar = calcular_coincidencia_estricta(
                ingredientes_busqueda,
                ingredientes_receta
            )

            # Solo considerar recetas con alta coincidencia (70%+)
            if porcentaje >= 0.7:
                receta_modificada = {
                    'nombre': receta['nombre'],
                    'ingredientes': ingredientes_mostrar,
                    'ingredientes_originales': [ing['original'] for ing in ingredientes_receta],
                    'restricciones': receta['restricciones'],
                    'instrucciones': receta['instrucciones'],
                    'imagen': receta['imagen'],
                    'porcentaje_coincidencia': floor(porcentaje * 100),
                    'cumple_restricciones': True,  # Ya pasó el filtro
                    'id': receta['id']
                }
                resultados.append(receta_modificada)

        # Ordenar por mejor coincidencia
        resultados_ordenados = sorted(
            resultados,
            key=lambda x: -x['porcentaje_coincidencia']
        )

        total_recetas = len(resultados_ordenados)
        recetas_a_devolver = resultados_ordenados[:10]

        if not recetas_a_devolver:
            return jsonify({
                'success': False,
                'message': 'No se encontraron recetas que coincidan con tus criterios estrictos',
                'suggestions': obtener_sugerencias(ingredientes_busqueda)
            })

        return jsonify({
            'success': True,
            'data': recetas_a_devolver,
            'total_recetas': total_recetas,
            'message': f'Se encontraron {total_recetas} recetas' +
                       (f', mostrando {len(recetas_a_devolver)}' if total_recetas > 10 else '')
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error en el servidor: {str(e)}'
        }), 500


def calcular_coincidencia_estricta(ingredientes_busqueda, ingredientes_receta):
    ingredientes_requeridos = [ing for ing in ingredientes_receta if not ing['opcional']]
    if not ingredientes_requeridos:
        return 0, []

    coincidencias = 0
    ingredientes_mostrar = []

    for ing_receta in ingredientes_receta:
        ingrediente_mostrar = ing_receta['original']
        encontrado = False

        # Verificar ingrediente original
        if ing_receta['nombre'] in ingredientes_busqueda:
            coincidencias += 1 if not ing_receta['opcional'] else 0.5
            encontrado = True
        else:
            # Verificar sustitutos
            for sustituto in ing_receta['sustitutos']:
                if sustituto in ingredientes_busqueda:
                    coincidencias += 1 if not ing_receta['opcional'] else 0.5
                    ingrediente_mostrar = sustituto
                    encontrado = True
                    break

        if not encontrado and not ing_receta['opcional']:
            ingrediente_mostrar = f"{ing_receta['original']} (faltante)"

        ingredientes_mostrar.append(ingrediente_mostrar)

    # Porcentaje basado solo en ingredientes requeridos
    porcentaje = coincidencias / len(ingredientes_requeridos)
    return porcentaje, ingredientes_mostrar


def verificar_restricciones(restricciones_busqueda, restricciones_receta):
    # Filtro vegetariano estricto
    if restricciones_busqueda.get('vegetariano', False):
        if not restricciones_receta.get('vegetariano', False):
            return False

    # Validar nutrientes
    nutrientes = ['calorias', 'carbohidratos', 'proteinas', 'grasas', 'azucares']

    for nutriente in nutrientes:
        valor_receta = restricciones_receta.get(nutriente, 0)
        rango = restricciones_busqueda.get(nutriente, {})

        # Verificar mínimo
        if 'min' in rango and rango['min'] is not None and valor_receta < rango['min']:
            return False

        # Verificar máximo
        if 'max' in rango and rango['max'] is not None and valor_receta > rango['max']:
            return False

    return True


def obtener_sugerencias(ingredientes_busqueda):
    sugerencias = set()

    for receta in recetas:
        for ing in receta['ingredientes']:
            ing_normalizado = normalizar_ingrediente(ing)
            if ing_normalizado['nombre'] not in ingredientes_busqueda:
                sugerencias.add(ing_normalizado['nombre'])
            for sustituto in ing_normalizado['sustitutos']:
                if sustituto not in ingredientes_busqueda:
                    sugerencias.add(sustituto)

    return list(sugerencias)[:5] if sugerencias else []


if __name__ == '__main__':
    app.run(debug=True)