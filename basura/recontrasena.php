<?php
session_start(); // Necesario para manejar mensajes de error/éxito
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="../../css/recontrasena.css">
</head>

<body>
    <div class="supercontainer">
        <div class="containerlogo">
            <a id="logoweb" class="fl" href="iniciosesion.php"><img src="../../image/LogoBlanco.webp" alt="LogoUnimap"></a>
        </div>
        <div class="MensajeUNIMAP">
            <div id="nombrelogo">
                <h2><span>U N I M A P</span></h2>
                <h4><span>Mapa Interactivo Universitario</span></h4>
            </div>
        </div>
    </div>
    <a href="../iniciosesion.php" class="back-button"><strong> ← Volver al Inicio</strong></a>
    
    <div class="recovery-container">
        <h1>Recuperar Contraseña</h1>
        
        <?php if(isset($_SESSION['error'])): ?>
            <div class="error-message"><?= $_SESSION['error']; unset($_SESSION['error']); ?></div>
        <?php endif; ?>
        
        <?php if(isset($_SESSION['success'])): ?>
            <div class="success-message"><?= $_SESSION['success']; unset($_SESSION['success']); ?></div>
        <?php endif; ?>

        <form id="recoveryForm" method="POST" action="reset-process.php">
            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) ?>">
            
            <div class="form-group">
                <label for="matricula">Matrícula:</label>
                <input type="text" id="matricula" name="matricula" required 
                    placeholder="Ingresa tu matrícula" pattern="[0-9]+"
                    title="La matrícula debe contener solo números">
            </div>
            
            <div class="form-group">
                <label for="contacto">Teléfono/Email Registrado:</label>
                <input type="text" id="contacto" name="contacto" required 
                    placeholder="Ingresa tu correo o número telefónico"
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]{10}"
                    title="Ingresa un correo válido o número de 10 dígitos">
            </div>
            
            <div class="button-group">
                <button type="submit" class="accept-btn">Aceptar</button>
                <button type="button" class="cancel-btn" onclick="window.location.href='iniciosesion.php'">Cancelar</button>
            </div>
        </form>
    </div>

    <script>
        // Validación cliente antes de enviar
        document.getElementById('recoveryForm').addEventListener('submit', function(e) {
            const matricula = document.getElementById('matricula').value;
            const contacto = document.getElementById('contacto').value;
            
            if (!/^\d+$/.test(matricula)) {
                alert('La matrícula debe contener solo números');
                e.preventDefault();
            }
            
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
            const isPhone = /^\d{10}$/.test(contacto);
            
            if (!isEmail && !isPhone)) {
                alert('Ingresa un correo válido o número de 10 dígitos');
                e.preventDefault();
            }
        });
    </script>
</body>
</html>