<?php
session_start();
date_default_timezone_set('America/Mexico_City'); // Ajusta según tu ubicación

try {
    // Validar datos
    $matricula = filter_input(INPUT_POST, 'matricula', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $contacto = filter_input(INPUT_POST, 'contacto', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    if (empty($matricula) || empty($contacto)) {
        throw new Exception("Todos los campos son obligatorios");
    }

    // Conexión directa a SQLite
    $databasePath = '../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Log SQLite version for debugging
    error_log("SQLite version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION));

    // Buscar en ambas tablas
    $stmt = $pdo->prepare("
        SELECT 'alumno' AS tipo, matricula, email, telefono
        FROM alumnos
        WHERE matricula = :matricula
          AND (email = :contacto OR telefono = :contacto)

        UNION

        SELECT 'admin' AS tipo, matricula, email, telefono
        FROM administrativos
        WHERE matricula = :matricula
          AND (email = :contacto OR telefono = :contacto)
    ");

    $stmt->execute([
        ':matricula' => $matricula,
        ':contacto' => $contacto
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("Teléfono/correo no registrados para este usuario");
    }

    // Generar token y tiempo de expiración (5 minutos)
    $token = bin2hex(random_bytes(50));
    $expira = date("Y-m-d H:i:s", time() + 300);
    error_log("Generated expiration time: $expira");
    error_log("Server timezone: " . date_default_timezone_get());

    // Determinar tabla objetivo
    $tabla = ($user['tipo'] == 'alumno') ? 'alumnos' : 'administrativos';

    // Actualizar registro
    $updateStmt = $pdo->prepare("
        UPDATE $tabla
        SET reset_token = :token,
            reset_expira = :expira
        WHERE matricula = :matricula
    ");

    $updateStmt->execute([
        ':token' => $token,
        ':expira' => $expira,
        ':matricula' => $matricula
    ]);

    // Construir enlace de recuperación
    $resetLink = "https://unimap-synh.onrender.com/php/rest-pasword/enlace-rest-contra.php?token=$token";
    error_log("Reset link: $resetLink");

    // Configurar PHPMailer
    require_once __DIR__ . '/../../../vendor/autoload.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer();
    $mail->SMTPDebug = 0; // Cambiado a 0 para no mostrar la depuración en producción
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Cambiar por tu servidor SMTP
    $mail->SMTPAuth = true;
    $mail->Username = 'soporte.uninap@gmail.com'; // Tu email
    $mail->Password = 'kxpu tbex kiiz csge'; // Contraseña de aplicación
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8'; // Agrega esta línea
    $mail->setFrom('soporte.uninap@gmail.com', 'Soporte UNIMAP');
    $mail->addAddress($user['email']);
    $mail->Subject = 'Restablecimiento de Contraseña - UNIMAP';
    $mail->Body = "Haz clic para restablecer tu contraseña (válido por 5 minutos):\n$resetLink";

    if (!$mail->send()) {
        throw new Exception("Error al enviar el correo: " . $mail->ErrorInfo);
    }

    // Registrar datos en sesión
    $_SESSION['tipo_usuario'] = $user['tipo'];
    $_SESSION['reset_matricula'] = $matricula;

    $_SESSION['success'] = "Hemos enviado un enlace de recuperación a tu correo registrado";
    header("Location: ../rest-contra.php");
    exit();

} catch (PDOException $e) {
    error_log("Error DB: " . $e->getMessage());
    $_SESSION['error'] = "Error en el sistema. Contacta al administrador.";
    header("Location: ../rest-contra.php");
    exit();
} catch (Exception $e) {
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../rest-contra.php");
    exit();
}
?>