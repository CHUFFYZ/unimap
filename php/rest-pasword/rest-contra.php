<?php
session_start();
// Inicializar mensajes
$error = $_SESSION['error'] ?? null;
$success = $_SESSION['success'] ?? null;
unset($_SESSION['error'], $_SESSION['success']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon"  href="../../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../../css/rest-contra.css">
</head>
<body>
    <div class="supercontainer">
        <div class="containerlogo">
            <a id="logoweb" class="fl" href="iniciosesion.php">
                <img src="../../image/iconos/logo/unimap.webp" alt="Logo UNIMAP">
            </a>
        </div>
        <div class="MensajeUNIMAP">
            <div id="nombrelogo">
                <h2><span>U N I M A P</span></h2>
                <h4><span>Mapa Interactivo Universitario</span></h4>
            </div>
        </div>
    </div>
    <a href="../sesion/sesion-alumn.php">
        <button class="back-button" link>Regresar</button>
    </a>
    <div class="recovery-container">
        <h1>Recuperar Contraseña</h1>
        
        <?php if($error): ?>
            <div class="error-message"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        
        <?php if($success): ?>
            <div class="success-message"><?= htmlspecialchars($success) ?></div>
        <?php endif; ?>

        <form method="POST" action="back-end/reset-process.php">
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) ?>">
            
            <div class="form-group">
                <label for="matricula">Matrícula:</label>
                <input type="text" id="matricula" name="matricula" required
                    placeholder="Ej: 20230001"
                    pattern="[0-9]+"
                    title="Solo números permitidos">
            </div>
            
            <div class="form-group">
                <label for="contacto">Correo</label>
                <input type="text" id="contacto" name="contacto" required
                    placeholder="Ej: usuario@ejemplo.com"
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]{10}"
                    title="Ingresa 10 dígitos o un correo válido">
            </div>
            
            <div class="button-group">
                <button type="submit" class="accept-btn">Continuar</button>
                <button type="button" class="cancel-btn" onclick="window.location.href='rest-contra.php'">Cancelar</button>
            </div>
        </form>
    </div>

    <script>
        document.querySelector('form').addEventListener('submit', function(e) {
            const matricula = document.getElementById('matricula').value;
            const contacto = document.getElementById('contacto').value;
            
            if (!/^\d+$/.test(matricula)) {
                alert('La matrícula debe contener solo números');
                e.preventDefault();
            }
            
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
            const isPhone = /^\d{10}$/.test(contacto);
            
            if (!isEmail && !isPhone) {
                alert('Formato inválido: Use 10 dígitos o un correo válido');
                e.preventDefault();
            }
        });
    </script>
</body>
</html>