import {
    map, osmMap, baseLayers, intermediateBaseLayers, detailedBaseLayers, detailedLayers, markersLayers,
    currentCampus, setMap, setOsmMap, setOsmLayer
} from './map-constants.js';
import { flyToLocation, showLocationDetails } from './map-ui.js';

export function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

export function initializeMap() {
    const mapElement = document.getElementById('map');
    const osmMapElement = document.getElementById('osm-map');
    const pantallaBienvenida = document.getElementById('pantallaBienvenida');
    const guiaContainer = document.getElementById('guia-container');
    const guiaContainer2 = document.getElementById('guia-container2');

    if (!mapElement) return;

    setMap(L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -1.5,
        maxZoom: 4,
        maxBoundsViscosity: 1.0,
        zoomDelta: 0.3,
        zoomSnap: 0,
        fadeAnimation: true,
        zoomAnimationThreshold: 2
    }));

    Object.keys(campuses).forEach(campus => {
        const { w, h, svg, geojson } = campuses[campus];
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
        fetch(geojson)
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
        setOsmMap(L.map('osm-map', {
            crs: L.CRS.EPSG3857,
            minZoom: 10.5,
            maxZoom: 20,
            zoomDelta: 0.3,
            zoomSnap: 0
        }).setView([18.646626696426264, -91.81813061518552], 18));
        setOsmLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 21,
            maxNativeZoom: 19
        }));
        osmMapElement.style.display = 'none';
    }
}