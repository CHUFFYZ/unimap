const campuses = {
    'Campus Principal': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus1.svg',
        geojson: '../../../data/university_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Aqui puro ingeniero de calidad',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    },
    'Campus 2': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'cetis el mejor',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    },
    'Campus 3': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Descripción del Campus 3.',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    },
    'Campus Sabancuy': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Descripción del Campus Sabancuy.',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    },
    'Jardin Botanico': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Descripción del Jardín Botánico.',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    },
    'Centro Cultural Universitario': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Descripción del Centro Cultural Universitario.',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    },
    'Museo Guanal': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Descripción del Museo Guanal.',
        photos: [
            { url: '../../../image/locations/CP/galeria/campus/1.webp', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/video.mp4' } // Ejemplo de video
        ]
    }
};

// Lista de ubicaciones por campus
const locations = {
    'Campus Principal': {
        'Facultad de Ciencias de la Información': {
            places: [{
                name: 'C-1',
                coords: [475, 1585],
                icon: { iconUrl: '../../../image/locations/CP/pines/pin-fci-c1.svg', color: 'azul-claro' },
                photos: [
                    { url: '../../../image/locations/CP/galeria/C-1/pb.jpg', isPanoramic: false },
                    { url: '../../../image/locations/CP/galeria/C-1/p2.jpg', isPanoramic: false },
                    { url: '../../../image/locations/CP/galeria/C-1/p3.jpg', isPanoramic: false },
                    { url: '../../../image/locations/CP/galeria/C-1/p4.jpg', isPanoramic: false },
                    { url: '../../../image/locations/CP/galeria/C-1/EDIFICIO.webp', isPanoramic: false },
                    { url: '../../../image/locations/CP/galeria/C-1/EDIFICIO1.webp', isPanoramic: false }
                ],
                comments: 'Este edificio es la planta principal de la Facultad de Ciencias de la Información, fundada en 1980. Es conocido por su biblioteca especializada y laboratorios de computación.',
                floors: 4,
                hasLevelExploration: true
            }],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-fci.svg', color: 'azul-claro' },
            usarIconoGrupal: false
        },
        'Centro de Idiomas': {
            places: [{
                name: 'C',
                coords: [700, 1595],
                icon: { iconUrl: '../../../image/locations/CP/pines/pin-ci.svg', color: 'amarillo' },
                photos: [
                    { url: '../../../image/locations/CP/galeria/ci/2.webp', isPanoramic: false }
                ],
                comments: [
                    'El Centro de Idiomas de la UNACAR ofrece programas de enseñanza de inglés y francés, tanto para estudiantes universitarios como para el público en general. Su objetivo es fortalecer las competencias lingüísticas de los alumnos.',
                    'Oferta educativa:',
                    '*Inglés: 4 niveles para licenciatura.',
                    '*Francés: Cursos optativos y especializados para propósitos académicos.',
                    '*Cursos no escolarizados: Programas abiertos para niños, jóvenes y adultos.'
                ],
                floors: 2,
                hasLevelExploration: false
            }],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-ci.svg', color: 'amarillo' },
            usarIconoGrupal: false
        },
        'Edificio de Vinculación': {
            places: [{
                name: 'CH',
                coords: [310, 1431],
                icon: { iconUrl: '../../../image/locations/CP/pines/pin-ev-ch.svg', color: 'verde-azul' },
                comments: ['Edificio de la facultad de Vinculación'],
                floors: 1,
                hasLevelExploration: false
            }],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-ev.svg', color: 'verde-azul' },
            usarIconoGrupal: false
        },
        'Facultad de Química': {
            places: [
                { name: 'T', coords: [791, 1270], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fq-t.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'], floors: 4, hasLevelExploration: false },
                { name: 'U', coords: [892, 1285], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fq-u.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'], floors: 3, hasLevelExploration: false },
                { name: 'U-1', coords: [915, 1225], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fq-u1.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'], floors: 2, hasLevelExploration: false },
                { name: 'V', coords: [878, 1330], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fq-v.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'], floors: 5, hasLevelExploration: false }
            ],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-fq.svg', color: 'cafe' },
            usarIconoGrupal: false
        },
        'Gimnasio Universitario y PE de LEFYD': {
            places: [{
                name: 'E',
                coords: [870, 783],
                icon: { iconUrl: '../../../image/locations/CP/pines/pin-gu.svg', color: 'naranja' },
                photos: [{ url: '../../../image/locations/CP/galeria/E/1.jpg', isPanoramic: true }],
                comments: ['Gimnasio Universitario de la UNACAR'],
                floors: 1,
                hasLevelExploration: false
            }],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-gu.svg', color: 'naranja' },
            usarIconoGrupal: false
        },
        'Facultad de Derecho': {
            places: [{
                name: 'Z',
                coords: [890, 1500],
                icon: { iconUrl: '../../../image/locations/CP/pines/pin-fd-z.svg', color: 'durazno' },
                comments: ['Edificio de la facultad de Derecho'],
                floors: 4,
                hasLevelExploration: false
            }],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-fd.svg', color: 'durazno' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Educativas': {
            places: [
                { name: 'H', coords: [531, 1208], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fce-h.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'], floors: 3, hasLevelExploration: false },
                { name: 'I', coords: [550, 1173], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fce-i.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'], floors: 2, hasLevelExploration: false },
                { name: 'K', coords: [636, 1131], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fce-k.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'], floors: 1, hasLevelExploration: false },
                { name: 'O', coords: [705, 1092], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fce-o.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'], floors: 4, hasLevelExploration: false },
                { name: 'Q', coords: [660, 1216], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fce-q.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'], floors: 3, hasLevelExploration: false }
            ],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-fce.svg', color: 'rosa-claro' },
            usarIconoGrupal: false
        },
        'Áreas de Servicios': {
            places: [
                { name: 'A_Rectoría', coords: [556, 575], icon: { iconUrl: '../../../image/locations/CP/pines/pin-rectoria-a.svg', color: 'rojo' }, comments: ['Edificio de Servicios A'], floors: 2, hasLevelExploration: false },
                { name: 'W_Centro de Educación Continua', coords: [894, 1371], icon: { iconUrl: '../../../image/locations/CP/pines/pin-cec-w.svg', color: 'morado' }, comments: ['Edificio de Servicios W'], floors: 1, hasLevelExploration: false },
                { name: 'F-1_Edificio Cafetería, Extensión Universitaria', coords: [629, 1349], icon: { iconUrl: '../../../image/locations/CP/pines/pin-ec-f1.svg', color: 'rosa-oscuro' }, comments: ['Edificio de Servicios F-1'], floors: 3, hasLevelExploration: false },
                { name: 'J_Coord. General de Obras y Baby Delfín', coords: [510, 1068], icon: { iconUrl: '../../../image/locations/CP/pines/pin-bd-j.svg', color: 'crema' }, comments: ['Edificio de Servicios J'], floors: 2, hasLevelExploration: false },
                { name: 'B_Biblioteca Universitaria', coords: [595, 1622], icon: { iconUrl: '../../../image/locations/CP/pines/pin-biblioteca.svg', color: 'verde-oscuro' }, comments: ['Edificio de Servicios B'], floors: 4, hasLevelExploration: false },
                { name: 'D_Aula Magna', coords: [810, 1415], icon: { iconUrl: '../../../image/locations/CP/pines/pin-am-d.svg', color: 'verde-claro' }, comments: ['Edificio de Servicios D'], floors: 1, hasLevelExploration: false },
                { name: 'M_Soporte Técnico', coords: [602, 1022], icon: { iconUrl: '../../../image/locations/CP/pines/pin-st-m.svg', color: 'azul-intenso' }, comments: ['Edificio de Servicios M'], floors: 2, hasLevelExploration: false },
                { name: 'N_Redes y Patrimonio Universitario', coords: [520, 1004], icon: { iconUrl: '../../../image/locations/CP/pines/pin-rpu-n.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios N'], floors: 3, hasLevelExploration: false },
                { name: 'P_Sala Audiovisual', coords: [705, 1184], icon: { iconUrl: '../../../image/locations/CP/pines/pin-sa-p.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios P'], floors: 1, hasLevelExploration: false },
                { name: 'G_Servicios Culturales', coords: [495, 1275], icon: { iconUrl: '../../../image/locations/CP/pines/pin-sc-g.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios G'], floors: 2, hasLevelExploration: false },
                { name: 'L', coords: [590, 1086], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fcea-l.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios L'], floors: 4, hasLevelExploration: false },
                { name: 'Ñ_Sala de Usos Múltiples, Fotocopiado', coords: [635, 1048], icon: { iconUrl: '../../../image/locations/CP/pines/pin-sum-ñ.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios Ñ'], floors: 1, hasLevelExploration: false },
                { name: 'LL_Almacenes y Talleres', coords: [710, 985], icon: { iconUrl: '../../../image/locations/CP/pines/pin-at-ll.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios LL'], floors: 2, hasLevelExploration: false },
                { name: 'ZB_Sutucar', coords: [750, 485], icon: { iconUrl: '../../../image/locations/CP/pines/pin-s-zb.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios ZB'], floors: 3, hasLevelExploration: false },
                { name: 'ZE_Secretaría Académica', coords: [721, 468], icon: { iconUrl: '../../../image/locations/CP/pines/pin-sa-ze.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios ZE'], floors: 1, hasLevelExploration: false },
                { name: 'Residencia Universitaria', coords: [1028, 666], icon: { iconUrl: '../../../image/locations/CP/pines/pin-RU.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios Residencia Universitaria'], floors: 5, hasLevelExploration: false },
                { name: 'Z-1', coords: [650, 1667], icon: { iconUrl: '../../../image/locations/CP/pines/pin-Z1.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios Z-1'], floors: 2, hasLevelExploration: false },
                { name: 'J-1', coords: [490, 1125], icon: { iconUrl: '../../../image/locations/CP/pines/pin-j1.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios J-1'], floors: 1, hasLevelExploration: false }
            ],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-sa.svg', color: 'azul-oscuro' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Económicas Administrativas': {
            places: [
                { name: 'R', coords: [650, 1273], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fcea-r.svg', color: 'azul' }, comments: ['Edificio de la Ciencias Económicas Administrativas'], floors: 3, hasLevelExploration: false },
                { name: 'S', coords: [760, 1333], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fcea-s.svg', color: 'azul' }, comments: ['Edificio de la facultad de Ciencias Económicas Administrativas'], floors: 4, hasLevelExploration: false },
                { name: 'X', coords: [910, 1414], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fcea-x.svg', color: 'azul' }, comments: ['Edificio de la facultad de Ciencias Económicas Administrativas'], floors: 2, hasLevelExploration: false },
                { name: 'Y', coords: [892, 1451], icon: { iconUrl: '../../../image/locations/CP/pines/pin-fcea-y.svg', color: 'azul' }, comments: ['Edificio de la facultad de Ciencias Económicas Administrativas'], floors: 5, hasLevelExploration: false }
            ],
            icon: { iconUrl: '../../../image/locations/CP/pines/pin-fcea.svg', color: 'azul' },
            usarIconoGrupal: false
        }
    },
    'Campus 2': {},
    'Campus 3': {},
    'Jardin Botanico': {},
    'Centro Cultural Universitario': {},
    'Museo Guanal': {},
    'Campus Sabancuy': {}
};

const interestPoints = {
    'Campus Principal': [
        {
            name: 'Cancha Unacar',
            building: 'Área Común',
            coords: [861, 995],
            photos: [{ url: '../../../image/locations/CP/galeria/areas-interes/CU/1.jpg', isPanoramic: true }],
            comments: 'Área ideal para deportes, como fútbol, voleibol.'
        },
        {
            name: 'Cancha Básquet',
            building: 'Área Común',
            coords: [894, 817],
            photos: [
                { url: '../../../image/locations/CP/galeria/areas-interes/CB/1.jpg', isPanoramic: true },
                { url: '../../../image/locations/CP/galeria/areas-interes/CB/videocanchabasquet.gif', isPanoramic: false }
            ],
            comments: 'Área ideal para deportes, como fútbol, voleibol.'
        },
        {
            name: 'Cancha Béisbol',
            building: 'Área Común',
            coords: [660, 683],
            photos: [{ url: '../../../image/locations/CP/galeria/areas-interes/b/2.jpg', isPanoramic: false }],
            comments: 'La cancha de béisbol de la UNACAR forma parte de la Unidad Deportiva Universitaria, donde se realizan entrenamientos y torneos estudiantiles.'
        },
        {
            name: 'Glorieta el Camarón',
            building: 'Monumento',
            coords: [414, 1370],
            photos: [
                { url: '../../../image/locations/CP/galeria/areas-interes/GC/camaron.webp', isPanoramic: false },
                { url: '../../../image/locations/CP/galeria/areas-interes/GC/nightcamaron.webp', isPanoramic: false },
                { url: '../../../image/locations/CP/galeria/areas-interes/GC/camaronarriba.webp', isPanoramic: false }
            ],
            comments: [
                'Historia de la Glorieta del Camarón en Ciudad del Carmen #Campeche.',
                'El monumento es un homenaje a la Industria Camaronera... (texto completo)'
            ]
        },
        {
            name: 'Área de Descanso FCI',
            building: 'Área Común',
            coords: [475, 1507],
            photos: [{ url: '../../../image/locations/CP/galeria/areas-interes/ADF/1.jpg', isPanoramic: true }],
            comments: 'Jardín con áreas verdes para relajarse entre clases.'
        },
        {
            name: 'Explanada',
            building: 'Área Común',
            coords: [640, 1305],
            photos: [{ url: '../../../image/locations/CP/galeria/areas-interes/E/1.jpg', isPanoramic: true }],
            comments: 'Este es un espacio amplio y abierto dentro de la universidad, utilizado para eventos institucionales, actividades culturales y reuniones estudiantiles...'
        },
        {
            name: 'Monumento',
            building: 'Área Común',
            coords: [710, 1403],
            photos: [{ url: '../../../image/locations/CP/galeria/areas-interes/M/1.jpg', isPanoramic: true }],
            comments: [
                'El Monumento a Justo Sierra Méndez es un homenaje al ilustre educador, escritor e historiador campechano...',
                'Cada año, en la UNACAR se conmemora el natalicio de Justo Sierra...'
            ]
        },
        {
            name: 'Monumento FCI',
            building: 'Área Común',
            coords: [590, 1545],
            photos: [{ url: '../../../image/locations/CP/galeria/areas-interes/MF/2.jpg', isPanoramic: false }],
            comments: 'Área ideal para deportes, como fútbol, voleibol.'
        }
    ],
    'Campus 2': [],
    'Campus 3': [],
    'Campus Sabancuy': [],
    'Jardin Botanico': [],
    'Centro Cultural Universitario': [],
    'Museo Guanal': []
};
const truckRoutes = [
    {
        id: 'route1',
        name: 'Ruta Centro - UNACAR',
        path: {
            type: 'LineString',
            coordinates: [
                [-91.837845, 18.640753],
                [-91.840009, 18.644419],
                [-91.840044, 18.644785], // Near Campus Principal
                [-91.840349, 18.645145],
                [-91.838165, 18.6462820],
                [-91.839659, 18.650349],
                [-91.841043, 18.653760]
            ]
        }
    },
    {
        id: 'route2',
        name: 'Ruta Playa Norte - UNACAR',
        path: {
            type: 'LineString',
            coordinates: [
                [-91.8220, 18.6440],
                [-91.8205, 18.6455],
                [-91.8181, 18.6466], // Near Campus Principal
                [-91.8175, 18.6472],
                [-91.8160, 18.6480]
            ]
        }
    },
    {
        id: 'route3',
        name: 'Ruta Mercado - UNACAR',
        path: {
            type: 'LineString',
            coordinates: [
                [-91.8195, 18.6430],
                [-91.8185, 18.6445],
                [-91.8181, 18.6466], // Near Campus Principal
                [-91.8178, 18.6478],
                [-91.8170, 18.6490]
            ]
        }
    }
];