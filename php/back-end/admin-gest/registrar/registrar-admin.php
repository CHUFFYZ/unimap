<?php
session_start();

// Enable errors for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Validate CSRF Token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '')) {
        throw new Exception("Token CSRF inválido");
    }

    // Validate and sanitize required data
    $requiredFields = ['matricula', 'password', 'email'];
    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    $matricula = filter_var($_POST['matricula'], FILTER_VALIDATE_INT);
    $password = $_POST['password'];
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $telefono = !empty($_POST['telefono']) ? filter_var($_POST['telefono'], FILTER_VALIDATE_INT) : null;
    $nombre = !empty($_POST['nombre']) ? filter_var($_POST['nombre'], FILTER_SANITIZE_STRING) : null;
    $apellido = !empty($_POST['apellido']) ? filter_var($_POST['apellido'], FILTER_SANITIZE_STRING) : null;

    if (!$matricula || $matricula < 1) {
        throw new Exception("Matrícula inválida");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Correo electrónico inválido");
    }

    if (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        throw new Exception("La contraseña debe contener letras y números (mínimo 8 caracteres)");
    }

    if ($telefono !== null && (!$telefono || $telefono < 1)) {
        throw new Exception("Teléfono inválido");
    }

    // Database connection
    $databasePath = '../../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if matricula exists
    $stmt = $pdo->prepare("SELECT matricula FROM administrativos WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    
    if ($stmt->fetch()) {
        throw new Exception("La matrícula ya está registrada");
    }

    // Insert new record
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO administrativos (
            matricula,
            nombre,
            apellido,
            contrasena,
            telefono,
            email,
            reset_token,
            reset_expira
        ) VALUES (
            :matricula,
            :nombre,
            :apellido,
            :contrasena,
            :telefono,
            :email,
            NULL,
            NULL
        )
    ");

    $stmt->execute([
        ':matricula' => $matricula,
        ':nombre' => $nombre,
        ':apellido' => $apellido,
        ':contrasena' => $hash,
        ':telefono' => $telefono,
        ':email' => $email
    ]);

    // Success
    $_SESSION['success'] = "Administrativo registrado exitosamente";
    header("Location: ../../../sesion/administrativo/alta-admin.php");
    exit();

} catch (PDOException $e) {
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../../../sesion/administrativo/alta-admin.php");
    exit();
} catch (Exception $e) {
    error_log("Error Registro: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../../sesion/administrativo/alta-admin.php");
    exit();
}