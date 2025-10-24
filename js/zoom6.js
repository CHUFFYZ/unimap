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
    const initialFloorSvgUrl = `image/locations/CP/galeria/${buildingCode}/p1.svg`;
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
            const floorSvgUrl = `image/locations/CP/galeria/${buildingCode}/p${i}.svg`;
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

function showLocationDetails(building, placeName, faculty, photos, comments, campus, showGoButton = false, isInterestPoint = false) {
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
    const buildingData = isInterestPoint ? null : locations[campus][building]?.places.find(p => p.name === placeName);
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
    const newPanoramaCloseBtn = panoramaCloseBtn.cloneNode(true);
    panoramaCloseBtn.parentNode.replaceChild(newPanoramaCloseBtn, panoramaCloseBtn);
    panoramaCloseBtn = newPanoramaCloseBtn;
    panoramaCloseBtn.addEventListener('click', () => {
        const panoramaContainer = document.getElementById('panorama-viewer');
        if (panoramaContainer) {
            panoramaContainer.classList.remove('visible');
            const panoramaDiv = document.getElementById('panorama');
            if (panoramaDiv) {
                panoramaDiv.innerHTML = '';
            }
            history.replaceState({ popup: 'location-details' }, null, '');
        }
    });

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
    const newFullscreenCloseBtn = fullscreenCloseBtn.cloneNode(true);
    fullscreenCloseBtn.parentNode.replaceChild(newFullscreenCloseBtn, fullscreenCloseBtn);
    fullscreenCloseBtn = newFullscreenCloseBtn;
    fullscreenCloseBtn.addEventListener('click', () => {
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
    });
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
        <div class="derechos">Imagenes obtenidas de Google Maps</div>
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
    const newPanoramaCloseBtn = panoramaCloseBtn.cloneNode(true);
    panoramaCloseBtn.parentNode.replaceChild(newPanoramaCloseBtn, panoramaCloseBtn);
    panoramaCloseBtn = newPanoramaCloseBtn;
    panoramaCloseBtn.addEventListener('click', () => {
        const panoramaContainer = document.getElementById('panorama-viewer');
        if (panoramaContainer) {
            panoramaContainer.classList.remove('visible');
            const panoramaDiv = document.getElementById('panorama');
            if (panoramaDiv) {
                panoramaDiv.innerHTML = '';
            }
            history.replaceState({ popup: 'osm-location-details' }, null, '');
        }
    });

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
    const newFullscreenCloseBtn = fullscreenCloseBtn.cloneNode(true);
    fullscreenCloseBtn.parentNode.replaceChild(newFullscreenCloseBtn, fullscreenCloseBtn);
    fullscreenCloseBtn = newFullscreenCloseBtn;
    fullscreenCloseBtn.addEventListener('click', () => {
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
            history.replaceState({ popup: 'osm-location-details' }, null, '');
        }
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
        showLocationDetails(building, title, building, photos || [], comments || 'No hay comentarios disponibles.', campus, false, true);
    });
    marker.on('popupopen', () => {
        const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
        if (popupElement) {
            popupElement.style.cursor = 'pointer';
            popupElement.addEventListener('click', (e) => {
                e.stopPropagation();
                flyToLocation(lat, lng, building, title, campus, true);
                showLocationDetails(building, title, building, photos || [], comments || 'No hay comentarios disponibles.', campus, false, true);
            }, { once: true });
        }
    });
    return marker;
}

function createInterestPinMarker(lat, lng, title, building, campus) {
    const pinUrl = 'image/locations/CP/pines/pin-usuario.svg';
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

function createStopMarker(lat, lng, name, routeIds, campus, photos, comments) {
    const stopIcon = L.icon({
        iconUrl: 'image/locations/CP/galeria/BUS/bus-stop.png',
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
            photos || [],
            comments || `Parada de las rutas: ${routeNames}`,
            campus
        );
    });
    marker.on('popupopen', () => {
        const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
        if (popupElement) {
            popupElement.style.cursor = 'pointer';
            popupElement.addEventListener('click', (e) => {
                e.stopPropagation();
                flyToOSMLocation(lat, lng, campus);
                showOSMLocationDetails(
                    name,
                    name,
                    'Parada de Camión',
                    photos || [],
                    comments || `Parada de las rutas: ${routeNames}`,
                    campus
                );
            }, { once: true });
        }
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
                    stopMap.set(key, {
                        name: stop.name,
                        coords: stop.coords,
                        routeIds: [route.id],
                        campus: 'Campus Principal',
                        photos: stop.photos || [],
                        comments: stop.comments || ''
                    });
                } else {
                    const existing = stopMap.get(key);
                    if (!existing.routeIds.includes(route.id)) {
                        existing.routeIds.push(route.id);
                    }
                    // Merge photos and comments if multiple routes share the stop
                    if (stop.photos) {
                        existing.photos = [...new Set([...existing.photos, ...stop.photos])];
                    }
                    if (stop.comments) {
                        const stopComments = Array.isArray(stop.comments) ? stop.comments : [stop.comments];
                        existing.comments = Array.isArray(existing.comments)
                            ? [...new Set([...existing.comments, ...stopComments])]
                            : stopComments;
                    }
                }
            });
        }
    });
    stopMap.forEach(stop => {
        const marker = createStopMarker(
            stop.coords[0],
            stop.coords[1],
            stop.name,
            stop.routeIds,
            stop.campus,
            stop.photos,
            stop.comments
        );
        marker.addTo(osmMap);
        stopMarkers.push(marker);
    });
}

function animateBusOnRoute(routeId) {
    const route = truckRoutes.find(r => r.id === routeId);
    if (!route || !route.isCircular) return;

    const busIcon = L.icon({
        iconUrl: 'image/locations/CP/galeria/BUS/bus-icon.png',
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
        setTimeout(moveBus, 1000);
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
    const closeBtn = document.getElementById('close-not-available');
    closeBtn.addEventListener('click', () => {
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
    try {
        const marker = L.marker([lat, lng], {
            title: title,
            icon: customIcon
        }).bindPopup(`<b>${isShared ? 'Edificio' : 'Zona'}: ${title}</b><br><small>${faculty}</small>`);
        marker.on('click', () => {
            flyToLocation(lat, lng, building, title, campus);
            showLocationDetails(building, title, faculty, photos || [], comments || 'No hay comentarios disponibles.', campus);
        });
        marker.on('popupopen', () => {
            const popupElement = marker._popup._container.querySelector('.leaflet-popup-content-wrapper');
            if (popupElement) {
                popupElement.style.cursor = 'pointer';
                popupElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    flyToLocation(lat, lng, building, title, campus);
                    showLocationDetails(building, title, faculty, photos || [], comments || 'No hay comentarios disponibles.', campus);
                }, { once: true });
            }
        });
        if (!markers[campus][building]) {
            markers[campus][building] = [];
        }
        markers[campus][building].push(marker);
        marker.addTo(markersLayers[campus]);
        return marker;
    } catch (error) {
        return null;
    }
}