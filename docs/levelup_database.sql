-- ============================================================================
-- SCRIPT DE BASE DE DATOS COMPLETA - LEVEL-UP GAMER E-COMMERCE
-- Proyecto: LevelUp Gamer (Arquitectura de Microservicios Fullstack)
-- Motor: MySQL 8.0 / MariaDB 10.5+
-- Codificación: UTF-8 (utf8mb4 / utf8mb4_unicode_ci)
-- Fecha de Generación: Noviembre 2026
-- Descripción:
--   Este script crea y puebla las dos bases de datos del sistema:
--   1. levelup_auth_db   -> Microservicio 1 (MS-Login / Auth, Usuarios, Roles y BCrypt)
--   2. levelup_tienda_db -> Microservicio 2 (MS-Productos / Catálogo, Stock, Pedidos)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================================
-- 1. BASE DE DATOS: levelup_auth_db (MICROSERVICIO DE AUTH Y USUARIOS - PUERTO 8081)
-- ============================================================================
CREATE DATABASE IF NOT EXISTS `levelup_auth_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `levelup_auth_db`;

-- ----------------------------------------------------------------------------
-- Tabla: usuarios
-- Almacena las cuentas registradas con contraseñas encriptadas en BCrypt
-- y control de acceso basado en roles (ROLE_ADMIN y ROLE_CLIENTE).
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(150) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(30) DEFAULT NULL,
  `region` VARCHAR(100) DEFAULT NULL,
  `comuna` VARCHAR(100) DEFAULT NULL,
  `rol` VARCHAR(30) NOT NULL DEFAULT 'ROLE_CLIENTE',
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Poblado de datos iniciales (Semillas) para levelup_auth_db
-- Contraseña de admin@levelup.cl   -> Admin123!
-- Contraseña de cliente@levelup.cl -> User123!
-- Hashes BCrypt generados con salt de 10 rondas (compatibles con Spring Security)
-- ----------------------------------------------------------------------------
INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contrasena`, `telefono`, `region`, `comuna`, `rol`, `fecha_creacion`) VALUES
(1, 'Administrador LevelUp', 'admin@levelup.cl', '$2a$10$h3lw6uu9qctZq7mBaiOrg.RY5b317Woy82qGBpM/haDNPQJH.5z8y', '+56 9 9999 8888', 'Region Metropolitana', 'Santiago', 'ROLE_ADMIN', '2026-11-20 10:00:00'),
(2, 'Benjamin Castro', 'cliente@levelup.cl', '$2a$10$gHdSSSL7/sB7FCmmR6JQxui4aWAF66KDCHMGTeuYN9NH/dg6PQWAa', '+56 9 1234 5678', 'Region de Valparaiso', 'Viña del Mar', 'ROLE_CLIENTE', '2026-11-20 10:05:00'),
(3, 'Vicente Cisternas', 'vicente@levelup.cl', '$2a$10$gHdSSSL7/sB7FCmmR6JQxui4aWAF66KDCHMGTeuYN9NH/dg6PQWAa', '+56 9 8765 4321', 'Region del bio Bio', 'Concepcion', 'ROLE_CLIENTE', '2026-11-21 14:30:00');


-- ============================================================================
-- 2. BASE DE DATOS: levelup_tienda_db (MICROSERVICIO DE PRODUCTOS - PUERTO 8082)
-- ============================================================================
CREATE DATABASE IF NOT EXISTS `levelup_tienda_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `levelup_tienda_db`;

-- ----------------------------------------------------------------------------
-- Tabla: productos
-- Almacena el inventario oficial de la tienda gamer (catálogo de 9 productos)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `detalle_pedidos`;
DROP TABLE IF EXISTS `pedidos`;
DROP TABLE IF EXISTS `productos`;

CREATE TABLE `productos` (
  `id` VARCHAR(50) NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `categoria` VARCHAR(100) NOT NULL,
  `precio` DECIMAL(12,2) NOT NULL,
  `img` VARCHAR(255) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 10,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Poblado del catálogo oficial de productos de Level-Up Gamer
-- ----------------------------------------------------------------------------
INSERT INTO `productos` (`id`, `nombre`, `categoria`, `precio`, `img`, `descripcion`, `stock`) VALUES
('JM001', 'Catan', 'Juegos de Mesa', 29990.00, '/imagenes/catan.jpg', 'Clásico juego de estrategia, comercio y colonización de islas para 3 a 4 jugadores.', 15),
('JM002', 'Carcassonne', 'Juegos de Mesa', 24990.00, '/imagenes/carcassonne.jpg', 'Juego de colocación de losetas medievales, castillos, caminos y monasterios.', 12),
('AC001', 'Controlador Inalámbrico Xbox Series X', 'Accesorios', 59990.00, '/imagenes/mando.jpg', 'Mando ergonómico inalámbrico con agarre texturizado y botón para compartir contenido.', 20),
('AC002', 'Auriculares Gamer HyperX Cloud II', 'Accesorios', 79990.00, '/imagenes/hyperxcloud2.jpg', 'Sonido envolvente 7.1 virtual con almohadillas de espuma viscoelástica para máxima comodidad.', 8),
('CO001', 'PlayStation 5', 'Consolas', 549990.00, '/imagenes/ps5.jpg', 'Consola de última generación con retroalimentación háptica, audio 3D y disco SSD ultra rápido.', 5),
('CG001', 'PC Gamer ASUS ROG Strix', 'Computadores Gamers', 1299990.00, '/imagenes/asusrog.jpg', 'Potente torre gamer con procesador Intel Core i7, tarjeta gráfica RTX 4070 y refrigeración líquida.', 3),
('SG001', 'Silla Gamer Secretlab Titan', 'Sillas Gamers', 349990.00, '/imagenes/sillagamer.jpg', 'Silla de diseño ergonómico premium tapizada en cuero sintético PRIME 2.0 y soporte lumbar integrado.', 6),
('MS001', 'Mouse Gamer Logitech G502 HERO', 'Mouse', 29990.00, '/imagenes/g502.jpg', 'Sensor óptico de alta precisión con hasta 25.600 DPI, pesas ajustables e iluminación RGB LIGHTSYNC.', 25),
('MP001', 'Mousepad Razer Goliathus Extended Chroma', 'Mousepad', 29990.00, '/imagenes/mousepadrazer.jpg', 'Superficie de microtextura optimizada para precisión de ratón e iluminación Razer Chroma RGB.', 18);

-- ----------------------------------------------------------------------------
-- Tabla: pedidos
-- Almacena las órdenes procesadas en el checkout de la tienda
-- ----------------------------------------------------------------------------
CREATE TABLE `pedidos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT DEFAULT NULL,
  `nombre_cliente` VARCHAR(100) DEFAULT NULL,
  `correo_cliente` VARCHAR(150) DEFAULT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total` DECIMAL(12,2) NOT NULL,
  `descuento` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cupon` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabla: detalle_pedidos
-- Almacena los ítems específicos comprados en cada orden
-- ----------------------------------------------------------------------------
CREATE TABLE `detalle_pedidos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pedido_id` BIGINT NOT NULL,
  `producto_id` VARCHAR(50) NOT NULL,
  `nombre_producto` VARCHAR(150) NOT NULL,
  `precio_unitario` DECIMAL(12,2) NOT NULL,
  `cantidad` INT NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_detalle_pedido_id` (`pedido_id`),
  CONSTRAINT `fk_detalle_pedidos_pedido`
    FOREIGN KEY (`pedido_id`)
    REFERENCES `pedidos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Poblado de pedidos de ejemplo (Para demostración de checkout y métricas)
-- ----------------------------------------------------------------------------
INSERT INTO `pedidos` (`id`, `usuario_id`, `nombre_cliente`, `correo_cliente`, `fecha`, `total`, `descuento`, `cupon`) VALUES
(1, 2, 'Benjamin Castro', 'cliente@levelup.cl', '2026-11-22 18:30:00', 89980.00, 0.00, NULL),
(2, 3, 'Vicente Cisternas', 'vicente@levelup.cl', '2026-11-23 11:20:00', 47992.00, 11998.00, 'LEVELUP20');

INSERT INTO `detalle_pedidos` (`id`, `pedido_id`, `producto_id`, `nombre_producto`, `precio_unitario`, `cantidad`, `subtotal`) VALUES
(1, 1, 'AC001', 'Controlador Inalámbrico Xbox Series X', 59990.00, 1, 59990.00),
(2, 1, 'JM001', 'Catan', 29990.00, 1, 29990.00),
(3, 2, 'AC001', 'Controlador Inalámbrico Xbox Series X', 59990.00, 1, 59990.00);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
