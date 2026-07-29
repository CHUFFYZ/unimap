<?php
session_start();
date_default_timezone_set('America/Mexico_City'); // Match reset-process.php time zone

// Ruta absoluta a la base de datos
$databasePath = '../../../DB/usuarios.db';

try {
    // Validar token desde la URL
    $token = $_GET['token'] ?? null;
    error_log("Token received: " . ($token ?? 'No token provided'));

    if (!$token) {
        throw new Exception("Enlace inválido o corrupto");
    }

    // Verificar archivo de base de datos
    $realPath = realpath($databasePath);
    error_log("Database path: " . ($realPath ? $realPath : 'Not found'));
    if (!$realPath || !file_exists($databasePath)) {
        throw new Exception("Archivo de base de datos no encontrado");
    }

    // Conexión a SQLite
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Log SQLite version and server timezone
    error_log("SQLite version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION));
    error_log("Server timezone: " . date_default_timezone_get());

    // Use PHP's current time for comparison
    $currentTime = date("Y-m-d H:i:s");
    error_log("PHP current time: $currentTime");

    // Check token existence and validity
    $stmt = $pdo->prepare("
        SELECT 'alumno' AS tipo, matricula, reset_token, reset_expira 
        FROM alumnos 
        WHERE reset_token = :token 
        AND reset_expira > :currentTime
        
        UNION ALL
        
        SELECT 'admin' AS tipo, matricula, reset_token, reset_expira 
        FROM administrativos 
        WHERE reset_token = :token 
        AND reset_expira > :currentTime
    ");
    
    $stmt->execute([':token' => $token, ':currentTime' => $currentTime]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    error_log("Query result: " . print_r($user, true));

    if (!$user) {
        error_log("No valid user found for token: $token");
        throw new Exception("El enlace ha expirado o ya fue usado");
    }

    // Log expiration time for debugging
    error_log("Token expires at: " . $user['reset_expira']);

    // Configurar variables de sesión
    $_SESSION['tipo_usuario'] = $user['tipo'];
    $_SESSION['reset_token'] = $user['reset_token'];
    $_SESSION['reset_matricula'] = $user['matricula'];
    error_log("Session data set: " . print_r($_SESSION, true));

} catch (PDOException $e) {
    error_log("Error SQL: " . $e->getMessage());
    $_SESSION['error'] = "Error técnico. Contacta al administrador.";
    header("Location: ../../sesion-alumn.php");
    exit();
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    $_SESSION['error'] = $e->getMessage();
    header("Location: ../../sesion-alumn.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambiar Contraseña - UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=Roboto&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon" href="../../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../../css/rest-contra.css">
</head>

<body>
    <a href="../sesion/sesion-alumn.php">
        <button class="back-button" link>Regresar</button>
    </a>
    <div class="recovery-container">
        <h1>Cambio de contraseña</h1>
        
        <?php if (isset($_SESSION['error'])): ?>
            <div class="error-message">
                <?= htmlspecialchars($_SESSION['error']) ?>
                <?php unset($_SESSION['error']); ?>
            </div>
        <?php endif; ?>
        
        <?php if (isset($_SESSION['reset_matricula'])): ?>
            <div class="user-info">
                <p>Matrícula: <strong><?= htmlspecialchars($_SESSION['reset_matricula']) ?></strong></p>
            </div>

            <form id="passwordForm" method="POST" action="back-end/update-password.php">
                <input type="hidden" name="csrf_token" value="<?= 
                    $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) 
                ?>">
                
                <div class="form-group">
                    <label for="password">Nueva contraseña:</label>
                    <input type="password" 
                        id="password" 
                        name="password" 
                        required 
                        placeholder="Mínimo 8 caracteres con letras y números"
                        minlength="8"
                        pattern="^(?=.*[A-Za-z])(?=.*\d).{8,}$"
                        title="Debe contener al menos una letra y un número">
                </div>
                
                <div class="form-group">
                    <label for="confirm_password">Confirmar:</label>
                    <input type="password" 
                        id="confirm_password" 
                        name="confirm_password" 
                        required
                        placeholder="Repite tu contraseña"
                        minlength="8">
                </div>
                
                <div class="button-group">
                    <button type="submit" class="accept-btn">Actualizar</button>
                    <button type="button" 
                            class="cancel-btn" 
                            onclick="window.location.href='../../sesion-alumn.php'">
                        Cancelar
                    </button>
                </div>
            </form>
        <?php else: ?>
            <p>No se puede procesar la solicitud. Por favor, solicita un nuevo enlace de restablecimiento.</p>
        <?php endif; ?>
    </div>

    <script>
        document.getElementById('passwordForm')?.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirm_password').value;
            const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
            
            if (!regex.test(password)) {
                alert('La contraseña debe contener letras y números (mínimo 8 caracteres)');
                e.preventDefault();
                return;
            }
            
            if (password !== confirm) {
                alert('Las contraseñas no coinciden');
                e.preventDefault();
            }
        });
    </script>
</body>
</html>