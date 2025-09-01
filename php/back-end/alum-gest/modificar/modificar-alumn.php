<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Validate CSRF Token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '')) {
        throw new Exception("Token CSRF inválido");
    }

    // Validate data
    if (empty($_POST['alumno'])) {
        throw new Exception("No se proporcionaron datos para modificar");
    }

    $alumno = json_decode($_POST['alumno'], true);
    if (!is_array($alumno)) {
        throw new Exception("Datos de alumno inválidos");
    }

    // Database connection
    $databasePath = '../../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    $matricula = filter_var($alumno['matricula'], FILTER_VALIDATE_INT);
    $nombre = filter_var($alumno['nombre'], FILTER_SANITIZE_STRING);
    $apellido = filter_var($alumno['apellido'], FILTER_SANITIZE_STRING);
    $contrasena = $alumno['contrasena'];
    $telefono = filter_var($alumno['telefono'], FILTER_VALIDATE_INT);
    $email = filter_var($alumno['email'], FILTER_SANITIZE_EMAIL);

    // Validate matricula
    if (!$matricula || $matricula < 1) {
        throw new Exception("Matrícula inválida");
    }

    // Validate nombre
    if (empty($nombre)) {
        throw new Exception("El nombre es requerido");
    }

    // Validate apellido
    if (empty($apellido)) {
        throw new Exception("El apellido es requerido");
    }

    // Validate telefono
    if (!$telefono || $telefono < 1) {
        throw new Exception("Teléfono inválido");
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }

    // Check if student exists
    $stmt = $pdo->prepare("SELECT matricula FROM alumnos WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    if (!$stmt->fetch()) {
        throw new Exception("El alumno no existe");
    }

    // Prepare update query
    $query = "UPDATE alumnos SET nombre = :nombre, apellido = :apellido, telefono = :telefono, email = :email";
    $params = [
        ':matricula' => $matricula,
        ':nombre' => $nombre,
        ':apellido' => $apellido,
        ':telefono' => $telefono,
        ':email' => $email
    ];

    // Handle password if provided
    if (!empty($contrasena)) {
        if (strlen($contrasena) < 8 || !preg_match('/[A-Za-z]/', $contrasena) || !preg_match('/[0-9]/', $contrasena)) {
            throw new Exception("La contraseña debe tener al menos 8 caracteres, incluyendo letras y números");
        }
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $query .= ", contrasena = :contrasena";
        $params[':contrasena'] = $hash;
    }

    $query .= " WHERE matricula = :matricula";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    $pdo->commit();

    // Success
    $_SESSION['success'] = "Alumno modificado exitosamente";
    header("Location: ../../../sesion/administrativo/mod-elim-alumn.php");
    exit();

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../../../sesion/administrativo/mod-elim-alumn.php");
    exit();
} catch (Exception $e) {
    error_log("Error Modificación: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../../sesion/administrativo/mod-elim-alumn.php");
    exit();
}