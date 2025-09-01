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

    // Validate matricula
    if (empty($_POST['matricula_delete'])) {
        throw new Exception("La matrícula es requerida");
    }

    $matricula = filter_var($_POST['matricula_delete'], FILTER_VALIDATE_INT);
    if (!$matricula || $matricula < 1) {
        throw new Exception("Matrícula inválida");
    }

    // Database connection
    $databasePath = '../../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Search for professor
    $stmt = $pdo->prepare("SELECT matricula, nombre, apellido, contrasena, telefono, email FROM profesores WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$professor) {
        throw new Exception("Usuario no registrado");
    }

    // Store professor info for confirmation
    $_SESSION['delete_info'] = $professor;
    header("Location: ../../../sesion/administrativo/mod-elim-prof.php");
    exit();

} catch (PDOException $e) {
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../../../sesion/administrativo/mod-elim-prof.php");
    exit();
} catch (Exception $e) {
    error_log("Error Búsqueda: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../../sesion/administrativo/mod-elim-prof.php");
    exit();
}