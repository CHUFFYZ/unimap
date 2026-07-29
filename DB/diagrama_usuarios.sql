--
-- Archivo generado con SQLiteStudio v3.4.16 el dom. sep. 7 23:52:01 2025
--
-- Codificación de texto usada: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Tabla: administrativos
CREATE TABLE IF NOT EXISTS administrativos (nombre TEXT, apellido TEXT, matricula INTEGER PRIMARY KEY UNIQUE NOT NULL, contrasena TEXT NOT NULL, telefono INTEGER, email TEXT, reset_token TEXT, reset_expira TEXT);
INSERT INTO administrativos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Alan', 'Bracamontes de la Cruz', 210348, '$2y$10$TYx6Pp8UBP8/29eCqPl48ete/89m/2q10YjGICABQN7w4tZIQgQDu', 9381069334, 'alanbracamontesdlc@gmail.com', NULL, NULL);
INSERT INTO administrativos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Jose del Carmen', 'Guerra Mendez', 210379, '$2y$10$DbgCtxD/jQ69MJnwKmnbRuUkGzLtE71kLnRDcWPmcBooM3lkDGbZW', 9381563508, 'chosero14@gmail.com', '874643808f3df23d9cff5dfb8d0ce0162b770d34dfdfba527591e76bd9b54ebd313d68217852662015f6630541c8fed7887d', '2025-08-11 18:02:09');

-- Tabla: alumnos
CREATE TABLE IF NOT EXISTS alumnos (nombre TEXT, apellido TEXT, matricula INTEGER PRIMARY KEY UNIQUE NOT NULL, contrasena TEXT NOT NULL, telefono INTEGER, email TEXT, reset_token TEXT, reset_expira TEXT);
INSERT INTO alumnos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('la neta del ', 'planeta', 8888, '$2y$10$7nw8OqA12yp0j5Ci.54Pcedpmu68t6XfCtXSlxSlX268oXLx91vzK', 54654655, '210379@aksfmaf.com', NULL, NULL);
INSERT INTO alumnos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Alan', 'Bracamontes de la Cruz', 210348, '$2y$10$/yRQEp16tl1r6deKRVkd7eBkJ6TZxoenbSFQ9XVaKWEDQloDlEdVK', 9381069334, 'alanbracamontesdlc@gmail.com', '93c0c6c4813d014ad19b2342abc1391cb87017273b2d13bc6ee19c98fb1018bfb71a7d3ab9dfbd8f95e0f3883755954f8685', '2025-05-18 21:28:33');
INSERT INTO alumnos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Carlos Alberto', 'Guerra Rodriguez', 210379, '$2y$10$4jzcQRxOhUnxQN5Y27tvJusjP1Lioikp3gMGcJJYwtPrRaC6B2Et.', 9380146569, 'chosero14@gmail.com', NULL, NULL);
INSERT INTO alumnos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Miguel Ángel ', 'Pérez Chan', 210684, '$2y$10$4shbHb18ugEdG6eca1ZhNu3shtLcbexzLU87L2jOmzClR36uxOm6u', 9381010060, '210684@mail.unacar.mx', NULL, NULL);
INSERT INTO alumnos (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Jefe', 'Maestro', 999999, '$2y$10$vvFh4ckq6ZXcwuuFUklnnO.FWaDvBTQHC14raY5PLHxiA9CGaO4dS', 9645658452, 'user-unknown@gmail.com', NULL, NULL);

-- Tabla: profesores
CREATE TABLE IF NOT EXISTS profesores (nombre TEXT, apellido TEXT, matricula INTEGER PRIMARY KEY UNIQUE NOT NULL, contrasena TEXT NOT NULL, telefono INTEGER, email TEXT, reset_token TEXT, reset_expira TEXT);
INSERT INTO profesores (nombre, apellido, matricula, contrasena, telefono, email, reset_token, reset_expira) VALUES ('Jose Angel', ' Perez Rejon', 680, '$2y$10$iRSsF7QQtHtCmJaEFVS/NenfhGcbS2TKdoB5t7ZWrAkPQp2abCRE6', 9381563508, 'chosero14@gmail.com', NULL, NULL);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
