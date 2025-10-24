<?php
session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
    <title>Inicio Sesion UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="shortcut icon" href="../../image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="../../css/sesion.css">
</head>
<body>
    <div class="main-wrapper">
        <div class="fondo">
            <img src="../../image/fondo/fondo.webp" alt="fondoimg">
        </div>
        <div class="supercontainer">
            <div class="containerlogo">
                <a id="logoweb" class="fl" href="sesion-alumn.php"><img src="../../image/iconos/logo/unimap.webp" alt="LogoUnimap"></a>
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
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="sesion-alumn.php">Alumnos</a>
                        </nav>
                    </div>
                </div>
                <div class="containerinf2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="sesion-profe.php">Docentes</a>
                        </nav>
                    </div>
                </div>
                <div class="container2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="sesion-admin.php">Administrativos</a>
                        </nav>
                    </div>
                </div>
            </div>
        </div>

        <div class="fondosupercontainer">
            <div class="inisesion">
                <div class="titulo" id="tituloinicio">
                    <h2>Inicio de Sesión</h2>
                </div>
            </div>  
            <div class="containerini">
                <form method="POST" action="../back-end/log-usuario/log-alumno.php">
                    <div class="logosweb">
                        <div class="intalumno" id="inicioalumno">
                            <h2>Alumnos</h2>
                        </div>
                        <div class="logoalum">  
                            <a id="logalum"><img src="../../image/iconos/userini/alumno.webp" alt="alumnoslogo"></a>
                        </div>     
                    </div>
                    <div class="contenedor-matricula">
                        <input type="text" name="matricula" class="input-personalizado" placeholder="Matrícula" id="matricula" required>
                    </div>
                    <div class="contenedor-contraseña">
                        <input type="password" name="password" class="input-personalizado2" placeholder="Contraseña" id="contraseña" required>
                        <i class="fas fa-eye toggle-password" id="togglePassword"></i>
                    </div>
                    <?php if (isset($_SESSION['error'])): ?>
                        <div class="error-mensaje">
                            <?php echo $_SESSION['error']; ?>
                        </div>
                        <?php unset($_SESSION['error']); ?>
                    <?php endif; ?>
                    <div class="contenedor-recuperar">
                        <div class="barra"></div>
                        <h3>¿Olvidaste la contraseña?</h3>
                        <h4><a id="contraseñarecu" href="../rest-pasword/rest-contra.php" class="link-recuperar">Presiona aquí</a></h4>
                    </div>
                    <div class="contenedor-botones">
                        <button type="submit" class="btn-acceder">Acceder</button>
                        <button type="button" class="btn-cancelar" onclick="location.reload()">Cancelar</button> 
                    </div>         
                </form>
            </div>
            <div class="toggle-container">
                <label class="toggle">
                    <input type="checkbox" id="guestMode" onchange="toggleGuestMode()">
                    Activar modo invitado
                </label>
                <button id="acceptButton" class="accept-button" onclick="redirectToGuest()">Aceptar</button>
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
    <script src="../../js/invitado.js"></script>
    <script src="../../js/menu.js"></script>
</body>
</html>