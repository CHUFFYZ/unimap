import {
    map, osmMap, markers, currentCampus, detailedLayers, campusColors,
    setMap, setOsmMap, setOsmLayer
} from '../../js/map/map-constants.js';
import { preloadImages, initializeMap } from '../../js/map/map-init.js';
import { addCustomControls } from '../../js/map/map-controls.js';
import { createMarker, updateLocationControls, updateOSMLocationControls } from '../../js/map/map-markers.js';
import { flyToLocation, flyToOSMLocation, handleMapTransition, showOSMLocationDetails } from '../../js/map/map-ui.js';

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa
    initializeMap();
    addCustomControls();

    // Precargar imágenes
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
        '../../../image/pines/pin-usuario.svg',
        '../../../image/pines/bus-stop.svg'
    ].filter(url => url);
    preloadImages(imageUrls);

    // Crear controles de ubicación
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
                const avgCoords = [coords[0] / data.places.length, coords[1] / data.places.length];
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
    const locationControls = document.getElementById('location-controls');
    if (locationControls) {
        locationControls.innerHTML = controlsHTML;
        updateLocationControls();
    }

    // Configurar búsqueda
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

    // Configurar controles de interfaz
    const infoIcon = document.querySelector('.palpitante3 .fa-magnifying-glass');
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

    // Configurar marcadores de campus en OSM
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
        }).on('click', () => {
            flyToLocation(
                campuses['Campus Principal'].center[0],
                campuses['Campus Principal'].center[1],
                'Campus Principal',
                'Campus Principal',
                'Campus Principal'
            );
        }),
        'Campus 2': L.marker([18.653975735270432, -91.81062427253869], {
            title: 'UNACAR Preparatoria',
            icon: L.icon({
                iconUrl: campusIcons['Campus 2'],
                iconSize: [64, 64],
                iconAnchor: [32, 64]
            })
        }).on('click', () => {
            showOSMLocationDetails(
                'Campus 2',
                'Campus 2',
                'UNACAR Preparatoria',
                [],
                'No hay comentarios disponibles.',
                'Campus 2',
                true
            );
        }),
        'Campus 3': L.marker([18.65757697187412, -91.76605622956039], {
            title: 'UNACAR',
            icon: L.icon({
                iconUrl: campusIcons['Campus 3'],
                iconSize: [64, 64],
                iconAnchor: [32, 64]
            })
        }).on('click', () => {
            showOSMLocationDetails(
                'Campus 3',
                'Campus 3',
                'UNACAR',
                [],
                'No hay comentarios disponibles.',
                'Campus 3',
                true
            );
        }),
        'Campus Sabancuy': L.marker([18.9694735975256, -91.18848920523213], {
            title: 'UNACAR',
            icon: L.icon({
                iconUrl: campusIcons['Campus Sabancuy'],
                iconSize: [64, 64],
                iconAnchor: [32, 64]
            })
        }).on('click', () => {
            showOSMLocationDetails(
                'Campus Sabancuy',
                'Campus Sabancuy',
                'UNACAR',
                [],
                'No hay comentarios disponibles.',
                'Campus Sabancuy',
                true
            );
        }),
        'Jardin Botanico': L.marker([18.636835943623314, -91.779242388015359], {
            title: 'UNACAR',
            icon: L.icon({
                iconUrl: campusIcons['Jardin Botanico'],
                iconSize: [64, 64],
                iconAnchor: [32, 64]
            })
        }).on('click', () => {
            showOSMLocationDetails(
                'Jardin Botanico',
                'Jardin Botanico',
                'UNACAR',
                [],
                'No hay comentarios disponibles.',
                'Jardin Botanico',
                true
            );
        }),
        'Centro Cultural Universitario': L.marker([18.638626189564732, -91.83462499633609], {
            title: 'UNACAR',
            icon: L.icon({
                iconUrl: campusIcons['Centro Cultural Universitario'],
                iconSize: [64, 64],
                iconAnchor: [32, 64]
            })
        }).on('click', () => {
            showOSMLocationDetails(
                'Centro Cultural Universitario',
                'Centro Cultural Universitario',
                'UNACAR',
                [],
                'No hay comentarios disponibles.',
                'Centro Cultural Universitario',
                true
            );
        }),
        'Museo Guanal': L.marker([18.638626189564732, -91.83462499633609], {
            title: 'UNACAR',
            icon: L.icon({
                iconUrl: campusIcons['Museo Guanal'],
                iconSize: [64, 64],
                iconAnchor: [32, 64]
            })
        }).on('click', () => {
            showOSMLocationDetails(
                'Museo Guanal',
                'Museo Guanal',
                'UNACAR',
                [],
                'No hay comentarios disponibles.',
                'Museo Guanal',
                true
            );
        })
    };

    // Configurar controles de ubicación para OSM
    let controlsHTML2 = `
        <div id="search-container2">
            <input type="text" 
                id="search-box2" 
                placeholder="Buscar campus..."
                autocomplete="off">
        </div>`;
    for (const campus of Object.keys(campuses)) {
        const { lat, lng } = osmMap.campusMarkers[campus].getLatLng();
        controlsHTML2 += `
            <a href="#" class="osm-location-link" 
               onclick="flyToOSMLocation(${lat}, ${lng}, '${campus}')"
               data-search="${campus.toLowerCase()}">
                ${campus}
            </a>`;
    }
    if (locationControls2) {
        locationControls2.innerHTML = controlsHTML2;
        updateOSMLocationControls();
    }

    const searchBox2 = document.getElementById('search-box2');
    if (searchBox2) {
        searchBox2.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const links = document.querySelectorAll('.osm-location-link');
            links.forEach(link => {
                const searchableText = link.dataset.search;
                link.style.display = searchableText.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // Configurar evento de zoom
    map.on('zoomend', () => {
        handleMapTransition(map.getZoom());
    });

    osmMap.on('zoomend', () => {
        const currentZoom = osmMap.getZoom();
        if (currentZoom >= 17) {
            handleMapTransition(0.51, true);
        } else if (currentZoom >= 15) {
            handleMapTransition(0, true);
        } else {
            handleMapTransition(-0.3, true);
        }
    });

    // Configurar popstate para manejar retroceso en el navegador
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.popup) {
            const popup = document.getElementById(state.popup);
            if (popup) {
                popup.classList.add('visible');
            }
        } else {
            const popups = document.querySelectorAll('#location-details, #osm-location-details, #panorama-viewer, #fullscreen-image, #routes-menu, #campus-selection-popup, #not-available-popup');
            popups.forEach(p => p.classList.remove('visible'));
        }
    });

    // Configurar cierre de imágenes y panoramas
    const fullscreenContainer = document.getElementById('fullscreen-image');
    if (fullscreenContainer) {
        fullscreenContainer.addEventListener('click', () => {
            fullscreenContainer.classList.remove('visible');
            history.replaceState(null, null, '');
        });
    }
    const panoramaContainer = document.getElementById('panorama-viewer');
    if (panoramaContainer) {
        panoramaContainer.addEventListener('click', (e) => {
            if (e.target === panoramaContainer) {
                panoramaContainer.classList.remove('visible');
                history.replaceState(null, null, '');
                const panoramaDiv = document.getElementById('panorama');
                if (panoramaDiv) panoramaDiv.innerHTML = '';
            }
        });
    }
});