<?php
ob_start(); // Inicia el búfer de salida
session_start();
$allowed = ['administrativo']; // Solo acceso administrativo
if (!isset($_SESSION['admin']) || 
    !isset($_SESSION['admin']['tipo']) || 
    !in_array($_SESSION['admin']['tipo'], $allowed)) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a administrativos. Redirigiendo...";
    header("Refresh: 1; URL=../sesionADMIN.php");
    exit();
}
ob_end_flush(); // Libera el búfer y envía la salida
require_once '../../DB-coneccion.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Profesores - UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon" href="../../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../../css/gestion-alumnos.css">
</head>

<body>
    <header class="welcome-header">
        <div>
            <h2>Bienvenido Administrativo</h2>
            <h4>Altas</h4>
            <p>Registro de Profesores - UNIMAP</p>
        </div>
        <div class="log">
            <img src="../../image/LogoBlanco.webp" alt="Logo Universidad">
        </div>
    </header>

    <div class="container">
        <div class="section">
            <a href="../mapaADMIN.php" class="btn-secondary"><i class="fas fa-arrow-left"></i> Regresar</a>
            <a href="gestion-profesores.php" class="btn-primary"><i class="fas fa-user-plus"></i> Modificar-Eliminar Profesores</a>
        </div>

        <div class="section">
            <h2>Alta de Profesores</h2>
            <?php if(isset($_SESSION['error'])): ?>
                <div class="error-message"><?= htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
            <?php endif; ?>
            <?php if(isset($_SESSION['success'])): ?>
                <div class="success-message"><?= htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?></div>
            <?php endif; ?>

            <!-- Alta Individual -->
            <form id="studentForm" method="POST" action="backend/registrar-profesor.php" class="excel-form">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) ?>">
                <div class="form-group">
                    <label for="matricula">Matrícula:</label>
                    <input type="number" id="matricula" name="matricula" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required 
                        pattern="^(?=.*[A-Za-z])(?=.*\d).{6,}$" 
                        title="Debe contener al menos una letra y un número (mínimo 6 caracteres)">
                </div>
                <div class="form-group">
                    <label for="telefono">Teléfono:</label>
                    <input type="tel" id="telefono" name="telefono" required>
                </div>
                <div class="form-group">
                    <label for="email">Correo Electrónico:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <button type="submit" class="btn-primary">Registrar Profesor</button>
            </form>

            <!-- Alta Masiva -->
            <div class="excel">
                <form method="POST" action="backend/registrar-masivo-profesor.php" enctype="multipart/form-data" class="excel-form">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <div class="form-group">
                        <label for="excel_file">Cargar Excel:</label>
                        <input type="file" id="excel_file" name="excel_file" accept=".xlsx,.xls" required>
                    </div>
                    <button type="submit" class="btn-primary">Registrar Masivo</button>
                </form>
                <div class="downloadcontainer">
                    <div class="downloadexel">
                        <a href="../../archivos/Estructura-Profesores.xlsx" download class="btn-secondary">Descargar Estructura</a>
                    </div>
                </div>
            </div>
        </div>
               
    </div>

    <script>
       
        function togglePassword() {
            const passwordField = document.getElementById('password');
            const toggleBtn = document.querySelector('.toggle-password i');
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleBtn.classList.remove('fa-eye');
                toggleBtn.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                toggleBtn.classList.remove('fa-eye-slash');
                toggleBtn.classList.add('fa-eye');
            }
        }

       
        document.getElementById('studentForm').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
            if (!regex.test(password)) {
                alert('La contraseña debe contener letras y números (mínimo 6 caracteres)');
                e.preventDefault();
            }
        });
    </script>
</body>
</html>