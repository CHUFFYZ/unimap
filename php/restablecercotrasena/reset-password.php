<?php
session_start();

// Verificar si hay token en la URL
$token = $_GET['token'] ?? null;

if (!$token) {
    $_SESSION['error'] = "Enlace inválido";
    header("Location: reset-request.php");
    exit();
}

try {
    // Configurar conexión directa a SQLite
    $databasePath = '../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar en ambas tablas con UNION y validar tiempo
    $stmt = $pdo->prepare("
        SELECT 'alumno' AS tipo, matricula, reset_token, reset_expira 
        FROM alumnos 
        WHERE reset_token = :token 
          AND datetime(reset_expira) > datetime('now')
        
        UNION
        
        SELECT 'admin' AS tipo, matricula, reset_token, reset_expira 
        FROM administrativos 
        WHERE reset_token = :token 
          AND datetime(reset_expira) > datetime('now')
    ");
    
    $stmt->execute([':token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("Enlace expirado o inválido");
    }
    $_SESSION['reset_token'] = $token;
    $_SESSION['tipo_usuario'] = $user['tipo'];
    $_SESSION['reset_matricula'] = $user['matricula'];

} catch (PDOException $e) {
    $_SESSION['error'] = "Error de conexión: " . $e->getMessage();
    header("Location: reset-request.php");
    exit();
} catch (Exception $e) {
    $_SESSION['error'] = $e->getMessage();
    header("Location: reset-request.php");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Nueva Contraseña</title>
    <style>
        body {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .recovery-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
        }
        
        .user-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        /* Mantener el resto del CSS anterior */
    </style>
</head>
<body>
    <div class="recovery-container">
        <h1>Establecer Nueva Contraseña</h1>
        
        <?php if(isset($_SESSION['error'])): ?>
            <div class="error-message"><?= htmlspecialchars($_SESSION['error']) ?></div>
            <?php unset($_SESSION['error']); ?>
        <?php endif; ?>

        <?php if(isset($_SESSION['reset_matricula'])): ?>
            <div class="user-info">
                <p>Matrícula: <strong><?= htmlspecialchars($_SESSION['reset_matricula']) ?></strong></p>
            </div>
        <?php endif; ?>

        <form method="POST" action="update-password.php">
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) ?>">
            
            <div class="form-group">
                <label for="password">Nueva contraseña:</label>
                <input type="password" id="password" name="password" required 
                    placeholder="Mínimo 8 caracteres con letras y números"
                    minlength="8"
                    pattern="^(?=.*[A-Za-z])(?=.*\d).{8,}$">
            </div>
            
            <div class="form-group">
                <label for="confirm_password">Confirmar contraseña:</label>
                <input type="password" id="confirm_password" name="confirm_password" required 
                    placeholder="Repite tu nueva contraseña"
                    minlength="8">
            </div>
            
            <div class="button-group">
                <button type="submit" class="accept-btn">Actualizar Contraseña</button>
                <a href="iniciosesion.php" class="cancel-btn">Cancelar</a>
            </div>
        </form>
    </div>
</body>
</html>