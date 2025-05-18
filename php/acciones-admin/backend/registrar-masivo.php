<?php
session_start();

require '../../../vendor/autoload.php'; // Ensure PHPSpreadsheet is installed via Composer

use PhpOffice\PhpSpreadsheet\IOFactory;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Validate CSRF Token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== ($_SESSION['csrf_token'] ?? '')) {
        throw new Exception("Token CSRF inválido");
    }

    // Check file upload
    if (!isset($_FILES['excel_file']) || $_FILES['excel_file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Error al cargar el archivo Excel");
    }

    // Database connection
    $databasePath = '../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Load Excel file
    $file = $_FILES['excel_file']['tmp_name'];
    $spreadsheet = IOFactory::load($file);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray();

    $successCount = 0;
    $errors = [];

    // Skip header row and process data
    for ($i = 1; $i < count($rows); $i++) {
        $row = $rows[$i];
        $matricula = filter_var($row[0], FILTER_VALIDATE_INT);
        $password = $row[1];
        $telefono = !empty($row[2]) ? filter_var($row[2], FILTER_VALIDATE_INT) : null;
        $email = !empty($row[3]) ? filter_var($row[3], FILTER_SANITIZE_EMAIL) : null;

        // Validate data
        if (!$matricula || $matricula < 1) {
            $errors[] = "Fila $i: Matrícula inválida";
            continue;
        }

        if (empty($password) || strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            $errors[] = "Fila $i: Contraseña inválida";
            continue;
        }

        if ($telefono !== null && (!$telefono || $telefono < 1)) {
            $errors[] = "Fila $i: Teléfono inválido";
            continue;
        }

        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Fila $i: Correo electrónico inválido";
            continue;
        }

        // Check if matricula exists
        $stmt = $pdo->prepare("SELECT matricula FROM alumnos WHERE matricula = :matricula");
        $stmt->execute([':matricula' => $matricula]);
        
        if ($stmt->fetch()) {
            $errors[] = "Fila $i: La matrícula $matricula ya está registrada";
            continue;
        }

        // Insert new record
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

        $successCount++;
    }

    // Set session messages
    if ($successCount > 0) {
        $_SESSION['success'] = "Se registraron $successCount alumnos exitosamente";
    }
    if (!empty($errors)) {
        $_SESSION['error'] = implode("; ", $errors);
    }

    header("Location: ../altas-alumnos.php");
    exit();

} catch (PDOException $e) {
    error_log("Error BD: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../altas-alumnos.php");
    exit();
} catch (Exception $e) {
    error_log("Error Registro Masivo: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../altas-alumnos.php");
    exit();
}