#!/bin/bash

OUTPUT_FILE="contexto_proyecto.txt"

if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "🗑️  Archivo anterior eliminado."
fi

# --- 1. CONFIGURACIÓN DE EXCLUSIONES ---

# Carpetas a ignorar (en CUALQUIER nivel de profundidad)
DIRS_TO_PRUNE=(
    "node_modules"
    ".git"
    "dist"
    "build"
    "logs"
    ".vscode"
    "db_data"
    "mongo-data"
)

# Archivos a ignorar
FILES_TO_IGNORE=(
    "*.db"
    "*.sqlite"
    "package-lock.json"
    "yarn.lock"
    "contexto_proyecto.txt"
    "*.png"
    "*.jpg"
    "*.jpeg"
    "*.ico"
    "*.svg"
    ".env" # Ignorado por seguridad, .env.example sí se incluirá
)

# --- 2. CONSTRUIR ARGUMENTOS PARA 'FIND' ---

PRUNE_ARGS=()
for dir in "${DIRS_TO_PRUNE[@]}"; do
    if [ ${#PRUNE_ARGS[@]} -gt 0 ]; then
        PRUNE_ARGS+=("-o")
    fi
    PRUNE_ARGS+=("-name" "$dir")
done

FILE_ARGS=()
for file in "${FILES_TO_IGNORE[@]}"; do
    FILE_ARGS+=("!" "-name" "$file")
done

# --- 3. EJECUCIÓN ---

echo "⏳ Generando estructura del proyecto..."

# Generamos un árbol usando 'find' y 'sed' (No requiere tener instalado 'tree')
echo "🌳 Estructura del Proyecto (solo Core):" > "$OUTPUT_FILE"
find . -type d \( "${PRUNE_ARGS[@]}" \) -prune -o -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g' >> "$OUTPUT_FILE"

echo -e "\n\n---\n\n📄 Contenido de los Archivos:\n" >> "$OUTPUT_FILE"

echo "⏳ Extrayendo código..."

# Leemos los archivos ignorando drásticamente las carpetas pesadas (-prune)
find . -type d \( "${PRUNE_ARGS[@]}" \) -prune -o -type f "${FILE_ARGS[@]}" -exec sh -c '
    echo "--- INICIO: {} ---" >> "$1"
    cat "{}" >> "$1"
    echo -e "\n--- FIN: {} ---\n" >> "$1"
' sh "$OUTPUT_FILE" \;

echo "✅ ¡Listo! El contexto condensado y limpio se ha guardado en $OUTPUT_FILE"