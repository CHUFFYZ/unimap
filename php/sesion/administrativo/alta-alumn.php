<?php
ob_start();
session_start();

error_log("Session data on mapa-admin.php: " . print_r($_SESSION, true));
error_log("Session ID: " . session_id());
error_log("Cookie lifetime: " . ini_get('session.cookie_lifetime'));

$allowed = ['admin'];

if (!isset($_SESSION['admin'])) {
    error_log("Session 'admin' not set");
    $error = "Sesión no iniciada.";
} elseif (!isset($_SESSION['admin']['tipo']) || !in_array($_SESSION['admin']['tipo'], $allowed)) {
    error_log("Invalid or missing 'tipo': " . ($_SESSION['admin']['tipo'] ?? 'not set'));
    $error = "Acceso restringido a administrativos.";
} elseif (!isset($_SESSION['admin']['nombre']) || !isset($_SESSION['admin']['apellido'])) {
    error_log("Missing 'nombre' or 'apellido'");
    $error = "Datos de usuario incompletos.";
} elseif (!isset($_SESSION['admin']['session_expiry']) || time() > $_SESSION['admin']['session_expiry']) {
    error_log("Session expired or 'session_expiry' not set. Current time: " . time() . ", Expiry: " . ($_SESSION['admin']['session_expiry'] ?? 'not set'));
    $error = "Sesión expirada.";
}

if (isset($error)) {
    session_unset();
    session_destroy();
    header("HTTP/1.1 403 Forbidden");
    echo $error . " Redirigiendo...";
    header("Refresh: 1; URL=../sesion-admin.php");
    exit();
}

ob_end_flush();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Alumnos - UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="shortcut icon" href="../../../image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="../../../css/alta-alumn.css">
</head>

<body>
    <header class="welcome-header">
        <div>
            <h2>Bienvenido Administrativo</h2>
            <h4>Altas</h4>
            <p>Registro de Alumnos - UNIMAP</p>
        </div>
        <div class="log">
            <a id="logoweb" class="fl" href="alta-alumn.php"><img src="../../../image/iconos/logo/unimap.webp" alt="Logo Universidad"></a>
        </div>
    </header>

    <div class="container">
        <!-- Navigation Button -->
        <div class="section">
            <a href="mapa-admin.php" class="btn-secondary"><i class="fas fa-arrow-left"></i> Regresar</a>
            <a href="mod-elim-alumn.php" class="btn-primary"><i class="fas fa-user-plus"></i> Modificar-Eliminar Alumnos</a>
        </div>

        <div class="section">
            <h2>Alta de Alumnos</h2>
            <?php if(isset($_SESSION['error'])): ?>
                <div class="error-message"><?= htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
            <?php endif; ?>
            <?php if(isset($_SESSION['success'])): ?>
                <div class="success-message"><?= htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?></div>
            <?php endif; ?>

            <!-- Alta Individual -->
            <form id="studentForm" method="POST" action="../../back-end/alum-gest/registrar/registrar-alumn.php" class="excel-form">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] = bin2hex(random_bytes(32)) ?>">
                <div class="form-group">
                    <label for="matricula">Matrícula:</label>
                    <input type="number" id="matricula" name="matricula" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required 
                        pattern="^(?=.*[A-Za-z])(?=.*\d).{8,}$" 
                        title="Debe contener al menos una letra y un número (mínimo 8 caracteres)">
                </div>
                <div class="form-group">
                    <label for="email">Correo Electrónico:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="telefono">Teléfono:</label>
                    <input type="tel" id="telefono" name="telefono">
                </div>
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre">
                </div>
                <div class="form-group">
                    <label for="apellido">Apellido:</label>
                    <input type="text" id="apellido" name="apellido">
                </div>
                <button type="submit" class="btn-primary">Registrar Alumno</button>
            </form>

            <!-- Alta Masiva -->
            <div class="excel">
                <form method="POST" action="../../back-end/alum-gest/registrar/registrar-alumn-masivo.php" enctype="multipart/form-data" class="excel-form">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <div class="form-group">
                        <label for="excel_file">Cargar Excel:</label>
                        <input type="file" id="excel_file" name="excel_file" accept=".xlsx,.xls" required>
                    </div>
                    <button type="submit" class="btn-primary">Registrar Masivo</button>
                </form>
                <div class="downloadcontainer">
                    <div class="downloadexel">
                        <a href="../../../archivos/Estructura-Alumnos.xlsx" download class="btn-secondary">Descargar Estructura</a>
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
            const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
            if (!regex.test(password)) {
                alert('La contraseña debe contener letras y números (mínimo 8 caracteres)');
                e.preventDefault();
            }
        });
    </script>
</body>
</html>