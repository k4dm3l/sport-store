# 🏋️♂️ Sports Products API - ¿Por qué MongoDB?

## 🍃 ¿MongoDB y no otra base de datos?

Imagina que tienes que guardar datos de productos deportivos (zapatillas, pelotas, etc.) que pueden ser *muy diferentes* entre sí. **MongoDB** nos permite: 

- **Flexibilidad**: Si un día una camiseta necesita tallas (S, M, L) y una pelota necesita peso (300g, 500g), MongoDB nos permite realizar ajustes. ¡Sin esquemas rígidos!
- **Velocidad en operacion I/O**: "¿Cuántos productos hay en total?" o "¿Qué categoría tiene más productos?" son operaciones que en conjunto con una buena estructura permite ser resueltas muy rapido.
- **Stock en tiempo real**: Si 100 usuarios compran al mismo tiempo, MongoDB permite manejar de manera concurrente multiples peticiones *sin romper nada*.
- **Escala fácil**: Si mañana tienes 1 millón de productos, MongoDB escala horizontalmente (más servidores) en lugar de verticalmente (servidores más grandes).

## 🔒 **Transacciones y Operaciones Atómicas:**  
Imagina esto: 50 usuarios comprando las últimas zapatillas al mismo tiempo. ¿Cómo evitamos que el stock se descuadre? **¡MongoDB tiene caracteristicas para manejar esto!**  

- **🔄 Transacciones tipo "Todo o Nada":**  
  Si creas/actualizas/borras un producto:  
  1. **Se guarda el producto**  
  2. **Se actualiza el reporte general** (total de productos, stock)  
  *¡Si falla algo, podemos hacer rollback!*  

- **⚡ Operaciones Atómicas (`$inc`):**  
  En la colección `Reports`, usamos **$inc** para:  
  ```javascript
  // Incrementar como si fuera un contador físico
  { $inc: { total_products: 1, total_stock: 100 } }
  ```

## 📊 ¿Cómo Funciona el Reporte en Tiempo Real?
- **Colección Reports: Un único documento que siempre refleja**:

```bash
{
  "total_products": 1589,
  "total_stock": 75430,
  "total_pricing": 250000.50
}
```

- **Colección Categories: Nos sirve para mantener las cantidades por cada categoria**:
```bash
{
  "name":"BALONCESTO",
  "count":25
}
```

- **Crear producto ➕**: total_products +1, total_stock + X
- **Eliminar producto ➖**: total_products -1, total_stock - X
- **Actualizar stock 🔄**: total_stock + (nuevoStock - viejoStock)
---

## 📚 Documentación de la API

¿Quieres probar los endpoints? **La documentación está aquí:**  
`http://localhost:[PUERTO]/api-docs` (reemplaza `[PUERTO]` por el que uses, ej: 3000).

Usamos **Swagger** para esto:
- ✅ Ves todos los endpoints.
- 🧪 Puedes usarlo para pruebas.
- 🔒 Incluye autenticación JWT.

---

## 🛠 Scripts útiles

Corre estos comandos en la terminal:

```bash
# Compilar el proyecto (TypeScript a JavaScript)
npm run compile

# Iniciar la API en producción
npm start

# Modo desarrollo (recarga automática)
npm run dev

# Arreglar format del código 🧹
npm run format

# Poblar la base de datos con datos de prueba (¡Haz esto primero! Este script usa Faker.js para inventar productos realistas 🎲)
npm run populate-db

# Otros comandos útiles:
npm run lint    # Revisar código
```

# 🐳 Iniciar el Proyecto con Docker (Desarrollo Local)

## 📋 Prerrequisitos
- Docker instalado ([Descargar Docker](https://www.docker.com/get-started))
- Docker Compose (viene incluido en Docker Desktop)

---

## 🚀 Comandos
**Para desarrollo (base de datos MongoDB y Redis):**
```bash
# Borra todo y reinicia desde cero (¡cuidado con los datos locales!)
docker compose down -v && docker compose up --build
```
