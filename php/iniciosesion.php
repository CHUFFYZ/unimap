<?php session_start(); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon"  href="../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../css/iniciosesion.css">
</head>
<body>
    <div class="fondo">
            <img src="../image/fondo.webp" alt="fondoimg">
        <div class="supercontainer">
            <div class="containerlogo">
                <a id="logoweb" class="fl" href="iniciosesion.php"><img src="../image/LogoBlanco.webp" alt="LogoUnimap"></a>
            </div>
            <div class="MensajeUNIMAP">
                <div id="nombrelogo">
                    <h2><span>U N I M A P</span></h2>
                    <h4><span>Mapa Interactivo Universitario</span></h4>
                </div>
            </div>
            <!-- Inicio menu---------------------------------------->

    
        <div class="menu-toggle" id="menu-toggle">&#9776;</div>
        <div class="menu-container" id="menu-container">
         <!-- Fin menu---------------------------------->    
                <div class="containerinf2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="iniciosesion.php">Alumnos</a>
                        </nav>
                    </div>
                </div>
                <div class="container2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="sesionADMIN.php">Administrativos</a>
                        </nav>
                    </div>
                </div>
                 <!-- 
                <div class="container3">
                    <div id="top-nav3" class="clearfix">
                        <nav class="fr3">
                            <a href="https://www.facebook.com/unacaroficial/" target="_blank"><i class="fab fa-facebook-f"></i></a>
                        </nav>
                    </div>
                </div>
                -->
            </div>
        </div>

        <!-- Cuadro del menú con el título dentro -->
        <div class="fondosupercontainer">
            <div class="inisesion">
                <div class="titulo" id="tituloinicio">
                    <h2> Inicio de Sesión </h2>
                </div>
            </div>  
            <div class="containerini">
                <!-- ---------------------------------------------------------------->    
                <form method="POST" action="log-alumnos.php">
                    <div class="logosweb">
                        <div class="intalumno" id="inicioalumno">
                            <h2>Alumnos</h2>
                        </div>
                        <div class="logoalum">  
                            <a id="logalum"><img src="../image/alumno.webp" alt="alumnoslogo"></a>
                        </div>     
                    </div>
                    <!-- Campo de entrada personalizado -->
                    <div class="contenedor-matricula">
                        <input type="text" name="matricula" class="input-personalizado" placeholder="Matrícula" id="matricula" required>
                    </div>
                    <!-- Campo de entrada personalizado -->
                    <div class="contenedor-contraseña">
                        <input type="password" name="password" class="input-personalizado2" placeholder="Contraseña" id="contraseña" required>
                        <i class="fas fa-eye toggle-password" id="togglePassword"></i>
                    </div>
                    <!-- Mensaje de error -->
                    <?php if (isset($_SESSION['error'])): ?>
                        <div class="error-mensaje">
                            <?php echo $_SESSION['error']; ?>
                        </div>
                        <?php unset($_SESSION['error']); ?>
                    <?php endif; ?>

                    <!-- Sección "¿Olvidaste la contraseña?" -->
                    <div class="contenedor-recuperar">
                        <div class="barra"></div>
                        <h3>¿Olvidaste la contraseña?</h3>
                        <h4><a id="contraseñarecu" href="restablecercotrasena/reset-request.php" target="_blank" class="link-recuperar">Presiona aquí</a></h4>
                    </div>
                <!-- Botones de acción -->
                    <div class="contenedor-botones">
                    <!-- Botón de Acceder -->
                    <button type="submit" class="btn-acceder">Acceder</button>
                    <!-- Botón de Cancelar -->
                    <button type="button" class="btn-cancelar" onclick="location.reload()">Cancelar</button> 
                </div>         
                </form>
            <!-- ---------------------------------------------------------------->   
            </div>
            <div class="toggle-container">
                <label class="toggle">
                    <input type="checkbox" id="guestMode" onchange="toggleGuestMode()">
                    Activar modo invitado
                </label>
                <button id="acceptButton" class="accept-button" onclick="redirectToGuest()">Aceptar</button>
            </div>
        </div>
    </div>
    <!-- Al final del body, antes de los scripts -->
<script>
    // Debug de envío de formulario
    document.querySelector('form').addEventListener('submit', function(e) {
        console.log('Formulario enviado');
        console.log('Matrícula:', document.getElementById('matricula').value);
        console.log('Contraseña:', document.getElementById('contraseña').value);
    });
</script>
<script>
/*ver contrasenna ojo---------------------------------------------------------------*/
document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#contraseña');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            // Alternar tipo de input
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            
            // Alternar icono
            this.classList.toggle('fa-eye-slash');
            this.classList.toggle('fa-eye');
        });
    }
});
</script>
    <script src="../js/invitado.js"></script>
    <script src="../js/menu.js"></script>
</body>
</html>