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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="shortcut icon" href="../../../image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="../../../css/mapa.css">
    <link rel="stylesheet" href="../../../css/gest-afis.css">
</head>
<body>
    <header class="welcome-header">
        <div>
            <h2>Bienvenido Administrativo</h2>
            <p>Sistema de Gestión de AFIs - UNIMAP</p>
        </div>
        <div class="log">
            <a  class="fl" href="gest-afis.php"><img src="../../../image/iconos/logo/unimap.webp" alt="Logo Universidad"></a>
    </header>
    <div class="action-buttons">
        <button class="btn-primary" onclick="showPopup()">
            <i class="fas fa-search"></i> Mostrar AFIs
        </button>
        <a class="btn btn-secondary" href="mapa-admin.php">
            <i class="fas fa-arrow-left"></i> Regresar
        </a>
    </div>
    
    <form id="uploadForm" method="POST" action="../../back-end/afi/subir-afi.php">
    <h2>Cargar AFIs a la Base de Datos</h2>
        <label for="month">Mes:</label>
        <select id="month" name="month" required>
            <option value="ENERO">Enero</option>
            <option value="FEBRERO">Febrero</option>
            <option value="MARZO">Marzo</option>
            <option value="ABRIL">Abril</option>
            <option value="MAYO">Mayo</option>
            <option value="Junio">Junio</option>
            <option value="JULIO">Julio</option>
            <option value="AGOSTO">Agosto</option>
            <option value="SEPTIEMBRE">Septiembre</option>
            <option value="OCTUBRE">Octubre</option>
            <option value="NOVIEMBRE">Noviembre</option>
            <option value="DICIEMBRE">Diciembre</option>
        </select>
        <label for="year">Año:</label>
        <input type="number" id="year" name="year" min="2023" required>
        <button type="submit">Cargar AFIs</button>
    </form>

    <form id="deleteForm" method="POST" action="../../back-end/afi/borrar-afi.php" onsubmit="return confirmDelete()">
        <h2>Borrar AFIs</h2>
        <label for="deleteMonth">Mes:</label>
        <select id="deleteMonth" name="month" required>
            <option value="ENERO">Enero</option>
            <option value="FEBRERO">Febrero</option>
            <option value="MARZO">Marzo</option>
            <option value="ABRIL">Abril</option>
            <option value="MAYO">Mayo</option>
            <option value="Junio">Junio</option>
            <option value="JULIO">Julio</option>
            <option value="AGOSTO">Agosto</option>
            <option value="SEPTIEMBRE">Septiembre</option>
            <option value="OCTUBRE">Octubre</option>
            <option value="NOVIEMBRE">Noviembre</option>
            <option value="DICIEMBRE">Diciembre</option> 
        </select>   
        <button type="submit">Borrar AFIs</button>
    </form>
    <!-- Botón para mostrar el popup -->
    <div id="popup-overlay" class="popup-overlay"></div>
    <!-- Contenido del popup -->
    <div id="popup" class="popup">
        <h2>Mostrar AFIs por Mes</h2>
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
                <button type="submit">Buscar</button>
                <button type="button" onclick="closePopup()">Cerrar</button>
            </form>
        </div>
        <div class="table-container" id="results">
        </div>
    </div>
    <div class="excel">
        <form id="uploadExcelForm" method="POST" action="../../back-end/afi/subir-exel.php" enctype="multipart/form-data">
            <h2>Subir Archivo Excel</h2>
            <label for="month">Mes:</label>
            <select id="month" name="month" required>
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
            <label for="year">Año:</label>
            <input type="number" id="year" name="year" min="2023" required>
            <label for="excelFile">Selecciona el archivo Excel:</label>
            <input type="file" id="excelFile" name="excelFile" accept=".xls, .xlsx" required>
            <button type="submit">Subir Archivo Excel</button>
        </form>
        <div class="downloadcontainer"> 
            <div class="downloadexel"> 
                <label for="excelFile2">Descargar estructura</label>
                <a href="../../../archivos/Estructura-Afis.xlsx" download="Estructura_AFIS.xlsx">
                    <button type="submit">Descargar</button>
                </a>
            </div>
        </div>
    </div>

    <script src="../../../js/mostrar-afi.js"></script>
    <script src="../../../js/global.js"></script>
    
    <script>
        function confirmDelete() {
            if (confirm("¿Estás seguro de que quieres borrar los datos seleccionados?")) {
                return confirm("Esta acción es irreversible. ¿Confirmas el borrado?");
            }
            return false;
        }
    </script>
</body>
</html>