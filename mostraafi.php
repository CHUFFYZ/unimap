<?php
if (isset($_GET['month1'])) {
    $validMonths = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    
    $month = strtoupper($_GET['month1']);
    
    if (!in_array($month, $validMonths, true)) {
        die("Error: Mes no válido.");
    }

    // Lista de ubicaciones registradas (extraída de zoom2.js)
    $locations = [
        'Rectoria' => [
            'places' => [
                ['name' => 'A', 'coords' => [556, 575]]
            ]
        ],
        'Biblioteca Universitaria' => [
            'places' => [
                ['name' => 'Biblioteca', 'coords' => [610, 1626]]
            ]
        ],
        'Facultad de Ciencias de la Informacion' => [
            'places' => [
                ['name' => 'C-1', 'coords' => [490, 1590]]
            ]
        ],
        'Centro de Idiomas' => [
            'places' => [
                ['name' => 'C', 'coords' => [715, 1600]]
            ]
        ],
        'Edificio de Vinculacion' => [
            'places' => [
                ['name' => 'CH', 'coords' => [310, 1431]]
            ]
        ],
        'Aula Magna' => [
            'places' => [
                ['name' => 'D', 'coords' => [810, 1415]]
            ]
        ],
        'Facultad de Quimica' => [
            'places' => [
                ['name' => 'T', 'coords' => [791, 1270]],
                ['name' => 'U', 'coords' => [892, 1285]],
                ['name' => 'U-1', 'coords' => [915, 1225]],
                ['name' => 'V', 'coords' => [878, 1330]]
            ]
        ],
        'Gimnasio Universitario y PE de LEFYD' => [
            'places' => [
                ['name' => 'E', 'coords' => [870, 783]]
            ]
        ],
        'Edificio de Cafeterias' => [
            'places' => [
                ['name' => 'F-1', 'coords' => [629, 1349]]
            ]
        ],
        'Facultad de Derecho' => [
            'places' => [
                ['name' => 'Z', 'coords' => [890, 1500]]
            ]
        ],
        'Facultad de Ciencias Educativas' => [
            'places' => [
                ['name' => 'H', 'coords' => [531, 1208]],
                ['name' => 'I', 'coords' => [550, 1173]],
                ['name' => 'K', 'coords' => [636, 1131]],
                ['name' => 'O', 'coords' => [705, 1092]],
                ['name' => 'Q', 'coords' => [660, 1216]]
            ]
        ],
        'Sala Audiovisual' => [
            'places' => [
                ['name' => 'P', 'coords' => [705, 1184]]
            ]
        ],
        'Facultad de Ciencias Economicas Administrativas' => [
            'places' => [
                ['name' => 'L', 'coords' => [590, 1086]],
                ['name' => 'R', 'coords' => [634, 1271]],
                ['name' => 'S', 'coords' => [760, 1333]],
                ['name' => 'X', 'coords' => [910, 1414]],
                ['name' => 'Y', 'coords' => [892, 1451]]
            ]
        ],
        'Centro de Educacion Continua' => [
            'places' => [
                ['name' => 'W', 'coords' => [894, 1371]]
            ]
        ]
    ];

    try {
        $databasePath = __DIR__ . '/DB/AFIS.db';
        $pdo = new PDO("sqlite:" . $databasePath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $query = "SELECT * FROM $month";
        $stmt = $pdo->query($query);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($results)) {
            echo "No hay registros para $month.";
            exit;
        }

        echo "<table border='1'>";
        echo "<tr><th>Día</th><th>AFI</th><th>Horas Totales</th><th>Horario</th><th>Lugar</th><th>Tipo</th></tr>";
        foreach ($results as $row) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['DIA'], ENT_QUOTES, 'UTF-8') . "</td>";
            echo "<td>" . htmlspecialchars($row['AFI'], ENT_QUOTES, 'UTF-8') . "</td>";
            echo "<td>" . htmlspecialchars($row['HRS_TOTALES']) . "</td>";
            echo "<td>" . htmlspecialchars($row['HORARIO']) . "</td>";
            
            // Procesar la columna Lugar
            $lugar = htmlspecialchars($row['LUGAR'], ENT_QUOTES, 'UTF-8');
            $lugarProcessed = $lugar;

            // 1. Buscar coincidencia exacta con nombres de locations
            foreach ($locations as $building => $data) {
                if (stripos($lugar, $building) !== false) {
                    // Usar el primer place de esta location
                    $placeName = $data['places'][0]['name'];
                    $coords = $data['places'][0]['coords'];
                    $lugarProcessed = preg_replace(
                        '/\b' . preg_quote($building, '/') . '\b/i',
                        "<a href='#' class='location-link-afi' style='color: blue; text-decoration: underline;' data-lat='{$coords[0]}' data-lng='{$coords[1]}' data-building='{$building}' data-place='{$placeName}'>{$building}</a>",
                        $lugar
                    );
                    break; // Salir tras la primera coincidencia
                }
            }

            // 2. Si no hubo coincidencia con location, buscar places
            if ($lugarProcessed === $lugar) {
                foreach ($locations as $building => $data) {
                    foreach ($data['places'] as $place) {
                        $placeName = $place['name'];
                        // Buscar placeName entre espacios o con espacio a la izquierda y guion/fin
                        $pattern = '/\s' . preg_quote($placeName, '/') . '(\s|-|$)/i';
                        if (preg_match($pattern, " $lugar ", $match)) {
                            $coords = $place['coords'];
                            $lugarProcessed = preg_replace(
                                '/\b' . preg_quote($placeName, '/') . '\b/i',
                                "<a href='#' class='location-link-afi' style='color: blue; text-decoration: underline;' data-lat='{$coords[0]}' data-lng='{$coords[1]}' data-building='{$building}' data-place='{$placeName}'>{$placeName}</a>",
                                $lugar
                            );
                            break 2; // Salir tras la primera coincidencia
                        }
                    }
                }
            }

            echo "<td>" . $lugarProcessed . "</td>";
            echo "<td>" . htmlspecialchars($row['TIPO']) . "</td>";
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