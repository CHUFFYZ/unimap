
<?php
session_start();

$allowed = ['administrativo']; // Solo acceso administrativo

if (!isset($_SESSION['admin']) || 
    !isset($_SESSION['admin']['tipo']) || 
    !in_array($_SESSION['admin']['tipo'], $allowed)) {
    
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a administrativos. Redirigiendo...";
    header("Refresh: 3; URL=sesionADMIN.php");
    exit();
}
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon"  href="../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../css/admin.css">
</head>
<body>
    <header class="welcome-header">
        <div>
            <h2>Bienvenido Administrativo</h2>
            <p>Sistema de Gestión de AFIs - UNIMAP</p>
        </div>
        <div class="log">
            <img src="../image/LogoBlanco.webp" alt="Logo Universidad">
        </div>
    </header>
    <!-- Agrega esto justo después del header -->
    <div class="action-buttons">
        <button class="btn-primary" onclick="showPopup()">
            <i class="fas fa-search"></i> Mostrar AFIs
        </button>
        <a class="btn btn-secondary" href="mapaADMIN.php">
            <i class="fas fa-arrow-left"></i> Regresar
        </a>
    </div>
    
    <form id="uploadForm" method="POST" action="../upload_afis.php">
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

         <!-- Formulario para borrar datos -->
    <form id="deleteForm" method="POST" action="../delete_afis.php" onsubmit="return confirmDelete()">
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
            <form id="searchForm" method="GET" action="../mostraafi.php">
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
    <div class="excel">
        <form id="uploadExcelForm" method="POST" action="../subir-exel.php" enctype="multipart/form-data">
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
                <a href="../archivos/436.xlsx" download="Estructura_AFIS.xlsx">
                    <button type="submit">Descargar</button>
                </a>
            </div>
        </div>
    </div>

    <script src="../zoom2.js"></script>
    <script src="../js/popup-afi.js"></script>
    <script src="../js/mostarafi.js"></script>
    
    <script>
        // Función para confirmar dos veces antes de borrar
        function confirmDelete() {
            if (confirm("¿Estás seguro de que quieres borrar los datos seleccionados?")) {
                return confirm("Esta acción es irreversible. ¿Confirmas el borrado?");
            }
            return false;
        }
    </script>
</body>
</html>