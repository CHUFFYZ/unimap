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
    if (empty($_POST['alumnos'])) {
        throw new Exception("No se proporcionaron datos para modificar");
    }

    $alumnos = json_decode($_POST['alumnos'], true);
    if (!is_array($alumnos) || empty($alumnos)) {
        throw new Exception("Datos de alumnos inválidos");
    }

    // Database connection
    $databasePath = '../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();
    $updatedCount = 0;

    foreach ($alumnos as $alumno) {
        $matricula = filter_var($alumno['matricula'], FILTER_VALIDATE_INT);
        $contrasena = $alumno['contrasena'];
        $telefono = filter_var($alumno['telefono'], FILTER_VALIDATE_INT);
        $email = filter_var($alumno['email'], FILTER_SANITIZE_EMAIL);

        // Validate data
        if (!$matricula || $matricula < 1) {
            continue;
        }

        if (empty($contrasena) || strlen($contrasena) < 8 || !preg_match('/[A-Za-z]/', $contrasena) || !preg_match('/[0-9]/', $contrasena)) {
            continue;
        }

        if (!$telefono || $telefono < 1) {
            continue;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            continue;
        }

        // Check if student exists
        $stmt = $pdo->prepare("SELECT matricula FROM alumnos WHERE matricula = :matricula");
        $stmt->execute([':matricula' => $matricula]);
        if (!$stmt->fetch()) {
            continue;
        }

        // Update student
        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE alumnos SET
                contrasena = :contrasena,
                telefono = :telefono,
                email = :email
            WHERE matricula = :matricula
        ");

        $stmt->execute([
            ':matricula' => $matricula,
            ':contrasena' => $hash,
            ':telefono' => $telefono,
            ':email' => $email
        ]);

        $updatedCount++;
    }

    $pdo->commit();

    // Success
    $_SESSION['success'] = "$updatedCount alumnos modificados exitosamente";
    header("Location: ../gestion-alumnos.php");
    exit();

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../gestion-alumnos.php");
    exit();
} catch (Exception $e) {
    error_log("Error Modificación: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../gestion-alumnos.php");
    exit();
}