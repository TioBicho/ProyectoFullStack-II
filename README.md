# Documento de Integración: Frontend LevelUp + Arquitectura de 2 Microservicios Spring Boot

Este documento detalla la arquitectura completa, configuración y puesta en marcha del ecosistema **LevelUp Gamer**, dando cumplimiento estricto a la rúbrica **DSY1104 - Evaluación Parcial 3** de Duoc UC.

---

## 1. Arquitectura General del Sistema

El sistema está dividido en **2 Microservicios Backend** independientes en Spring Boot (Java 17) con persistencia en MySQL, comunicados de manera desacoplada con el **Frontend React**:

```
                              +---------------------------------------+
                              |         FRONTEND REACT (Vite)         |
                              |         Puerto: 5173 / Local          |
                              +-------------------+-------------------+
                                                  |
                         +------------------------+------------------------+
                         | (REST / Fetch)                                  | (REST / Fetch)
                         v                                                 v
+------------------------------------+           +------------------------------------+
|    MICROSERVICIO 1: MS-LOGIN       |           |   MICROSERVICIO 2: MS-PRODUCTOS    |
| (Auth, Registro, Roles, Usuarios)  |           |   (Catálogo, Stock, Carrito, Ped)  |
|         Puerto: 8081               |           |            Puerto: 8082            |
|    Base de Datos: levelup_auth_db  |           |   Base de Datos: levelup_tienda_db |
+------------------+-----------------+           +-----------------+------------------+
                   |                                               |
                   +------ JWT HMAC-SHA256 (Shared Secret Key) ----+
                           (Permite validación sin acoplar DBs)
```

---

## 2. Microservicio 1: Auth & Usuarios (`levelup-MSlogin`)

- **Directorio:** `C:\Users\PC\Desktop\levelup-MSlogin\levelup-MSlogin`
- **Puerto:** `8081`
- **Base de Datos:** MySQL `levelup_auth_db`
- **Documentación Swagger / OpenAPI:** [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **Especificación OpenAPI (JSON):** [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

### Endpoints Expuestos:
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registra un nuevo cliente con contraseña encriptada en BCrypt. |
| `POST` | `/api/auth/login` | Público | Valida credenciales y genera un Token JWT (HMAC-SHA256). |
| `GET` | `/api/auth/me` | Autenticado | Devuelve los datos del usuario correspondiente al token. |
| `GET` | `/api/auth/validate`| Autenticado | Valida la vigencia y firma del token JWT. |
| `GET` | `/api/usuarios` | `ROLE_ADMIN` | Lista todos los usuarios registrados en el sistema. |
| `GET` | `/api/usuarios/{id}`| `ROLE_ADMIN` | Obtiene el detalle de un usuario por su ID. |
| `POST`| `/api/usuarios` | `ROLE_ADMIN` | Crea un nuevo usuario en la base de datos (con rol y contraseña cifrada). |
| `PUT` | `/api/usuarios/{id}`| `ROLE_ADMIN` | Actualiza datos de un usuario (nombre, teléfono, ubicación, rol). |
| `PATCH`| `/api/usuarios/{id}/rol` | `ROLE_ADMIN` | Modifica el rol de un usuario (`ROLE_CLIENTE` / `ROLE_ADMIN`). |
| `DELETE`| `/api/usuarios/{id}` | `ROLE_ADMIN` | Elimina permanentemente un usuario por su ID. |

### Cuentas Semilla por Defecto:
- **Administrador:**
  - Correo: `admin@levelup.cl`
  - Contraseña: `Admin123!`
  - Rol: `ROLE_ADMIN`
- **Cliente:**
  - Correo: `cliente@levelup.cl`
  - Contraseña: `User123!`
  - Rol: `ROLE_CLIENTE`

---

## 3. Microservicio 2: Tienda (`levelup-MSproductos`)

- **Directorio:** `C:\Users\PC\Desktop\levelup-MSproductos\levelup-MSproductos`
- **Puerto:** `8082`
- **Base de Datos:** MySQL `levelup_tienda_db`
- **Documentación Swagger / OpenAPI:** [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
- **Especificación OpenAPI (JSON):** [http://localhost:8082/v3/api-docs](http://localhost:8082/v3/api-docs)

### Endpoints Expuestos:
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `GET` | `/api/productos` | Público | Lista los productos activos del catálogo (soporta `?search=`). |
| `GET` | `/api/productos/{id}` | Público | Obtiene el detalle de un producto específico. |
| `POST` | `/api/productos` | `ROLE_ADMIN` | Crea un nuevo producto (valida campos obligatorios y formato). |
| `PUT` | `/api/productos/{id}` | `ROLE_ADMIN` | Modifica precio, stock, descripción, imagen, etc. |
| `DELETE` | `/api/productos/{id}` | `ROLE_ADMIN` | Elimina un producto del catálogo. |
| `POST` | `/api/pedidos` | Autenticado/Público | Registra un pedido con ítems, descuenta stock y aplica cupón (`DUOC20`). |
| `GET` | `/api/pedidos` | `ROLE_ADMIN` | Lista todos los pedidos procesados en la tienda. |
| `GET` | `/api/pedidos/{id}` | Autenticado | Obtiene el detalle completo de un pedido. |

### Reglas de Negocio Implementadas:
1. **Control de Stock en Tiempo Real:** Al confirmar un pedido, se descuenta la cantidad comprada de cada producto. Si no hay stock suficiente, la transacción se aborta arrojando un error `400 Bad Request`.
2. **Sistema de Cupones:** Soporta el cupón oficial del proyecto `DUOC20`, aplicando un 20% de descuento automático en el total de la compra.
3. **Catálogo Oficial Semilla:** Carga automáticamente los 9 productos del catálogo de LevelUp (`PROD-001` a `PROD-009`) con sus descripciones, imágenes e inventarios.

---

## 4. Frontend React (`LevelUp2JEJE\LevelUp`)

Los servicios de integración con los dos microservicios se encuentran centralizados en:
- `src/services/api.js`: Cliente HTTP REST que apunta a los puertos `8081` (MS-Login) y `8082` (MS-Productos).
- `src/services/authService.js`: Fachada para login, registro, logout, manejo de JWT en `localStorage` y verificación de roles.
- `src/services/userService.js`: Fachada para operaciones CRUD de usuarios conectado a MS-Login con persistencia en MySQL.
- `src/services/productService.js`: Fachada para operaciones CRUD de catálogo.
- `src/Components/ProtectedRoute.jsx`: Componente de control de acceso para proteger rutas administrativas según el rol del usuario (`ROLE_ADMIN`).
- `src/Pages/AdminUsuarios.jsx`: Vista completa de administración de usuarios (CRUD, asignación de roles, métricas, filtros y modales).

### Pruebas Unitarias del Frontend:
El frontend cuenta con una suite completa de **106 pruebas unitarias** en Vitest, todas en estado aprobado (`106 passed`).

---

## 5. Instrucciones para Ejecutar los Microservicios

### Requisito Previo: Java 17
Asegúrate de ejecutar con Java 17 configurando `JAVA_HOME` en tu terminal PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
```

### Iniciar Microservicio 1 (MS-Login: 8081):
```powershell
cd "C:\Users\PC\Desktop\levelup-MSlogin\levelup-MSlogin"
.\mvnw.cmd spring-boot:run
```

### Iniciar Microservicio 2 (MS-Productos: 8082):
Abre una segunda terminal de PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
cd "C:\Users\PC\Desktop\levelup-MSproductos\levelup-MSproductos"
.\mvnw.cmd spring-boot:run
```

### Iniciar el Frontend React:
Abre una tercera terminal:
```powershell
cd "C:\Users\PC\Desktop\LevelUp2JEJE\LevelUp"
npm run dev
```