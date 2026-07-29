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
    
    // Reemplazar FILTER_SANITIZE_STRING (obsoleto) con alternativas modernas
    $nombre = !empty($_POST['nombre']) ? htmlspecialchars($_POST['nombre'], ENT_QUOTES, 'UTF-8') : null;
    $apellido = !empty($_POST['apellido']) ? htmlspecialchars($_POST['apellido'], ENT_QUOTES, 'UTF-8') : null;

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
    $stmt = $pdo->prepare("SELECT matricula FROM profesores WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    
    if ($stmt->fetch()) {
        throw new Exception("La matrícula ya está registrada");
    }

    // Insert new record
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO profesores (
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
    $_SESSION['success'] = "Profesor registrado exitosamente";
    
    // Redirección segura
    if (!headers_sent()) {
        header("Location: ../../../sesion/administrativo/alta-prof.php");
        exit();
    } else {
        echo "<script>window.location.href = '../../../sesion/administrativo/alta-prof.php';</script>";
        exit();
    }

} catch (PDOException $e) {
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    
    if (!headers_sent()) {
        header("Location: ../../../sesion/administrativo/alta-prof.php");
        exit();
    } else {
        echo "<script>window.location.href = '../../../sesion/administrativo/alta-prof.php';</script>";
        exit();
    }
    
} catch (Exception $e) {
    error_log("Error Registro: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    
    if (!headers_sent()) {
        header("Location: ../../../sesion/administrativo/alta-prof.php");
        exit();
    } else {
        echo "<script>window.location.href = '../../../sesion/administrativo/alta-prof.php';</script>";
        exit();
    }
}