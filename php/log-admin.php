<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db_path = '../DB/usuarios.db';

try {
    // Validar matrícula numérica
    $matricula = $_POST['matricula'];
    if (!ctype_digit($matricula)) {
        throw new Exception("La matrícula debe ser numérica");
    }

    // Conexión a la base de datos
    $conn = new PDO("sqlite:$db_path");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta mejorada
    $stmt = $conn->prepare("
        SELECT contrasena 
        FROM administrativos 
        WHERE matricula = :matricula
    ");
    $stmt->execute([':matricula' => $matricula]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$resultado) {
        throw new Exception("Matrícula no registrada");
    }

    // Verificación segura de contraseña
    if (!password_verify($_POST['password'], $resultado['contrasena'])) {
        throw new Exception("Credenciales inválidas");
    }

    // Configurar sesión
    $_SESSION['admin'] = [
        'matricula' => $matricula,
        'tipo' => 'administrativo',
        'ultimo_acceso' => time()
    ];

    // Redirigir al dashboard
    header("Location: mapaADMIN.php");
    exit();

} catch(PDOException $e) {
    error_log("Error DB: " . $e->getMessage());
    $_SESSION['error'] = "Error en el sistema. Contacta al administrador.";
    header("Location: sesionADMIN.php");
    exit();
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: sesionADMIN.php");
    exit();
}
?>