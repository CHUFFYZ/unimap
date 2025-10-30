<?php
session_start();

// Si existe alguna sesión activa, intentar redirigir
if (!empty($_SESSION)) {
    // 1. Verificar sesión de Alumno
    if (isset($_SESSION['alumno']) && $_SESSION['alumno']['tipo'] === 'alumno') {
        // Redirigir a la página del alumno
        header("Location: php/sesion/alumno/mapa-alumn.php");
        exit();
    }

    // 2. Verificar sesión de Profesor (Profe)
    if (isset($_SESSION['profesor']) && $_SESSION['profesor']['tipo'] === 'profesor') {
        // Redirigir a la página del profesor
        header("Location: php/sesion/profesor/mapa-profe.php");
        exit();
    }

    // 3. Verificar sesión de Administrador (Admin)
    if (isset($_SESSION['admin']) && $_SESSION['admin']['tipo'] === 'admin') {
        // Redirigir a la página del administrador
        header("Location: php/sesion/administrativo/mapa-admin.php");
        exit();
    }

    // Opcional: Si hay sesión pero no es de un tipo conocido, podríamos limpiarla.
    // session_unset();
    // session_destroy();
    
    // Si la sesión existe pero no cumple con los criterios anteriores,
    // el usuario se queda en index.php.
}

// Si no hay sesión o la sesión no coincide con ningún tipo,
// el flujo normal del index.php (contenido, enlaces de login, etc.) continúa.

// ... el resto del código HTML/PHP del index.php
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIMAP -  Mapa Interactivo Universitario</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/normalize.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.pannellum.org/2.5/pannellum.css">
    <link rel="shortcut icon" href="image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="css/mapa.css">
    
    <link rel="stylesheet" href="css/global.css">
    <link rel="stylesheet" href="css/niveles-piso.css">
    <link rel="stylesheet" href="css/rutas.css">
    <link rel="stylesheet" href="css/especial.css">

</head>
<body>
    <div class="pantalla-bienvenida" id="pantallaBienvenida">
        <h1 id="mensajeBienvenida" data-key="msjbienbenida">¡Bienvenido!</h1>
            <img src="image/iconos/carga/loading1.png" alt="Imagen de bienvenida" class="imagen-bienvenida" id="imagenBienvenida">
        <h1 id="mensajeCargando" data-key="msjcargando">Cargando...</h1>
    </div>
    <div id="contenido" style="display: none;"></div>
    <div class="supercontainer">
        <div class="usuario" id="usuario-toggle">
            <img src="image/iconos/userini/snusuario.svg" alt="User Image">
        </div>
        <div class="menu-usuario" id="menu-usuario">
                <div class="opciones">
                    <div class="contain-inisesion menu-option">
                        <a class="boton" data-key="opcinisesion" href="php/sesion/sesion-alumn.php">Inicio de Sesion</a>
                    </div>
                    <div class="contain-registrar menu-option">
                        <a class="boton" data-key="opcregist" href="html/registro.html">Registrarse</a>
                    </div>
                    <div class="contain-ayuda menu-option">
                        <a class="boton" data-key="opcayuda" href="html/ayuda-invitado.html">Ayuda</a>
                    </div>
                </div>
                <!-- 
                <div class="idioma">
                    <div class="language-switcher">
                        <select id="languageSelector">
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                </div>
                -->
            </div>
        <div class="unimap">
            <div class="containerlogo">
                <a id="logoweb" class="fl" href="index.php"><img src="image/iconos/logo/unimap.webp" alt="LogoUnimap"></a>
            </div>
            <div class="MensajeUNIMAP">
                <div id="nombrelogo">
                    <h2><span>U N I M A P</span></h2>
                    <h4><span data-key="subtitulounimap">Mapa Interactivo Universitario</span></h4>
                </div>
            </div>
        </div>
        <div class="menu-toggle" id="menu-toggle">☰</div>
        <div class="menu-container" id="menu-container"> 
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="html/bots.html">Bots</a>
            </div> 
            <!--
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="diagramas.html">Bots</a>
            </div>          -->
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="html/calendario.html">Calendario Escolar</a>
            </div>
            <div class="aboutme menu-option">
                <a class="btn" data-key="opcsobremi" href="html/aboutme.html">Sobre mi</a>
            </div>
            <div class="container3 menu-option">
                <a class="f" href="https://www.facebook.com/share/1C651KQP8b/" target="_blank" > <i class="fab fa-facebook-f"></i></a>
            </div>
        </div>
    </div>
    <div id="map-container">
        <div id="map"></div>
        <div id="osm-map"></div>
    </div>
    
    <div id="guia-container">
        <div class="palpitante3">
            <i class="fa-solid fa-magnifying-glass" aria-label="Abrir panel de ubicaciones"></i>
        </div>
        <div class="palpitante2">
            <h2><-- ¡Consulta Edificios Aquí!</h2>
        </div>
        <div id="location-controls"></div>
        <div id="location-details"></div>
    </div>
    
    <div id="guia-container2">
        <div class="palpitante5">
            <i class="fa-solid fa-magnifying-glass" aria-label="Abrir panel de ubicaciones"></i>
        </div>
        <div class="palpitante4">
            <h2><-- ¡Consulta lugares Aquí!</h2>
        </div>
        <div id="location-controls2"></div>
        <div id="osm-location-details" class="location-details"></div>
    </div>
    <div id="fullscreen-image">
            <span class="fullscreen-close-btn">×</span>
            <img src="" alt="Imagen en pantalla completa">
            <video src="" alt="" style="display: none;"></video>
    </div>
    <div id="panorama-viewer" class="panorama-container">
            <div id="panorama"></div>
            <span class="panorama-close-btn">×</span>
    </div>
    <div id="popup-overlay" class="popup-overlay"></div>
    <div class="barra">
        <p><span data-key="msjcopyright">&copy; 2025 UNIMAP. Todos los derechos reservados.</span></p>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.pannellum.org/2.5/pannellum.js"></script>
    <script src="js/locations2.js"></script>
    <script src="js/zoom5.js"></script>
    <script src="js/zoom6.js"></script>
    <script src="js/global.js"></script>
    <script src="js/menu.js"></script>
    <script src="js/menu-usuario.js"></script>
</body>
</html>