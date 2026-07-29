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

    // Validate matriculas
    if (empty($_POST['matriculas'])) {
        throw new Exception("No se seleccionaron alumnos para eliminar");
    }

    $matriculas = json_decode($_POST['matriculas'], true);
    if (!is_array($matriculas) || empty($matriculas)) {
        throw new Exception("Lista de matrículas inválida");
    }

    // Database connection
    $databasePath = '../../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();
    $deletedCount = 0;

    foreach ($matriculas as $matricula) {
        $matricula = filter_var($matricula, FILTER_VALIDATE_INT);
        if (!$matricula || $matricula < 1) {
            continue;
        }

        // Check if student exists
        $stmt = $pdo->prepare("SELECT matricula FROM alumnos WHERE matricula = :matricula");
        $stmt->execute([':matricula' => $matricula]);
        if ($stmt->fetch()) {
            // Delete student
            $stmt = $pdo->prepare("DELETE FROM alumnos WHERE matricula = :matricula");
            $stmt->execute([':matricula' => $matricula]);
            $deletedCount++;
        }
    }

    $pdo->commit();

    // Clear any existing delete_info to avoid confusion
    unset($_SESSION['delete_info']);

    // Success
    $_SESSION['success'] = "$deletedCount alumnos eliminados exitosamente";
    header("Location: ../../../sesion/administrativo/mod-elim-alumn.php");
    exit();

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico: " . $e->getMessage();
    header("Location: ../../../sesion/administrativo/mod-elim-alumn.php");
    exit();
} catch (Exception $e) {
    error_log("Error Eliminación Masiva: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../../sesion/administrativo/mod-elim-alumn.php");
    exit();
}