let map; // Mapa SVG con L.CRS.Simple
let osmMap; // Mapa de OpenStreetMap con L.CRS.EPSG3857
let osmLayer;
let baseLayers = {}, intermediateBaseLayers = {}, detailedBaseLayers = {}, detailedLayers = {}, markersLayers = {};
let markers = { 'Campus Principal': {}, 'Campus 2': {}, 'Campus 3': {} };
let interestMarkers = { 'Campus Principal': [], 'Campus 2': [], 'Campus 3': [] };
let isFlying = false;
let interestPointsActive = { 'Campus Principal': false, 'Campus 2': false, 'Campus 3': false };
let geolocationActive = false;
let currentPinMarker = null;
let userMarker = null;
let currentCampus = 'Campus Principal'; // Campus por defecto
let ignoreNextZoomEnd = false; // Flag para ignorar el zoomend inicial en OSM

// Almacenar referencias a los event listeners activos
let fullscreenCloseListener = null;
let panoramaCloseListener = null;

// Configuración de campus con coordenadas y zoom inicial personalizables
const campuses = {
    'Campus Principal': { 
        w: 2049, 
        h: 1521, 
        svg: '../../../image/mapa/campus1.svg', 
        geojson: '../../../data/university_buildings.json', 
        center: [700, 1200], // [lat, lng]
        zoom: 0 // Zoom inicial
    },
    'Campus 2': { 
        w: 2049, 
        h: 1521, 
        svg: '../../../image/mapa/campus2.svg', 
        geojson: '../../../data/campus2_buildings.json', 
        center: [700, 1200], // [lat, lng]
        zoom: 0 // Zoom inicial
    },
    'Campus 3': { 
        w: 2049, 
        h: 1521, 
        svg: '../../../image/mapa/campus3.svg', 
        geojson: '../../../data/campus3_buildings.json', 
        center: [700, 1200], // [lat, lng]
        zoom: 0 // Zoom inicial
    }
};

// Lista de ubicaciones por campus
const locations = {
    'Campus Principal': {
        'Facultad de Ciencias de la Información': {
            places: [{
                name: 'C-1',
                coords: [475, 1585],
                icon: { iconUrl: '../../../image/pines/pin-fci-c1.svg', color: 'azul-claro' },
                photos: [
                    { url: '../../../image/galeria/c-1/pb.jpg', isPanoramic: false },
                    { url: '../../../image/galeria/c-1/p2.jpg', isPanoramic: false },
                    { url: '../../../image/galeria/c-1/p3.jpg', isPanoramic: false },
                    { url: '../../../image/galeria/c-1/p4.jpg', isPanoramic: false },
                    { url: '../../../image/galeria/c-1/EDIFICIO.webp', isPanoramic: false },
                    { url: '../../../image/galeria/c-1/EDIFICIO1.webp', isPanoramic: false }
                ],
                comments: 'Este edificio es la planta principal de la Facultad de Ciencias de la Información, fundada en 1980. Es conocido por su biblioteca especializada y laboratorios de computación.'
            }],
            icon: { iconUrl: '../../../image/pines/pin-fci.svg', color: 'azul-claro' },
            usarIconoGrupal: false
        },
        'Centro de Idiomas': {
            places: [{
                name: 'C',
                coords: [700, 1595],
                icon: { iconUrl: '../../../image/pines/pin-ci.svg', color: 'amarillo' },
                photos: [
                    { url: '../../../image/galeria/ci/2.webp', isPanoramic: false }
                ],
                comments: [
                    'El Centro de Idiomas de la UNACAR ofrece programas de enseñanza de inglés y francés, tanto para estudiantes universitarios como para el público en general. Su objetivo es fortalecer las competencias lingüísticas de los alumnos.',
                    'Oferta educativa:',
                    '*Inglés: 4 niveles para licenciatura.',
                    '*Francés: Cursos optativos y especializados para propósitos académicos.',
                    '*Cursos no escolarizados: Programas abiertos para niños, jóvenes y adultos.'
                ]
            }],
            icon: { iconUrl: '../../../image/pines/pin-ci.svg', color: 'amarillo' },
            usarIconoGrupal: false
        },
        'Edificio de Vinculación': {
            places: [{
                name: 'CH',
                coords: [310, 1431],
                icon: { iconUrl: '../../../image/pines/pin-ev-ch.svg', color: 'verde-azul' },
                comments: ['Edificio de la facultad de Vinculación']
            }],
            icon: { iconUrl: '../../../image/pines/pin-ev.svg', color: 'verde-azul' },
            usarIconoGrupal: false
        },
        'Facultad de Química': {
            places: [
                { name: 'T', coords: [791, 1270], icon: { iconUrl: '../../../image/pines/pin-fq-t.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'] },
                { name: 'U', coords: [892, 1285], icon: { iconUrl: '../../../image/pines/pin-fq-u.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'] },
                { name: 'U-1', coords: [915, 1225], icon: { iconUrl: '../../../image/pines/pin-fq-u1.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'] },
                { name: 'V', coords: [878, 1330], icon: { iconUrl: '../../../image/pines/pin-fq-v.svg', color: 'cafe' }, comments: ['Edificio de la facultad de Química'] }
            ],
            icon: { iconUrl: '../../../image/pines/pin-fq.svg', color: 'cafe' },
            usarIconoGrupal: false
        },
        'Gimnasio Universitario y PE de LEFYD': {
            places: [{
                name: 'E',
                coords: [870, 783],
                icon: { iconUrl: '../../../image/pines/pin-gu.svg', color: 'naranja' },
                photos: [{ url: '../../../image/galeria/E/1.jpg', isPanoramic: true }],
                comments: ['Gimnasio Universitario de la UNACAR']
            }],
            icon: { iconUrl: '../../../image/pines/pin-gu.svg', color: 'naranja' },
            usarIconoGrupal: false
        },
        'Facultad de Derecho': {
            places: [{
                name: 'Z',
                coords: [890, 1500],
                icon: { iconUrl: '../../../image/pines/pin-fd-z.svg', color: 'durazno' },
                comments: ['Edificio de la facultad de Derecho']
            }],
            icon: { iconUrl: '../../../image/pines/pin-fd.svg', color: 'durazno' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Educativas': {
            places: [
                { name: 'H', coords: [531, 1208], icon: { iconUrl: '../../../image/pines/pin-fce-h.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'] },
                { name: 'I', coords: [550, 1173], icon: { iconUrl: '../../../image/pines/pin-fce-i.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'] },
                { name: 'K', coords: [636, 1131], icon: { iconUrl: '../../../image/pines/pin-fce-k.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'] },
                { name: 'O', coords: [705, 1092], icon: { iconUrl: '../../../image/pines/pin-fce-o.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'] },
                { name: 'Q', coords: [660, 1216], icon: { iconUrl: '../../../image/pines/pin-fce-q.svg', color: 'rosa-claro' }, comments: ['Edificio de la facultad de Ciencias Educativas'] }
            ],
            icon: { iconUrl: '../../../image/pines/pin-fce.svg', color: 'rosa-claro' },
            usarIconoGrupal: false
        },
        'Áreas de Servicios': {
            places: [
                { name: 'A_Rectoría', coords: [556, 575], icon: { iconUrl: '../../../image/pines/pin-rectoria-a.svg', color: 'rojo' }, comments: ['Edificio de Servicios A'] },
                { name: 'W_Centro de Educación Continua', coords: [894, 1371], icon: { iconUrl: '../../../image/pines/pin-cec-w.svg', color: 'morado' }, comments: ['Edificio de Servicios W'] },
                { name: 'F-1_Edificio Cafetería, Extensión Universitaria', coords: [629, 1349], icon: { iconUrl: '../../../image/pines/pin-ec-f1.svg', color: 'rosa-oscuro' }, comments: ['Edificio de Servicios F-1'] },
                { name: 'J_Coord. General de Obras y Baby Delfín', coords: [510, 1068], icon: { iconUrl: '../../../image/pines/pin-bd-j.svg', color: 'crema' }, comments: ['Edificio de Servicios J'] },
                { name: 'B_Biblioteca Universitaria', coords: [595, 1622], icon: { iconUrl: '../../../image/pines/pin-biblioteca.svg', color: 'verde-oscuro' }, comments: ['Edificio de Servicios B'] },
                { name: 'D_Aula Magna', coords: [810, 1415], icon: { iconUrl: '../../../image/pines/pin-am-d.svg', color: 'verde-claro' }, comments: ['Edificio de Servicios D'] },
                { name: 'M_Soporte Técnico', coords: [602, 1022], icon: { iconUrl: '../../../image/pines/pin-st-m.svg', color: 'azul-intenso' }, comments: ['Edificio de Servicios M'] },
                { name: 'N_Redes y Patrimonio Universitario', coords: [520, 1004], icon: { iconUrl: '../../../image/pines/pin-rpu-n.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios N'] },
                { name: 'P_Sala Audiovisual', coords: [705, 1184], icon: { iconUrl: '../../../image/pines/pin-sa-p.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios P'] },
                { name: 'G_Servicios Culturales', coords: [495, 1275], icon: { iconUrl: '../../../image/pines/pin-sc-g.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios G'] },
                { name: 'L', coords: [590, 1086], icon: { iconUrl: '../../../image/pines/pin-fcea-l.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios L'] },
                { name: 'Ñ_Sala de Usos Múltiples, Fotocopiado', coords: [635, 1048], icon: { iconUrl: '../../../image/pines/pin-sum-ñ.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios Ñ'] },
                { name: 'LL_Almacenes y Talleres', coords: [710, 985], icon: { iconUrl: '../../../image/pines/pin-at-ll.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios LL'] },
                { name: 'ZB_Sutucar', coords: [750, 485], icon: { iconUrl: '../../../image/pines/pin-s-zb.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios ZB'] },
                { name: 'ZE_Secretaría Académica', coords: [721, 468], icon: { iconUrl: '../../../image/pines/pin-sa-ze.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios ZE'] },
                { name: 'Residencia Universitaria', coords: [1028, 666], icon: { iconUrl: '../../../image/pines/pin-RU.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios Residencia Universitaria'] },
                { name: 'Z-1', coords: [650, 1667], icon: { iconUrl: '../../../image/pines/pin-Z1.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios Z-1'] },
                { name: 'J-1', coords: [490, 1125], icon: { iconUrl: '../../../image/pines/pin-j1.svg', color: 'azul-oscuro' }, comments: ['Edificio de Servicios J-1'] }
            ],
            icon: { iconUrl: '../../../image/pines/pin-sa.svg', color: 'azul-oscuro' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Económicas Administrativas': {
            places: [
                { name: 'R', coords: [650, 1273], icon: { iconUrl: '../../../image/pines/pin-fcea-r.svg', color: 'azul' }, comments: ['Edificio de la Ciencias Económicas Administrativas'] },
                { name: 'S', coords: [760, 1333], icon: { iconUrl: '../../../image/pines/pin-fcea-s.svg', color: 'azul' }, comments: ['Edificio de la facultad de Ciencias Económicas Administrativas'] },
                { name: 'X', coords: [910, 1414], icon: { iconUrl: '../../../image/pines/pin-fcea-x.svg', color: 'azul' }, comments: ['Edificio de la facultad de Ciencias Económicas Administrativas'] },
                { name: 'Y', coords: [892, 1451], icon: { iconUrl: '../../../image/pines/pin-fcea-y.svg', color: 'azul' }, comments: ['Edificio de la facultad de Ciencias Económicas Administrativas'] }
            ],
            icon: { iconUrl: '../../../image/pines/pin-fcea.svg', color: 'azul' },
            usarIconoGrupal: false
        }
    }
};

const interestPoints = {
    'Campus Principal': [
        {
            name: 'Cancha Unacar',
            building: 'Área Común',
            coords: [861, 995],
            photos: [{ url: '../../../image/galeria/areas-interes/CU/1.jpg', isPanoramic: true }],
            comments: 'Área ideal para deportes, como fútbol, voleibol.'
        },
        {
            name: 'Cancha Básquet',
            building: 'Área Común',
            coords: [894, 817],
            photos: [
                { url: '../../../image/galeria/areas-interes/CB/1.jpg', isPanoramic: true },
                { url: '../../../image/galeria/areas-interes/CB/videocanchabasquet.gif', isPanoramic: false }
            ],
            comments: 'Área ideal para deportes, como fútbol, voleibol.'
        },
        {
            name: 'Cancha Béisbol',
            building: 'Área Común',
            coords: [660, 683],
            photos: [{ url: '../../../image/galeria/areas-interes/b/2.jpg', isPanoramic: false }],
            comments: 'La cancha de béisbol de la UNACAR forma parte de la Unidad Deportiva Universitaria, donde se realizan entrenamientos y torneos estudiantiles.'
        },
        {
            name: 'Glorieta el Camarón',
            building: 'Monumento',
            coords: [414, 1370],
            photos: [
                { url: '../../../image/galeria/areas-interes/GC/camaron.webp', isPanoramic: false },
                { url: '../../../image/galeria/areas-interes/GC/nightcamaron.webp', isPanoramic: false },
                { url: '../../../image/galeria/areas-interes/GC/camaronarriba.webp', isPanoramic: false }
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
            photos: [{ url: '../../../image/galeria/areas-interes/ADF/1.jpg', isPanoramic: true }],
            comments: 'Jardín con áreas verdes para relajarse entre clases.'
        },
        {
            name: 'Explanada',
            building: 'Área Común',
            coords: [640, 1305],
            photos: [{ url: '../../../image/galeria/areas-interes/E/1.jpg', isPanoramic: true }],
            comments: 'Este es un espacio amplio y abierto dentro de la universidad, utilizado para eventos institucionales, actividades culturales y reuniones estudiantiles...'
        },
        {
            name: 'Monumento',
            building: 'Área Común',
            coords: [710, 1403],
            photos: [{ url: '../../../image/galeria/areas-interes/M/1.jpg', isPanoramic: true }],
            comments: [
                'El Monumento a Justo Sierra Méndez es un homenaje al ilustre educador, escritor e historiador campechano...',
                'Cada año, en la UNACAR se conmemora el natalicio de Justo Sierra...'
            ]
        },
        {
            name: 'Monumento FCI',
            building: 'Área Común',
            coords: [590, 1545],
            photos: [{ url: '../../../image/galeria/areas-interes/MF/2.jpg', isPanoramic: false }],
            comments: 'Área ideal para deportes, como fútbol, voleibol.'
        }
    ]
};

function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function switchToCampus(campus) {
    currentCampus = campus;
    const { w, h, center, zoom } = campuses[campus];
    const bounds = [[0, 0], [h, w]];
    map.setMaxBounds(bounds);
    map.eachLayer(layer => map.removeLayer(layer));
    baseLayers[campus].addTo(map);
    markersLayers[campus].addTo(map);
    map.fitBounds(bounds);
    map.setView(center, zoom);
    // Reactivar puntos de interés si estaban activos
    if (interestPointsActive[campus]) {
        updateInterestPoints(campus);
    }
    // Ocultar el mapa de OpenStreetMap
    const osmMapElement = document.getElementById('osm-map');
    const mapElement = document.getElementById('map');
    if (osmMapElement && mapElement) {
        osmMapElement.style.display = 'none';
        mapElement.style.display = 'block';
    }
}

function flyToLocation(lat, lng, building, placeName, campus, isInterestPoint = false) {
    if (!map) {
        console.log('flyToLocation: Map not initialized');
        return;
    }

    if (isFlying) {
        console.log('flyToLocation: Already flying, ignoring');
        return;
    }

    isFlying = true;

    map.closePopup();

    if (currentPinMarker) {
        map.removeLayer(currentPinMarker);
        currentPinMarker = null;
    }

    map.flyTo([lat, lng], 1, {
        duration: 1.5,
        noMoveStart: true
    });

    const locationControls = document.getElementById('location-controls');
    if (locationControls) {
        locationControls.classList.remove('visible');
    }

    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.value = '';
    }

    const links = document.querySelectorAll('.location-link');
    links.forEach(link => {
        link.style.display = 'block';
        const section = link.closest('.building-section');
        if (section) section.style.display = 'block';
    });

    Object.values(markers[campus]).flat().forEach(m => {
        if (m._icon) m._icon.classList.remove('marker-animated');
    });
    const popups = document.querySelectorAll('.leaflet-popup-content-wrapper');
    popups.forEach(popup => popup.classList.remove('popup-animated'));

    map.once('moveend', () => {
        if (isInterestPoint) {
            const pinMarker = createInterestPinMarker(lat, lng, placeName, building, campus);
            if (pinMarker) {
                currentPinMarker = pinMarker;
                pinMarker.openPopup();
                pinMarker._icon.classList.add('marker-animated');
            }
        } else {
            const markerGroup = markers[campus][building];
            if (!markerGroup) {
                console.log(`flyToLocation: No marker group found for building ${building} in ${campus}`);
                isFlying = false;
                return;
            }

            const targetMarker = markerGroup.find(m => {
                const latlng = m.getLatLng();
                return Math.abs(latlng.lat - lat) < 0.0001 && Math.abs(latlng.lng - lng) < 0.0001;
            });

            if (!targetMarker) {
                console.log(`flyToLocation: No target marker found at [${lat}, ${lng}] for building ${building} in ${campus}`);
                isFlying = false;
                return;
            }

            let markerAttempts = 0;
            const maxMarkerAttempts = 5;
            const animateMarkerAndPopup = () => {
                if (targetMarker._icon) {
                    targetMarker._icon.classList.add('marker-animated');

                    targetMarker.once('popupopen', () => {
                        const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
                        if (popupElement) {
                            popupElement.classList.remove('popup-animated');
                            void popupElement.offsetWidth;
                            popupElement.classList.add('popup-animated');
                        }
                    });

                    targetMarker.openPopup();

                    setTimeout(() => {
                        const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
                        if (popupElement && !popupElement.classList.contains('popup-animated')) {
                            popupElement.classList.remove('popup-animated');
                            void popupElement.offsetWidth;
                            popupElement.classList.add('popup-animated');
                        }
                    }, 500);
                } else if (markerAttempts < maxMarkerAttempts) {
                    markerAttempts++;
                    setTimeout(animateMarkerAndPopup, 200);
                }
            };

            animateMarkerAndPopup();
        }
        isFlying = false;
    });
}

function showLocationDetails(building, placeName, faculty, photos, comments, campus) {
    console.log('showLocationDetails called with:', { building, placeName, faculty, photos, comments, campus });

    const detailsPanel = document.getElementById('location-details');
    if (!detailsPanel) {
        console.log('showLocationDetails: #location-details element not found in DOM');
        return;
    }

    const safePhotos = Array.isArray(photos) ? photos : [];
    const safeComments = Array.isArray(comments) ? comments : [comments || 'No hay comentarios disponibles.'];

    const photoHTML = safePhotos.length > 0
        ? safePhotos
            .map(photo => {
                const isObject = typeof photo === 'object' && photo.url;
                const url = isObject ? photo.url : photo;
                const isPanoramic = isObject && photo.isPanoramic;
                const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                if (isVideo) {
                    return `<video src="${url}" alt="Video de ${placeName}" class="photo-item" controls></video>`;
                } else {
                    return `<img src="${url}" alt="Foto de ${placeName}" class="photo-item" data-panoramic="${isPanoramic ? 'true' : 'false'}">`;
                }
            })
            .join('')
        : '<p>Imágenes y videos muy pronto, si quieres probarlas ve a puntos de interés o edificios C-1 de la Facultad de Ciencias de la Información y C del área de Centro de Idiomas.</p>';

    const commentsHTML = safeComments.map(comment => `<p>${comment}</p>`).join('');

    detailsPanel.innerHTML = `
        <span class="close-btn">×</span>
        <h2>Zona: ${placeName}</h2>
        <div class="faculty">${faculty}</div>
        <div class="photos">${photoHTML}</div>
        <div class="comments">${commentsHTML}</div>
    `;
    detailsPanel.classList.add('visible');
    console.log('showLocationDetails: #location-details set to visible with content:', detailsPanel.innerHTML);

    history.pushState({ popup: 'location-details' }, null, '');

    const closeBtn = detailsPanel.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            detailsPanel.classList.remove('visible');
            history.replaceState(null, null, '');
            if (currentPinMarker) {
                currentPinMarker.closePopup();
                map.removeLayer(currentPinMarker);
                currentPinMarker = null;
            }
        }, { once: true });
    }

    const photoItems = detailsPanel.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.tagName === 'IMG' && item.dataset.panoramic === 'true') {
                const panoramaContainer = document.getElementById('panorama-viewer');
                if (panoramaContainer) {
                    panoramaContainer.classList.add('visible');
                    const panoramaDiv = document.getElementById('panorama');
                    if (panoramaDiv) {
                        panoramaDiv.innerHTML = '';
                    }
                    pannellum.viewer('panorama', {
                        type: 'equirectangular',
                        panorama: item.src,
                        autoLoad: true,
                        showControls: true,
                        yaw: 0,
                        pitch: 0,
                        hfov: 100
                    });
                    history.replaceState({ popup: 'panorama-viewer' }, null, '');
                }
            } else {
                const fullscreenContainer = document.getElementById('fullscreen-image');
                const fullscreenImg = fullscreenContainer.querySelector('img');
                const fullscreenVideo = fullscreenContainer.querySelector('video');
                if (fullscreenContainer && fullscreenImg && fullscreenVideo) {
                    if (item.tagName === 'VIDEO') {
                        fullscreenVideo.src = item.src;
                        fullscreenVideo.style.display = 'block';
                        fullscreenImg.style.display = 'none';
                    } else {
                        fullscreenImg.src = item.src;
                        fullscreenImg.alt = item.alt;
                        fullscreenImg.style.display = 'block';
                        fullscreenVideo.style.display = 'none';
                    }
                    fullscreenContainer.classList.add('visible');
                    history.replaceState({ popup: 'fullscreen-image' }, null, '');
                }
            }
        });
    });

    // Configurar cierre de panorama
    let panoramaCloseBtn = document.querySelector('.panorama-close-btn');
    if (!panoramaCloseBtn) {
        console.log('Panorama close button not found, creating one');
        panoramaCloseBtn = document.createElement('span');
        panoramaCloseBtn.className = 'panorama-close-btn';
        panoramaCloseBtn.innerHTML = '×';
        const panoramaContainer = document.getElementById('panorama-viewer');
        if (panoramaContainer) {
            panoramaContainer.appendChild(panoramaCloseBtn);
        } else {
            console.log('Panorama container not found, cannot add close button');
            return;
        }
    }

    if (panoramaCloseListener) {
        panoramaCloseBtn.removeEventListener('click', panoramaCloseListener);
    }

    panoramaCloseListener = () => {
        console.log('Panorama close button clicked');
        const panoramaContainer = document.getElementById('panorama-viewer');
        if (panoramaContainer) {
            panoramaContainer.classList.remove('visible');
            const panoramaDiv = document.getElementById('panorama');
            if (panoramaDiv) {
                panoramaDiv.innerHTML = '';
            }
            history.replaceState({ popup: 'location-details' }, null, '');
        }
    };

    console.log('Adding panorama close button listener');
    panoramaCloseBtn.addEventListener('click', panoramaCloseListener);

    // Configurar cierre de fullscreen
    let fullscreenCloseBtn = document.querySelector('.fullscreen-close-btn');
    if (!fullscreenCloseBtn) {
        console.log('Fullscreen close button not found, creating one');
        fullscreenCloseBtn = document.createElement('span');
        fullscreenCloseBtn.className = 'fullscreen-close-btn';
        fullscreenCloseBtn.innerHTML = '×';
        const fullscreenContainer = document.getElementById('fullscreen-image');
        if (fullscreenContainer) {
            fullscreenContainer.appendChild(fullscreenCloseBtn);
        } else {
            console.log('Fullscreen container not found, cannot add close button');
            return;
        }
    }

    if (fullscreenCloseListener) {
        fullscreenCloseBtn.removeEventListener('click', fullscreenCloseListener);
    }

    fullscreenCloseListener = () => {
        console.log('Fullscreen close button clicked');
        const fullscreenContainer = document.getElementById('fullscreen-image');
        if (fullscreenContainer) {
            fullscreenContainer.classList.remove('visible');
            const fullscreenImg = fullscreenContainer.querySelector('img');
            const fullscreenVideo = fullscreenContainer.querySelector('video');
            if (fullscreenImg) fullscreenImg.src = '';
            if (fullscreenVideo) fullscreenVideo.src = '';
            history.replaceState({ popup: 'location-details' }, null, '');
        }
    };

    console.log('Adding fullscreen close button listener');
    fullscreenCloseBtn.addEventListener('click', fullscreenCloseListener);
}

function createInterestPointMarker(lat, lng, title, building, photos, comments, campus) {
    const customIcon = L.divIcon({
        className: 'interest-point',
        html: `
            <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid #0000FF;
                background: rgba(135, 206, 250, 0.5);
                z-index: 400;
            "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });

    const marker = L.marker([lat, lng], {
        title: title,
        icon: customIcon
    }).bindPopup(`<b>Zona: ${title}</b><br><small>${building}</small>`);

    marker.on('click', (e) => {
        console.log(`marcador ${title} en [${lat}, ${lng}] en ${campus}`);
        flyToLocation(lat, lng, building, title, campus, true);
        showLocationDetails(building, title, building, photos || [], comments || 'No hay comentarios disponibles.', campus);
    });

    return marker;
}

function createInterestPinMarker(lat, lng, title, building, campus) {
    const pinUrl = '../../../image/pines/pin-usuario.svg';
    
    const customIcon = L.divIcon({
        className: 'interest-pin',
        html: `
            <div class="marker-inner" style="
                background-image: url('${pinUrl}');
                background-size: contain;
                background-repeat: no-repeat;
                width: 32px;
                height: 32px;
                transform-origin: bottom center;
                z-index: 500;
            "></div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    try {
        const marker = L.marker([lat, lng], {
            title: title,
            icon: customIcon,
            zIndexOffset: 1000
        }).bindPopup(`<b>Zona: ${title}</b><br><small>${building}</small>`).addTo(map);
        
        marker.on('popupopen', () => {
            const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.classList.remove('popup-animated');
                void popupElement.offsetWidth;
                popupElement.classList.add('popup-animated');
            }
        });

        marker.on('popupclose', () => {
            if (marker._icon) {
                marker._icon.classList.remove('marker-animated');
            }
            map.removeLayer(marker);
            currentPinMarker = null;
            const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.classList.remove('popup-animated');
            }
        });

        return marker;
    } catch (error) {
        console.log(`createInterestPinMarker: Error creating pin for ${title} in ${campus}:`, error);
        return null;
    }
}

function toggleGeolocation() {
    const geolocationButton = document.querySelector('.leaflet-control-geolocation');
    if (!geolocationActive) {
        geolocationActive = true;
        geolocationButton.classList.add('active');
        geolocationButton.style.backgroundColor = '#1E90FF'; // Azul al activar
        // Simulación de geolocalización en coordenadas de píxeles
        const simulatedLatLng = [700, 1200]; // Centro del mapa SVG de Campus Principal
        if (userMarker) {
            map.removeLayer(userMarker);
        }
        userMarker = L.marker(simulatedLatLng, {
            icon: L.divIcon({
                className: 'user-marker',
                html: '<div style="width: 20px; height: 20px; border-radius: 50%; background: #ff0000; border: 2px solid #fff;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
        flyToLocation(simulatedLatLng[0], simulatedLatLng[1], 'Ubicación Actual', 'Usuario', 'Campus Principal', true);
    } else {
        geolocationActive = false;
        geolocationButton.classList.remove('active');
        geolocationButton.style.backgroundColor = ''; // Restaurar estilo
        if (userMarker) {
            map.removeLayer(userMarker);
            userMarker = null;
        }
    }
}

function showNotAvailablePopup(campus) {
    let popup = document.getElementById('not-available-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'not-available-popup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'white';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        popup.style.zIndex = '1000';
        popup.style.textAlign = 'center';
        document.body.appendChild(popup);
    }

    popup.innerHTML = `
        <span id="close-not-available" style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 20px;">×</span>
        <h3>Campus No Disponible</h3>
        <p>Por el momento, el ${campus} no está disponible. ¿Desea viajar al Campus Principal?</p>
        <button id="accept-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Aceptar</button>
    `;

    popup.style.display = 'block';

    const acceptBtn = document.getElementById('accept-btn');
    acceptBtn.addEventListener('mouseenter', () => {
        acceptBtn.style.backgroundColor = '#45a049';
        acceptBtn.style.transform = 'scale(1.05)';
        acceptBtn.style.transition = 'all 0.3s ease';
    });
    acceptBtn.addEventListener('mouseleave', () => {
        acceptBtn.style.backgroundColor = '#4CAF50';
        acceptBtn.style.transform = 'scale(1)';
    });
    acceptBtn.addEventListener('click', () => {
        switchToCampus('Campus Principal');
        popup.style.display = 'none';
    });

    document.getElementById('close-not-available').addEventListener('click', () => {
        popup.style.display = 'none';
    });
}

function showCampusSelectionPopup() {
    let popup = document.getElementById('campus-selection-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'campus-selection-popup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'white';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        popup.style.zIndex = '1000';
        popup.style.textAlign = 'center';
        document.body.appendChild(popup);
    }

    popup.innerHTML = `
        <span id="close-selection" style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-size: 20px;">×</span>
        <h3>¿Quieres ir a algún campus?</h3>
        <div style="margin: 10px;">
            <button id="campus1-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">Campus Principal</button>
            <button id="campus2-btn" style="background-color: #ccc; color: #666; padding: 10px 20px; border: none; border-radius: 5px; margin: 5px;" disabled>Campus 2</button>
            <button id="campus3-btn" style="background-color: #ccc; color: #666; padding: 10px 20px; border: none; border-radius: 5px; margin: 5px;" disabled>Campus 3</button>
        </div>
        <div id="action-buttons" style="display: none;">
            <button id="accept-selection-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">Aceptar</button>
            <button id="cancel-btn" style="background-color: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">Cancelar</button>
        </div>
    `;

    popup.style.display = 'block';

    const campus1Btn = document.getElementById('campus1-btn');
    const actionButtons = document.getElementById('action-buttons');
    const acceptBtn = document.getElementById('accept-selection-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const closeBtn = document.getElementById('close-selection');

    campus1Btn.addEventListener('click', () => {
        actionButtons.style.display = 'block';
    });

    acceptBtn.addEventListener('click', () => {
        switchToCampus('Campus Principal');
        popup.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        osmMap.setZoom(osmMap.getZoom() - 3); // Reduce more zoom
        popup.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
        osmMap.setZoom(osmMap.getZoom() - 3); // Same for close
        popup.style.display = 'none';
    });
}

// Nueva función para actualizar los puntos de interés
function updateInterestPoints(campus) {
    // Limpiar marcadores de interés existentes
    interestMarkers[campus].forEach(marker => map.removeLayer(marker));
    interestMarkers[campus] = [];

    // Si los puntos de interés están activos, añadirlos al mapa
    if (interestPointsActive[campus]) {
        interestPoints[campus].forEach(point => {
            const marker = createInterestPointMarker(
                point.coords[0],
                point.coords[1],
                point.name,
                point.building,
                point.photos,
                point.comments,
                campus
            );
            marker.addTo(map);
            interestMarkers[campus].push(marker);
        });
    }
}

function toggleInterestPoints(campus) {
    interestPointsActive[campus] = !interestPointsActive[campus];
    const interestButton = document.querySelector('.leaflet-control-interest');
    if (interestPointsActive[campus]) {
        interestButton.classList.add('active');
        updateInterestPoints(campus); // Añadir puntos de interés
    } else {
        interestButton.classList.remove('active');
        interestMarkers[campus].forEach(marker => map.removeLayer(marker));
        interestMarkers[campus] = [];
        if (currentPinMarker) {
            map.removeLayer(currentPinMarker);
            currentPinMarker = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const mapElement = document.getElementById('map');
    const osmMapElement = document.getElementById('osm-map');
    const pantallaBienvenida = document.getElementById('pantallaBienvenida');

    if (!mapElement) {
        console.error('DOMContentLoaded: #map element not found');
        return;
    }

    if (!osmMapElement) {
        console.warn('DOMContentLoaded: #osm-map element not found, OpenStreetMap will not be available at minimum zoom');
    }

    // Mapa SVG (inicializado con Campus Principal)
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1.5,
        maxZoom: 2,
        maxBoundsViscosity: 1.0,
        zoomDelta: 0.3,
        zoomSnap: 0,
        fadeAnimation: true,
        zoomAnimationThreshold: 2
    });

    // Configurar capas para cada campus
    Object.keys(campuses).forEach(campus => {
        const { w, h, svg } = campuses[campus];
        const bounds = [[0, 0], [h, w]];
        baseLayers[campus] = L.imageOverlay(svg, bounds);
        intermediateBaseLayers[campus] = L.imageOverlay(svg, bounds, { opacity: 1 });
        detailedBaseLayers[campus] = L.imageOverlay(svg, bounds, { opacity: 1 });
        detailedLayers[campus] = L.geoJSON(null, {
            style: function (feature) {
                const facultyColors = {
                    'Facultad de Ciencias de la Información': '#0040c9',
                    'Centro de Idiomas': '#f8da00',
                    'Edificio de Vinculación': '#01c78a',
                    'Facultad de Química': '#d7a570',
                    'Gimnasio Universitario y PE de LEFYD': '#ff6829',
                    'Facultad de Derecho': '#ff9e7b',
                    'Facultad de Ciencias Educativas': '#ffaff4',
                    'Áreas de Servicios': '#8f9cd0',
                    'Facultad de Ciencias Económicas Administrativas': '#006eff',
                    'Preparatoria': '#00ccff',
                    'Facultad de Ingeniería': '#cc6600'
                };
                return {
                    fillColor: facultyColors[feature.properties.faculty] || '#0040c9',
                    fillOpacity: 0.7,
                    color: '#000',
                    weight: 2
                };
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`
                    <b>Edificio: ${feature.properties.name}</b><br>
                    <small>${feature.properties.faculty}</small><br>
                    ${feature.properties.description || 'No hay descripción disponible.'}
                `);
                layer.on('click', () => {
                    const coords = feature.geometry.coordinates[0][0]; // Centroide aproximado
                    flyToLocation(coords[1], coords[0], feature.properties.faculty, feature.properties.name, campus);
                    showLocationDetails(
                        feature.properties.faculty,
                        feature.properties.name,
                        feature.properties.faculty,
                        feature.properties.photos || [],
                        feature.properties.description || 'No hay comentarios disponibles.',
                        campus
                    );
                });
            }
        });
        markersLayers[campus] = L.layerGroup();

        // Cargar GeoJSON para cada campus
        fetch(campuses[campus].geojson)
            .then(response => response.json())
            .then(data => {
                detailedLayers[campus].addData(data);
            })
            .catch(error => console.error(`Error loading GeoJSON for ${campus}:`, error));
    });

    // Inicializar con Campus Principal
    const { w, h, center, zoom } = campuses['Campus Principal'];
    const bounds = [[0, 0], [h, w]];
    baseLayers['Campus Principal'].on('load', () => {
        pantallaBienvenida.classList.add('fade-out');
    });
    baseLayers['Campus Principal'].addTo(map);
    markersLayers['Campus Principal'].addTo(map);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
    map.setView(center, zoom);

    // Mapa de OpenStreetMap
    if (osmMapElement) {
        osmMap = L.map('osm-map', {
            crs: L.CRS.EPSG3857,
            minZoom: 12,
            maxZoom: 21,
            zoomDelta: 0.3,
            zoomSnap: 0
        }).setView([18.646626696426264, -91.81813061518552], 18);

        osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 21,
            maxNativeZoom: 19
        });

        osmMap.campusMarkers = {
            'Campus Principal': L.marker([18.646626696426264, -91.81813061518552], {
                title: 'UNACAR'
            }).bindPopup(`
                <b>UNACAR Universidad</b><br>
                <small>Universidad Autónoma del Carmen</small><br>
                Campus Principal, Ciudad del Carmen
            `, { autoClose: false, closeOnClick: false }),
            'Campus 2': L.marker([18.653975735270432, -91.81062427253869], {
                title: 'UNACAR Preparatoria'
            }).bindPopup(`
                <b>UNACAR Preparatoria</b><br>
                <small>Universidad Autónoma del Carmen</small><br>
                Campus 2, Ciudad del Carmen
            `, { autoClose: false, closeOnClick: false }),
            'Campus 3': L.marker([18.65757697187412, -91.76605622956039], {
                title: 'UNACAR'
            }).bindPopup(`
                <b>UNACAR Universidad</b><br>
                <small>Universidad Autónoma del Carmen</small><br>
                Campus 3, Ciudad del Carmen
            `, { autoClose: false, closeOnClick: false })
        };

        // Mantener popups siempre abiertos y manejar clics en marcadores
        Object.entries(osmMap.campusMarkers).forEach(([campus, marker]) => {
            marker.addTo(osmMap).openPopup();
            marker.on('popupclose', () => {
                // Reabrir el popup inmediatamente si se intenta cerrar
                marker.openPopup();
            });
            marker.on('click', () => {
                if (campus === 'Campus Principal') {
                    switchToCampus(campus);
                } else {
                    showNotAvailablePopup(campus);
                }
            });
        });

        osmMapElement.style.display = 'none';
    }

    // Alternar capas según el zoom
    const thresholdZoom = 0.5; // Umbral para capa detallada
    const intermediateZoomThreshold = -0.5; // Umbral para capa intermedia
    const minZoom = -1.5; // Zoom mínimo para OpenStreetMap
    let isOSMVisible = false;

    function getClosestCampus() {
        const center = osmMap.getCenter();
        let closestCampus = null;
        let minDist = Infinity;
        Object.entries(osmMap.campusMarkers).forEach(([campus, marker]) => {
            const dist = center.distanceTo(marker.getLatLng());
            if (dist < minDist) {
                minDist = dist;
                closestCampus = campus;
            }
        });
        return closestCampus;
    }

    function getVisibleCampus() {
        const bounds = osmMap.getBounds();
        let visibleCampuses = [];
        let closestVisibleCampus = null;
        let minDist = Infinity;
        const center = osmMap.getCenter();
        Object.entries(osmMap.campusMarkers).forEach(([campus, marker]) => {
            if (bounds.contains(marker.getLatLng())) {
                visibleCampuses.push(campus);
                const dist = center.distanceTo(marker.getLatLng());
                if (dist < minDist) {
                    minDist = dist;
                    closestVisibleCampus = campus;
                }
            }
        });
        if (visibleCampuses.length === 1) {
            return visibleCampuses[0];
        } else if (visibleCampuses.length > 1) {
            return closestVisibleCampus;
        } else {
            return currentCampus;
        }
    }

    function handleMapTransition(currentZoom, fromOSM = false) {
        console.log('Handle transition - Zoom level:', currentZoom, 'OSM visible:', isOSMVisible, 'From OSM:', fromOSM, 'Current Campus:', currentCampus);

        if (currentZoom === minZoom && osmMap && osmMapElement && !fromOSM) {
            if (!isOSMVisible) {
                console.log('Mostrando mapa de OpenStreetMap');
                isOSMVisible = true;
                mapElement.style.display = 'none';
                osmMapElement.style.display = 'block';
                map.eachLayer(layer => map.removeLayer(layer));
                osmMap.addLayer(osmLayer);
                Object.values(osmMap.campusMarkers).forEach(marker => {
                    osmMap.addLayer(marker);
                    marker.openPopup(); // Asegurar que los popups estén abiertos
                });
                ignoreNextZoomEnd = true;
                osmMap.setView(osmMap.campusMarkers[currentCampus].getLatLng(), 18);
                osmMap.invalidateSize();
            }
        } else if ((currentZoom > minZoom || fromOSM) && isOSMVisible) {
            console.log('Ocultando OpenStreetMap y mostrando mapa SVG de', currentCampus);
            isOSMVisible = false;
            mapElement.style.display = 'block';
            osmMapElement.style.display = 'none';
            osmMap.removeLayer(osmLayer);
            Object.values(osmMap.campusMarkers).forEach(marker => osmMap.removeLayer(marker));

            if (fromOSM) {
                const osmZoom = osmMap.getZoom();
                let svgZoom;
                if (osmZoom >= 17) {
                    svgZoom = thresholdZoom + 0.01;
                } else if (osmZoom >= 15) {
                    svgZoom = 0;
                } else {
                    svgZoom = intermediateZoomThreshold + 0.2;
                }
                const visibleCampus = getVisibleCampus();
                if (visibleCampus) {
                    currentCampus = visibleCampus;
                }
                switchToCampus(currentCampus);
                map.setZoom(svgZoom);
                return;
            }

            if (currentZoom >= thresholdZoom) {
                console.log('Mostrando capa detallada de', currentCampus);
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(detailedBaseLayers[currentCampus]);
                map.addLayer(detailedLayers[currentCampus]);
                map.addLayer(markersLayers[currentCampus]);
            } else if (currentZoom > intermediateZoomThreshold) {
                console.log('Mostrando capa base de', currentCampus);
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(baseLayers[currentCampus]);
                map.addLayer(markersLayers[currentCampus]);
            } else {
                console.log('Mostrando capa intermedia de', currentCampus);
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(intermediateBaseLayers[currentCampus]);
                map.addLayer(markersLayers[currentCampus]);
            }
        } else if (!isOSMVisible && !fromOSM) {
            if (currentZoom >= thresholdZoom) {
                console.log('Mostrando capa detallada y base detallada de', currentCampus);
                mapElement.style.display = 'block';
                if (osmMapElement) osmMapElement.style.display = 'none';
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(detailedBaseLayers[currentCampus]);
                map.addLayer(detailedLayers[currentCampus]);
                map.addLayer(markersLayers[currentCampus]);
            } else if (currentZoom > intermediateZoomThreshold) {
                console.log('Mostrando capa base de', currentCampus);
                mapElement.style.display = 'block';
                if (osmMapElement) osmMapElement.style.display = 'none';
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(baseLayers[currentCampus]);
                map.addLayer(markersLayers[currentCampus]);
            } else {
                console.log('Mostrando capa intermedia de', currentCampus);
                mapElement.style.display = 'block';
                if (osmMapElement) osmMapElement.style.display = 'none';
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(intermediateBaseLayers[currentCampus]);
                map.addLayer(markersLayers[currentCampus]);
            }
        }

        // Actualizar puntos de interés después de cambiar capas
        updateInterestPoints(currentCampus);
    }

    map.on('zoomstart', () => {
        Object.values(markers[currentCampus]).flat().forEach(m => {
            if (m._icon) m._icon.classList.remove('marker-animated');
        });

        const svgElement = document.querySelector('.leaflet-overlay-pane svg');
        if (svgElement) {
            svgElement.classList.add('will-change-transform');
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        markerElements.forEach(marker => {
            marker.classList.add('will-change-transform');
        });
    });

    map.on('zoomend moveend', () => {
        const currentZoom = map.getZoom();
        handleMapTransition(currentZoom, false);
    });

    if (osmMap) {
        osmMap.on('zoomend', () => {
            if (isOSMVisible) {
                if (ignoreNextZoomEnd) {
                    ignoreNextZoomEnd = false;
                    return;
                }
                const osmZoom = osmMap.getZoom();
                console.log('OSM Zoom changed to:', osmZoom);
                if (osmZoom >= 18.3) {
                    showCampusSelectionPopup();
                }
            }
        });
    }

    // Control personalizado con botón de geolocalización
    L.Control.CustomZoom = L.Control.Zoom.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
            const zoomDelta = 0.3;

            const geolocation = L.DomUtil.create('a', 'leaflet-control-geolocation', container);
            geolocation.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
            geolocation.href = '#';
            geolocation.title = 'Activar/Desactivar Geolocalización';
            L.DomEvent.on(geolocation, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                toggleGeolocation();
            });

            const meditation = L.DomUtil.create('a', 'leaflet-control-interest', container);
            meditation.innerHTML = '<i class="fas fa-person"></i>';
            meditation.href = '#';
            meditation.title = 'Ver Puntos de Interés';
            L.DomEvent.on(meditation, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                toggleInterestPoints(currentCampus);
            });

            this._zoomInButton = this._createButton(
                '+', '+ Zoom', 'leaflet-control-zoom-in', container,
                function(e) {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    if (!isFlying) {
                        map.setZoom(map.getZoom() + zoomDelta);
                    }
                }
            );

            this._zoomOutButton = this._createButton(
                '−', '- Zoom', 'leaflet-control-zoom-out', container,
                function(e) {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    if (!isFlying) {
                        map.setZoom(map.getZoom() - zoomDelta);
                    }
                }
            );

            this._updateDisabled();
            map.on('zoomend zoomlevelschange', this._updateDisabled, this);

            return container;
        },

        _createButton: function(html, title, className, container, fn) {
            const link = L.DomUtil.create('a', className, container);
            link.innerHTML = html;
            link.href = '#';
            link.title = title;

            L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', fn, this);

            return link;
        },

        _updateDisabled: function() {
            const map = this._map;
            const className = 'leaflet-disabled';

            L.DomUtil.removeClass(this._zoomInButton, className);
            L.DomUtil.removeClass(this._zoomOutButton, className);

            if (map._zoom >= map.getMaxZoom()) {
                L.DomUtil.addClass(this._zoomInButton, className);
            }
            if (map._zoom <= map.getMinZoom()) {
                L.DomUtil.addClass(this._zoomOutButton, className);
            }
        }
    });

    map.removeControl(map.zoomControl);
    map.addControl(new L.Control.CustomZoom({ position: 'topleft' }));

    function createMarker(lat, lng, title, building, iconConfig, faculty, photos, comments, campus, isShared = false) {
        const customIcon = L.divIcon({
            className: `marker-${iconConfig.color}`,
            html: `
                <div class="marker-inner" style="
                    background-image: url('${iconConfig.iconUrl}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    width: 32px;
                    height: 32px;
                    transform-origin: bottom center;
                "></div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        const popupContent = isShared
            ? `<b>${building}</b><br><small>${locations[campus][building].places.map(p => p.name).join(', ')}</small>`
            : `<b>Edificio: ${title}</b><br><small>${building}</small>`;

        const marker = L.marker([lat, lng], {
            title: isShared ? building : title,
            icon: customIcon
        }).bindPopup(popupContent);

        marker.on('click', () => {
            console.log(`marcador ${title} (de: ${building}) en [${lat}, ${lng}] en ${campus}`);
            flyToLocation(lat, lng, building, isShared ? building : title, campus);
        });

        marker.on('popupopen', () => {
            const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.style.cursor = 'pointer';
                popupElement.addEventListener('click', (e) => {
                    console.log(`Popup clicked for ${title} (building: ${building}) in ${campus}`);
                    e.stopPropagation();
                    if (isShared) {
                        showLocationDetails(building, building, faculty, [], 'Múltiples edificios: ' + locations[campus][building].places.map(p => p.name).join(', '), campus);
                    } else {
                        showLocationDetails(building, title, faculty, photos || [], comments || 'No hay comentarios disponibles.', campus);
                    }
                }, { once: true });
            } else {
                console.log(`Popup opened for ${title}, but .leaflet-popup-content-wrapper not found`);
            }
        });

        marker.on('popupclose', function() {
            if (marker._icon) {
                marker._icon.classList.remove('marker-animated');
            }
            const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.classList.remove('popup-animated');
            }
        });

        if (!markers[campus][building]) markers[campus][building] = [];
        markers[campus][building].push(marker);
        markersLayers[campus].addLayer(marker);
        return marker;
    }

    const infoIcon = document.querySelector('.fa-magnifying-glass');
    const locationControls = document.getElementById('location-controls');
    
    if (infoIcon && locationControls) {
        infoIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            locationControls.classList.toggle('visible');
            
            if (locationControls.classList.contains('visible')) {
                const searchBox = document.getElementById('search-box');
                if (searchBox) searchBox.value = '';
                const links = document.querySelectorAll('.location-link');
                links.forEach(link => {
                    link.style.display = 'block';
                    const section = link.closest('.building-section');
                    if (section) section.style.display = 'block';
                });
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (locationControls && !locationControls.contains(e.target) && infoIcon && !infoIcon.contains(e.target)) {
            locationControls.classList.remove('visible');
            const searchBox = document.getElementById('search-box');
            if (searchBox) searchBox.value = '';
            const links = document.querySelectorAll('.location-link');
            links.forEach(link => {
                link.style.display = 'block';
                const section = link.closest('.building-section');
                if (section) section.style.display = 'block';
            });
        }
    });

    const imageUrls = [
        ...Object.keys(locations).flatMap(campus =>
            Object.values(locations[campus]).map(data => data.icon.iconUrl)
        ),
        ...Object.keys(locations).flatMap(campus =>
            Object.values(locations[campus]).flatMap(data =>
                data.places.filter(place => place.icon).map(place => place.icon.iconUrl)
            )
        ),
        ...Object.keys(locations).flatMap(campus =>
            Object.values(locations[campus]).flatMap(data =>
                data.places.flatMap(place =>
                    (place.photos || []).map(photo => typeof photo === 'object' ? photo.url : photo)
                )
            )
        ),
        ...Object.keys(interestPoints).flatMap(campus =>
            interestPoints[campus].flatMap(point =>
                (point.photos || []).map(photo => typeof photo === 'object' ? photo.url : photo)
            )
        ),
        '../image/pines/pin-usuario.svg'
    ];
    preloadImages(imageUrls);

    let controlsHTML = `
        <div id="search-container">
            <input type="text" 
                id="search-box" 
                placeholder="Buscar aula o edificio..."
                autocomplete="off">
        </div>`;
    
    for (const campus of Object.keys(locations)) {
        controlsHTML += `<div class="building-section"><h2>${campus}</h2>`;
        for (const [building, data] of Object.entries(locations[campus])) {
            controlsHTML += `<h3>${building}</h3>`;
            if (data.usarIconoGrupal) {
                const coords = data.places.reduce(([sumLat, sumLng], place) => {
                    return [sumLat + place.coords[0], sumLng + place.coords[1]];
                }, [0, 0]);
                const avgCoords = [coords[0]/data.places.length, coords[1]/data.places.length];
                createMarker(avgCoords[0], avgCoords[1], building, building, data.icon, building, [], '', campus, true);
                controlsHTML += `
                    <a href="#" class="location-link marker-${data.icon.color}" 
                       onclick="flyToLocation(${avgCoords[0]}, ${avgCoords[1]}, '${building}', '${building}', '${campus}')"
                       data-search="${building.toLowerCase()} ${data.places.map(p => p.name.toLowerCase()).join(' ')}">
                        ${building}
                    </a>`;
            } else {
                data.places.forEach(place => {
                    const [lat, lng] = place.coords;
                    const icon = place.icon || data.icon;
                    createMarker(lat, lng, place.name, building, icon, building, place.photos, place.comments, campus);
                    controlsHTML += `
                        <a href="#" class="location-link marker-${icon.color}" 
                           onclick="flyToLocation(${lat}, ${lng}, '${building}', '${place.name}', '${campus}')"
                           data-search="${place.name.toLowerCase()} ${building.toLowerCase()}">
                            ${place.name}
                        </a>`;
                });
            }
        }
        controlsHTML += '</div>';
    }
    
    if (locationControls) {
        locationControls.innerHTML = controlsHTML;
    }

    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const links = document.querySelectorAll('.location-link');
            detailedLayers[currentCampus].eachLayer(layer => {
                const buildingName = layer.feature.properties.name.toLowerCase();
                layer.setStyle({
                    fillOpacity: buildingName.includes(searchTerm) ? 0.7 : 0.3
                });
            });
            
            links.forEach(link => {
                const searchableText = link.dataset.search;
                const match = searchableText.includes(searchTerm);
                link.style.display = match ? 'block' : 'none';
                
                const section = link.closest('.building-section');
                if (section) {
                    const visibleLinks = section.querySelectorAll('.location-link[style*="display: block"]');
                    section.style.display = visibleLinks.length > 0 ? 'block' : 'none';
                }
            });
        });
    }

    map.on('load', function() {
        const pantallaBienvenida = document.getElementById('pantallaBienvenida');
        const contenido = document.getElementById('contenido');
        if (pantallaBienvenida && contenido) {
            pantallaBienvenida.style.display = 'none';
            contenido.style.display = 'block';
        }
    });
});

window.flyToLocation = flyToLocation;