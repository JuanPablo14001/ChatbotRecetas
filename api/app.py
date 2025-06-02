def obtener_recetas(ingredientes_usuario, restricciones_usuario):
    ingredientes_usuario = set(map(normalizar, ingredientes_usuario))
    recetas_recomendadas = []

    for receta in base_conocimiento:
        ingredientes_receta = set(map(normalizar, receta["ingredientes"]))

        if not ingredientes_usuario.issuperset(ingredientes_receta):
            continue

        cumple_restricciones = True
        for restriccion, valor_maximo in restricciones_usuario.items():
            if valor_maximo is not None and receta["restricciones"].get(restriccion, 0) > valor_maximo:
                cumple_restricciones = False
                break

        if cumple_restricciones:
            recetas_recomendadas.append(receta)

    return recetas_recomendadas
