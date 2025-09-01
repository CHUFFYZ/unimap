<?php
// Configurar el tiempo de vida de la cookie antes de iniciar la sesión
$session_lifetime = 4*24*60*60; // 2 horas en segundos
ini_set('session.cookie_lifetime', $session_lifetime);
ini_set('session.gc_maxlifetime', $session_lifetime);

// Configurar parámetros de la cookie de sesión
session_set_cookie_params([
    'lifetime' => $session_lifetime,
    'path' => '/',
    'domain' => '',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Strict'
]);

// Iniciar sesión
session_start();
session_regenerate_id(true);

error_log("Session save path: " . session_save_path());
error_log("Session ID before login: " . session_id());
error_log("Cookie lifetime set: " . ini_get('session.cookie_lifetime'));

error_reporting(E_ALL);
ini_set('display_errors', 1);

$db_path = '../../../DB/usuarios.db';

try {
    if (!file_exists($db_path)) {
        throw new Exception("Archivo de base de datos no encontrado: $db_path");
    }

    $matricula = $_POST['matricula'] ?? '';
    if (!ctype_digit($matricula)) {
        throw new Exception("La matrícula debe ser numérica");
    }

    $conn = new PDO("sqlite:$db_path");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("
        SELECT contrasena, nombre, apellido 
        FROM alumnos 
        WHERE matricula = :matricula
    ");
    $stmt->execute([':matricula' => $matricula]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$resultado) {
        throw new Exception("Matrícula no registrada");
    }

    if (!password_verify($_POST['password'] ?? '', $resultado['contrasena'])) {
        throw new Exception("Credenciales inválidas");
    }

    $_SESSION['alumno'] = [
        'matricula' => $matricula,
        'tipo' => 'alumno',
        'ultimo_acceso' => time(),
        'session_expiry' => time() + $session_lifetime,
        'nombre' => $resultado['nombre'] ?? 'Usuario',
        'apellido' => $resultado['apellido'] ?? ''
    ];

    error_log("Session data set: " . print_r($_SESSION['alumno'], true));
    error_log("Session ID after setting data: " . session_id());

    header("Location: ../../sesion/alumno/mapa-alumn.php");
    exit();

} catch(PDOException $e) {
    error_log("PDO Error: " . $e->getMessage());
    $_SESSION['error'] = "Error en el sistema. Contacta al administrador.";
    header("Location: ../../sesion/sesion-alumn.php");
    exit();
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../sesion/sesion-alumn.php");
    exit();
}
?>