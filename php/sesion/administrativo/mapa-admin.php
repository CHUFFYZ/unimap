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
    <title>UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../css/normalize.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.pannellum.org/2.5/pannellum.css">
    <link rel="shortcut icon" href="../../../image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="../../../css/mapa.css">
    <link rel="stylesheet" href="../../../css/global.css">
    <link rel="stylesheet" href="../../../css/admin-exclusivo.css">
</head>
<body>
    <div class="pantalla-bienvenida" id="pantallaBienvenida">
        <h1 id="mensajeBienvenida" data-key="msjbienbenida">¡Bienvenido!</h1>
            <img src="../../../image/iconos/carga/loading1.png" alt="Imagen de bienvenida" class="imagen-bienvenida" id="imagenBienvenida">
        <h1 id="mensajeCargando" data-key="msjcargando">Cargando...</h1>
    </div>
    <div id="contenido" style="display: none;"></div>
    <div class="supercontainer">
        <div class="usuario" id="usuario-toggle">
        <?php
            $matricula = isset($_SESSION['admin']['matricula']) ? $_SESSION['admin']['matricula'] : '';
            $imageExtension = 'webp'; 
            $imagePath = "../../../image/usuarios/$matricula/{$matricula}user.$imageExtension";
            $defaultImage = "../../../image/usuarios/user-unknown/user.webp";
            $displayImage = file_exists($imagePath) ? $imagePath : $defaultImage;
            ?>
            <img src="<?php echo htmlspecialchars($displayImage); ?>" alt="User Image">
        </div>
        <div class="menu-usuario" id="menu-usuario">
                <div class="opciones">
                    <div class="username">
                        <h1><div>Bienvenido Administrador</div><?php
    
                            $nombre_completo = $_SESSION['admin']['nombre'] ?? 'Usuario';
                            $apellido_completo = $_SESSION['admin']['apellido'] ?? '';
                            $primer_nombre = !empty($nombre_completo) ? explode(' ', trim($nombre_completo))[0] : 'Usuario';
                            $primer_apellido = !empty($apellido_completo) ? explode(' ', trim($apellido_completo))[0] : '';
                            echo htmlspecialchars($primer_nombre . ($primer_apellido ? ' ' . $primer_apellido : ''));
                        ?></h1>
                    </div>
                    <div class="separador"></div>
                    <div class="contain-inisesion menu-option">
                        <a class="boton" data-key="opcinisesion" href="../php/sesion/sesion-alumn.php">cuenta</a>
                    </div>
                    <div class="contain-ayuda menu-option">
                        <a class="boton" data-key="opcayuda" href="ayuda.php">Ayuda</a>
                    </div>
                    <div class="contain-registrar menu-option">
                        <a class="boton" data-key="opcregist" href="../../back-end/global-back-end/cerrar-sesion.php">Cerrar Sesion</a>
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
                </div> -->
            </div>
        <div class="unimap">
            <div class="containerlogo">
                <a id="logoweb" class="fl" href="mapa-alumn.php"><img src="../../../image/iconos/logo/unimap.webp" alt="LogoUnimap"></a>
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
                <a class="btn" data-key="opccalendario" href="gest-afis.php">Gestion AFIS</a>
            </div>    
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="alta-alumn.php">Gestion Alumnos</a>
            </div>  
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="alta-prof.php">Gestion Profesores</a>
            </div>    
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="alta-admin.php">Gestion Admin</a>
            </div>    
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="../../../html/calendario.html"">Calendario Escolar</a>
            </div>
            <div class="aboutme menu-option">
                <a class="btn" data-key="opcsobremi" href="../../../html/aboutme.html">Sobre mi</a>
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
    <div class="palpitante"></div>
    <div class="palpitante2">
        <h2><-- ¡Consulta Edificios Aqui!</h2>
    </div>
    <div id="guia-container">
        <div class="palpitante3" title="Botón usuario">
            <i class="fa-solid fa-magnifying-glass" aria-label="Abrir panel de ubicaciones"></i>
        </div>
        <div id="location-controls"></div>
        <div id="location-details"></div>
        <div id="fullscreen-image">
            <span class="fullscreen-close-btn">×</span>
            <img src="" alt="Imagen en pantalla completa">
            <video src="" alt="" style="display: none;"></video>
        </div>
        <div id="panorama-viewer" class="panorama-container">
            <div id="panorama"></div>
            <span class="panorama-close-btn">×</span>
        </div>
    </div>
    <div class="barra">
        <p><span data-key="msjcopyright">&copy; 2025 UNIMAP. Todos los derechos reservados.</span></p>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.pannellum.org/2.5/pannellum.js"></script>
    <script src="../../../js/zoom2.js"></script>
    <script src="../../../js/global.js"></script>
    <script src="../../../js/menu.js"></script>
    <script src="../../../js/menu-usuario.js"></script>
    <script src="../../../js/lenguaje.js"></script>
</body>
</html>
