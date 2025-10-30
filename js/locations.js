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
            { url: '../../../image/locations/CP/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/CP/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/CP/galeria/campus/2.jpg', isPanoramic: false }
              
        ]
    },
    'Campus 2': {
        w: 2049,
        h: 1521,
        svg: '../../../image/locations/mapa/campus2.svg',
        geojson: '../../../data/campus2_buildings.json',
        center: [700, 1200], // [lat, lng]
        zoom: 0, // Zoom inicial
        description: 'Campus 2',
        photos: [
            { url: '../../../image/locations/C2/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/C2/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/C2/galeria/campus/2.jpg', isPanoramic: false }
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
            { url: '../../../image/locations/C3/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/C3/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/C3/galeria/campus/2.jpg', isPanoramic: false },
            { url: '../../../image/locations/C3/galeria/campus/3.jpg', isPanoramic: false }
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
            { url: '../../../image/locations/CS/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/CS/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/CS/galeria/campus/2.jpg', isPanoramic: false }
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
            { url: '../../../image/locations/JB/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/JB/galeria/campus/2.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/3.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/4.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/5.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/6.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/7.jpg', isPanoramic: false },
            { url: '../../../image/locations/JB/galeria/campus/8.jpg', isPanoramic: false }
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
            { url: '../../../image/locations/CCU/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/CCU/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/CCU/galeria/campus/2.jpg', isPanoramic: false },
            { url: '../../../image/locations/CCU/galeria/campus/3.jpg', isPanoramic: false }
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
            { url: '../../../image/locations/MG/galeria/campus/1.jpg', isPanoramic: false },
            { url: '../../../image/locations/MG/galeria/campus/1d.jpg', isPanoramic: true },
            { url: '../../../image/locations/MG/galeria/campus/2.jpg', isPanoramic: false },
            { url: '../../../image/locations/MG/galeria/campus/3.jpg', isPanoramic: false },
            { url: '../../../image/locations/MG/galeria/campus/4.jpg', isPanoramic: false }
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
                comments: [
                    'Este edificio es la planta principal de la Facultad de Ciencias de la Información, fundada en 1980.',
                    'Es conocido por su biblioteca especializada y laboratorios de computación.'
                ],
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
                    'El Centro de Idiomas de la UNACAR ofrece programas de enseñanza de inglés y francés, tanto para estudiantes universitarios como para el público en general.',
                    'Su objetivo es fortalecer las competencias lingüísticas de los alumnos.',
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
                { name: 'B_Biblioteca Universitaria', coords: [595, 1622], icon: { iconUrl: '../../../image/locations/CP/pines/pin-biblioteca.svg', color: 'verde-oscuro' }, 
                comments: [
                    'Biblioteca Central',
                    'Función Principal: Coordina el Sistema Bibliotecario completo y centraliza la administración, normatividad y tecnología para fortalecer el modelo educativo.',
                    'Servicios Destacados: Acceso a Catálogos, Bases de Datos (incluyendo recursos de CONRICyT), Colecciones de ebooks y revistas, y Recursos Abiertos.',
                    '<a href="https://unacar.mx/biblioteca">Visita el sitio web de la biblioteca</a>',
                    'Calidad: Sus procesos están certificados bajo la norma ISO 9001:2008 en las áreas de organización bibliográfica y servicios al público.',
                    'Contacto (Central): Dirección de Bibliotecas (Mtro. William Benítez Mateo): wbenitez@delfin.unacar.mx.',
                    'Teléfono (Atención al Público): 938 38 11018, Ext. 1509 y 1517.',
                    'Teléfono (Jefe de Biblioteca – Campus Principal): 938 38 11018, Ext. 1509.',
                    'Misión: Satisfacer las necesidades de aprendizaje, conocimiento e información de los universitarios por medio de los servicios bibliotecarios y colecciones documentales'
                ], floors: 4, hasLevelExploration: false },
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
        name: 'Ruta Playa Norte - UNACAR',
        isCircular: true, // Indicates the route loops back to start
        stops: [
            { name: 'Soriana-Centro', coords: [18.640870073829813, -91.83790386251145], 
            photos: [{ url: '../../../image/locations/rutas/paradas/soriana.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.'
            },
            { name: 'Museo/IMSS Centro', coords: [18.64287612486025, -91.83907209136056],
            photos: [{ url: '../../../image/locations/rutas/paradas/imss-centro.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.'
            },
            { name: 'Panteon Viejo', coords: [18.644917580527245, -91.84011709059698],
            photos: [{ url: '../../../image/locations/rutas/paradas/panteon.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.'
             },
            { name: 'Porto Real', coords: [18.64684995775086, -91.83834390248762],
            photos: [{ url: '../../../image/locations/rutas/paradas/real.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Iglesia De Jesucristo/Farmacia Guadalajara', coords: [18.648225611104106, -91.83885333916616],
            photos: [{ url: '../../../image/locations/rutas/paradas/iglesia.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Telcel', coords: [18.64940233225228, -91.83928030798094],
            photos: [{ url: '../../../image/locations/rutas/paradas/telcel.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Deportiva 20 de Noviembre', coords: [18.65249031098299, -91.84048021322522],
            photos: [{ url: '../../../image/locations/rutas/paradas/7.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Pereira', coords: [18.65668684584055, -91.84212640991316],
            photos: [{ url: '../../../image/locations/rutas/paradas/8.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'CETMAR', coords: [18.65800591379384, -91.84264159519986],
            photos: [{ url: '../../../image/locations/rutas/paradas/9.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Zoologico', coords: [18.6593924162784, -91.83855613233287],
            photos: [{ url: '../../../image/locations/rutas/paradas/10.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Centro de Atencion Multiple', coords: [18.65991110342697, -91.83676803466422],
            photos: [{ url: '../../../image/locations/rutas/paradas/11.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'CONALEP', coords: [18.66010193847542, -91.83617099597126],
            photos: [{ url: '../../../image/locations/rutas/paradas/12.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'CECATI', coords: [18.660398243166007, -91.83518819772729],
            photos: [{ url: '../../../image/locations/rutas/paradas/13.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'CETIS', coords: [18.660911193668348, -91.83348482919781],
            photos: [{ url: '../../../image/locations/rutas/paradas/14.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Informal Millan', coords: [18.65943763320154, -91.83150951254807],
            photos: [{ url: '../../../image/locations/rutas/paradas/15.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Informal Tortilleria', coords: [18.66029102921037, -91.82876885218012],
            photos: [{ url: '../../../image/locations/rutas/paradas/16.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Informal Ballena/Ostion', coords: [18.661605468966115, -91.82361650650945],
            photos: [{ url: '../../../image/locations/rutas/paradas/17.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Informal Panteon Nuevo', coords: [18.66208235618949, -91.8188222482511],
            photos: [{ url: '../../../image/locations/rutas/paradas/18.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Rhino Gym', coords: [18.660718827193293, -91.81831350777671],
            photos: [{ url: '../../../image/locations/rutas/paradas/19.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Lavadero Perikin', coords: [18.659799500014167, -91.81804297596597],
            photos: [{ url: '../../../image/locations/rutas/paradas/20.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Primaria Lucila Alayola Laura', coords: [18.65891669591386, -91.81773559142633],
            photos: [{ url: '../../../image/locations/rutas/paradas/21.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Instituto Mexicano Del Petroleo', coords: [18.655111006996194, -91.81648088174501],
            photos: [{ url: '../../../image/locations/rutas/paradas/22.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Hotel LOSSANDES', coords: [18.65359507181176, -91.81594443137047],
            photos: [{ url: '../../../image/locations/rutas/paradas/23.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte, Periferico.' },
            { name: 'Plaza Real', coords: [18.650257912435272, -91.81361446881267],
            photos: [{ url: '../../../image/locations/rutas/paradas/24.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'KFC', coords: [18.647794386554327, -91.81200701401094],
            photos: [{ url: '../../../image/locations/rutas/paradas/25.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'City Club', coords: [18.646679483038188, -91.81456501870262],
            photos: [{ url: '../../../image/locations/rutas/paradas/26.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Bancomer', coords: [18.64626120904367, -91.81559020206961],
            photos: [{ url: '../../../image/locations/rutas/paradas/27.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Campus Principal', coords: [18.645404420931712, -91.81770103499662],
            photos: [{ url: '../../../image/locations/rutas/paradas/28.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Pemex', coords: [18.644602866610036, -91.81965905848925],
            photos: [{ url: '../../../image/locations/rutas/paradas/29.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Chedraui', coords: [18.643719896807262, -91.82198809290907],
            photos: [{ url: '../../../image/locations/rutas/paradas/30.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'NOMARMEX', coords: [18.642506839211485, -91.82411358742259],
            photos: [{ url: '../../../image/locations/rutas/paradas/31.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Chevrolet', coords: [18.64143336545754, -91.82579314804555],
            photos: [{ url: '../../../image/locations/rutas/paradas/32.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Ultima Parada', coords: [18.639403562040695, -91.83115384108753],
            photos: [{ url: '../../../image/locations/rutas/paradas/33.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
            { name: 'Santory', coords: [18.639303046336693, -91.83698625461554],
            photos: [{ url: '../../../image/locations/rutas/paradas/34.jpg', isPanoramic: true }],
            comments: 'Parada Ruta Playanorte.' },
        ],
        path: {
            type: 'LineString',
            coordinates: [
                [-91.837846, 18.640738],[-91.838255, 18.641453],[-91.838669, 18.642184],[-91.839077, 18.642852],
                [-91.839323, 18.643282],[-91.839529, 18.643646],[-91.839988, 18.644437],[-91.840054, 18.644798],
                [-91.840100, 18.644855],[-91.840332, 18.645155],[-91.838916, 18.645910],[-91.838167, 18.646276],
                [-91.838752, 18.647862],[-91.839238, 18.649186],[-91.839654, 18.650355],[-91.839897, 18.650873],
                [-91.840270, 18.651836],[-91.840726, 18.653042],[-91.841042, 18.653752],
                [-91.841488, 18.654993],[-91.842230, 18.656874],
                [-91.842678, 18.658039],[-91.842627, 18.658088],[-91.842511, 18.658104],[-91.842075, 18.658220],
                [-91.840230, 18.658896],[-91.839124, 18.659255],[-91.838540, 18.659419],[-91.837143, 18.659830],
                [-91.834716, 18.660511],[-91.832777, 18.661093],[-91.832597, 18.661028],[-91.831677, 18.659398],
                [-91.831626, 18.659413],[-91.830358, 18.659828],[-91.827215, 18.660743],[-91.824436, 18.661411],
                [-91.823562, 18.661601],[-91.822273, 18.661906],[-91.820781, 18.662293],
                [-91.819985, 18.662516],[-91.819725, 18.661799],
                [-91.818737, 18.662092],[-91.818737, 18.662092],[-91.818213, 18.660439],[-91.816695, 18.655819],
                [-91.816374, 18.654840],
                [-91.815982, 18.653648],
                [-91.815524, 18.652504],
                [-91.814969, 18.651734],
                [-91.813172, 18.649730],
                [-91.812370, 18.648681],
                [-91.811800, 18.647864],
                [-91.813847, 18.646956],
                [-91.816039, 18.646058],
                [-91.818068, 18.645240],
                [-91.818227, 18.645248],
                [-91.818352, 18.645253],
                [-91.818453, 18.645155],
                [-91.818544, 18.645052],
                [-91.818837, 18.644914],
                [-91.821655, 18.643788],
                [-91.822300, 18.643529],
                [-91.822658, 18.643355],
                [-91.824247, 18.642370],
                [-91.826012, 18.641223],
                [-91.826374, 18.640998],
                [-91.826914, 18.640777],
                [-91.828413, 18.640284],
                [-91.829606, 18.639893],
                [-91.831372, 18.639283],
                [-91.833330, 18.638620],
                [-91.835476, 18.637876],
                [-91.836065, 18.637640],
                [-91.836471, 18.638320],
                [-91.836872, 18.639042],
                [-91.837846, 18.640738]
            ]
        }
    }/*,
    {
        id: 'route2',
        name: 'Ruta Perez Martinez - UNACAR',
        isCircular: false,
        stops: [
            { name: 'Playa Norte', coords: [18.6440, -91.8220] },
            { name: 'Parada Intermedia', coords: [18.6455, -91.8205] },
            { name: 'Campus Principal', coords: [18.6466, -91.8181] }
        ],
        path: {
            type: 'LineString',
            coordinates: [
                [-91.8220, 18.6440],
                [-91.8205, 18.6455],
                [-91.8181, 18.6466]
            ]
        }
    }*/
];