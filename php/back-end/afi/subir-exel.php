<?php
// En este script se procesa únicamente la subida del archivo Excel,
// sin insertar datos en la base de datos.
// Se utiliza PhpSpreadsheet solo si en el futuro se requiere manipular el contenido.

try {
    // Recibir y validar los datos enviados desde el formulario
    $month = isset($_POST['month']) ? strtoupper($_POST['month']) : null;
    $year  = isset($_POST['year'])  ? $_POST['year'] : null;

    if (empty($month)) {
        die("Error: No se ha seleccionado un mes.");
    }
    if (empty($year)) {
        die("Error: No se ha seleccionado un año.");
    }

    // Validar mes
    $validMonths = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    if (!in_array($month, $validMonths)) {
        die("Error: Mes no válido.");
    }

    // Verificar que se haya subido un archivo
    if (!isset($_FILES['excelFile'])) {
        die("Error: No se ha seleccionado un archivo para subir.");
    }

    $uploadedFile = $_FILES['excelFile'];

    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        die("Error al subir el archivo: " . $uploadedFile['error']);
    }

    // Validar extensión del archivo (se aceptan .xls y .xlsx)
    $allowedExtensions = ['xls', 'xlsx'];
    $fileExtension = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
    if (!in_array($fileExtension, $allowedExtensions)) {
        die("Error: El archivo debe ser un Excel con extensión .xls o .xlsx.");
    }

    // Definir la carpeta de destino según el mes:
    // - De ENERO a JUNIO: carpeta "ENE-JUN_año"
    // - De JULIO a DICIEMBRE: carpeta "JUL-DIC_año"
    if (in_array($month, ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO'])) {
        $folderName = "ENE-JUN_$year";
    } else {
        $folderName = "JUL-DIC_$year";
    }
    
    // Establecer la ruta destino (supone que la carpeta DB/afis está en el mismo nivel de este script)
    $targetDir = __DIR__ . "/../../../DB/afis/$folderName";

    // Crear la carpeta destino si no existe
    if (!file_exists($targetDir)) {
        if (!mkdir($targetDir, 0777, true)) {
            die("Error: No se pudo crear la carpeta de destino.");
        }
    }

    // Definir el nombre del archivo destino: "MES_AÑO.ext"
    $newFileName   = "{$month}_{$year}.$fileExtension";
    $targetFilePath = $targetDir . "/" . $newFileName;

    // Mover el archivo subido a la carpeta destino
    if (!move_uploaded_file($uploadedFile['tmp_name'], $targetFilePath)) {
        die("Error: No se pudo mover el archivo subido.");
    }

    echo "El archivo se ha subido correctamente y se ha guardado como <strong>$newFileName</strong> en la carpeta <strong>$folderName</strong>.";
} catch (Exception $e) {
    echo "Error general: " . $e->getMessage();
}
?>
