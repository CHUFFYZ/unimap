<?php
ob_start();
session_start();

error_log("Session data on mapa-alumn.php: " . print_r($_SESSION, true));
error_log("Session ID: " . session_id());
error_log("Cookie lifetime: " . ini_get('session.cookie_lifetime'));

$allowed = ['alumno'];

if (!isset($_SESSION['alumno'])) {
    error_log("Session 'alumno' not set");
    $error = "Sesión no iniciada.";
} elseif (!isset($_SESSION['alumno']['tipo']) || !in_array($_SESSION['alumno']['tipo'], $allowed)) {
    error_log("Invalid or missing 'tipo': " . ($_SESSION['alumno']['tipo'] ?? 'not set'));
    $error = "Acceso restringido a alumnos.";
} elseif (!isset($_SESSION['alumno']['nombre']) || !isset($_SESSION['alumno']['apellido'])) {
    error_log("Missing 'nombre' or 'apellido'");
    $error = "Datos de usuario incompletos.";
} elseif (!isset($_SESSION['alumno']['session_expiry']) || time() > $_SESSION['alumno']['session_expiry']) {
    error_log("Session expired or 'session_expiry' not set. Current time: " . time() . ", Expiry: " . ($_SESSION['alumno']['session_expiry'] ?? 'not set'));
    $error = "Sesión expirada.";
}

if (isset($error)) {
    session_unset();
    session_destroy();
    header("HTTP/1.1 403 Forbidden");
    echo $error . " Redirigiendo...";
    header("Refresh: 1; URL=../sesion-alumn.php");
    exit();
    
    
}

ob_end_flush();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIMAP - Ayuda</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap">
    <link rel="icon" href="../../../image/iconos/logo/LogoBlanco1.svg" type="image/webp"/>
    <link rel="stylesheet" href="../../../css/ayuda.css">
</head>
<body>
    <button class="back-button" onclick="window.history.back()">Regresar</button>
    <div class="container">
        <h1>Ayuda con UNIMAP Alumnos</h1>
        <p>¿Tienes problemas con UNIMAP? ¡Estamos aquí para ayudarte! Envíanos un correo a <a href="mailto:soporte.uninap@gmail.com">soporte.uninap@gmail.com</a> o mediante inbox en nuestra pagina oficial de facebook <a href="https://www.facebook.com/people/UNIMAP-Mapa-Interactivo-Universitario/61576284754408/" target="_blank">UNIMAP-Mapa Interactivo Universitario </a> y te responderemos lo antes posible.</p>
        
        <h2>Cómo usar el mapa interactivo</h2>
        <p>A continuación, te explicamos paso a paso cómo funciona el mapa interactivo de UNIMAP y todas las acciones que puedes realizar:</p>
        
        <div class="steps-container" id="steps-container">
            <div class="step">
                <h3>Paso 1: Inicia sesión como alumno</h3>
                <p>Después de iniciar sesión, UniMap se cargará en el modo "alumno". Para una buena experiencia, confirma que tu conexión a internet sea estable.</p>
                <div class="step-images-container">
                    <img class="step-image" src="../../../image/ayuda/alumno/index-pc.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc.png')">
                    <img class="step-image" src="../../../image/ayuda/alumno/index-mv.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv.png')">
                </div>
            </div>
            <div class="step">
                <h3>Paso 2: Navegación en el mapa</h3>
                <p>Utiliza los controles de zoom (+/-) ubicados en la esquina inferior derecha del mapa para acercar o alejar la vista. Encima de estos controles se encuentra el botón de "Puntos de interés". Actívelo para que puedan visualizarse marcadores azules en el mapa. Al hacer clic en uno de ellos, podrá consultar la información de ese lugar. Algunos puntos incluyen además imágenes en 360°.</p>
                <P>En el ordenador, también puedes usar la rueda del ratón.</P>
                <P>En dispositivos móviles, usa los botones de zoom o el gesto de " pellizcar " en la pantalla.</P>
                <div class="step-images-container">
                <img class="step-image" src="../../../image/ayuda/alumno/index-pc-+-.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc-+-.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-+-.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-+-.png')">
                </div>
            </div>
            <div class="step">
                <h3>Paso 2.1: Navegación en el mapa</h3>
                <p>Si reduces lo suficiente el zoom para poder visualizar el mapa de Ciudad del Carmen 😲</p>
                <div class="step-images-container">
                <img class="step-image" src="../../../image/ayuda/alumno/video.gif" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/video.gif')">
                <img class="step-image" src="../../../image/ayuda/alumno/video2.gif" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/video2.gif')">
                </div>
            </div>
            <div class="step">
                <h3>Paso 3: Atajos de teclado</h3>
                <p>Usa los siguientes atajos para una navegación más rápida:</p>
                <ul>
                    <li><strong>+</strong> o <strong>=</strong>: Acercar el zoom</li>
                    <li><strong>-</strong>: Alejar el zoom</li>
                    <!--<li><strong>Inicio</strong>: Restablecer a la vista completa</li>-->
                </ul>
            </div>
             <div class="step">
                <h3>Paso 4: Explora el mapa y los edificios</h3>
                <p>Haz clic y arrastra el mapa para moverte por las diferentes áreas.</p>
                <P>Haz clic sobre el pin de un edificio para visualizar sus características principales. Si luego hace clic en la ventana emergente que aparece sobre el pin, se desplegará un apartado con imágenes e información adicional del edificio.</P>
                <div class="step-images-container">
                <img class="step-image" src="../../../image/ayuda/alumno/index-pc-pin.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc-pin.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-pin.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-pin.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-pc-info.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc-info.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-info.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-info.png')">
                
                </div>
            </div>
            <div class="step">
                <h3>Paso 5: Usa el buscador de edificios</h3>
                <p>Si no encuentras un edificio, usa la lupa en la esquina inferior izquierda. Al hacer clic, aparecerá un listado de edificios con un buscador. Selecciona el edificio que buscas y haz clic en su rectángulo para que el mapa te redirija a él.</P>
                <div class="step-images-container">
                <img class="step-image" src="../../../image/ayuda/alumno/index-pc-bus.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc-bus.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-bus.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-bus.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-pc-busc.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc-busc.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-busc.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-busc.png')">
                </div>
            </div>
            <div class="step">
                <h3>Paso 6: Accede a las opciones adicionales</h3>
                <p>En un ordenador, encontrarás opciones como AFIS, Calendario, Cubículos de Profesores, Sobre UNIMAP y la página de Facebook en la barra superior</p>
                <P>En un dispositivo móvil, haz clic en el símbolo de menú (≡) para ver todas estas opciones.</P>
                <div class="step-images-container">
                <img class="step-image" src="../../../image/ayuda/alumno/index-pc-opc.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-pc-opc.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-opc.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-opc.png')">
                <img class="step-image" src="../../../image/ayuda/alumno/index-mv-opc1.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/alumno/index-mv-opc1.png')">
                </div>
            </div>
            <div class="step">
                <h3>Paso 7: Cuenta</h3>
                <p>Para ver tu información de usuario, cambiar tu foto de perfil o cerrar sesión, busca el círculo con la imagen de un usuario en la esquina superior izquierda. Al hacer clic, se abrirá un menú con las opciones de Cuenta, Cerrar sesión y Ayuda.</p>
            </div>
            <div class="step">
                <h3>Navegadores compatibles</h3>
                <p>Navegadores compatibles: Brave, Microsoft Edge, Chrome, Opera, Navegador de samsung, Navegador de Google</p>
                <div class="step-images-container-n">
                <img class="step-image-n" src="../../../image/iconos/navegadores/brave.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/brave.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/chrome.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/chrome.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/edge.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/edge.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/opera.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/opera.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/samsung.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/samsung.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/google.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/google.png')">
                </div>
            </div>
            <div class="step">
                <h3>Navegadores incompatibles</h3>
                <p>Navegadores incompatibles: Opera GX, navegador integrado de Messenger, navegador integrado de telegram... todos los navegadores integrados de aplicaciones</p>
                <div class="step-images-container-n">
                <img class="step-image-n" src="../../../image/iconos/navegadores/Opera_GX_Icon.svg.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/Opera_GX_Icon.svg.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/messenger.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/messenger.png')">
                <img class="step-image-n" src="../../../image/iconos/navegadores/telegram.png" alt="Acceso al mapa" onclick="openModal('../../../image/iconos/navegadores/telegram.png')">
                </div>
            </div>
            <!--
            <div class="step">
                <h3>Paso 4: Vista completa</h3>
                <p>Presiona el botón de "Vista completa" (ícono de casa) para restablecer el mapa a su vista inicial y ver todo el contenido de una sola vez.</p>
                <div class="step-images-container">
                <img class="step-image" src="../image/ayuda/invitado/index-pc-btn-+-.png" alt="Acceso al mapa" onclick="openModal('../image/ayuda/invitado/index-pc-btn-+-.png')">
                <img class="step-image" src="../image/ayuda/invitado/index-mv-btn-+-.png" alt="Acceso al mapa" onclick="openModal('../image/ayuda/invitado/index-mv-btn-+-.png')">
                </div>
            </div>
            -->
            
        </div>
        <!--
        <h2>Galería de imágenes</h2>
        <p>Haz clic en cualquier imagen para verla en detalle. Usa el botón de cerrar para regresar.</p>
        <div class="images-container" id="images-container">
            <div class="image-card" onclick="openModal('../image/sample1.jpg')">
                <img src="../image/sample1.jpg" alt="Mapa interactivo">
                <p>Vista del mapa interactivo</p>
            </div>
            <div class="image-card" onclick="openModal('../image/sample2.jpg')">
                <img src="../image/sample2.jpg" alt="Controles del mapa">
                <p>Controles del mapa</p>
            </div>
        </div>
        -->
        <div class="info-box">
            <p><strong>¿Necesitas ayuda adicional?</strong></p>
            <p>Contáctanos enviando un correo a <a href="mailto:soporte.uninap@gmail.com">soporte.uninap@gmail.com</a> con una descripción detallada de tu problema. ¡Estamos listos para ayudarte!</p>
        </div>

        <div class="footer" id="footer-date">
            UNIMAP © 
        </div>
    </div>

    <div class="modal" id="image-modal">
        <button class="close-button" onclick="closeModal()">✖</button>
        <div class="modal-content">
            <img id="modal-image" src="" alt="Imagen ampliada">
        </div>
    </div>

    <script>
        const footerElement = document.getElementById('footer-date');
        const currentYear = new Date().getFullYear();
        footerElement.innerHTML = `UNIMAP © ${currentYear}`;
    </script>
    <script>
        function openModal(imageSrc) {
            const modal = document.getElementById('image-modal');
            const modalImage = document.getElementById('modal-image');
            modalImage.src = imageSrc;
            modal.style.display = 'flex';
        }

        function closeModal() {
            const modal = document.getElementById('image-modal');
            modal.style.display = 'none';
        }

        document.getElementById('image-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>