import {
    map, markers, interestMarkers, interestPointsActive, currentPinMarker, currentCampus,
    setCurrentPinMarker
} from './map-constants.js';
import { flyToLocation, showLocationDetails } from './map-ui.js';

export function createInterestPointMarker(lat, lng, title, building, photos, comments, campus) {
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

export function createInterestPinMarker(lat, lng, title, building, campus) {
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
            setCurrentPinMarker(null);
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

export function createStopMarker(lat, lng, name, routeIds) {
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
    return marker;
}

export function createMarker(lat, lng, title, building, iconConfig, faculty, photos, comments, campus, isShared = false) {
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

export function updateInterestPoints(campus) {
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

export function toggleInterestPoints(campus) {
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
            setCurrentPinMarker(null);
        }
    }
}