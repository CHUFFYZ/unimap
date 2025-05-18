// geolocation.js
let geolocationWatchId = null;
let userMarker = null;
let isGeolocationActive = false;
let lastCoords = null;

// Parámetros de transformación ajustados para el nuevo tamaño del mapa
const transformParams = {
    sx: 139104.30, // Escala para longitud (píxeles/grado) ajustada: 219049.07 * (1301/2049)
    sy: 200235.03, // Escala para latitud (píxeles/grado) ajustada: 238126.95 * (1279/1521)
    lon0: -91.81754135065904, // Longitud de referencia (sin cambios)
    lat0: 18.645852473619726, // Latitud de referencia (sin cambios)
    x0: 774, // X de referencia ajustado: 1218 * (1301/2049)
    y0: 451  // Y de referencia ajustado: 536 * (1279/1521)
};

// Transformar coordenadas geográficas a coordenadas de Leaflet
function transformCoordinates(lat, lon) {
    const x = transformParams.sx * (lon - transformParams.lon0) + transformParams.x0;
    const y = transformParams.sy * (lat - transformParams.lat0) + transformParams.y0;
    console.log('Transformación:', [lat, lon], '->', [y, x]); // Depuración
    return [y, x]; // [lat, lng] para Leaflet
}

// Actualizar la ubicación del usuario
function updateUserLocation(lat, lon) {
    if (!map) {
        console.error('Mapa no inicializado');
        return;
    }

    let coords = transformCoordinates(lat, lon);
    
    // Suavizar el movimiento con promedio móvil
    if (lastCoords) {
        coords[0] = 0.7 * coords[0] + 0.3 * lastCoords[0]; // y
        coords[1] = 0.7 * coords[1] + 0.3 * lastCoords[1]; // x
    }
    lastCoords = coords;

    const [leafletLat, leafletLng] = coords;

    // Validar que las coordenadas estén dentro de los límites
    const bounds = [[0, 0], [1279, 1301]]; // Nuevos límites del mapa
    if (leafletLat < bounds[0][0] || leafletLat > bounds[1][0] || leafletLng < bounds[0][1] || leafletLng > bounds[1][1]) {
        console.warn('Ubicación fuera de los límites del mapa:', [lat, lon], '->', coords, 'Límites:', bounds);
        return;
    }

    const userIcon = L.divIcon({
        className: 'user-location',
        html: `
            <div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #FF0000;
                border: 2px solid #FFFFFF;
                box-shadow: 0 0 8px rgba(0,0,0,0.5);
            "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });

    if (userMarker) {
        // Actualizar marcador existente
        userMarker.setLatLng([leafletLat, leafletLng]);
    } else {
        // Crear nuevo marcador
        userMarker = L.marker([leafletLat, leafletLng], {
            icon: userIcon,
            zIndexOffset: 1000
        }).addTo(map).bindPopup('Tu ubicación');
    }

    // Centrar el mapa en la ubicación del usuario si la geolocalización está activa
    if (isGeolocationActive) {
        map.panTo([leafletLat, leafletLng]);
    }
}

// Iniciar geolocalización
function startGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolocalización no soportada por tu navegador.');
        return;
    }

    if (geolocationWatchId !== null) {
        console.log('Geolocalización ya activa');
        return;
    }

    isGeolocationActive = true;
    const geoButton = document.getElementById('geolocation-toggle');
    if (geoButton) {
        geoButton.classList.add('active');
        geoButton.innerHTML = '<i class="fas fa-location-crosshairs"></i> Desactivar Geolocalización';
    }

    geolocationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Actualización de geolocalización:', latitude, longitude);
            updateUserLocation(latitude, longitude);
        },
        (error) => {
            console.error('Error de geolocalización:', error);
            alert('Error al obtener la ubicación: ' + error.message);
            stopGeolocation();
        },
        {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0
        }
    );
}

// Detener geolocalización
function stopGeolocation() {
    if (geolocationWatchId !== null) {
        navigator.geolocation.clearWatch(geolocationWatchId);
        geolocationWatchId = null;
    }

    isGeolocationActive = false;
    const geoButton = document.getElementById('geolocation-toggle');
    if (geoButton) {
        geoButton.classList.remove('active');
        geoButton.innerHTML = '<i class="fas fa-location-crosshairs"></i> Activar Geolocalización';
    }

    if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
    }
    lastCoords = null; // Reiniciar el filtro
}

// Alternar geolocalización
function toggleGeolocation() {
    if (isGeolocationActive) {
        stopGeolocation();
    } else {
        startGeolocation();
    }
}

// Agregar control de geolocalización al mapa
document.addEventListener('DOMContentLoaded', () => {
    if (!map) {
        console.error('Mapa no inicializado para el control de geolocalización');
        return;
    }

    // Extender control de Leaflet para el botón de geolocalización
    L.Control.Geolocation = L.Control.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control-geolocation leaflet-bar');
            const button = L.DomUtil.create('a', 'geolocation-toggle', container);
            button.id = 'geolocation-toggle';
            button.innerHTML = '<i class="fas fa-location-crosshairs"></i> Activar Geolocalización';
            button.href = '#';
            button.title = 'Activar/Desactivar Geolocalización';

            L.DomEvent.on(button, 'click', (e) => {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                toggleGeolocation();
            });

            return container;
        }
    });

    map.addControl(new L.Control.Geolocation({ position: 'topleft' }));
});

