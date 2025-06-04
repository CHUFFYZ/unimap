<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    <title>Inicio Sesion UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="../css/normalize.css">
    <link rel="icon" href="../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../css/iniciosesionactualizado.css">
</head>
<body>
    <div class="supercontainer">
        <div class="containerlogo">
            <a id="logoweb" href="mapaALUM.php"><img src="../image/LogoBlanco.webp" alt="LogoUnimap"></a>
        </div>
        <div class="MensajeUNIMAP">
            <div id="nombrelogo">
                <h2><span>U N I M A P</span></h2>
                <h4><span>Mapa Interactivo Universitario</span></h4>
            </div>
        </div>
        <div class="menu-toggle" id="menu-toggle">☰</div>
        <div class="menu-container" id="menu-container">
            <div class="containerinf2">
                <nav class="fr2">
                    <a class="btn" href="iniciosesion.php">Alumnos</a>
                </nav>
            </div>
            <div class="container2">
                <nav class="fr2">
                    <a class="btn" href="sesionADMIN.php">Administrativos</a>
                </nav>
            </div>
        </div>
    </div>
    <div class="wrapper">
        <div class="login_box">
            <div class="login-header">
                <span>Inicio de Sesión</span>
            </div>
            <div class="logosweb">
                <div class="intalumno">
                    <h2>Alumnos</h2>
                </div>
                <div class="logoalum">  
                    <a id="logalum"><img src="../image/alumno.webp" alt="alumnoslogo"></a>
                </div>     
            </div>
            <form method="POST" action="log-alumnos.php">
                <div class="input_box">
                    <input type="text" name="matricula" class="input-field" id="matricula" required>
                    <label for="matricula" class="label">Matrícula</label>
                    <i class="bx bx-user icon"></i>
                </div>
                <div class="input_box">
                    <input type="password" name="password" class="input-field" id="contraseña" required>
                    <label for="contraseña" class="label">Contraseña</label>
                    <i class="bx bx-lock-alt icon"></i>
                    <i class="fas fa-eye toggle-password" id="togglePassword"></i>
                </div>
                <?php if (isset($_SESSION['error'])): ?>
                    <div class="error-mensaje">
                        <?php echo $_SESSION['error']; ?>
                    </div>
                    <?php unset($_SESSION['error']); ?>
                <?php endif; ?>
                <div class="remember-forgot">
                    <div class="forgot">
                        <a href="restablecercotrasena/reset-request.php" target="_blank">¿Olvidaste la contraseña?</a>
                    </div>
                </div>
                <div class="input_box">
                    <input type="submit" class="input-submit" value="Acceder">
                </div>
                <div class="input_box">
                    <button type="button" class="input-cancel" onclick="location.reload()">Cancelar</button>
                </div>
            </form>
            <div class="guest-mode">
                <div class="remember-me">
                    <input type="checkbox" id="guestMode" onchange="toggleGuestMode()">
                    <label for="guestMode">Activar modo invitado</label>
                </div>
                <div class="input_box">
                    <button id="acceptButton" class="accept-button" onclick="redirectToGuest()">Aceptar</button>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.querySelector('form').addEventListener('submit', function(e) {
            console.log('Formulario enviado');
            console.log('Matrícula:', document.getElementById('matricula').value);
            console.log('Contraseña:', document.getElementById('contraseña').value);
        });
    </script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const togglePassword = document.querySelector('#togglePassword');
            const password = document.querySelector('#contraseña');
            if (togglePassword && password) {
                togglePassword.addEventListener('click', function() {
                    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                    password.setAttribute('type', type);
                    this.classList.toggle('fa-eye-slash');
                    this.classList.toggle('fa-eye');
                });
            }
        });
    </script>
    <script src="../js/invitado.js"></script>
    <script src="../js/menu.js"></script>
    <script src="../js/zoom.js"></script>
</body>
</html>