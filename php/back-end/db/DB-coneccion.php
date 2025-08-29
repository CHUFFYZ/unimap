<?php
function getDatabaseConnection() {
    $databasePath = '../../../DB/usuarios.db';
    
    if (!file_exists($databasePath)) {
        throw new Exception("Archivo de base de datos no encontrado");
    }

    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}