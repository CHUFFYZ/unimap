import {
    osmMap, userMarker, accuracyCircle, routeLayers, stopMarkers, currentDestination,
    geolocationActive, firstGeoUpdate, selectedRoutes, routesMenu, routesActive,
    setUserMarker, setAccuracyCircle, setGeolocationActive, setFirstGeoUpdate,
    setCurrentDestination, setGeolocationWatchId
} from './map-constants.js';
import { createStopMarker } from './map-markers.js';
import { clearRoutesAndStops } from './map-ui.js';

export function toggleGeolocation() {
    const geolocationButton = document.querySelector('.leaflet-control-geolocation');
    if (!geolocationActive) {
        setGeolocationActive(true);
        setFirstGeoUpdate(true);
        geolocationButton.classList.add('active');
        if ("geolocation" in navigator) {
            setGeolocationWatchId(navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude, accuracy } = position.coords;
                if (!userMarker) {
                    setUserMarker(L.circleMarker([latitude, longitude], {
                        radius: 6,
                        fillColor: "#3388ff",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(osmMap));
                } else {
                    userMarker.setLatLng([latitude, longitude]);
                }
                if (!accuracyCircle) {
                    setAccuracyCircle(L.circle([latitude, longitude], {
                        radius: accuracy,
                        color: "#3388ff",
                        fillColor: "#3388ff",
                        fillOpacity: 0.2,
                        weight: 1
                    }).addTo(osmMap));
                } else {
                    accuracyCircle.setLatLng([latitude, longitude]);
                    accuracyCircle.setRadius(accuracy);
                }
                if (firstGeoUpdate) {
                    osmMap.flyTo([latitude, longitude], 18, {
                        duration: 1.5,
                        noMoveStart: true
                    });
                    setFirstGeoUpdate(false);
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
            }, { enableHighAccuracy: true }));
        } else {
            alert('Geolocalización no soportada en este navegador.');
            toggleGeolocation();
        }
    } else {
        setGeolocationActive(false);
        geolocationButton.classList.remove('active');
        geolocationButton.style.backgroundColor = '';
        if (geolocationWatchId) {
            navigator.geolocation.clearWatch(geolocationWatchId);
            setGeolocationWatchId(null);
        }
        if (userMarker) {
            osmMap.removeLayer(userMarker);
            setUserMarker(null);
        }
        if (accuracyCircle) {
            osmMap.removeLayer(accuracyCircle);
            setAccuracyCircle(null);
        }
        if (routeLayers['navigation']) {
            osmMap.removeLayer(routeLayers['navigation']);
            delete routeLayers['navigation'];
        }
        setCurrentDestination(null);
    }
}

export function flyToOSMLocation(lat, lng, campus) {
    if (!osmMap) return;
    if (routeLayers['navigation']) {
        osmMap.removeLayer(routeLayers['navigation']);
        delete routeLayers['navigation'];
    }
    if (geolocationActive && userMarker) {
        setCurrentDestination({ lat: lat, lng: lng, campus: campus });
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
        if (currentDestination) setCurrentDestination(null);
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

export function showRoutesMenu() {
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
    } else {
        routesButton.classList.remove('active');
        routesMenu.style.display = 'none';
        history.replaceState(null, null, '');
        clearRoutesAndStops();
    }
}

export function updateRoutesMenu() {
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

export function toggleRouteDisplay(routeId) {
    const route = truckRoutes.find(r => r.id === routeId);
    if (!route) return;
    if (selectedRoutes.includes(routeId)) {
        selectedRoutes = selectedRoutes.filter(id => id !== routeId);
        if (routeLayers[routeId]) {
            osmMap.removeLayer(routeLayers[routeId]);
            delete routeLayers[routeId];
        }
    } else {
        selectedRoutes.push(routeId);
        routeLayers[routeId] = L.geoJSON(route.path, {
            style: { color: '#ff4500', weight: 5, opacity: 0.7 }
        }).addTo(osmMap);
    }
    if (selectedRoutes.length > 0) {
        const group = new L.FeatureGroup(Object.values(routeLayers));
        osmMap.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
}

export function updateStopMarkers() {
    stopMarkers.forEach(marker => osmMap.removeLayer(marker));
    stopMarkers = [];
    const stopMap = new Map();
    selectedRoutes.forEach(routeId => {
        const route = truckRoutes.find(r => r.id === routeId);
        if (route && route.stops) {
            route.stops.forEach(stop => {
                const key = `${stop.coords[1]},${stop.coords[0]}`;
                if (!stopMap.has(key)) {
                    stopMap.set(key, { name: stop.name, coords: stop.coords, routeIds: [route.id] });
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
        const marker = createStopMarker(stop.coords[0], stop.coords[1], stop.name, stop.routeIds);
        marker.addTo(osmMap);
        stopMarkers.push(marker);
    });
}