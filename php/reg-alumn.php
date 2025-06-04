<?php
session_start();

$allowed = ['administrativo']; // Solo acceso administrativo

if (!isset($_SESSION['admin']) || 
    !isset($_SESSION['admin']['tipo']) || 
    !in_array($_SESSION['admin']['tipo'], $allowed)) {
    
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a administrativos. Redirigiendo...";
    header("Refresh: 3; URL=sesionADMIN.php");
    exit();
}
require_once '../DB-coneccion.php';
?>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro de Alumnos - UNIMAP</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="../css/normalize.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link rel="icon"  href="../image/LogoBlanco1.webp" type="image/webp"/>
        <link rel="stylesheet" href="../css/reg-alumn.css">
    </head>
    <body>
        <header class="welcome-header">
            <div>
                <h2>Registro de Alumnos</h2>
                <p>Sistema de Gestión Estudiantil - UNIMAP</p>
            </div>
            <div class="logo">
                <img src="../image/LogoBlanco.webp" alt="Logo Universidad">
            </div>
        </header>
        <div class="regresar";>
            <a href="mapaADMIN.php" class="back-button"><strong>← Volver al Inicio</strong></a>
        </div>
        <form id="studentForm" method="POST" action="acciones-admin/registrar-alumn.php">
        <h2>Datos del Estudiante</h2>
        
        <?php if(isset($_SESSION['error'])): ?>
            <div class="error-message">
                <?= htmlspecialchars($_SESSION['error']); ?>
                <?php unset($_SESSION['error']); ?>
            </div>
        <?php endif; ?>
        <?php if(isset($_SESSION['success'])): ?>
            <div class="success-message">
                <?= htmlspecialchars($_SESSION['success']); ?>
                <?php unset($_SESSION['success']); ?>
            </div>
        <?php endif; ?>
        <input type="hidden" name="csrf_token" value="<?= 
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) 
        ?>">

        <div class="form-group">
            <label for="matricula">Matrícula:</label>
            <input type="number" id="matricula" name="matricula" required>
        </div>

        <div class="form-group">
            <label for="password">Contraseña:</label>
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
            <label for="telefono">Teléfono:</label>
            <input type="tel" id="telefono" name="telefono" required>
        </div>

        <div class="form-group">
            <label for="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" required>
        </div>

        <button type="submit" class="btn-primary">Registrar Alumno</button>
    </form>
        <div class="barra">
        <p>&copy; 2025 Universidad Autonoma del Carmen. Todos los derechos reservados.</p>
        </div>

        <script>
        document.getElementById('studentForm').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
            
            if (!regex.test(password)) {
                alert('La contraseña debe contener letras y números (mínimo 8 caracteres)');
                e.preventDefault();
            }
        });
    </script>
    </body>
</html>