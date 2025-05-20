<?php
ob_start(); // Inicia el búfer de salida
session_start();
$allowed = ['alumno']; // Solo acceso alumnos
if (!isset($_SESSION['alumno']) || 
    !isset($_SESSION['alumno']['tipo']) || 
    !in_array($_SESSION['alumno']['tipo'], $allowed)) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a alumnos. Redirigiendo...";
    header("Refresh: 3; URL=iniciosesion.php");
    exit();
}
ob_end_flush(); // Libera el búfer y envía la salida
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
    <link rel="stylesheet" href="../css/normalize.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="icon" href="../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../css/mapaALUM.css">
    <link rel="stylesheet" href="../css/global.css">
    <!-- Pannellum para imágenes panorámicas -->
    <link rel="stylesheet" href="https://cdn.pannellum.org/2.5/pannellum.css">
</head>
<body>
    <!-- Pantalla de Bienvenida -->
    <div class="pantalla-bienvenida" id="pantallaBienvenida">
        <h1 id="mensajeBienvenida">¡Bienvenido!</h1>
        <img src="../image/loading1.png" alt="Imagen de bienvenida" class="imagen-bienvenida" id="imagenBienvenida">
        <h1 id="mensajeCargando">Cargando...</h1>
    </div>
    <div id="contenido" style="display: none;">
        <!-- Aquí puedes incluir tu contenido de mapa.html -->
    </div>

    <header>
        <div class="supercontainer">
            <div class="containerlogo">
                <a id="logoweb" class="fl" href="mapaALUM.php"><img src="../image/LogoBlanco.webp" alt="LogoUnimap"></a>
            </div>
            <div class="MensajeUNIMAP">
                <div id="nombrelogo">
                    <h2><span>U N I M A P</span></h2>
                    <h4><span>Mapa Interactivo Universitario</span></h4>
                </div>
            </div>
            <!-- Inicio menu -->
            <div class="menu-toggle" id="menu-toggle">☰</div>
            <div class="menu-container" id="menu-container">
                <div class="containerinf1">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" onclick="showPopup()">Mostrar AFIS</a>
                        </nav>
                    </div>
                </div>
                <div class="containerinfo">
                    <div id="top-navinfo" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="cubiculos.php">Cubiculos de Profesores</a>
                        </nav>
                    </div>
                </div>
                <div class="containerinf2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="../html/calendario.html" target="_blank">Calendario Escolar</a>
                        </nav>
                    </div>
                </div>
                <div class="container2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="../html/aboutme.html">About me</a>
                        </nav>
                    </div>
                </div>
                <div class="container3">
                    <div id="top-nav3" class="clearfix">
                        <nav class="fr3">
                            <a href="https://www.facebook.com/unacaroficial/" target="_blank"><i class="fab fa-facebook-f"></i></a>
                        </nav>
                    </div>
                </div>
                <div class="container2">
                    <div id="top-nav2" class="clearfix">
                        <nav class="fr2">
                            <a class="btn" href="cerrar-sesion.php">Cerrar Sesion</a>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </header>   
    <div id="map-container">
        <div id="map"></div>
    </div>
    <div class="palpitante"></div>
    <div class="palpitante2">
        <h2><-- ¡Consulta Edificios Aqui!</h2>
    </div>
    <div id="guia-container">
        <div class="palpitante3">
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
    
    <!-- Contenedor AFIs -->
    <div id="popup-overlay" class="popup-overlay"></div>
    <div id="popup" class="popup">
        <h1>Mostrar AFIs por Mes</h1>
        <div class="form-container">
            <form id="searchForm" method="GET" action="../mostraafi2.php">
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
                <button type="submit">Buscar</button>
                <button type="button" onclick="closePopup()">Cerrar</button>
            </form>
        </div>
        <div class="table-container" id="results">
            <!-- Aquí se mostrarán los resultados de la tabla -->
        </div>
    </div>
    <div class="barra">
        <p>© 2025 Universidad Autónoma del Carmen. Todos los derechos reservados.</p>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.pannellum.org/2.5/pannellum.js"></script>
    <script src="../js/zoom2.js"></script>
    <script src="../js/menu.js"></script>
    <script src="../js/popup-afi.js"></script>
    <script src="../js/mostarafi2.js"></script>
    <!--<script src="../js/geolocalizacion.js"></script>-->
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                document.getElementById('imagenBienvenida').classList.add('fadeOut');
            }, 2000);
        });
    </script>
    <script>
        const h2 = document.querySelector('.palpitante2 h2');
        function restartAnimation() {
            h2.style.animation = 'none'; // Desactiva la animación
            h2.offsetHeight; // Forzar reflujo para reiniciar
            h2.style.animation = 'palpitante2 8s ease-in-out forwards 3s'; // Reactiva
        }
        restartAnimation(); // Ejecutar al cargar
        setInterval(restartAnimation, 20000); // Repetir cada 2.5 minutos
    </script>
</body>
</html>