<?php
require '../../../vendor/autoload.php'; // Cargar PhpSpreadsheet desde Composer

use PhpOffice\PhpSpreadsheet\IOFactory;

try {
    // Ruta completa al archivo de la base de datos
    $databasePath = __DIR__ . '/../../../DB/AFIS.db';

    // Conexión a SQLite
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener mes y año del formulario
    $month = isset($_POST['month']) ? strtoupper($_POST['month']) : null; // Convertir a mayúsculas
    $year = isset($_POST['year']) ? $_POST['year'] : null;

    // Validar que el mes y el año hayan sido seleccionados
    if ($month === null || $month === '') {
        die("Error: No se seleccionó un mes.");
    }
    if ($year === null || $year === '') {
        die("Error: No se seleccionó un año.");
    }

    // Validar que el mes sea válido
    $validMonths = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    if (!in_array($month, $validMonths)) {
        die("Error: Mes no válido.");
    }

    // Generar la ruta del archivo Excel
    $folder = ($month === 'ENERO' || $month === 'FEBRERO' || $month === 'MARZO' || $month === 'ABRIL' || $month === 'MAYO' || $month === 'JUNIO') ? "ENE-JUN_$year" : "JUL-DIC_$year";
    $fileName = "{$month}_{$year}.xlsx"; // Corregir la concatenación
    $filePath = "../../../DB/afis/$folder/$fileName";

    // Verificar que el archivo exista
    if (!file_exists($filePath)) {
        die("Error: El archivo $fileName no existe en la ruta $filePath");
    }

    // Leer el archivo Excel usando PhpSpreadsheet
    $spreadsheet = IOFactory::load($filePath); // Cargar el archivo Excel
    $sheet = $spreadsheet->getActiveSheet(); // Seleccionar la hoja activa
    $data = $sheet->toArray(); // Convertir el contenido a un arreglo

    // Insertar datos en la tabla correspondiente al mes seleccionado
    $query = "INSERT INTO $month (DIA, AFI, HRS_TOTALES, HORARIO, LUGAR, TIPO) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($query);
    foreach ($data as $row) {
        // Evitar encabezados si están en la primera fila
        if (strtoupper($row[0]) == 'DIA') {
            continue;
        }

        // Validar datos antes de la inserción
        $dia = $row[0] ?? null;
        $afi = $row[1] ?? null;
        $hrs_totales = $row[2] ?? null;
        $horario = $row[3] ?? null;
        $lugar = $row[4] ?? null;
        $tipo = $row[5] ?? null;

        // Evitar inserciones de filas vacías
        if ($dia && $afi && $hrs_totales && $horario && $lugar && $tipo) {
            $stmt->execute([$dia, $afi, $hrs_totales, $horario, $lugar, $tipo]);
        }
    }

    echo "¡Datos cargados exitosamente en la tabla $month!";
} catch (PDOException $e) {
    echo "Error en la conexión con la base de datos: " . $e->getMessage();
} catch (Exception $e) {
    echo "Error general: " . $e->getMessage();
}
?>
