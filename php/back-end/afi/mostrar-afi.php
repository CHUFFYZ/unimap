<?php
if (isset($_GET['month1'])) {
    $validMonths = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    $month = strtoupper($_GET['month1']);
    
    if (!in_array($month, $validMonths, true)) {
        die("Error: Mes no válido.");
    }

    try {
        $databasePath = '../../../DB/AFIS.db';
        $pdo = new PDO("sqlite:" . $databasePath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Asumiendo que las tablas se llaman igual que los meses en mayúsculas
        $query = "SELECT * FROM $month";
        $stmt = $pdo->query($query);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($results)) {
            echo "No hay registros para $month.";
            exit;
        }

        echo "<table border='1'>";
        echo "<tr><th>Día</th><th>AFI</th><th>Horas Totales</th><th>Horario</th><th>Lugar</th><th>Tipo</th><th>Notificacion</th></tr>";
        foreach ($results as $row) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['DIA'], ENT_QUOTES, 'UTF-8') . "</td>";
            echo "<td>" . htmlspecialchars($row['AFI'], ENT_QUOTES, 'UTF-8') . "</td>";
            echo "<td>" . htmlspecialchars($row['HRS_TOTALES']) . "</td>";
            echo "<td>" . htmlspecialchars($row['HORARIO']) . "</td>";
            echo "<td>" . htmlspecialchars($row['LUGAR']) . "</td>";
            echo "<td>" . htmlspecialchars($row['TIPO']) . "</td>";
            echo "<td>" . htmlspecialchars("") . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } catch (PDOException $e) {
        error_log("Error DB: " . $e->getMessage());
        die("Error al cargar los datos.");
    }
} else {
    die("Parámetro 'month1' no recibido.");
}
?>