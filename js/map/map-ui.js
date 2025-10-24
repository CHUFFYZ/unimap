import {
    map, osmMap, osmLayer, baseLayers, intermediateBaseLayers, detailedBaseLayers,
    detailedLayers, markersLayers, markers, interestPointsActive, currentPinMarker,
    currentCampus, isFlying, routesMenu, routesActive, currentFloorOverlay,
    levelMenu, buildingMarker, setCurrentCampus, setIsFlying, setCurrentPinMarker,
    setCurrentFloorOverlay, setLevelMenu, setBuildingMarker
} from './map-constants.js';
import { startLevelExploration } from './map-levels.js';
import { createInterestPinMarker } from './map-markers.js';
import { flyToOSMLocation } from './map-navigation.js';
import { updateInterestPoints, updateLocationControls, updateOSMLocationControls } from './map-markers.js';

export function switchToCampus(campus) {
    setCurrentCampus(campus);
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
        setCurrentFloorOverlay(null);
    }
    if (levelMenu) {
        document.body.removeChild(levelMenu);
        setLevelMenu(null);
    }
    if (routesMenu) {
        routesMenu.style.display = 'none';
        routesActive = false;
        const routesButton = document.querySelector('.leaflet-control-routes');
        if (routesButton) routesButton.classList.remove('active');
        clearRoutesAndStops();
    }
}

export function flyToLocation(lat, lng, building, placeName, campus, isInterestPoint = false) {
    if (!map) return;
    if (isFlying) return;
    setIsFlying(true);
    map.closePopup();
    if (currentPinMarker) {
        map.removeLayer(currentPinMarker);
        setCurrentPinMarker(null);
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
                setCurrentPinMarker(pinMarker);
                pinMarker.openPopup();
                if (pinMarker._icon) pinMarker._icon.classList.add('marker-animated');
            }
        } else {
            const markerGroup = markers[campus][building];
            if (!markerGroup) {
                setIsFlying(false);
                return;
            }
            const targetMarker = markerGroup.find(m => {
                const latlng = m.getLatLng();
                return Math.abs(latlng.lat - lat) < 0.0001 && Math.abs(latlng.lng - lng) < 0.0001;
            });
            if (!targetMarker) {
                setIsFlying(false);
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
        setIsFlying(false);
    });
}

export function showLocationDetails(building, placeName, faculty, photos, comments, campus, showGoButton = false) {
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
                setCurrentPinMarker(null);
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
}

export function showOSMLocationDetails(building, placeName, faculty, photos, comments, campus, showGoButton = false) {
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
    const closeBtn = document.querySelector('.close-btn');
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

export function showNotAvailablePopup(campus) {
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

export function showCampusSelectionPopup() {
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

export function clearRoutesAndStops() {
    Object.keys(routeLayers).forEach(key => {
        if (key !== 'navigation' && routeLayers[key]) {
            osmMap.removeLayer(routeLayers[key]);
        }
    });
    routeLayers = routeLayers['navigation'] ? { navigation: routeLayers['navigation'] } : {};
    selectedRoutes = [];
    stopMarkers.forEach(marker => osmMap.removeLayer(marker));
    stopMarkers = [];
}

export function handleMapTransition(currentZoom, fromOSM = false) {
    const guiaContainer = document.getElementById('guia-container');
    const guiaContainer2 = document.getElementById('guia-container2');
    const mapElement = document.getElementById('map');
    const osmMapElement = document.getElementById('osm-map');
    const thresholdZoom = 0.5;
    const intermediateZoomThreshold = -0.5;
    const minZoom = -1.5;
    let isOSMVisible = false;

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
                setCurrentFloorOverlay(null);
            }
            if (levelMenu) {
                document.body.removeChild(levelMenu);
                setLevelMenu(null);
            }
            if (buildingMarker && buildingMarker._icon) {
                buildingMarker._icon.style.display = '';
            }
            setBuildingMarker(null);
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
                setCurrentCampus(visibleCampus);
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
    if (currentFloorOverlay) {
        currentFloorOverlay.addTo(map);
    }
    if (buildingMarker && buildingMarker._icon && !currentFloorOverlay) {
        buildingMarker._icon.style.display = '';
        setBuildingMarker(null);
    }
    updateInterestPoints(currentCampus);
}

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