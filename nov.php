<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Crear una nueva hoja de cálculo
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setCellValue('A1', 'Hola, PhpSpreadsheet!');
$sheet->setCellValue('B1', 'Estamos generando Excel.');
$sheet->setCellValue('A2', '¡Éxito asegurado!');

// Guardar como archivo Excel
$writer = new Xlsx($spreadsheet);
$fileName = 'archivo_generado.xlsx'; // Nombre del archivo generado
$writer->save($fileName);

echo "¡Archivo Excel generado con éxito! Archivo guardado como: $fileName";
?>
