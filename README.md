# 🎯 PPTX API — Generador de Presentaciones para ChatGPT

API que recibe un JSON y devuelve un archivo `.pptx` listo para descargar.  
Diseñada para usarse como **Custom GPT Action** en ChatGPT.

---

## 🚀 Deploy en Railway (5 minutos)

1. Sube esta carpeta a un repositorio de GitHub
2. Ve a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
3. Selecciona tu repositorio
4. Railway detecta Node.js automáticamente y hace el deploy
5. Ve a **Settings → Networking → Generate Domain**
6. ¡Listo! Tienes tu URL pública, ejemplo: `https://pptx-api-production.up.railway.app`

---

## 📡 Endpoints

### `GET /`
Health check — verifica que la API esté viva.

### `POST /generate`
Genera y descarga un archivo `.pptx`.

**Body (JSON):**
```json
{
  "title": "Mi Presentación",
  "theme": "dark",
  "slides": [
    {
      "background": "1E2761",
      "elements": [
        {
          "type": "text",
          "text": "Título Principal",
          "x": 0.5, "y": 2,
          "w": 9, "h": 1.5,
          "fontSize": 40,
          "bold": true,
          "color": "FFFFFF",
          "align": "center"
        }
      ]
    }
  ]
}
```

---

## 🎨 Temas disponibles

| Tema       | Fondo    | Descripción              |
|------------|----------|--------------------------|
| `dark`     | Azul marino | Elegante y profesional |
| `light`    | Blanco   | Clásico y limpio         |
| `coral`    | Azul/Rojo | Energético y llamativo  |
| `forest`   | Verde    | Natural y calmado        |
| `minimal`  | Gris     | Minimalista              |
| `corporate`| Negro    | Corporativo premium      |

---

## 🧩 Tipos de elementos

### `text` — Texto libre
```json
{
  "type": "text",
  "text": "Hola Mundo",
  "x": 0.5, "y": 1,
  "w": 9, "h": 1,
  "fontSize": 24,
  "fontFace": "Calibri",
  "color": "FFFFFF",
  "bold": false,
  "italic": false,
  "align": "left"
}
```

### `bullets` — Lista con viñetas
```json
{
  "type": "bullets",
  "items": ["Primer punto", "Segundo punto", "Tercer punto"],
  "x": 0.5, "y": 1.5,
  "w": 9, "h": 3,
  "fontSize": 18,
  "color": "FFFFFF"
}
```

### `shape` — Forma geométrica
```json
{
  "type": "shape",
  "shape": "rectangle",
  "x": 0, "y": 0,
  "w": 10, "h": 0.8,
  "fill": "4FC3F7",
  "line": "FFFFFF",
  "lineWidth": 1
}
```
Formas: `rectangle`, `oval`, `line`, `rounded_rectangle`

### `image` — Imagen desde URL
```json
{
  "type": "image",
  "url": "https://ejemplo.com/imagen.png",
  "x": 1, "y": 1,
  "w": 4, "h": 3
}
```

### `chart` — Gráfica
```json
{
  "type": "chart",
  "chartType": "bar",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "values": [4500, 5500, 6200, 7100],
  "seriesName": "Ventas",
  "x": 0.5, "y": 1,
  "w": 9, "h": 4,
  "showValues": true,
  "chartTitle": "Ventas Trimestrales"
}
```
Tipos: `bar`, `line`, `pie`, `doughnut`

---

## 🤖 Schema OpenAPI para Custom GPT

Copia este schema en la sección **Actions** de tu Custom GPT:

```yaml
openapi: 3.1.0
info:
  title: PPTX Generator API
  description: Generates PowerPoint presentations from JSON descriptions
  version: 1.0.0
servers:
  - url: https://TU-URL-AQUI.railway.app
paths:
  /generate:
    post:
      operationId: generatePresentation
      summary: Generate a PPTX file
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [slides]
              properties:
                title:
                  type: string
                  description: Title of the presentation
                theme:
                  type: string
                  enum: [dark, light, coral, forest, minimal, corporate]
                  description: Color theme
                slides:
                  type: array
                  description: Array of slides
                  items:
                    type: object
                    properties:
                      background:
                        type: string
                        description: Hex color without # (e.g. "1E2761")
                      elements:
                        type: array
                        items:
                          type: object
      responses:
        "200":
          description: PPTX file binary
          content:
            application/vnd.openxmlformats-officedocument.presentationml.presentation:
              schema:
                type: string
                format: binary
```

---

## 💬 Prompt para tu Custom GPT

Pega esto en las **Instructions** de tu Custom GPT:

```
Eres un experto en diseño de presentaciones. Cuando el usuario te pida crear una presentación, genera un JSON con la estructura correcta y llama a la acción generatePresentation.

REGLAS:
- Coordenadas X e Y en pulgadas (el slide mide 10" x 5.625")
- Colores en HEX sin # (ej: "FF0000")
- Usa temas: dark, light, coral, forest, minimal, corporate
- Cada slide debe tener al menos un título prominente
- Combina formas (shapes) de fondo con texto encima para hacer diseños atractivos
- Para títulos usa fontSize 36-44, para cuerpo 14-18
- Deja márgenes de al menos 0.5" en los bordes

EJEMPLO de slide con diseño:
- Shape rectangle de fondo de color accent (ancho completo, h=0.8) en y=0
- Texto del título encima en y=0.1 con color blanco, fontSize 28, bold
- Contenido debajo en y=1.2
```

---

## 📦 Instalación local (para pruebas)

```bash
npm install
node index.js
# Servidor en http://localhost:3000
```

Prueba rápida:
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","theme":"dark","slides":[{"elements":[{"type":"text","text":"Hola!","x":1,"y":2,"w":8,"h":2,"fontSize":40,"color":"FFFFFF","align":"center"}]}]}' \
  --output test.pptx
```
