<?php
try {
    // Ruta completa al archivo de la base de datos
    $databasePath = __DIR__ . '/DB/AFIS.db';
    // Conexión a SQLite
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Conexión exitosa a la base de datos.";
} catch (PDOException $e) {
    echo "Error en la conexión: " . $e->getMessage();
}
?>