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
    if (empty($_POST['profesor'])) {
        throw new Exception("No se proporcionaron datos para modificar");
    }

    $profesor = json_decode($_POST['profesor'], true);
    if (!is_array($profesor)) {
        throw new Exception("Datos de profesor inválidos");
    }

    // Database connection
    $databasePath = '../../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    $matricula = filter_var($profesor['matricula'], FILTER_VALIDATE_INT);
    $nombre = filter_var($profesor['nombre'], FILTER_SANITIZE_STRING);
    $apellido = filter_var($profesor['apellido'], FILTER_SANITIZE_STRING);
    $contrasena = $profesor['contrasena'];
    $telefono = filter_var($profesor['telefono'], FILTER_VALIDATE_INT);
    $email = filter_var($profesor['email'], FILTER_SANITIZE_EMAIL);

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

    // Check if professor exists
    $stmt = $pdo->prepare("SELECT matricula FROM profesores WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    if (!$stmt->fetch()) {
        throw new Exception("El profesor no existe");
    }

    // Prepare update query
    $query = "UPDATE profesores SET nombre = :nombre, apellido = :apellido, telefono = :telefono, email = :email";
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
    $_SESSION['success'] = "Profesor modificado exitosamente";
    header("Location: ../../../sesion/administrativo/mod-elim-prof.php");
    exit();

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../../../sesion/administrativo/mod-elim-prof.php");
    exit();
} catch (Exception $e) {
    error_log("Error Modificación: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../../sesion/administrativo/mod-elim-prof.php");
    exit();
}