let map;
let markers = {};
let interestMarkers = [];
let isFlying = false;
let interestPointsActive = false;

function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function flyToLocation(lat, lng, building, placeName, isInterestPoint = false) {
    if (!map) {
        return;
    }

    if (isFlying) {
        return;
    }

    isFlying = true;

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

    Object.values(markers).flat().forEach(m => {
        if (m._icon) m._icon.classList.remove('marker-animated');
    });
    const popups = document.querySelectorAll('.leaflet-popup-content-wrapper');
    popups.forEach(popup => popup.classList.remove('popup-animated'));

    map.once('moveend', () => {
        if (isInterestPoint) {
            const pinMarker = createInterestPinMarker(lat, lng, placeName, building);
            if (pinMarker) {
                pinMarker.openPopup();
                pinMarker._icon.classList.add('marker-animated');
            }
        } else {
            const markerGroup = markers[building];
            if (!markerGroup) {
                isFlying = false;
                return;
            }

            const targetMarker = markerGroup.find(m => {
                const latlng = m.getLatLng();
                return Math.abs(latlng.lat - lat) < 0.0001 && Math.abs(latlng.lng - lng) < 0.0001;
            });

            if (!targetMarker) {
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

function showLocationDetails(building, placeName, faculty, photos, comments) {
    const detailsPanel = document.getElementById('location-details');
    if (!detailsPanel) {
        return;
    }

    const photoHTML = photos.length > 0
        ? photos
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
        : '<p>No hay fotos o videos disponibles.</p>';

    let commentsHTML;
    if (Array.isArray(comments)) {
        commentsHTML = comments.map(comment => `<p>${comment}</p>`).join('');
    } else {
        commentsHTML = `<p>${comments || 'No hay comentarios disponibles.'}</p>`;
    }

    detailsPanel.innerHTML = `
        <span class="close-btn">×</span>
        <h2>Zona: ${placeName}</h2>
        <div class="faculty">${faculty}</div>
        <div class="photos">${photoHTML}</div>
        <div class="comments">${commentsHTML}</div>
    `;
    detailsPanel.classList.add('visible');

    // Añadir un estado al historial para manejar los popups
    history.pushState({ popup: 'location-details' }, null, '');

    const closeBtn = detailsPanel.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            detailsPanel.classList.remove('visible');
            // Limpiar el historial al cerrar manualmente
            history.replaceState(null, null, '');
        }, { once: true });
    }

    const photoItems = detailsPanel.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.tagName === 'IMG' && item.dataset.panoramic === 'true') {
                const panoramaContainer = document.getElementById('panorama-viewer');
                if (panoramaContainer) {
                    panoramaContainer.classList.add('visible');
                    pannellum.viewer('panorama', {
                        type: 'equirectangular',
                        panorama: item.src,
                        autoLoad: true,
                        showControls: true,
                        yaw: 0,
                        pitch: 0,
                        hfov: 100
                    });
                    // Actualizar el estado del historial
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
                    // Actualizar el estado del historial
                    history.replaceState({ popup: 'fullscreen-image' }, null, '');
                }
            }
        });
    });

    const panoramaCloseBtn = document.querySelector('.panorama-close-btn');
    if (panoramaCloseBtn) {
        panoramaCloseBtn.addEventListener('click', () => {
            const panoramaContainer = document.getElementById('panorama-viewer');
            if (panoramaContainer) {
                panoramaContainer.classList.remove('visible');
                const panoramaDiv = document.getElementById('panorama');
                if (panoramaDiv) {
                    panoramaDiv.innerHTML = ''; // Limpiar el visor
                }
                // Restaurar el estado del popup anterior
                history.replaceState({ popup: 'location-details' }, null, '');
            }
        }, { once: true });
    }

    const fullscreenCloseBtn = document.querySelector('.fullscreen-close-btn');
    if (fullscreenCloseBtn) {
        fullscreenCloseBtn.addEventListener('click', () => {
            const fullscreenContainer = document.getElementById('fullscreen-image');
            if (fullscreenContainer) {
                fullscreenContainer.classList.remove('visible');
                // Restaurar el estado del popup anterior
                history.replaceState({ popup: 'location-details' }, null, '');
            }
        }, { once: true });
    }
}

function createInterestPointMarker(lat, lng, title, building, photos, comments) {
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

    marker.on('click', () => {
        flyToLocation(lat, lng, building, title, true);
        showLocationDetails(building, title, building, photos || [], comments || 'No hay comentarios disponibles.');
    });

    return marker;
}

function createInterestPinMarker(lat, lng, title, building) {
    const pinUrl = '../image/pines/pin-usuario.svg';
    
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
            const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.classList.remove('popup-animated');
            }
        });

        return marker;
    } catch (error) {
        return null;
    }
}

// Mapa
document.addEventListener('DOMContentLoaded', function() {
    const w = 2049, h = 1521;
    const bounds = [[0, 0], [h, w]];
    const mapElement = document.getElementById('map');
    const pantallaBienvenida = document.getElementById('pantallaBienvenida');

    if (!mapElement) {
        return;
    }

    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -0.5,
        maxZoom: 1,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        zoomDelta: 0.5,
        zoomSnap: 0,
        fadeAnimation: true,
        zoomAnimationThreshold: 2
    });
    
    const imageOverlay = L.imageOverlay('../image/mapa2.svg', bounds);
    imageOverlay.on('load', () => {
        pantallaBienvenida.classList.add('fade-out');
    });
    imageOverlay.addTo(map);

    map.fitBounds(bounds);
    map.setView([700, 1200], 0);

    // Optimizar imágenes y pines durante el zoom
    map.on('zoomstart', () => {
        Object.values(markers).flat().forEach(m => {
            if (m._icon) m._icon.classList.remove('marker-animated');
        });

        const svgElement = document.querySelector('.leaflet-overlay-pane svg');
        if (svgElement) {
            svgElement.classList.add('will-change-transform');
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        if (markerElements.length > 0) {
            markerElements.forEach(marker => {
                marker.classList.add('will-change-transform');
            });
        }
    });

    map.on('zoomend', () => {
        const svgElement = document.querySelector('.leaflet-overlay-pane svg');
        if (svgElement) {
            svgElement.classList.remove('will-change-transform');
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        if (markerElements.length > 0) {
            markerElements.forEach(marker => {
                marker.classList.remove('will-change-transform');
            });
        }
    });

    // Manejar el evento popstate para el botón "Atrás"
    window.addEventListener('popstate', (event) => {
        const panoramaContainer = document.getElementById('panorama-viewer');
        const fullscreenContainer = document.getElementById('fullscreen-image');
        const detailsPanel = document.getElementById('location-details');

        if (panoramaContainer && panoramaContainer.classList.contains('visible')) {
            panoramaContainer.classList.remove('visible');
            const panoramaDiv = document.getElementById('panorama');
            if (panoramaDiv) {
                panoramaDiv.innerHTML = ''; // Limpiar el visor
            }
            history.replaceState({ popup: 'location-details' }, null, '');
        } else if (fullscreenContainer && fullscreenContainer.classList.contains('visible')) {
            fullscreenContainer.classList.remove('visible');
            history.replaceState({ popup: 'location-details' }, null, '');
        } else if (detailsPanel && detailsPanel.classList.contains('visible')) {
            detailsPanel.classList.remove('visible');
            history.replaceState(null, null, '');
        } else {
            // Si no hay popups abiertos, añadir un estado para evitar retroceder
            history.pushState({ popup: 'map' }, null, '');
        }

        // Prevenir la navegación a la página anterior
        event.preventDefault();
        event.stopPropagation();
    });

    // Añadir un estado inicial para el mapa
    history.replaceState({ popup: 'map' }, null, '');

    L.Control.CustomZoom = L.Control.Zoom.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
            const zoomDelta = 0.3;

            const meditation = L.DomUtil.create('a', 'leaflet-control-interest', container);
            meditation.innerHTML = '<i class="fas fa-person"></i>';
            meditation.href = '#';
            meditation.title = 'Toggle Puntos de Interés';
            L.DomEvent.on(meditation, 'click', function(e) {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                toggleInterestPoints();
            });

            this._zoomInButton = this._createButton(
                '+', 'Zoom in', 'leaflet-control-zoom-in', container,
                function(e) {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    if (!isFlying) {
                        map.setZoom(map.getZoom() + zoomDelta);
                    }
                }
            );

            this._zoomOutButton = this._createButton(
                '−', 'Zoom out', 'leaflet-control-zoom-out', container,
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

    function createMarker(lat, lng, title, building, iconConfig, faculty, photos, comments, isShared = false) {
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
            ? `<b>${building}</b><br><small>${locations[building].places.map(p => p.name).join(', ')}</small>`
            : `<b>Edificio: ${title}</b><br><small>${building}</small>`;

        const marker = L.marker([lat, lng], {
            title: isShared ? building : title,
            icon: customIcon
        }).bindPopup(popupContent).addTo(map);

        marker.on('click', () => {
            flyToLocation(lat, lng, building, isShared ? building : title);
        });

        marker.on('popupopen', () => {
            const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.style.cursor = 'pointer';
                popupElement.addEventListener('click', () => {
                    if (isShared) {
                        showLocationDetails(building, building, faculty, [], 'Múltiples edificios: ' + locations[building].places.map(p => p.name).join(', '));
                    } else {
                        showLocationDetails(building, title, faculty, photos || [], comments || 'No hay comentarios disponibles.');
                    }
                });
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

        if (!markers[building]) markers[building] = [];
        markers[building].push(marker);
        return marker;
    }

    function toggleInterestPoints() {
        interestPointsActive = !interestPointsActive;
        const interestButton = document.querySelector('.leaflet-control-interest');
        if (interestPointsActive) {
            interestButton.classList.add('active');
            interestPoints.forEach(point => {
                const marker = createInterestPointMarker(
                    point.coords[0],
                    point.coords[1],
                    point.name,
                    point.building,
                    point.photos,
                    point.comments
                );
                marker.addTo(map);
                interestMarkers.push(marker);
            });
        } else {
            interestButton.classList.remove('active');
            interestMarkers.forEach(marker => map.removeLayer(marker));
            interestMarkers = [];
        }
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

    const locations = {
        'Facultad de Ciencias de la Informacion': {
            places: [{
                name: 'C-1',
                coords: [475, 1585],
                icon: { iconUrl: '../image/pines/pin-fci-c1.svg', color: 'azul-claro' },
                photos: [
                    { url: '../image/galeria/c-1/pb.jpg', isPanoramic: false },
                    { url: '../image/galeria/c-1/p2.jpg', isPanoramic: false },
                    { url: '../image/galeria/c-1/p3.jpg', isPanoramic: false },
                    { url: '../image/galeria/c-1/p4.jpg', isPanoramic: false },
                    { url: '../image/galeria/c-1/EDIFICIO.webp', isPanoramic: false },
                    { url: '../image/galeria/c-1/EDIFICIO1.webp', isPanoramic: false }
                ],
                comments: 'Este edificio es la planta principal de la Facultad de Ciencias de la Información, fundada en 1980. Es conocido por su biblioteca especializada y laboratorios de computación.'
            }],
            icon: { iconUrl: '../image/pines/pin-fci.svg', color: 'azul-claro' },
            usarIconoGrupal: false
        },
        'Centro de Idiomas': {
            places: [{
                name: 'C',
                coords: [700, 1595],
                icon: { iconUrl: '../image/pines/pin-ci.svg', color: 'amarillo' },
                photos: [
                    { url: '../image/galeria/ci/2.webp', isPanoramic: false }
                ],
                comments: [
                    'El Centro de Idiomas de la UNACAR ofrece programas de enseñanza de inglés y francés, tanto para estudiantes universitarios como para el público en general. Su objetivo es fortalecer las competencias lingüísticas de los alumnos.',
                    'Oferta educativa:',
                    '*Inglés: 4 niveles para licenciatura.',
                    '*Francés: Cursos optativos y especializados para propósitos académicos.',
                    '*Cursos no escolarizados: Programas abiertos para niños, jóvenes y adultos.'
                ]
            }],
            icon: { iconUrl: '../image/pines/pin-ci.svg', color: 'amarillo' },
            usarIconoGrupal: false
        },
        'Edificio de Vinculacion': {
            places: [{
                name: 'CH',
                coords: [310, 1431],
                icon: { iconUrl: '../image/pines/pin-ev-ch.svg', color: 'verde-azul' },
                photos: [
                    { url: '../image/galeria/ev/360-ch.jpg', isPanoramic: true }
                ]
            }],
            icon: { iconUrl: '../image/pines/pin-ev.svg', color: 'verde-azul' },
            usarIconoGrupal: false
        },
        'Facultad de Quimica': {
            places: [
                { name: 'T', coords: [791, 1270], icon: { iconUrl: '../image/pines/pin-fq-t.svg', color: 'cafe' } },
                { name: 'U', coords: [892, 1285], icon: { iconUrl: '../image/pines/pin-fq-u.svg', color: 'cafe' } },
                { name: 'U-1', coords: [915, 1225], icon: { iconUrl: '../image/pines/pin-fq-u1.svg', color: 'cafe' } },
                { name: 'V', coords: [878, 1330], icon: { iconUrl: '../image/pines/pin-fq-v.svg', color: 'cafe' } }
            ],
            icon: { iconUrl: '../image/pines/pin-fq.svg', color: 'cafe' },
            usarIconoGrupal: false
        },
        'Gimnasio Universitario y PE de LEFYD': {
            places: [{
                name: 'E', coords: [870, 783], icon: { iconUrl: '../image/pines/pin-gu.svg', color: 'naranja' }, 
                photos: [
                    { url: '../image/galeria/E/1.jpg', isPanoramic: true }
                ],
                comments: [
                    'Gimnasio Universitario de la UNACAR'
                ]
            }],
            icon: { iconUrl: '../image/pines/pin-gu.svg', color: 'naranja' },
            usarIconoGrupal: false
        },
        'Facultad de Derecho': {
            places: [{
                name: 'Z',
                coords: [890, 1500],
                icon: { iconUrl: '../image/pines/pin-fd-z.svg', color: 'durazno' }
            }],
            icon: { iconUrl: '../image/pines/pin-fd.svg', color: 'durazno' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Educativas': {
            places: [
                { name: 'H', coords: [531, 1208], icon: { iconUrl: '../image/pines/pin-fce-h.svg', color: 'rosa-claro' } },
                { name: 'I', coords: [550, 1173], icon: { iconUrl: '../image/pines/pin-fce-i.svg', color: 'rosa-claro' } },
                { name: 'K', coords: [636, 1131], icon: { iconUrl: '../image/pines/pin-fce-k.svg', color: 'rosa-claro' } },
                { name: 'O', coords: [705, 1092], icon: { iconUrl: '../image/pines/pin-fce-o.svg', color: 'rosa-claro' } },
                { name: 'Q', coords: [660, 1216], icon: { iconUrl: '../image/pines/pin-fce-q.svg', color: 'rosa-claro' } }
            ],
            icon: { iconUrl: '../image/pines/pin-fce.svg', color: 'rosa-claro' },
            usarIconoGrupal: false
        },
        'Areas de Servicios': {
            places: [
                { name: 'P_Sala Audiovisual', coords: [705, 1184], icon: { iconUrl: '../image/pines/pin-sa-p.svg', color: 'azul-oscuro' } },
                { name: 'L', coords: [590, 1086], icon: { iconUrl: '../image/pines/pin-fcea-l.svg', color: 'azul' } },
                {
                    name: 'B_Biblioteca Universitaria',
                    coords: [595, 1622],
                    icon: { iconUrl: '../image/pines/pin-biblioteca.svg', color: 'verde-oscuro' },
                    photos: [
                        { url: '../image/galeria/B/2.webp', isPanoramic: false },
                        { url: '../image/galeria/B/360-biblioteca.jpg', isPanoramic: true }
                    ],
                    comments: 'Una biblioteca universitaria es un edificio con áreas de consulta, salas de estudio y acceso digital. Para ingresar, se requiere identificación institucional y dejar los objetos personales en resguardo con el encargado.'
                },
                {
                    name: 'D_Aula Magna',
                    coords: [810, 1415],
                    icon: { iconUrl: '../image/pines/pin-am-d.svg', color: 'verde-claro' },
                    photos: [
                        { url: '../image/galeria/D/1.jpg', isPanoramic: false },
                        { url: '../image/galeria/D/2.jpg', isPanoramic: false },
                        { url: '../image/galeria/D/360-aula-magna.jpg', isPanoramic: true }
                    ],
                    comments: [
                        'Aula Magna es un edificio emblemático de la universidad, utilizado para conferencias, eventos institucionales y actividades académicas de gran relevancia.',
                        'El diseño del Aula Magna refleja la identidad de la UNACAR, con una estructura moderna y funcional que permite albergar a un gran número de asistentes. Además, cuenta con equipamiento tecnológico para presentaciones y proyecciones, lo que lo convierte en un punto clave para la difusión del conocimiento y la cultura en la región'
                    ]
                },
                { name: 'F-1_Edificio Cafeteria, Extension Universitaria', coords: [629, 1349], icon: { iconUrl: '../image/pines/pin-ec-f1.svg', color: 'rosa-oscuro' } },
                { name: 'W_Centro de Educacion Continua', coords: [894, 1371], icon: { iconUrl: '../image/pines/pin-cec-w.svg', color: 'morado' } },
                { name: 'A_Rectoria', coords: [556, 575], icon: { iconUrl: '../image/pines/pin-rectoria-a.svg', color: 'rojo' } },
                { name: 'G_Servicios Culturales', coords: [495, 1275], icon: { iconUrl: '../image/pines/pin-sc-g.svg', color: 'rojo' } },
                { name: 'LL_Almacenes y Talleres', coords: [710, 985], icon: { iconUrl: '../image/pines/pin-at-ll.svg', color: 'rojo' } },
                { name: 'Ñ_Sala de Usos Multiples, Fotocopiado', coords: [635, 1048], icon: { iconUrl: '../image/pines/pin-sum-ñ.svg', color: 'rojo' } },
                { name: 'M_Soporte Tecnico', coords: [602, 1022], icon: { iconUrl: '../image/pines/pin-st-m.svg', color: 'rojo' } },
                { name: 'N_Redes y Patrimonio Universitario', coords: [520, 1004], icon: { iconUrl: '../image/pines/pin-rpu-n.svg', color: 'rojo' } },
                { name: 'J_Coord. General de Obras y Baby Delfin', coords: [510, 1068], icon: { iconUrl: '../image/pines/pin-bd-j.svg', color: 'rojo' } },
                { name: 'J-1', coords: [490, 1125], icon: { iconUrl: '../image/pines/pin-j1.svg', color: 'rojo' } },
                { name: 'Z-1', coords: [650, 1667], icon: { iconUrl: '../image/pines/pin-Z1.svg', color: 'rojo' } },
                { name: 'ZB_Sutucar', coords: [750, 485], icon: { iconUrl: '../image/pines/pin-s-zb.svg', color: 'rojo' } },
                { name: 'ZE_Sec. Academica', coords: [721, 468], icon: { iconUrl: '../image/pines/pin-sa-ze.svg', color: 'rojo' } },
                { name: 'Residencia Universitaria', coords: [1028, 666], icon: { iconUrl: '../image/pines/pin-RU.svg', color: 'rojo' } }
            ],
            icon: { iconUrl: '../image/pines/pin-sa.svg', color: 'azul-oscuro' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Economicas Administrativas': {
            places: [
                { name: 'R', coords: [650, 1273], icon: { iconUrl: '../image/pines/pin-fcea-r.svg', color: 'azul' } },
                { name: 'S', coords: [760, 1333], icon: { iconUrl: '../image/pines/pin-fcea-s.svg', color: 'azul' } },
                { name: 'X', coords: [910, 1414], icon: { iconUrl: '../image/pines/pin-fcea-x.svg', color: 'azul' } },
                { name: 'Y', coords: [892, 1451], icon: { iconUrl: '../image/pines/pin-fcea-y.svg', color: 'azul' } }
            ],
            icon: { iconUrl: '../image/pines/pin-fcea.svg', color: 'azul' },
            usarIconoGrupal: false
        }
    };

    const interestPoints = [
        {
            name: 'Cancha Unacar',
            building: 'Área Común',
            coords: [861, 995],
            photos: [
                { url: '../image/galeria/estudio/aire-libre1.jpg', isPanoramic: false },
                { url: '../image/galeria/estudio/aire-libre2.jpg', isPanoramic: false },
                { url: '../image/galeria/estudio/360-cancha-unacar.jpg', isPanoramic: true }
            ],
            comments: 'Área ideal para deportes, como futbol, voleibol.'
        },
        {
            name: 'Cancha Basquet',
            building: 'Área Común',
            coords: [894, 817],
            photos: [
                { url: '../image/galeria/areas-interes/CB/videocanchabasquet.mp4', isPanoramic: false },
                { url: '../image/galeria/areas-interes/CB/videocanchabasquet.gif', isPanoramic: false }
            ],
            comments: 'Área ideal para deportes, como futbol, voleibol.'
        },
        {
            name: 'Glorieta el Camaron',
            building: 'Monumento',
            coords: [414, 1370],
            photos: [
                { url: '../image/galeria/areas-interes/GC/camaron.webp', isPanoramic: false },
                { url: '../image/galeria/areas-interes/GC/nightcamaron.webp', isPanoramic: false },
                { url: '../image/galeria/areas-interes/GC/camaronarriba.webp', isPanoramic: false },
                { url: '../image/galeria/areas-interes/GC/360-camaron.jpg', isPanoramic: true }
            ],
            comments: [
                'Historia de la Glorieta del Camarón en Ciudad del Carmen #Campeche.',
                'El monumento es un homenaje a la Industria Camaronera. Ya que a mitad del siglo XX se inicio en la Isla el denominado “auge pesquero”, con la explotación del camarón, lo que imprimió un nuevo crecimiento y brillo a Carmen.',
                'Durante la década de 1960 a 1970, la ciudad vivió la época dorada de la industria camaronera, la Isla tuvo la flota camaronera más importante del país, al tener al rededor de 500 embarcaciones, las cuáles llegaban a los muelles de la calle 20 para dejar su producto en las congeladoras.',
                'La "Isla del Carmen" era reconocida en Estados Unidos por ser un grana exportadora de productos del mar. En las sociedades cooperativas trabajaba casi toda la población y brindaba sustento a miles de familias Carmelitas.',
                'La escultura del Camarón fue diseñada por el Ing. Alberto Calderón Osuna y elaborada en la ciudad de Puebla, dicha escultura esta hecha de bronce, con un peso de 1,800 kg y 2.5 metros de altura.',
                'A lo largo de los años se le han realizado diversos cambios a la glorieta. En la actualidad la fuente está formada por tres brazos de concreto armado, que sostienen una Perla (alusión a la Perla del Golfo) y sobre ella el Camarón. Cuenta con tres accesos laterales con escalinatas que permiten el paso a un andador, para que se pueda caminar alrededor de la glorieta.'
            ]
        },
        {
            name: 'Area de Descanso FCI',
            building: 'Área Común',
            coords: [475, 1507],
            photos: [
                { url: '../image/galeria/areas-interes/ADF/1.jpg', isPanoramic: true }
            ],
            comments: 'Jardín con áreas verdes para relajarse entre clases.'
        },
        {
            name: 'Explanada',
            building: 'Área Común',
            coords: [640, 1305],
            photos: [
                { url: '../image/galeria/areas-interes/E/1.jpg', isPanoramic: true },
                { url: '../image/galeria/areas-interes/E/2.webp', isPanoramic: false },
                { url: '../image/galeria/areas-interes/E/3.webp', isPanoramic: false }
            ],
            comments: 'Este es un espacio amplio y abierto dentro de la universidad, utilizado para eventos institucionales, actividades culturales y reuniones estudiantiles. Su diseño permite la congregación de grandes grupos, siendo un punto clave para ceremonias y celebraciones académicas. Además, es un lugar de encuentro para la comunidad universitaria.'
        },
        {
            name: 'Monumento',
            building: 'Área Común',
            coords: [710, 1403],
            photos: [
                { url: '../image/galeria/areas-interes/M/1.jpg', isPanoramic: true },
                { url: '../image/galeria/areas-interes/M/2.webp', isPanoramic: false }
            ],
            comments: [
                'El Monumento a Justo Sierra Méndez es un homenaje al ilustre educador, escritor e historiador campechano, reconocido por su contribución a la educación en México y la fundación de la Universidad Nacional de México (hoy UNAM).',
                'Cada año, en la UNACAR se conmemora el natalicio de Justo Sierra con una ceremonia cívica en este monumento, donde autoridades universitarias y municipales colocan una ofrenda floral y montan guardia de honor en su memoria.'
            ]
        },
        {
            name: 'Monumento FCI',
            building: 'Área Común',
            coords: [590, 1545],
            photos: [
                { url: '../image/galeria/estudio/aire-libre1.jpg', isPanoramic: false },
                { url: '../image/galeria/estudio/aire-libre2.jpg', isPanoramic: false },
                { url: '../image/galeria/estudio/360-monumento-fci.jpg', isPanoramic: true }
            ],
            comments: 'Área ideal para deportes, como futbol, voleibol.'
        }
    ];

    const imageUrls = [
        ...Object.values(locations).map(data => data.icon.iconUrl),
        ...Object.values(locations).flatMap(data =>
            data.places.filter(place => place.icon).map(place => place.icon.iconUrl)
        ),
        ...Object.values(locations).flatMap(data =>
            data.places.flatMap(place =>
                (place.photos || []).map(photo => typeof photo === 'object' ? photo.url : photo)
            )
        ),
        ...interestPoints.flatMap(point =>
            (point.photos || []).map(photo => typeof photo === 'object' ? photo.url : photo)
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
    
    for (const [building, data] of Object.entries(locations)) {
        controlsHTML += `<div class="building-section"><h3>${building}</h3>`;
        
        if (data.usarIconoGrupal) {
            const coords = data.places.reduce(([sumLat, sumLng], place) => {
                return [sumLat + place.coords[0], sumLng + place.coords[1]];
            }, [0, 0]);
            const avgCoords = [coords[0] / data.places.length, coords[1] / data.places.length];
            createMarker(avgCoords[0], avgCoords[1], building, building, data.icon, building, [], '', true);
            controlsHTML += `
                <a href="#" class="location-link marker-${data.icon.color}" 
                   onclick="flyToLocation(${avgCoords[0]}, ${avgCoords[1]}, '${building}', '${building}')"
                   data-search="${building.toLowerCase()} ${data.places.map(p => p.name.toLowerCase()).join(' ')}">
                    ${building}
                </a>`;
        } else {
            data.places.forEach(place => {
                const [lat, lng] = place.coords;
                const icon = place.icon || data.icon;
                createMarker(lat, lng, place.name, building, icon, building, place.photos, place.comments);
                controlsHTML += `
                    <a href="#" class="location-link marker-${icon.color}" 
                       onclick="flyToLocation(${lat}, ${lng}, '${building}', '${place.name}')"
                       data-search="${place.name.toLowerCase()} ${building.toLowerCase()}">
                        ${place.name}
                    </a>`;
            });
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