<?php
session_start();

// Habilita errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // 1. Validar CSRF Token
    if (!isset($_POST['csrf_token'])) {
        throw new Exception("Token CSRF no proporcionado");
    }
    
    if ($_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '')) {
        throw new Exception("Token CSRF inválido");
    }

    // 2. Validar y sanitizar datos
    $requiredFields = ['matricula', 'password', 'telefono', 'email'];
    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("El campo $field es requerido");
        }
    }

    $matricula = filter_var($_POST['matricula'], FILTER_VALIDATE_INT);
    $telefono = filter_var($_POST['telefono'], FILTER_VALIDATE_INT);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    if (!$matricula || $matricula < 1) {
        throw new Exception("Matrícula inválida");
    }

    if (!$telefono || $telefono < 1) {
        throw new Exception("Teléfono inválido");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Correo electrónico inválido");
    }

    if (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        throw new Exception("La contraseña debe contener letras y números (mínimo 8 caracteres)");
    }

    // 3. Conexión a la base de datos
    $databasePath = '../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Verificar si la matrícula ya existe
    $stmt = $pdo->prepare("SELECT matricula FROM alumnos WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    
    if ($stmt->fetch()) {
        throw new Exception("La matrícula ya está registrada");
    }

    // 5. Insertar nuevo registro
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO alumnos (
            matricula,
            contrasena,
            telefono,
            email,
            reset_token,
            reset_expira
        ) VALUES (
            :matricula,
            :contrasena,
            :telefono,
            :email,
            NULL,
            NULL
        )
    ");

    $stmt->execute([
        ':matricula' => $matricula,
        ':contrasena' => $hash,
        ':telefono' => $telefono,
        ':email' => $email
    ]);

    // 6. Redirigir con éxito
    $_SESSION['success'] = "Alumno registrado exitosamente";
    header("Location: ../reg-alumn.php");
    exit();

} catch (PDOException $e) {
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../reg-alumn.php");
    exit();
} catch (Exception $e) {
    error_log("Error Registro: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../reg-alumn.php");
    exit();
}