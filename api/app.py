from flask import Flask, request, jsonify
import json
from math import floor
from weasyprint import HTML
from io import BytesIO
from flask import send_file
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

#Decodificar el json
with open('recetas.json', 'r', encoding='utf-8') as f:
    recetas = json.load(f)


#Funciones
#Algoritmo de normalizacion de datos
#Funcion para normalizar cada ingrediente, si es opcional, obligatorio o un objeto
def normalizar_ingrediente(ing):
    if isinstance(ing, str):
        return {
            'nombre': ing.rstrip('*').rstrip('-'),
            'sustitutos': [],
            'opcional': ing.endswith('*'),
            'obligatorio': ing.endswith('-'),
            'original': ing.rstrip('*').rstrip('-')
        }
    return {
        'nombre': ing.get('nombre', '').rstrip('*').rstrip('-'),
        'sustitutos': ing.get('sustitutos', []),
        'opcional': ing.get('opcional', False) or ('nombre' in ing and ing['nombre'].endswith('*')),
        'obligatorio': ing.get('obligatorio', False) or ('nombre' in ing and ing['nombre'].endswith('-')),
        'original': ing.get('nombre', '').rstrip('*').rstrip('-')
    }


#Algoritmo de matching con ponderacion
#Funcion para calcular la coincidencia de los ingredientes enviados con las recetas del json
def calcular_coincidencia_estricta(ingredientes_busqueda, ingredientes_receta):
    ingredientes_requeridos = [ing for ing in ingredientes_receta if not ing['opcional']]
    if not ingredientes_requeridos:
        return 0, []

    # Verificar primero ingredientes obligatorios
    for ing_receta in ingredientes_receta:
        if ing_receta['obligatorio']:
            encontrado = False
            # Verificar ingrediente original
            if ing_receta['nombre'] in ingredientes_busqueda:
                encontrado = True
            else:
                # Verificar sustitutos
                for sustituto in ing_receta['sustitutos']:
                    if sustituto in ingredientes_busqueda:
                        encontrado = True
                        break
            
            if not encontrado:
                return 0, []  # No cumple con ingrediente obligatorio

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
        #Si no se encuentra el ite lo marca como faltante
        if not encontrado and not ing_receta['opcional']:
            ingrediente_mostrar = f"{ing_receta['original']} (faltante)"

        ingredientes_mostrar.append(ingrediente_mostrar)

    # Porcentaje basado solo en ingredientes requeridos
    porcentaje = coincidencias / len(ingredientes_requeridos)
    return porcentaje, ingredientes_mostrar


#Algoritmo de validacion por restricciones
#Funcion para verificar las restricciones de la receta
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

#Algoritmo de recomendacion basado en exclusion
#Funcion para sugerir las recetas con mayor porcentaje limitando a 6 recetas
def obtener_sugerencias(ingredientes_busqueda):
    #Conjunto para evitar duplicados
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



#API

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


@app.route('/api/generar-pdf', methods=['POST'])
def generar_pdf():
    try:
        data = request.json
        receta_id = int(data.get('id'))
        ingredientes_modal = data.get('ingredientes_modal', [])

        receta = next((r for r in recetas if r['id'] == receta_id), None)
        if not receta:
            return jsonify({'success': False, 'message': 'Receta no encontrada'}), 404

        imagen_path = os.path.abspath(os.path.join('..', 'resources', receta['imagen']))

        # Para Windows
        if os.name == 'nt':
            imagen_path = imagen_path.replace('\\', '/')

        # URL para WeasyPrint (file://)
        imagen_url = f"file:///{imagen_path}"
        print(imagen_path)
        print(f"¿Existe la imagen? {os.path.exists(imagen_path)}")
        html_content = f"""
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    color: #333;
                    padding: 30px;
                    background: #f8f8f8;
                }}
                .container {{
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }}
                h1 {{
                    color: #D32F2F;
                    margin-top: 20px;
                }}
                h2 {{
                    color: #C62828;
                    margin-top: 30px;
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 5px;
                }}
                ul {{
                    padding-left: 20px;
                }}
                li::marker {{
                    color: #D32F2F;
                }}
                .step {{
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                }}
                .circle {{
                    flex-shrink: 0;
                    background-color: #f28b82;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 10px;
                    font-size: 14px;
                }}
                .image-container {{
                    text-align: center;
                }}
                .image-container img {{
                    width: 100%;
                    max-width: 500px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="image-container">
                    <img src="{imagen_url}" alt="Imagen">
                </div>

                <h1>{receta['nombre']}</h1>

                <h2>Ingredientes</h2>
                <ul>
                    {''.join(f"<li>{ing}</li>" for ing in ingredientes_modal)}
                </ul>

                <h2>Preparación</h2>
                {''.join(f"<div class='step'><div class='circle'>{i+1}</div><div>{line.strip()}</div></div>"
                    for i, line in enumerate(receta['instrucciones'].split('\n')) if line.strip())}
            </div>
        </body>
        </html>
        """

        pdf_io = BytesIO()
        HTML(string=html_content, base_url=".").write_pdf(pdf_io)
        pdf_io.seek(0)

        return send_file(pdf_io, mimetype='application/pdf', as_attachment=True, download_name='receta.pdf')

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error generando el PDF: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)