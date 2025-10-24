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
    <title>UNIMAP -  Mapa Interactivo Universitario</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../css/normalize.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.pannellum.org/2.5/pannellum.css">
    <link rel="shortcut icon" href="../../../image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="../../../css/mapa.css">
    <link rel="stylesheet" href="../../../css/global.css">
    <link rel="stylesheet" href="../../../css/niveles-piso.css">
    <link rel="stylesheet" href="../../../css/rutas.css">
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
            $matricula = isset($_SESSION['alumno']['matricula']) ? $_SESSION['alumno']['matricula'] : '';
            $imageExtension = 'webp'; 
            $imagePath = "../../../image/usuarios/alumn/$matricula/{$matricula}user.$imageExtension";
            $defaultImage = "../../../image/usuarios/user-unknown/user.webp";
            $displayImage = file_exists($imagePath) ? $imagePath : $defaultImage;
            ?>
            <img src="<?php echo htmlspecialchars($displayImage); ?>" alt="User Image">
        </div>
        <div class="menu-usuario" id="menu-usuario">
            <div class="opciones">
                
                <div class="username">
                    <h1><div>Bienvenido Alumno</div><?php
                    
                        $nombre_completo = $_SESSION['alumno']['nombre'] ?? 'Usuario';
                        $apellido_completo = $_SESSION['alumno']['apellido'] ?? '';
                        $primer_nombre = !empty($nombre_completo) ? explode(' ', trim($nombre_completo))[0] : 'Usuario';
                        $primer_apellido = !empty($apellido_completo) ? explode(' ', trim($apellido_completo))[0] : '';
                        echo htmlspecialchars($primer_nombre . ($primer_apellido ? ' ' . $primer_apellido : ''));
                    ?></h1>
                </div>
                <div class="separador"></div>
                <div class="contain-inisesion menu-option">
                    <a class="boton" data-key="opcinisesion" href="usuario.php">Cuenta</a>
                </div>
                <div class="contain-ayuda menu-option">
                    <a class="boton" data-key="opcayuda" href="ayuda.php">Ayuda</a>
                </div>
                <div class="contain-registrar menu-option">
                    <a class="boton" data-key="opcregist" href="../../back-end/global-back-end/cerrar-sesion.php">Cerrar Sesión</a>
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
                <a class="btn" data-key="opccalendario" href="../../../html/bots.html">Bots</a>
            </div> 
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" onclick="showPopup()">Mostrar AFIS</a>
            </div>
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="../global-sesion/cubiculos.php">Cubículos</a>
            </div>
            <div class="aboutme menu-option">
                <a class="btn" data-key="opccalendario" href="../../../html/calendario.html"">Calendario Escolar</a>
            </div>
            <div class="aboutme menu-option">
                <a class="btn" data-key="opcsobremi" href="../../../html/aboutme.html">Sobre mí</a>
            </div>
            <div class="container3 menu-option">
                <a class="f" href="https://www.facebook.com/share/1C651KQP8b/" target="_blank"><i class="fab fa-facebook-f"></i></a>
            </div>
        </div>
    </div>
    
    <div id="map-container">
        <div id="map"></div>
        <div id="osm-map"></div>
    </div>
    <!--<div class="palpitante"></div>-->
    
    
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
    <div id="popup" class="popup">
        <h1>Mostrar AFIs por Mes</h1>
        <div class="form-container">
            <form id="searchForm" method="GET" action="../../back-end/afi/mostrar-afi.php">
                <label for="month1">Mes:</label>
                <select id="month1" name="month1" required>
                    <option value="ENERO">Enero</option>
                    <option value="FEBRERO">Febrero</option>
                    <option value="MARZO">Marzo</option>
                    <option value="ABRIL">Abril</option>
                    <option value="MAYO">Mayo</option>
                    <option value="JUNIO">Junio</option>
                    <option value="JULIO">Julio</option>
                    <option value="AGOSTO">Agosto</option>
                    <option value="SEPTIEMBRE">Septiembre</option>
                    <option value="OCTUBRE">Octubre</option>
                    <option value="NOVIEMBRE">Noviembre</option>
                    <option value="DICIEMBRE">Diciembre</option>
                </select>
                <div class="btn-cl-bus">
                    <button type="submit">Buscar</button>
                    <button type="button" onclick="closePopup()">Cerrar</button>
                </div>
            </form>
        </div>
        <div class="table-container" id="results">
        </div>
    </div>
    <div class="barra">
        <p><span data-key="msjcopyright">&copy; 2025 UNIMAP. Todos los derechos reservados.</span></p>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.pannellum.org/2.5/pannellum.js"></script>
    <script src="../../../js/locations.js"></script>
    <script src="../../../js/zoom3.js"></script>
    <script src="../../../js/zoom4.js"></script>
    <script src="../../../js/global.js"></script>
    <script src="../../../js/menu.js"></script>
    <script src="../../../js/menu-usuario.js"></script>
    <script src="https://unimap-50ch.onrender.com/js/lenguaje.js"></script>
    <script src="../../../js/mostrar-afi.js"></script>
</body>
</html>