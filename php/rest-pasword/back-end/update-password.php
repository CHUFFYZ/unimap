<?php
session_start();

// Habilita errores para desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // 1. Validar sesión y CSRF Token
    if (!isset($_SESSION['tipo_usuario'], $_SESSION['reset_token'], $_SESSION['reset_matricula'])) {
        throw new Exception("Acceso no autorizado: Sesión inválida");
    }

    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        throw new Exception("Token CSRF inválido");
    }

   
    // 2. Validar datos del formulario
    $password = $_POST['password'] ?? null;
    $confirm = $_POST['confirm_password'] ?? null;

    if ($password !== $confirm) {
        throw new Exception("Las contraseñas no coinciden");
    }

    if (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        throw new Exception("Mínimo 8 caracteres con letras y números");
    }

    // 3. Conexión a la base de datos
    $databasePath = '../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Actualizar contraseña y limpiar token
    $tabla = ($_SESSION['tipo_usuario'] == 'alumno') ? 'alumnos' : 'administrativos';
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        UPDATE $tabla 
        SET contrasena = :hash,
            reset_token = NULL,
            reset_expira = NULL 
        WHERE matricula = :matricula
    ");

    $stmt->execute([
        ':hash' => $hash,
        ':matricula' => $_SESSION['reset_matricula']
    ]);

    // 5. Limpiar sesión y redirigir
    session_unset();
    session_destroy();

    // Iniciar nueva sesión para el mensaje de éxito
    session_start();
    $_SESSION['success'] = "¡Contraseña actualizada exitosamente!";
    header("Location: ../rest-contra.php");
    exit();

} catch (PDOException $e) {
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../rest-contra.php?token=" . ($_SESSION['reset_token'] ?? ''));
    exit();
} catch (Exception $e) {
    error_log("Error General: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../rest-contra.php?token=" . ($_SESSION['reset_token'] ?? ''));
    exit();
}