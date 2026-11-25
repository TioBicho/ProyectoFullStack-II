# Especificación de Requisitos de Software (ERS)
**Proyecto:** Tienda Online Level-Up Gamer  
**Estándar:** IEEE 830  
**Revisión:** 3.0  
**Fecha de Actualización:** 23/11/2026  

---

## Ficha del Documento

| Fecha | Revisión | Autor(es) | Descripción del Cambio |
| :--- | :---: | :--- | :--- |
| 04/09/2026 | 1.0 | Vicente Cisternas, Benjamín Castro | Versión Inicial (Maqueta estática HTML/CSS/JS). |
| 09/09/2026 | 2.0 | Benjamín Castro, Vicente Cisternas | Modificación en restricciones, suposiciones y dependencias iniciales. |
| 23/11/2026 | 3.0 | Benjamín Castro, Vicente Cisternas | **Actualización Fullstack Integral:** Transición a arquitectura desacoplada de 2 Microservicios en Spring Boot 3 (Java 17), base de datos relacional MySQL/MariaDB en AWS EC2, Frontend SPA en React (Vite) en AWS S3, seguridad robusta con Spring Security 6, JWT, hashing BCrypt, control de acceso basado en roles (RBAC: `ROLE_ADMIN` y `ROLE_CLIENTE`), CRUDs REST completos con códigos HTTP estandarizados y suite de 107 pruebas automatizadas en Vitest. |

| Validación de Aprobación | |
| :--- | :--- |
| **Por el Cliente:** | **Por el Equipo de Desarrollo / Proveedor:** |
| [Firma] _____________________________ | [Firma] _____________________________ |
| Representante Level-Up Gamer | Jefe de Proyecto / Desarrollador Líder |

---

## 1. Introducción

### 1.1. Propósito
El propósito de este documento es definir, especificar y formalizar los requisitos funcionales y no funcionales para la versión de producción de la plataforma de comercio electrónico **Level-Up Gamer**. Este documento sirve como contrato técnico y guía de referencia para desarrolladores, evaluadores académicos, administradores de sistemas y partes interesadas (*stakeholders*).

### 1.2. Ámbito del Sistema
* **Nombre del sistema:** Plataforma E-Commerce Level-Up Gamer (Arquitectura Fullstack Desacoplada).
* **Lo que hace:**
  * Proporciona una tienda virtual de alto rendimiento con interfaz gamer moderna (modo oscuro/claro).
  * Autenticación y registro de usuarios con contraseñas encriptadas mediante algoritmos de derivación de claves (BCrypt) y tokens de sesión firmados criptográficamente (JWT).
  * Control de acceso estricto basado en roles (`ROLE_CLIENTE` y `ROLE_ADMIN`) tanto en la interfaz de React como en los filtros de seguridad de los microservicios backend.
  * Catálogo de productos interactivo con búsqueda en tiempo real, filtrado por categorías y vista detallada.
  * Carrito de compras reactivo con persistencia aislada por usuario autenticado (`user_cart_<email>`).
  * Módulos de administración completos (CRUD REST) para la gestión de productos y usuarios (creación, edición, eliminación y cambio de roles).
  * Persistencia real y transaccional en un motor de base de datos relacional MySQL / MariaDB desplegado en la nube.
* **Lo que no hace:**
  * No gestiona inventario físico de tiendas presenciales (es exclusivamente digital).
  * No procesa cobros bancarios reales mediante pasarelas de producción como Transbank Webpay o Stripe (simulado a nivel de checkout y validación de reglas de negocio).
* **Objetivos y beneficios:** Ofrecer una experiencia de compra fluida y segura, eliminar el almacenamiento de credenciales en texto plano o datos quemados en el navegador, garantizar la integridad de datos mediante microservicios independientes y permitir alta disponibilidad mediante infraestructura cloud en Amazon Web Services (AWS).

### 1.3. Definiciones, Acrónimos y Abreviaturas
* **ERS:** Especificación de Requisitos de Software.
* **IEEE:** Institute of Electrical and Electronics Engineers.
* **SPA:** *Single Page Application* (Aplicación de Página Única construida en React).
* **REST:** *Representational State Transfer* (Estilo de arquitectura para servicios web).
* **JWT:** *JSON Web Token* (Estándar abierto RFC 7519 para transmisión segura de identidad mediante tokens compactos y autofirmados).
* **BCrypt:** Función de hashing de contraseñas adaptativa basada en el cifrado Blowfish.
* **RBAC:** *Role-Based Access Control* (Control de acceso basado en roles).
* **CORS:** *Cross-Origin Resource Sharing* (Mecanismo de seguridad en navegadores para peticiones entre diferentes orígenes).
* **DTO:** *Data Transfer Object* (Objeto de transferencia de datos con validaciones de entrada).
* **JPA / Hibernate:** API de persistencia en Java y su framework de mapeo objeto-relacional (ORM).
* **AWS S3:** *Simple Storage Service* (Servicio de almacenamiento en la nube donde se aloja el frontend compilado).
* **AWS EC2:** *Elastic Compute Cloud* (Instancia de máquina virtual Linux donde se ejecutan los microservicios y la base de datos).
* **Vitest:** Entorno moderno de pruebas unitarias e integración para proyectos Vite.

### 1.4. Referencias
* Estándar IEEE 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
* Rúbrica de Evaluación DSY1104 - Evaluación Parcial 3, Duoc UC.
* Especificaciones OpenAPI 3.0 / Swagger UI de los microservicios de Login y Productos.
* Documento de Caso de Negocio: *Tienda LEVEL-UP GAMER*.

### 1.5. Visión General del Documento
El documento continúa en la Sección 2 con una visión general de la arquitectura, funciones del sistema, perfiles de usuario y restricciones tecnológicas. La Sección 3 detalla minuciosamente los requisitos específicos de interfaz, requisitos funcionales (RF) con sus códigos HTTP asociados, requisitos no funcionales (RNF), matriz de endpoints y catálogo de productos inicial.

---

## 2. Descripción General

### 2.1. Perspectiva del Producto
La plataforma **Level-Up Gamer** opera bajo una arquitectura distribuida y desacoplada compuesta por tres capas independientes:

```
+--------------------------------------------------------------------------+
|                       CAPA DE PRESENTACIÓN (CLIENTE)                     |
|  AWS S3 (Static Website Hosting) -> Single Page Application en React/Vite |
|  - Ruteo dinámico (React Router v6) y Protección de Rutas (ProtectedRoute) |
|  - Context API (CartContext) con persistencia por cuenta de usuario       |
|  - Consumo asíncrono de APIs REST mediante Fetch y Variables de Entorno  |
+------------------------------------+-------------------------------------+
                                     | (Peticiones HTTP/REST con Bearer JWT)
                                     v
+--------------------------------------------------------------------------+
|                  CAPA DE SERVICIOS (AWS EC2 - LINUX 2023)                |
|  Puerto 8081: Microservicio Auth & Usuarios (Spring Boot 3 / Java 17)    |
|  Puerto 8082: Microservicio Tienda & Productos (Spring Boot 3 / Java 17) |
|  - Spring Security 6 + Filtros JWT + Custom AccessDeniedHandler (403)     |
|  - Controladores REST, DTOs con Bean Validation, Documentación Swagger UI|
+------------------------------------+-------------------------------------+
                                     | (JDBC / JPA Hibernate)
                                     v
+--------------------------------------------------------------------------+
|                     CAPA DE DATOS (AWS EC2 / MYSQL)                      |
|  Base de Datos 1: levelup_auth_db   (Tablas: usuarios)                   |
|  Base de Datos 2: levelup_tienda_db (Tablas: productos, pedidos)         |
+--------------------------------------------------------------------------+
```

### 2.2. Funciones Principales del Producto
1. **Autenticación y Seguridad:** Registro de clientes, inicio de sesión contra base de datos, generación y validación de tokens JWT, encriptación BCrypt y cierre de sesión seguro.
2. **Catálogo y Búsqueda:** Navegación por catálogo con imágenes, precios, stock y descripción; filtrado en tiempo real por término de búsqueda y categoría.
3. **Carrito de Compras y Checkout:** Gestión reactiva de ítems, cálculo automático de subtotales, persistencia del carrito por usuario (inmune a cierres de sesión) y verificación de stock.
4. **Administración de Productos (Admin):** Módulo exclusivo para administradores que permite crear, editar y eliminar productos con persistencia en MySQL y validación de entradas.
5. **Administración de Usuarios (Admin):** Módulo para listar usuarios registrados, dar de alta nuevas cuentas, actualizar datos, alternar roles (`ROLE_CLIENTE` $\leftrightarrow$ `ROLE_ADMIN`) y dar de baja usuarios.

### 2.3. Características de los Usuarios
* **Cliente Gamer (`ROLE_CLIENTE`):** Usuario registrado o visitante que puede explorar productos, agregar ítems al carrito, registrar pedidos y gestionar su perfil. **Restricción:** No tiene autorización para invocar endpoints de creación, modificación o borrado de productos o usuarios (cualquier intento genera respuesta HTTP `403 Forbidden`).
* **Administrador (`ROLE_ADMIN`):** Usuario con privilegios elevados encargado del control de stock, mantenimiento del catálogo de productos y gobernanza de las cuentas de usuario y asignación de roles.

### 2.4. Restricciones del Sistema
* **Prohibición de Datos Quemados:** La aplicación no debe utilizar credenciales codificadas en duro (*hardcoded*) ni listas ficticias de prueba en el cliente. Toda información proviene de la base de datos a través de la API.
* **Seguridad Criptográfica:** Prohibición absoluta de almacenar contraseñas en texto plano. Se exige el uso de funciones hash de un solo sentido (BCrypt con factor de costo predeterminado).
* **Desacoplamiento Front/Back:** El cliente web no se conecta directamente a la base de datos; la comunicación es 100% a través de servicios RESTful mediante variables de entorno (`.env` con prefijo `VITE_`).
* **Manejo de CORS:** Los microservicios backend deben implementar configuraciones CORS explícitas permitiendo cabeceras de autorización (`Authorization`, `Content-Type`) y orígenes web remotos.
* **Restricción de Recursos en Servidor:** Al operar en instancias EC2 tipo *Burstable* (1 GB RAM), la máquina virtual debe contar con al menos 2 GB de espacio Swap activo y los microservicios deben limitar su memoria de montón Java (`-Xms128m -Xmx256m`) para evitar terminaciones abruptas del sistema operativo.
* **Compatibilidad de Navegadores:** Compatible con navegadores modernos (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) con soporte para JavaScript ES6+, HTML5 y CSS3.

### 2.5. Suposiciones y Dependencias
* Se asume conectividad a Internet bidireccional entre el navegador del usuario y la instancia AWS EC2 en los puertos HTTP `8081` y `8082`.
* Se asume la disponibilidad del servicio de base de datos MySQL/MariaDB escuchando en el puerto local `3306` dentro del entorno de ejecución de los microservicios.
* Se asume que el navegador del cliente tiene habilitado el soporte de `localStorage` para la conservación de la sesión JWT y el carrito de compras.

---

## 3. Requisitos Específicos

### 3.1. Requisitos de Interfaces

#### 3.1.1. Interfaces de Usuario (UI)
* **Identidad Visual Gamer:** Paleta cromática con fondo oscuro dominante (#000000, #121212), acentos en Azul Eléctrico (#1E90FF), Verde Neón (#39FF14) y Amarillo Alerta (#FFD700).
* **Soporte de Temas:** Conmutador interactivo de tema Claro / Oscuro (*Dark/Light Mode*) persistido en la sesión del usuario.
* **Diseño Responsivo:** Maquetación fluida mediante Bootstrap 5 adaptable a resoluciones móviles, tablets y monitores de escritorio.
* **Feedback al Usuario:** Implementación de modales de confirmación para acciones destructivas (eliminar producto o usuario), spinners e indicadores de carga (*cargando*), y alertas visuales automáticas para respuestas exitosas o errores de red.

#### 3.1.2. Interfaces de Hardware
* **Cliente:** Dispositivos con procesador estándar, mínimo 2 GB de RAM y pantalla con resolución mínima de 320px de ancho.
* **Servidor (AWS EC2):** Instancia virtual Linux (Amazon Linux 2023) con arquitectura x86_64, 1 vCPU, 1 GB RAM física y 2 GB de memoria Swap en disco EBS.

#### 3.1.3. Interfaces de Software
* **Backend Framework:** Spring Boot 3.x, Java 17 LTS, Spring Data JPA, Spring Security 6.
* **Frontend Framework:** React 18+, Vite 5+, React Router DOM v6.
* **Gestor de Base de Datos:** MariaDB 10.5 / MySQL 8.0.
* **Documentación de APIs:** OpenAPI 3 / Swagger UI integrado en los endpoints `/swagger-ui/index.html` de cada microservicio.

#### 3.1.4. Interfaces de Comunicación
* Protocolo de transferencia: HTTP/1.1 y HTTPS.
* Formato de intercambio de datos: `application/json; charset=UTF-8`.
* Mecanismo de autenticación: Encabezado HTTP `Authorization: Bearer <token_jwt>`.

---

### 3.2. Requisitos Funcionales

#### RF1: Registro Seguro de Usuarios
* **Actores:** Visitante / Cliente no autenticado.
* **Descripción:** El sistema debe permitir registrar una nueva cuenta de cliente en la base de datos `levelup_auth_db`.
* **Entradas:** Nombre completo, correo electrónico, contraseña, teléfono, región y comuna.
* **Reglas de Negocio:**
  * El correo debe tener formato válido y no estar registrado previamente (unicidad).
  * La contraseña debe ser cifrada con `BCryptPasswordEncoder` antes de persistirse en la base de datos; nunca se guarda texto plano.
  * El rol asignado por defecto al registrarse desde el formulario público es `ROLE_CLIENTE`.
  * La entidad `Usuario` debe excluir la contraseña en cualquier serialización JSON hacia el cliente (`@JsonProperty(access = WRITE_ONLY)`).
* **Códigos HTTP:** `201 Created` en éxito; `400 Bad Request` ante campos vacíos o correo duplicado.

#### RF2: Autenticación e Inicio de Sesión (Login con JWT)
* **Actores:** Cliente, Administrador.
* **Descripción:** Permite a los usuarios autenticarse contra el microservicio de autenticación.
* **Entradas:** Correo electrónico y contraseña.
* **Reglas de Negocio:**
  * El microservicio valida las credenciales comparando el hash BCrypt.
  * Si son válidas, genera un token JWT firmado con algoritmo HMAC-SHA256 que encapsula el correo y el rol (`ROLE_ADMIN` o `ROLE_CLIENTE`), con tiempo de expiración de 24 horas.
  * El frontend almacena el token y los datos de perfil básico en `localStorage`.
  * Si el servidor no responde o las credenciales son inválidas, la interfaz muestra el error correspondiente y **bajo ninguna circunstancia** permite el ingreso con datos quemados locales.
* **Códigos HTTP:** `200 OK` (retorna token, id, nombre, correo y rol); `401 Unauthorized` ante credenciales erróneas; `400 Bad Request` si faltan parámetros.

#### RF3: Cierre de Sesión (Logout) y Preservación de Estado
* **Actores:** Usuario autenticado (`ROLE_CLIENTE` o `ROLE_ADMIN`).
* **Descripción:** Permite al usuario terminar su sesión de forma segura.
* **Reglas de Negocio:**
  * El frontend elimina el token JWT y el objeto de usuario de `localStorage`.
  * El contenido actual del carrito de compras se respalda en una clave específica del usuario (`user_cart_<email>`) para que al volver a iniciar sesión en el futuro, sus productos agregados no se pierdan.

#### RF4: Control de Acceso y Rutas Protegidas (RBAC)
* **Actores:** Sistema, Cliente, Administrador.
* **Descripción:** Restringe el acceso a las vistas y operaciones de administración exclusivamente a usuarios con rol `ROLE_ADMIN`.
* **Reglas de Negocio:**
  * **En Frontend:** El componente `<ProtectedRoute>` intercepta la navegación a rutas administrativas (`/admin`, `/admin/usuarios`, `/admin/crear`, `/admin/editar/:id`). Si no hay sesión activa, redirige a `/login`. Si el rol es `ROLE_CLIENTE`, emite alerta de denegación y redirige a la página principal.
  * **En Backend:** Los filtros de Spring Security validan en cada petición que el token contenga la autoridad `ROLE_ADMIN`.
  * Si un usuario con rol `ROLE_CLIENTE` intenta consumir directamente un endpoint administrativo mediante herramientas externas (Postman, cURL, Swagger), el backend responde obligatoriamente con código HTTP **`403 Forbidden`** gestionado por `CustomAccessDeniedHandler`.
  * Si la petición carece de token, responde **`401 Unauthorized`**.

#### RF5: CRUD REST de Productos
* **Actores:** Cliente (solo lectura), Administrador (control total).
* **Descripción:** Gestión integral del catálogo de productos con persistencia en MySQL (`levelup_tienda_db`).
* **Operaciones y Códigos HTTP:**
  * `GET /api/productos`: Lista todos los productos disponibles (Público, responde `200 OK`).
  * `GET /api/productos/{id}`: Obtiene el detalle de un producto por su código (Público, responde `200 OK` o `404 Not Found`).
  * `POST /api/productos`: Registra un nuevo producto (Requiere `ROLE_ADMIN`, responde `201 Created` o `400 Bad Request`).
  * `PUT /api/productos/{id}`: Modifica los datos de un producto (Requiere `ROLE_ADMIN`, responde `200 OK`, `400 Bad Request` o `404 Not Found`).
  * `DELETE /api/productos/{id}`: Elimina permanentemente un producto (Requiere `ROLE_ADMIN`, responde `200 OK` o `404 Not Found`).
* **Validaciones DTO:** El código, nombre, categoría, URL de imagen y descripción son obligatorios; el precio debe ser $\ge 0.0$ y el stock debe ser un entero $\ge 0$.

#### RF6: CRUD REST de Usuarios y Gestión de Roles
* **Actores:** Administrador (`ROLE_ADMIN`).
* **Descripción:** Módulo administrativo para la gobernanza de usuarios en `levelup_auth_db`.
* **Operaciones y Códigos HTTP:**
  * `GET /api/usuarios`: Retorna la nómina completa de usuarios (Requiere `ROLE_ADMIN`, responde `200 OK`).
  * `GET /api/usuarios/{id}`: Retorna la información de un usuario específico (Requiere `ROLE_ADMIN`, responde `200 OK` o `404 Not Found`).
  * `POST /api/usuarios`: Da de alta un nuevo usuario definiendo rol inicial y contraseña encriptada (Requiere `ROLE_ADMIN`, responde `201 Created`).
  * `PUT /api/usuarios/{id}`: Actualiza información de contacto, región y comuna (Requiere `ROLE_ADMIN`, responde `200 OK`).
  * `PATCH /api/usuarios/{id}/rol`: Modifica exclusivamente el rol del usuario (Requiere `ROLE_ADMIN`, responde `200 OK`).
  * `DELETE /api/usuarios/{id}`: Elimina la cuenta de usuario (Requiere `ROLE_ADMIN`, responde `200 OK`). El sistema bloquea en el frontend que el administrador en sesión se elimine a sí mismo.

#### RF7: Carrito de Compras Reactivo
* **Actores:** Cliente, Visitante.
* **Descripción:** Proporciona un contenedor temporal de compras interactivo.
* **Reglas de Negocio:**
  * Permite añadir productos desde el catálogo, incrementar/decrementar cantidades y remover ítems.
  * Calcula en tiempo real subtotales y cantidades totales de ítems.
  * El carrito se enlaza al correo del usuario al iniciar sesión, restaurando automáticamente compras previas no finalizadas.

#### RF8: Gestión de Pedidos y Descuentos
* **Actores:** Cliente autenticado.
* **Descripción:** Permite consolidar la orden de compra en `levelup_tienda_db`.
* **Reglas de Negocio:**
  * Valida que exista stock suficiente en la base de datos para cada producto antes de confirmar el pedido; de lo contrario aborta la transacción (`400 Bad Request`).
  * Aplica descuento del 20% si el usuario ingresa el cupón institucional `DUOC20` o posee correo institucional Duoc UC.

---

### 3.3. Requisitos No Funcionales (RNF)

#### RNF1: Seguridad de la Información
* Todas las contraseñas deben estar procesadas mediante el algoritmo hash BCrypt con sal (*salt*) aleatoria integrada.
* Los tokens de sesión deben estar cifrados con HMAC-SHA256 con una clave secreta de al menos 256 bits (`app.jwt.secret`).
* Las rutas internas de error y los manejadores de excepciones (`CustomAccessDeniedHandler` y `JwtAuthenticationEntryPoint`) deben interceptar accesos no autorizados y devolver esquemas JSON estructurados sin exponer trazas de la pila (*stack traces*) al usuario final.

#### RNF2: Rendimiento y Optimización de Memoria
* El paquete cliente de producción generado por Vite debe estar minificado y comprimido, con un peso inferior a 400 KB en scripts principales.
* La máquina virtual EC2 debe mantener los procesos Java Spring Boot acotados dentro de parámetros `-Xms128m -Xmx256m`, con soporte de 2 GB de memoria de intercambio (Swap), garantizando una utilización de memoria física estable inferior al 80%.

#### RNF3: Fiabilidad y Persistencia de Datos
* Toda modificación realizada sobre usuarios o productos debe persistirse de forma síncrona en las tablas de MySQL mediante transacciones JPA (`@Transactional`).
* Si se interrumpe el suministro de energía o se reinicia la instancia EC2, la base de datos MariaDB/MySQL debe iniciar de forma automática al arranque del sistema operativo (*systemd enabled*).

#### RNF4: Disponibilidad
* Los servicios web y la documentación OpenAPI deben operar con una disponibilidad continua 24/7 en los puertos asignados (`8081` y `8082`), accesibles públicamente desde cualquier dispositivo conectado a Internet.

#### RNF5: Mantenibilidad y Calidad de Código
* El código fuente del frontend debe estar desacoplado en una capa de servicios (`src/services/api.js`, `userService.js`, `productService.js`, `authService.js`).
* La solución debe mantener una batería de pruebas automatizadas en Vitest con **107 pruebas unitarias y de integración pasando al 100% de forma exitosa**, cubriendo validaciones de formularios, operaciones del carrito, ruteo y componentes visuales.

#### RNF6: Portabilidad y Despliegue en la Nube
* El frontend debe poder ejecutarse en cualquier proveedor de alojamiento estático (AWS S3, Vercel, Netlify) sin requerir modificaciones en el código fuente, gobernado únicamente por variables de entorno `.env`.
* El backend debe ser multiplataforma gracias a la Máquina Virtual de Java (JVM 17), capaz de ejecutarse en entornos Linux (Amazon Linux 2023 / Ubuntu) y Windows.

---

## 4. Matriz de Endpoints REST y Códigos HTTP de Respuesta

| Microservicio | Método | Endpoint | Rol Mínimo | Códigos HTTP Soportados |
| :--- | :---: | :--- | :---: | :--- |
| **MS-Login (8081)** | `POST` | `/api/auth/register` | Público | `201 Created`, `400 Bad Request` |
| **MS-Login (8081)** | `POST` | `/api/auth/login` | Público | `200 OK`, `400 Bad Request`, `401 Unauthorized` |
| **MS-Login (8081)** | `GET` | `/api/usuarios` | `ROLE_ADMIN` | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| **MS-Login (8081)** | `GET` | `/api/usuarios/{id}` | `ROLE_ADMIN` | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **MS-Login (8081)** | `POST` | `/api/usuarios` | `ROLE_ADMIN` | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` |
| **MS-Login (8081)** | `PUT` | `/api/usuarios/{id}` | `ROLE_ADMIN` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **MS-Login (8081)** | `PATCH`| `/api/usuarios/{id}/rol` | `ROLE_ADMIN` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **MS-Login (8081)** | `DELETE`| `/api/usuarios/{id}` | `ROLE_ADMIN` | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **MS-Productos (8082)** | `GET` | `/api/productos` | Público | `200 OK` |
| **MS-Productos (8082)** | `GET` | `/api/productos/{id}` | Público | `200 OK`, `404 Not Found` |
| **MS-Productos (8082)** | `POST` | `/api/productos` | `ROLE_ADMIN` | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` |
| **MS-Productos (8082)** | `PUT` | `/api/productos/{id}` | `ROLE_ADMIN` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **MS-Productos (8082)** | `DELETE`| `/api/productos/{id}` | `ROLE_ADMIN` | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **MS-Productos (8082)** | `POST` | `/api/pedidos` | Autenticado | `201 Created`, `400 Bad Request` |
| **MS-Productos (8082)** | `GET` | `/api/pedidos` | `ROLE_ADMIN` | `200 OK`, `401 Unauthorized`, `403 Forbidden` |

---

## 5. Catálogo Oficial Semilla de Productos (Base de Datos MySQL)

| Código (ID) | Categoría | Nombre | Precio (CLP) | Stock | Imagen Oficial |
| :---: | :--- | :--- | :---: | :---: | :--- |
| `JM001` | Juegos de Mesa | Catan | $29.990 | 15 | `/imagenes/catan.jpg` |
| `JM002` | Juegos de Mesa | Carcassonne | $24.990 | 12 | `/imagenes/carcassonne.jpg` |
| `AC001` | Accesorios | Controlador Inalámbrico Xbox Series X | $59.990 | 20 | `/imagenes/mando.jpg` |
| `AC002` | Accesorios | Auriculares Gamer HyperX Cloud II | $79.990 | 8 | `/imagenes/hyperxcloud2.jpg` |
| `CO001` | Consolas | PlayStation 5 | $549.990 | 5 | `/imagenes/ps5.jpg` |
| `CG001` | Computadores Gamers | PC Gamer ASUS ROG Strix | $1.299.990 | 3 | `/imagenes/asusrog.jpg` |
| `SG001` | Sillas Gamers | Silla Gamer Secretlab Titan | $349.990 | 6 | `/imagenes/sillagamer.jpg` |
| `MS001` | Mouse | Mouse Gamer Logitech G502 HERO | $29.990 | 25 | `/imagenes/g502.jpg` |
| `MP001` | Mousepad | Mousepad Razer Goliathus Extended Chroma | $29.990 | 18 | `/imagenes/mousepadrazer.jpg` |

---

## 6. Cuadro de Cuentas Semilla Iniciales

| Rol | Nombre | Correo Electrónico | Contraseña Inicial | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `ROLE_ADMIN` | Administrador LevelUp | `admin@levelup.cl` | `Admin123!` | Administración de inventario, catálogo y gobernanza de usuarios. |
| `ROLE_CLIENTE` | Benjamin Castro | `cliente@levelup.cl` | `User123!` | Compras, carrito de compras, checkout y pruebas de restricción 403. |
