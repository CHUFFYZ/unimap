let map;
let osmMap;
let osmLayer;
let baseLayers = {}, intermediateBaseLayers = {}, detailedBaseLayers = {}, detailedLayers = {}, markersLayers = {};
let markers = { 'Campus Principal': {}, 'Campus 2': {}, 'Campus 3': {}, 'Jardin Botanico': {}, 'Centro Cultural Universitario': {}, 'Museo Guanal': {}, 'Campus Sabancuy': {}};
let interestMarkers = { 'Campus Principal': [], 'Campus 2': [], 'Campus 3': [], 'Jardin Botanico': [], 'Centro Cultural Universitario': [], 'Museo Guanal': [], 'Campus Sabancuy': [] };
let isFlying = false;
let interestPointsActive = { 'Campus Principal': false, 'Campus 2': false, 'Campus 3': false, 'Jardin Botanico': false, 'Centro Cultural Universitario': false, 'Museo Guanal': false, 'Campus Sabancuy': false };
let geolocationActive = false;
let currentPinMarker = null;
let userMarker = null;
let accuracyCircle = null;
let routeLayers = {};
let stopMarkers = [];
let currentDestination = null;
let firstGeoUpdate = false;
let currentCampus = 'Campus Principal';
let ignoreNextZoomEnd = false;
let routesMenu = null;
let routesActive = false;
let selectedRoutes = [];
let busAnimations = {}; // Added for bus animations
let fullscreenCloseListener = null;
let panoramaCloseListener = null;
let geolocationWatchId = null;
let currentFloorOverlay = null;
let levelMenu = null;
let buildingMarker = null;

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
    if (!currentFloorOverlay) {
        map.addLayer(markersLayers[campus]);
    }
    map.fitBounds(bounds);
    map.setView(center, zoom);
    if (interestPointsActive[campus]) {
        updateInterestPoints(campus);
    }
    const guiaContainer = document.getElementById('guia-container');
    const guiaContainer2 = document.getElementById('guia-container2');
    const osmMapElement = document.getElementById('osm-map');
    const mapElement = document.getElementById('map');
    if (osmMapElement && mapElement) {
        osmMapElement.style.display = 'none';
        mapElement.style.display = 'block';
    }
    if (guiaContainer && guiaContainer2) {
        guiaContainer.style.display = 'block';
        guiaContainer2.style.display = 'none';
    }
    updateLocationControls();
    if (currentFloorOverlay) {
        map.removeLayer(currentFloorOverlay);
        currentFloorOverlay = null;
    }
    if (levelMenu) {
        document.body.removeChild(levelMenu);
        levelMenu = null;
    }
    // Close routes menu when switching to vectorized map
    if (routesMenu) {
        routesMenu.style.display = 'none';
        routesActive = false;
        const routesButton = document.querySelector('.leaflet-control-routes');
        if (routesButton) routesButton.classList.remove('active');
        clearRoutesAndStops();
    }
}

function flyToLocation(lat, lng, building, placeName, campus, isInterestPoint = false) {
    if (!map) return;
    if (isFlying) return;
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
                if (pinMarker._icon) pinMarker._icon.classList.add('marker-animated');
            }
        } else {
            const markerGroup = markers[campus][building];
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
            const maxMarkerAttempts = 10;
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
                    setTimeout(animateMarkerAndPopup, 300);
                }
            };
            animateMarkerAndPopup();
        }
        isFlying = false;
    });
}

function startLevelExploration(campus, faculty, buildingCode) {
    const buildingData = locations[campus][faculty].places.find(p => p.name === buildingCode);
    if (!buildingData || !buildingData.floors) return;
    const floors = buildingData.floors;
    const { w, h } = campuses[campus];
    const bounds = [[0, 0], [h, w]];
    if (currentFloorOverlay) {
        map.removeLayer(currentFloorOverlay);
        currentFloorOverlay = null;
    }
    buildingMarker = null;
    if (markers[campus][faculty]) {
        buildingMarker = markers[campus][faculty].find(m => {
            const latlng = m.getLatLng();
            return Math.abs(latlng.lat - buildingData.coords[0]) < 0.0001 && Math.abs(latlng.lng - buildingData.coords[1]) < 0.0001;
        });
        if (buildingMarker && buildingMarker._icon) {
            buildingMarker._icon.style.display = 'none';
        }
    }
    const initialFloorSvgUrl = `../../../image/locations/CP/galeria/${buildingCode}/p1.svg`;
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svgElement.setAttribute("preserveAspectRatio", "none");
    svgElement.innerHTML = `<image href="${initialFloorSvgUrl}" x="0" y="0" width="100%" height="100%" />`;
    currentFloorOverlay = L.svgOverlay(svgElement, bounds, {
        opacity: 1,
        interactive: false
    }).addTo(map);
    const mapContainer = document.getElementById('map');
    mapContainer.style.position = 'relative';
    if (levelMenu) {
        document.body.removeChild(levelMenu);
    }
    levelMenu = document.createElement('div');
    levelMenu.id = 'level-menu';
    for (let i = 1; i <= floors; i++) {
        const levelBtn = document.createElement('button');
        levelBtn.textContent = `P${i}`;
        levelBtn.addEventListener('click', () => {
            if (currentFloorOverlay) {
                map.removeLayer(currentFloorOverlay);
            }
            const floorSvgUrl = `../../../image/locations/CP/galeria/${buildingCode}/p${i}.svg`;
            const newSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            newSvgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            newSvgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
            newSvgElement.setAttribute("preserveAspectRatio", "none");
            newSvgElement.innerHTML = `<image href="${floorSvgUrl}" x="0" y="0" width="100%" height="100%" />`;
            currentFloorOverlay = L.svgOverlay(newSvgElement, bounds, {
                opacity: 1,
                interactive: false
            }).addTo(map);
            Array.from(levelMenu.querySelectorAll('button:not(.close-levels)')).forEach(btn => btn.style.backgroundColor = '');
            levelBtn.style.backgroundColor = '#ccc';
        });
        levelMenu.appendChild(levelBtn);
    }
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-levels';
    closeBtn.textContent = 'X';
    closeBtn.addEventListener('click', () => {
        if (currentFloorOverlay) {
            map.removeLayer(currentFloorOverlay);
            currentFloorOverlay = null;
        }
        if (levelMenu) {
            document.body.removeChild(levelMenu);
            levelMenu = null;
        }
        if (buildingMarker && buildingMarker._icon) {
            buildingMarker._icon.style.display = '';
        }
        buildingMarker = null;
        map.addLayer(markersLayers[currentCampus]);
    });
    levelMenu.appendChild(closeBtn);
    document.body.appendChild(levelMenu);
    levelMenu.querySelector('button:not(.close-levels)').click();
    map.removeLayer(markersLayers[currentCampus]);
    map.invalidateSize();
}

function showLocationDetails(building, placeName, faculty, photos, comments, campus, showGoButton = false) {
    const detailsPanel = document.getElementById('location-details');
    if (!detailsPanel) return;
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
    const buildingData = locations[campus][building].places.find(p => p.name === placeName);
    const hasLevelExploration = buildingData && buildingData.hasLevelExploration && buildingData.floors > 0;
    let innerHTML = `
        <span class="close-btn">×</span>
        <h2>Zona: ${placeName}</h2>
        <div class="top">
            ${hasLevelExploration ? `<span class="explore-levels"><i class="fas fa-layer-group"></i>Exploración por niveles</span>` : ''}
            <span class="rute"><i class="fas fa-layer-group"></i>Como llegar</span>
        </div>
        <div class="faculty">${faculty}</div>
        <div class="photos">${photoHTML}</div>
        <div class="comments">${commentsHTML}</div>
    `;
    if (showGoButton) {
        innerHTML += `<button class="go-to-map">Ir al mapa</button>`;
    }
    detailsPanel.innerHTML = innerHTML;
    detailsPanel.classList.add('visible');
    history.pushState({ popup: 'location-details' }, null, '');
    const closeBtn = detailsPanel.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            detailsPanel.classList.remove('visible');
            history.replaceState(null, null, '');
            if (currentPinMarker) {
                map.removeLayer(currentPinMarker);
                currentPinMarker = null;
            }
        }, { once: true });
    }
    if (showGoButton) {
        const goButton = detailsPanel.querySelector('.go-to-map');
        if (goButton) {
            goButton.addEventListener('click', () => {
                switchToCampus(campus);
                detailsPanel.classList.remove('visible');
                history.replaceState(null, null, '');
            }, { once: true });
        }
    }
    if (hasLevelExploration) {
        const exploreLevels = detailsPanel.querySelector('.explore-levels');
        if (exploreLevels) {
            exploreLevels.addEventListener('click', () => {
                startLevelExploration(campus, building, placeName);
            });
        }
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
                    history.pushState({ popup: 'panorama-viewer' }, null, '');
                }
            } else {
                const fullscreenContainer = document.getElementById('fullscreen-image');
                if (fullscreenContainer) {
                    const fullscreenImg = fullscreenContainer.querySelector('img');
                    const fullscreenVideo = fullscreenContainer.querySelector('video');
                    if (fullscreenImg && fullscreenVideo) {
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
                        history.pushState({ popup: 'fullscreen-image' }, null, '');
                    }
                }
            }
        });
    });
    let panoramaCloseBtn = document.querySelector('.panorama-close-btn');
    if (!panoramaCloseBtn) {
        panoramaCloseBtn = document.createElement('span');
        panoramaCloseBtn.className = 'panorama-close-btn';
        panoramaCloseBtn.innerHTML = '×';
        const panoramaContainer = document.getElementById('panorama-viewer');
        if (panoramaContainer) {
            panoramaContainer.appendChild(panoramaCloseBtn);
        }
    }
    if (panoramaCloseListener) {
        panoramaCloseBtn.removeEventListener('click', panoramaCloseListener);
    }
    panoramaCloseListener = () => {
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
    panoramaCloseBtn.addEventListener('click', panoramaCloseListener, { once: true });

    let fullscreenCloseBtn = document.querySelector('.fullscreen-close-btn');
    if (!fullscreenCloseBtn) {
        fullscreenCloseBtn = document.createElement('span');
        fullscreenCloseBtn.className = 'fullscreen-close-btn';
        fullscreenCloseBtn.innerHTML = '×';
        const fullscreenContainer = document.getElementById('fullscreen-image');
        if (fullscreenContainer) {
            fullscreenContainer.appendChild(fullscreenCloseBtn);
        }
    }
    if (fullscreenCloseListener) {
        fullscreenCloseBtn.removeEventListener('click', fullscreenCloseListener);
    }
    fullscreenCloseListener = () => {
        const fullscreenContainer = document.getElementById('fullscreen-image');
        if (fullscreenContainer) {
            fullscreenContainer.classList.remove('visible');
            const fullscreenImg = fullscreenContainer.querySelector('img');
            const fullscreenVideo = fullscreenContainer.querySelector('video');
            if (fullscreenImg) fullscreenImg.src = '';
            if (fullscreenVideo) {
                fullscreenVideo.src = '';
                fullscreenVideo.pause();
            }
            history.replaceState({ popup: 'location-details' }, null, '');
        }
    };
    fullscreenCloseBtn.addEventListener('click', fullscreenCloseListener, { once: true });
}

function showOSMLocationDetails(building, placeName, faculty, photos, comments, campus, showGoButton = false) {
    const detailsPanel = document.getElementById('osm-location-details');
    if (!detailsPanel) return;
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
        : '<p>Imágenes y videos muy pronto.</p>';
    const commentsHTML = safeComments.map(comment => `<p>${comment}</p>`).join('');
    let innerHTML = `
        <span class="close-btn">×</span>
        <h2>Zona: ${placeName}</h2>
        <div class="faculty">${faculty}</div>
        <div class="photos">${photoHTML}</div>
        <div class="comments">${commentsHTML}</div>
    `;
    if (showGoButton) {
        innerHTML += `<button class="go-to-map">Ir al mapa</button>`;
    }
    detailsPanel.innerHTML = innerHTML;
    detailsPanel.classList.add('visible');
    history.pushState({ popup: 'osm-location-details' }, null, '');
    const closeBtn = detailsPanel.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            detailsPanel.classList.remove('visible');
            history.replaceState(null, null, '');
        }, { once: true });
    }
    if (showGoButton) {
        const goButton = detailsPanel.querySelector('.go-to-map');
        if (goButton) {
            goButton.addEventListener('click', () => {
                switchToCampus(campus);
                detailsPanel.classList.remove('visible');
                history.replaceState(null, null, '');
            }, { once: true });
        }
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
                    history.pushState({ popup: 'panorama-viewer' }, null, '');
                }
            } else {
                const fullscreenContainer = document.getElementById('fullscreen-image');
                if (fullscreenContainer) {
                    const fullscreenImg = fullscreenContainer.querySelector('img');
                    const fullscreenVideo = fullscreenContainer.querySelector('video');
                    if (fullscreenImg && fullscreenVideo) {
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
                        history.pushState({ popup: 'fullscreen-image' }, null, '');
                    }
                }
            }
        });
    });
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
    marker.on('click', () => {
        flyToLocation(lat, lng, building, title, campus, true);
        showLocationDetails(building, title, building, photos || [], comments || 'No hay comentarios disponibles.', campus);
    });
    marker.on('popupopen', () => {
        const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
        if (popupElement) {
            popupElement.style.cursor = 'pointer';
            popupElement.addEventListener('click', (e) => {
                e.stopPropagation();
                flyToLocation(lat, lng, building, title, campus, true);
                showLocationDetails(building, title, building, photos || [], comments || 'No hay comentarios disponibles.', campus);
            }, { once: true });
        }
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
        return null;
    }
}

function createStopMarker(lat, lng, name, routeIds, campus) {
    const stopIcon = L.icon({
        iconUrl: '../../../image/pines/bus-stop.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
    const routeNames = routeIds.map(id => truckRoutes.find(r => r.id === id)?.name || '').join(', ');
    const marker = L.marker([lat, lng], {
        icon: stopIcon,
        title: name
    }).bindPopup(`<b>Parada: ${name}</b><br><small>Rutas: ${routeNames}</small>`);
    marker.on('click', () => {
        flyToOSMLocation(lat, lng, campus);
        showOSMLocationDetails(
            name,
            name,
            'Parada de Camión',
            [], // Add photos if available
            `Parada de las rutas: ${routeNames}`,
            campus
        );
    });
    return marker;
}

function updateStopMarkers() {
    stopMarkers.forEach(marker => osmMap.removeLayer(marker));
    stopMarkers = [];
    const stopMap = new Map();
    selectedRoutes.forEach(routeId => {
        const route = truckRoutes.find(r => r.id === routeId);
        if (route && route.stops) {
            route.stops.forEach(stop => {
                const key = `${stop.coords[1]},${stop.coords[0]}`;
                if (!stopMap.has(key)) {
                    stopMap.set(key, { name: stop.name, coords: stop.coords, routeIds: [route.id], campus: 'Campus Principal' });
                } else {
                    const existing = stopMap.get(key);
                    if (!existing.routeIds.includes(route.id)) {
                        existing.routeIds.push(route.id);
                    }
                }
            });
        }
    });
    stopMap.forEach(stop => {
        const marker = createStopMarker(stop.coords[0], stop.coords[1], stop.name, stop.routeIds, stop.campus);
        marker.addTo(osmMap);
        stopMarkers.push(marker);
    });
}

function animateBusOnRoute(routeId) {
    const route = truckRoutes.find(r => r.id === routeId);
    if (!route || !route.isCircular) return;

    const busIcon = L.icon({
        iconUrl: '../../../image/pines/bus-icon.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const coordinates = route.path.coordinates.map(([lng, lat]) => [lat, lng]);
    const busMarker = L.marker(coordinates[0], { icon: busIcon }).addTo(osmMap);
    busAnimations[routeId] = {
        marker: busMarker,
        index: 0,
        stop: () => {
            osmMap.removeLayer(busMarker);
        }
    };

    function moveBus() {
        const anim = busAnimations[routeId];
        if (!anim) return;
        anim.index = (anim.index + 1) % coordinates.length;
        const nextPos = coordinates[anim.index];
        anim.marker.setLatLng(nextPos);
        setTimeout(moveBus, 1000); // Adjust speed (ms per step)
    }
    moveBus();
}

function toggleRouteDisplay(routeId) {
    const route = truckRoutes.find(r => r.id === routeId);
    if (!route) return;
    if (selectedRoutes.includes(routeId)) {
        selectedRoutes = selectedRoutes.filter(id => id !== routeId);
        if (routeLayers[routeId]) {
            osmMap.removeLayer(routeLayers[routeId]);
            delete routeLayers[routeId];
        }
        if (busAnimations[routeId]) {
            busAnimations[routeId].stop();
            delete busAnimations[routeId];
        }
    } else {
        selectedRoutes.push(routeId);
        routeLayers[routeId] = L.geoJSON(route.path, {
            style: { color: '#1100ffff', weight: 5, opacity: 0.7 }
        }).addTo(osmMap);
        if (route.isCircular) {
            animateBusOnRoute(routeId);
        }
    }
    if (selectedRoutes.length > 0) {
        const group = new L.FeatureGroup(Object.values(routeLayers));
        osmMap.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
    updateStopMarkers();
}

function clearRoutesAndStops() {
    Object.keys(routeLayers).forEach(key => {
        if (key !== 'navigation' && routeLayers[key]) {
            osmMap.removeLayer(routeLayers[key]);
        }
    });
    routeLayers = routeLayers['navigation'] ? { navigation: routeLayers['navigation'] } : {};
    selectedRoutes = [];
    stopMarkers.forEach(marker => osmMap.removeLayer(marker));
    stopMarkers = [];
    Object.keys(busAnimations).forEach(routeId => {
        busAnimations[routeId].stop();
        delete busAnimations[routeId];
    });
}

function toggleGeolocation() {
    const geolocationButton = document.querySelector('.leaflet-control-geolocation');
    if (!geolocationActive) {
        geolocationActive = true;
        firstGeoUpdate = true;
        geolocationButton.classList.add('active');
        if ("geolocation" in navigator) {
            geolocationWatchId = navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude, accuracy } = position.coords;
                if (!userMarker) {
                    userMarker = L.circleMarker([latitude, longitude], {
                        radius: 6,
                        fillColor: "#3388ff",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(osmMap);
                } else {
                    userMarker.setLatLng([latitude, longitude]);
                }
                if (!accuracyCircle) {
                    accuracyCircle = L.circle([latitude, longitude], {
                        radius: accuracy,
                        color: "#3388ff",
                        fillColor: "#3388ff",
                        fillOpacity: 0.2,
                        weight: 1
                    }).addTo(osmMap);
                } else {
                    accuracyCircle.setLatLng([latitude, longitude]);
                    accuracyCircle.setRadius(accuracy);
                }
                if (firstGeoUpdate) {
                    osmMap.flyTo([latitude, longitude], 18, {
                        duration: 1.5,
                        noMoveStart: true
                    });
                    firstGeoUpdate = false;
                }
                if (currentDestination) {
                    const url = `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${currentDestination.lng},${currentDestination.lat}?overview=full&geometries=geojson`;
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            if (routeLayers['navigation']) osmMap.removeLayer(routeLayers['navigation']);
                            if (data.routes && data.routes.length > 0) {
                                const geometry = data.routes[0].geometry;
                                routeLayers['navigation'] = L.geoJSON(geometry, {
                                    style: { color: '#3880ff', weight: 5, opacity: 0.7 }
                                }).addTo(osmMap);
                            }
                        })
                        .catch(error => {});
                }
            }, (error) => {
                alert('No se pudo obtener la ubicación. Asegúrate de permitir el acceso a la ubicación.');
                toggleGeolocation();
            }, { enableHighAccuracy: true });
        } else {
            alert('Geolocalización no soportada en este navegador.');
            toggleGeolocation();
        }
    } else {
        geolocationActive = false;
        geolocationButton.classList.remove('active');
        geolocationButton.style.backgroundColor = '';
        if (geolocationWatchId) {
            navigator.geolocation.clearWatch(geolocationWatchId);
            geolocationWatchId = null;
        }
        if (userMarker) {
            osmMap.removeLayer(userMarker);
            userMarker = null;
        }
        if (accuracyCircle) {
            osmMap.removeLayer(accuracyCircle);
            accuracyCircle = null;
        }
        if (routeLayers['navigation']) {
            osmMap.removeLayer(routeLayers['navigation']);
            delete routeLayers['navigation'];
        }
        currentDestination = null;
    }
}

function flyToOSMLocation(lat, lng, campus) {
    if (!osmMap) return;
    if (routeLayers['navigation']) {
        osmMap.removeLayer(routeLayers['navigation']);
        delete routeLayers['navigation'];
    }
    if (geolocationActive && userMarker) {
        currentDestination = { lat: lat, lng: lng, campus: campus };
        const currentPos = userMarker.getLatLng();
        const url = `https://router.project-osrm.org/route/v1/driving/${currentPos.lng},${currentPos.lat};${lng},${lat}?overview=full&geometries=geojson`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const geometry = data.routes[0].geometry;
                    routeLayers['navigation'] = L.geoJSON(geometry, {
                        style: { color: '#3880ff', weight: 5, opacity: 0.7 }
                    }).addTo(osmMap);
                    osmMap.flyToBounds(routeLayers['navigation'].getBounds(), {
                        padding: [50, 50],
                        duration: 1.5
                    });
                } else {
                    osmMap.flyTo([lat, lng], 18, { duration: 1.5 });
                }
            })
            .catch(error => {
                osmMap.flyTo([lat, lng], 18, { duration: 1.5 });
            });
    } else {
        if (currentDestination) currentDestination = null;
        osmMap.flyTo([lat, lng], 18, {
            duration: 1.5,
            noMoveStart: true
        });
    }
    const locationControls2 = document.getElementById('location-controls2');
    if (locationControls2) {
        locationControls2.classList.remove('visible');
    }
    const searchBox2 = document.getElementById('search-box2');
    if (searchBox2) {
        searchBox2.value = '';
    }
    const links = document.querySelectorAll('.osm-location-link');
    links.forEach(link => {
        link.style.display = 'block';
    });
}

function showNotAvailablePopup(campus) {
    let popup = document.getElementById('not-available-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'not-available-popup';
        document.body.appendChild(popup);
    }
    popup.innerHTML = `
        <span id="close-not-available">×</span>
        <h3>Lugar No Disponible</h3>
        <p>Por el momento, el ${campus} no está disponible. ¿Desea viajar al Campus Principal?</p>
        <button id="accept-btn">Aceptar</button>
    `;
    popup.style.display = 'block';
    const acceptBtn = document.getElementById('accept-btn');
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
        document.body.appendChild(popup);
    }
    popup.innerHTML = `
        <span id="close-selection">×</span>
        <h3>¿Quieres ir a algún lugar?</h3>
        <div>
            <button id="campus1-btn">Campus Principal</button>
            <button id="campus2-btn" disabled>Campus 2</button>
            <button id="campus3-btn" disabled>Campus 3</button>
            <button id="sabancuy-btn" disabled>Campus Sabancuy</button>
            <button id="jardin-btn" disabled>Jardin Botanico</button>
            <button id="ccu-btn" disabled>Centro Cultural Universitario</button>
            <button id="museo-btn" disabled>Museo Guanal</button>
        </div>
        <div id="action-buttons" style="display: none;">
            <button id="accept-selection-btn">Aceptar</button>
            <button id="cancel-btn">Cancelar</button>
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
        osmMap.setZoom(osmMap.getZoom() - 3);
        popup.style.display = 'none';
    });
    closeBtn.addEventListener('click', () => {
        osmMap.setZoom(osmMap.getZoom() - 3);
        popup.style.display = 'none';
    });
}

function updateInterestPoints(campus) {
    interestMarkers[campus].forEach(marker => map.removeLayer(marker));
    interestMarkers[campus] = [];
    if (interestPointsActive[campus] && interestPoints[campus]) {
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
        updateInterestPoints(campus);
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

function updateLocationControls() {
    const sections = document.querySelectorAll('.building-section');
    sections.forEach(section => {
        if (section.dataset.campus === currentCampus) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

const campusColors = {
    'Campus Principal': 'yellow',
    'Campus 2': 'yellow',
    'Campus 3': 'yellow',
    'Jardin Botanico': 'green',
    'Centro Cultural Universitario': 'orange',
    'Museo Guanal': 'gris',
    'Campus Sabancuy': 'yellow'
};

function updateOSMLocationControls() {
    const locationControls2 = document.getElementById('location-controls2');
    if (!locationControls2) return;
    let controlsHTML = `
        <div id="search-container2">
            <input type="text" 
                id="search-box2" 
                placeholder="Buscar campus..."
                autocomplete="off">
        </div>
        <div class="campus-section">
            <h2>Lugares</h2>`;
    Object.keys(osmMap.campusMarkers).forEach(campus => {
        const marker = osmMap.campusMarkers[campus];
        const [lat, lng] = [marker.getLatLng().lat, marker.getLatLng().lng];
        const colorClass = `marker-${campusColors[campus]}`;
        controlsHTML += `
            <a href="#" class="osm-location-link ${colorClass}" 
               onclick="flyToOSMLocation(${lat}, ${lng}, '${campus}')"
               data-search="${campus.toLowerCase()}">
                ${campus}
            </a>`;
    });
    controlsHTML += '</div>';
    locationControls2.innerHTML = controlsHTML;
    const searchBox2 = document.getElementById('search-box2');
    if (searchBox2) {
        searchBox2.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const links = document.querySelectorAll('.osm-location-link');
            links.forEach(link => {
                const searchableText = link.dataset.search;
                const match = searchableText.includes(searchTerm);
                link.style.display = match ? 'block' : 'none';
            });
        });
    }
}

function showRoutesMenu() {
    if (!routesMenu) {
        routesMenu = document.createElement('div');
        routesMenu.id = 'routes-menu';
        document.body.appendChild(routesMenu);
    }
    routesActive = !routesActive;
    const routesButton = document.querySelector('.leaflet-control-routes');
    if (routesActive) {
        routesButton.classList.add('active');
        updateRoutesMenu();
        routesMenu.style.display = 'block';
        history.pushState({ menu: 'routes-menu' }, null, '');
        selectedRoutes.forEach(routeId => {
            const route = truckRoutes.find(r => r.id === routeId);
            if (route && route.isCircular && !busAnimations[routeId]) {
                animateBusOnRoute(routeId);
            }
        });
    } else {
        routesButton.classList.remove('active');
        routesMenu.style.display = 'none';
        history.replaceState(null, null, '');
        clearRoutesAndStops();
    }
}

function updateRoutesMenu() {
    if (!routesMenu) return;
    let menuHTML = `
        <span id="close-routes-menu">×</span>
        <h3>Rutas de Camiones</h3>
        <div id="routes-list">`;
    truckRoutes.forEach(route => {
        const isSelected = selectedRoutes.includes(route.id);
        menuHTML += `
            <div class="route-item" data-route-id="${route.id}">
                <span class="route-checkmark" style="display: ${isSelected ? 'inline' : 'none'};">✅</span>
                <span class="route-name">${route.name}</span>
            </div>`;
    });
    menuHTML += '</div>';
    routesMenu.innerHTML = menuHTML;
    const closeBtn = document.getElementById('close-routes-menu');
    closeBtn.addEventListener('click', () => {
        routesMenu.style.display = 'none';
        routesActive = false;
        const routesButton = document.querySelector('.leaflet-control-routes');
        if (routesButton) routesButton.classList.remove('active');
        clearRoutesAndStops();
        history.replaceState(null, null, '');
    }, { once: true });
    document.querySelectorAll('.route-item').forEach(item => {
        item.addEventListener('click', () => {
            const routeId = item.dataset.routeId;
            toggleRouteDisplay(routeId);
            updateRoutesMenu();
            updateStopMarkers();
        });
    });
}

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
        flyToLocation(lat, lng, building, isShared ? building : title, campus);
        showLocationDetails(
            building,
            isShared ? building : title,
            faculty,
            photos || [],
            isShared ? 'Múltiples edificios: ' + locations[campus][building].places.map(p => p.name).join(', ') : (comments || 'No hay comentarios disponibles.'),
            campus
        );
    });
    marker.on('popupopen', () => {
        const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
        if (popupElement) {
            popupElement.style.cursor = 'pointer';
            popupElement.addEventListener('click', (e) => {
                e.stopPropagation();
                flyToLocation(lat, lng, building, isShared ? building : title, campus);
                showLocationDetails(
                    building,
                    isShared ? building : title,
                    faculty,
                    photos || [],
                    isShared ? 'Múltiples edificios: ' + locations[campus][building].places.map(p => p.name).join(', ') : (comments || 'No hay comentarios disponibles.'),
                    campus
                );
            }, { once: true });
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

document.addEventListener('DOMContentLoaded', function() {
    const mapElement = document.getElementById('map');
    const osmMapElement = document.getElementById('osm-map');
    const pantallaBienvenida = document.getElementById('pantallaBienvenida');
    const guiaContainer = document.getElementById('guia-container');
    const guiaContainer2 = document.getElementById('guia-container2');
    if (!mapElement) return;
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1.5,
        maxZoom: 4,
        maxBoundsViscosity: 1.0,
        zoomDelta: 0.3,
        zoomSnap: 0,
        fadeAnimation: true,
        zoomAnimationThreshold: 2
    });
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
                    const coords = feature.geometry.coordinates[0][0];
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
        fetch(campuses[campus].geojson)
            .then(response => response.json())
            .then(data => {
                detailedLayers[campus].addData(data);
            })
            .catch(error => {});
    });
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
    if (osmMapElement) {
        osmMap = L.map('osm-map', {
            crs: L.CRS.EPSG3857,
            minZoom: 10.5,
            maxZoom: 20,
            zoomDelta: 0.3,
            zoomSnap: 0
        }).setView([18.646626696426264, -91.81813061518552], 18);
        osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 21,
            maxNativeZoom: 19
        });
        const campusIcons = {
            'Campus Principal': '../../../image/locations/CP/pines/pin-cp.svg',
            'Campus 2': '../../../image/locations/CP/pines/pin-cp.svg',
            'Campus 3': '../../../image/locations/CP/pines/pin-cp.svg',
            'Campus Sabancuy': '../../../image/locations/CP/pines/pin-cp.svg',
            'Jardin Botanico': '../../../image/locations/CP/pines/pin-jb.svg',
            'Centro Cultural Universitario': '../../../image/locations/CP/pines/pin-ccu.svg',
            'Museo Guanal': '../../../image/locations/CP/pines/pin-mg.svg'
        };
        osmMap.campusMarkers = {
            'Campus Principal': L.marker([18.646626696426264, -91.81813061518552], {
                title: 'UNACAR',
                icon: L.icon({
                    iconUrl: campusIcons['Campus Principal'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
            'Campus 2': L.marker([18.653975735270432, -91.81062427253869], {
                title: 'UNACAR Preparatoria',
                icon: L.icon({
                    iconUrl: campusIcons['Campus 2'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
            'Campus 3': L.marker([18.65757697187412, -91.76605622956039], {
                title: 'UNACAR',
                icon: L.icon({
                    iconUrl: campusIcons['Campus 3'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
            'Campus Sabancuy': L.marker([18.9694735975256, -91.18848920523213], {
                title: 'UNACAR',
                icon: L.icon({
                    iconUrl: campusIcons['Campus Sabancuy'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
            'Jardin Botanico': L.marker([18.636835943623314, -91.779242388015359], {
                title: 'UNACAR',
                icon: L.icon({
                    iconUrl: campusIcons['Jardin Botanico'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
            'Centro Cultural Universitario': L.marker([18.638626189564732, -91.83462499633609], {
                title: 'UNACAR',
                icon: L.icon({
                    iconUrl: campusIcons['Centro Cultural Universitario'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
            'Museo Guanal': L.marker([18.633442367616624, -91.83217897408228], {
                title: 'UNACAR',
                icon: L.icon({
                    iconUrl: campusIcons['Museo Guanal'],
                    iconSize: [64, 64],
                    iconAnchor: [32, 64]
                })
            }),
        };
        Object.entries(osmMap.campusMarkers).forEach(([campus, marker]) => {
            marker.addTo(osmMap);
            marker.on('click', () => {
                flyToOSMLocation(marker.getLatLng().lat, marker.getLatLng().lng, campus);
                showOSMLocationDetails(
                    campus,
                    campus,
                    'UNACAR',
                    campuses[campus].photos || [],
                    campuses[campus].description || 'No hay descripción disponible.',
                    campus,
                    true
                );
            });
        });
        osmMapElement.style.display = 'none';
    }
    const thresholdZoom = 0.5;
    const intermediateZoomThreshold = -0.5;
    const minZoom = -1.5;
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
        const guiaContainer = document.getElementById('guia-container');
        const guiaContainer2 = document.getElementById('guia-container2');
        const hasFloorOverlay = !!currentFloorOverlay;
        if (currentZoom === minZoom && osmMap && osmMapElement && !fromOSM) {
            if (!isOSMVisible) {
                isOSMVisible = true;
                mapElement.style.display = 'none';
                osmMapElement.style.display = 'block';
                map.eachLayer(layer => map.removeLayer(layer));
                osmMap.addLayer(osmLayer);
                Object.values(osmMap.campusMarkers).forEach(marker => {
                    osmMap.addLayer(marker);
                });
                ignoreNextZoomEnd = true;
                osmMap.setView(osmMap.campusMarkers[currentCampus].getLatLng(), 18);
                osmMap.invalidateSize();
                if (guiaContainer) guiaContainer.style.display = 'none';
                if (guiaContainer2) {
                    guiaContainer2.style.display = 'block';
                    updateOSMLocationControls();
                }
                if (currentFloorOverlay) {
                    map.removeLayer(currentFloorOverlay);
                    currentFloorOverlay = null;
                }
                if (levelMenu) {
                    document.body.removeChild(levelMenu);
                    levelMenu = null;
                }
                if (buildingMarker && buildingMarker._icon) {
                    buildingMarker._icon.style.display = '';
                }
                buildingMarker = null;
            }
        } else if ((currentZoom > minZoom || fromOSM) && isOSMVisible) {
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
                if (guiaContainer) guiaContainer.style.display = 'block';
                if (guiaContainer2) guiaContainer2.style.display = 'none';
                return;
            }
            if (currentZoom >= thresholdZoom) {
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(detailedBaseLayers[currentCampus]);
                map.addLayer(detailedLayers[currentCampus]);
                if (!currentFloorOverlay) {
                    map.addLayer(markersLayers[currentCampus]);
                }
            } else if (currentZoom > intermediateZoomThreshold) {
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(baseLayers[currentCampus]);
                if (!currentFloorOverlay) {
                    map.addLayer(markersLayers[currentCampus]);
                }
            } else {
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(intermediateBaseLayers[currentCampus]);
                if (!currentFloorOverlay) {
                    map.addLayer(markersLayers[currentCampus]);
                }
            }
            if (guiaContainer) guiaContainer.style.display = 'block';
            if (guiaContainer2) guiaContainer2.style.display = 'none';
            // Close routes menu when switching to vectorized map
            if (routesMenu) {
                routesMenu.style.display = 'none';
                routesActive = false;
                const routesButton = document.querySelector('.leaflet-control-routes');
                if (routesButton) routesButton.classList.remove('active');
                clearRoutesAndStops();
                history.replaceState(null, null, '');
            }
        } else if (!isOSMVisible && !fromOSM) {
            if (currentZoom >= thresholdZoom) {
                mapElement.style.display = 'block';
                if (osmMapElement) osmMapElement.style.display = 'none';
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(detailedBaseLayers[currentCampus]);
                map.addLayer(detailedLayers[currentCampus]);
                if (!currentFloorOverlay) {
                    map.addLayer(markersLayers[currentCampus]);
                }
            } else if (currentZoom > intermediateZoomThreshold) {
                mapElement.style.display = 'block';
                if (osmMapElement) osmMapElement.style.display = 'none';
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(baseLayers[currentCampus]);
                if (!currentFloorOverlay) {
                    map.addLayer(markersLayers[currentCampus]);
                }
            } else {
                mapElement.style.display = 'block';
                if (osmMapElement) osmMapElement.style.display = 'none';
                map.eachLayer(layer => map.removeLayer(layer));
                map.addLayer(intermediateBaseLayers[currentCampus]);
                if (!currentFloorOverlay) {
                    map.addLayer(markersLayers[currentCampus]);
                }
            }
            if (guiaContainer) guiaContainer.style.display = 'block';
            if (guiaContainer2) guiaContainer2.style.display = 'none';
        }
        if (hasFloorOverlay && currentFloorOverlay) {
            currentFloorOverlay.addTo(map);
        }
        if (buildingMarker && buildingMarker._icon && !currentFloorOverlay) {
            buildingMarker._icon.style.display = '';
            buildingMarker = null;
        }
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
                if (osmZoom >= 20) {
                    showCampusSelectionPopup();
                }
            }
        });
    }
    L.Control.CustomZoomVector = L.Control.Zoom.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
            const zoomDelta = 0.3;
            const interest = L.DomUtil.create('a', 'leaflet-control-interest', container);
            interest.innerHTML = '<i class="fas fa-person"></i>';
            interest.href = '#';
            interest.title = 'Ver Puntos de Interés';
            L.DomEvent.on(interest, 'click', function(e) {
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
    map.addControl(new L.Control.CustomZoomVector({ position: 'topleft' }));
    if (osmMap) {
        L.Control.CustomZoomOSM = L.Control.Zoom.extend({
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
                const zoomDelta = 0.3;
                const routes = L.DomUtil.create('a', 'leaflet-control-routes', container);
                routes.innerHTML = '<i class="fas fa-bus"></i>';
                routes.href = '#';
                routes.title = 'Ver Rutas de Camiones';
                L.DomEvent.on(routes, 'click', function(e) {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    showRoutesMenu();
                });
                const geolocation = L.DomUtil.create('a', 'leaflet-control-geolocation', container);
                geolocation.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                geolocation.href = '#';
                geolocation.title = 'Activar/Desactivar Geolocalización';
                L.DomEvent.on(geolocation, 'click', function(e) {
                    L.DomEvent.preventDefault(e);
                    L.DomEvent.stopPropagation(e);
                    toggleGeolocation();
                });
                this._zoomInButton = this._createButton(
                    '+', '+ Zoom', 'leaflet-control-zoom-in', container,
                    function(e) {
                        L.DomEvent.preventDefault(e);
                        L.DomEvent.stopPropagation(e);
                        osmMap.setZoom(osmMap.getZoom() + zoomDelta);
                    }
                );
                this._zoomOutButton = this._createButton(
                    '−', '- Zoom', 'leaflet-control-zoom-out', container,
                    function(e) {
                        L.DomEvent.preventDefault(e);
                        L.DomEvent.stopPropagation(e);
                        osmMap.setZoom(osmMap.getZoom() - zoomDelta);
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
        osmMap.removeControl(osmMap.zoomControl);
        osmMap.addControl(new L.Control.CustomZoomOSM({ position: 'topleft' }));
    }
    const infoIcon = document.querySelector('.palpitante3 .fa-magnifying-glass');
    const locationControls = document.getElementById('location-controls');
    const infoIcon2 = document.querySelector('.palpitante5 .fa-magnifying-glass');
    const locationControls2 = document.getElementById('location-controls2');
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
                updateLocationControls();
            }
        });
    }
    if (infoIcon2 && locationControls2) {
        infoIcon2.addEventListener('click', (e) => {
            e.stopPropagation();
            locationControls2.classList.toggle('visible');
            if (locationControls2.classList.contains('visible')) {
                const searchBox2 = document.getElementById('search-box2');
                if (searchBox2) searchBox2.value = '';
                const links = document.querySelectorAll('.osm-location-link');
                links.forEach(link => {
                    link.style.display = 'block';
                });
                updateOSMLocationControls();
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
        if (locationControls2 && !locationControls2.contains(e.target) && infoIcon2 && !infoIcon2.contains(e.target)) {
            locationControls2.classList.remove('visible');
            const searchBox2 = document.getElementById('search-box2');
            if (searchBox2) searchBox2.value = '';
            const links = document.querySelectorAll('.osm-location-link');
            links.forEach(link => {
                link.style.display = 'block';
            });
        }
    });
    const imageUrls = [
        ...Object.keys(locations).flatMap(campus =>
            Object.values(locations[campus]).map(data => data.icon ? data.icon.iconUrl : '')
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
        '../image/pines/pin-usuario.svg',
        '../image/pines/bus-stop.svg',
        '../image/pines/bus-icon.svg' // Added bus icon
    ].filter(url => url);
    preloadImages(imageUrls);
    let controlsHTML = `
        <div id="search-container">
            <input type="text" 
                id="search-box" 
                placeholder="Buscar aula o edificio..."
                autocomplete="off">
        </div>`;
    for (const campus of Object.keys(locations)) {
        controlsHTML += `<div class="building-section" data-campus="${campus}"><h2>${campus}</h2>`;
        for (const [building, data] of Object.entries(locations[campus])) {
            controlsHTML += `<h3>${building}</h3>`;
            if (data.usarIconoGrupal) {
                const coords = data.places.reduce(([sumLat, sumLng], place) => {
                    return [sumLat + place.coords[0], sumLng + place.coords[1]];
                }, [0, 0]);
                const avgCoords = [coords[0]/data.places.length, coords[1]/data.places.length];
                createMarker(avgCoords[0], avgCoords[0], avgCoords[1], building, building, data.icon, building, [], '', campus, true);
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
        updateLocationControls();
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
    window.flyToLocation = flyToLocation;
    window.flyToOSMLocation = flyToOSMLocation;
});