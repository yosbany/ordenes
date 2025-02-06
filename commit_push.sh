#!/bin/bash

# Obtener la ruta donde está ubicado el script
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📂 Listado de proyectos disponibles:"
# Listar directorios en la misma carpeta del script
projects=($(ls -d $BASE_DIR/*/ 2>/dev/null | xargs -n 1 basename))

# Verificar si hay proyectos disponibles
if [ ${#projects[@]} -eq 0 ]; then
    echo "⚠️ No se encontraron proyectos en la misma carpeta del script."
    exit 1
fi

# Mostrar la lista de proyectos y permitir selección
for i in "${!projects[@]}"; do
    echo "$((i+1))) ${projects[$i]}"
done

# Pedir al usuario que elija un proyecto
read -p "Seleccione un número de proyecto: " choice

# Validar la selección
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -le 0 ] || [ "$choice" -gt "${#projects[@]}" ]; then
    echo "❌ Opción inválida."
    exit 1
fi

# Obtener el nombre del proyecto seleccionado
selected_project="${projects[$((choice-1))]}"
PROJECT_PATH="$BASE_DIR/$selected_project"

echo "📂 Cambiando al directorio: $PROJECT_PATH"
cd "$PROJECT_PATH" || { echo "❌ Error: No se pudo acceder a $PROJECT_PATH"; exit 1; }

# Pedir un mensaje de commit
read -p "Ingrese un mensaje para el commit (o presione Enter para usar uno por defecto): " commit_message
commit_message=${commit_message:-"Actualización automática"}

# Ejecutar los comandos de Git
git add .
git commit -m "$commit_message"

# Obtener la rama actual
branch=$(git rev-parse --abbrev-ref HEAD)

# Hacer push a la rama actual
git push origin "$branch"

echo "✅ Cambios subidos correctamente a la rama $branch en el proyecto $selected_project"
