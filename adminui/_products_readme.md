Panel de Productos (Admin)

- Colección Firestore: `products`
- Campos: `name` (string), `image` (string URL), `cost` (number), `currency` ("apk" | "proxy"), `tier` (string)

Operaciones implementadas en `adminui/script.js`:
- `loadProducts()` carga y renderiza productos.
- `createProduct()` agrega un producto.
- `edit` y `delete` botones para cada producto.

Si no existe la colección `products`, crea documentos desde el panel.
