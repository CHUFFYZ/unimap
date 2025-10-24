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
let busAnimations = {};
let fullscreenCloseListener = null;
let panoramaCloseListener = null;
let geolocationWatchId = null;
let currentFloorOverlay = null;
let levelMenu = null;
let buildingMarker = null;

const campusColors = {
    'Campus Principal': 'yellow',
    'Campus 2': 'yellow',
    'Campus 3': 'yellow',
    'Jardin Botanico': 'green',
    'Centro Cultural Universitario': 'orange',
    'Museo Guanal': 'gris',
    'Campus Sabancuy': 'yellow'
};

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
        '../../../image/locations/CP/pines/pin-usuario.svg',
        '../../../image/locations/CP/galeria/BUS/bus-stop.svg',
        '../../../image/locations/CP/galeria/BUS/bus-icon.png'
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
                createMarker(avgCoords[0], avgCoords[1], building, data.icon, building, [], '', campus, true);
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