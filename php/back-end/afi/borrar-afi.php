<?php
try {
    // Ruta al archivo de la base de datos en la carpeta DB
    $databasePath = __DIR__ . '/../../../DB/AFIS.db'; // Asegúrate de que el nombre de la base de datos sea correcto

    // Conexión a la base de datos SQLite
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener el mes desde el formulario
    $month = isset($_POST['month']) ? strtoupper($_POST['month']) : null; // Convertir a mayúsculas

    // Validar que el mes haya sido seleccionado
    if ($month === null || $month === '') {
        die("Error: No se seleccionó un mes.");
    }

    // Verificar que el mes sea válido (ejemplo: ENERO, FEBRERO, etc.)
    $validMonths = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    if (!in_array($month, $validMonths)) {
        die("Error: Mes no válido.");
    }

    // Construir la consulta SQL para eliminar todos los datos de la tabla correspondiente al mes
    $query = "DELETE FROM $month"; // La tabla seleccionada será el nombre del mes
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    // Confirmar el número de registros eliminados
    $rowsDeleted = $stmt->rowCount(); // Contar las filas afectadas
    if ($rowsDeleted > 0) {
        echo "Se eliminaron $rowsDeleted registros de la tabla $month correctamente.";
    } else {
        echo "No se encontraron registros en la tabla $month.";
    }
} catch (PDOException $e) {
    echo "Error al intentar eliminar los datos: " . $e->getMessage();
} catch (Exception $e) {
    echo "Error general: " . $e->getMessage();
}
?>
