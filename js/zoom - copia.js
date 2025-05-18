let map;
let markers = {};
let isFlying = false;

function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
        img.onload = () => console.log(`Imagen cargada: ${url}`);
        img.onerror = () => console.warn(`Error al cargar imagen: ${url}`);
    });
}

function flyToLocation(lat, lng, building, placeName) {
    if (!map) {
        console.error("Mapa no inicializado");
        return;
    }

    if (isFlying) {
        console.log("Zoom en curso, espera a que termine");
        return;
    }

    isFlying = true;
    console.log(`Volando a [${lat}, ${lng}] para ${placeName}`);

    map.flyTo([lat, lng], 1, {
        duration: 1.5,
        noMoveStart: true
    });

    const locationControls = document.getElementById('location-controls');
    if (locationControls) {
        locationControls.classList.remove('visible');
    } else {
        console.warn("Elemento #location-controls no encontrado");
    }

    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.value = '';
    } else {
        console.warn("Elemento #search-box no encontrado");
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
        console.log(`Zoom completado para ${placeName}`);
        const markerGroup = markers[building];
        if (!markerGroup) {
            console.warn(`Grupo de marcadores no encontrado para ${building}`);
            isFlying = false;
            return;
        }

        const targetMarker = markerGroup.find(m => {
            const latlng = m.getLatLng();
            return Math.abs(latlng.lat - lat) < 0.0001 && Math.abs(latlng.lng - lng) < 0.0001;
        });

        if (!targetMarker) {
            console.warn(`Marcador no encontrado para ${placeName}`);
            isFlying = false;
            return;
        }

        let markerAttempts = 0;
        const maxMarkerAttempts = 5;
        const animateMarkerAndPopup = () => {
            if (targetMarker._icon) {
                console.log(`Animando marcador: ${placeName}`);
                targetMarker._icon.classList.add('marker-animated');

                targetMarker.once('popupopen', () => {
                    const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
                    if (popupElement) {
                        popupElement.classList.remove('popup-animated');
                        void popupElement.offsetWidth;
                        popupElement.classList.add('popup-animated');
                        console.log("Popup animado correctamente :)");
                    } else {
                        console.error("Popup no encontrado en el DOM tras popupopen");
                    }
                });

                targetMarker.openPopup();

                setTimeout(() => {
                    const popupElement = document.querySelector('.leaflet-popup-content-wrapper');
                    if (popupElement && !popupElement.classList.contains('popup-animated')) {
                        console.warn("Fallback: No jalo aplicando animación del popup manualmente");
                        popupElement.classList.remove('popup-animated');
                        void popupElement.offsetWidth;
                        popupElement.classList.add('popup-animated');
                    }
                }, 500);
            } else if (markerAttempts < maxMarkerAttempts) {
                markerAttempts++;
                console.warn(`Intento ${markerAttempts}: Marcador no renderizado, reintentando...`);
                setTimeout(animateMarkerAndPopup, 200);
            } else {
                console.error(`No se pudo :( renderizar el marcador para ${placeName}`);
            }
        };

        animateMarkerAndPopup();
        isFlying = false;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const w = 2049, h = 1521;
    const bounds = [[0, 0], [h, w]];
    const mapElement = document.getElementById('map');
    const pantallaBienvenida = document.getElementById('pantallaBienvenida');

    if (!mapElement) {
        console.error("Elemento #map no encontrado en el DOM");
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

    const imageOverlay = L.imageOverlay('image/mapa999-optimizado.svg', bounds);
    imageOverlay.on('load', () => {
        pantallaBienvenida.classList.add('fade-out');
    });
    imageOverlay.on('error', () => {
        console.error("Error al cargar la imagen del mapa");
        pantallaBienvenida.classList.add('fade-out');
    });
    imageOverlay.addTo(map);

    map.fitBounds(bounds);
    map.setView([700, 1200], 0);

    map.on('zoomstart', () => {
        Object.values(markers).flat().forEach(m => {
            if (m._icon) m._icon.classList.remove('marker-animated');
        });

        const svgElement = document.querySelector('.leaflet-overlay-pane svg');
        if (svgElement) {
            svgElement.classList.add('will-change-transform');
        } else {
            console.warn('SVG del mapa no encontrado en zoomstart');
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        if (markerElements.length > 0) {
            markerElements.forEach(marker => {
                marker.classList.add('will-change-transform');
            });
        } else {
            console.warn('No se encontraron marcadores en zoomstart');
        }

        console.log('Aplicado will-change: transform durante zoomstart');
    });

    map.on('zoomend', () => {
        const svgElement = document.querySelector('.leaflet-overlay-pane svg');
        if (svgElement) {
            svgElement.classList.remove('will-change-transform');
        } else {
            console.warn('SVG del mapa no encontrado en zoomend');
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        if (markerElements.length > 0) {
            markerElements.forEach(marker => {
                marker.classList.remove('will-change-transform');
            });
        } else {
            console.warn('No se encontraron marcadores en zoomend');
        }

        console.log('Removido will-change: transform tras zoomend');
    });

    L.Control.CustomZoom = L.Control.Zoom.extend({
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
            const zoomDelta = 0.3;

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

    function createMarker(lat, lng, title, building, iconConfig, isShared = false) {
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
    } else {
        console.warn("Elemento .fa-magnifying-glass o #location-controls no encontrado");
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
        'Rectoria': {
            places: [{ name: 'A', coords: [556, 575], icon: { iconUrl: 'image/pines/pin-rectoria-a.svg', color: 'rojo' }}],
            icon: { iconUrl: 'image/pines/pin-rectoria.svg', color: 'rojo' },
            usarIconoGrupal: false
        },
        'Biblioteca Universitaria': {
            places: [{ name: 'Biblioteca', coords: [595, 1622], icon: { iconUrl: 'image/pines/pin-biblioteca.svg', color: 'verde-oscuro' } }],
            icon: { iconUrl: 'image/pines/pin-biblioteca.svg', color: 'verde-oscuro' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias de la Informacion': {
            places: [{
                name: 'C-1',
                coords: [475, 1585],
                icon: { iconUrl: 'image/pines/pin-fci-c1.svg', color: 'azul-claro' }
            }],
            icon: { iconUrl: 'image/pines/pin-fci.svg', color: 'azul-claro' },
            usarIconoGrupal: false
        },
        'Centro de Idiomas': {
            places: [{ name: 'C', coords: [700, 1595], icon: { iconUrl: 'image/pines/pin-ci.svg', color: 'amarillo' } }],
            icon: { iconUrl: 'image/pines/pin-ci.svg', color: 'amarillo' },
            usarIconoGrupal: false
        },
        'Edificio de Vinculacion': {
            places: [{ name: 'CH', coords: [310, 1431], icon: { iconUrl: 'image/pines/pin-ev-ch.svg', color: 'verde-azul' }}],
            icon: { iconUrl: 'image/pines/pin-ev.svg', color: 'verde-azul' },
            usarIconoGrupal: false
        },
        'Aula Magna': {
            places: [{ name: 'D', coords: [810, 1415], icon: { iconUrl: 'image/pines/pin-am-d.svg', color: 'verde-claro' } }],
            icon: { iconUrl: 'image/pines/pin-am.svg', color: 'verde-claro' },
            usarIconoGrupal: false
        },
        'Facultad de Quimica': {
            places: [
                { name: 'T', coords: [791, 1270], icon: { iconUrl: 'image/pines/pin-fq-t.svg', color: 'cafe' } },
                { name: 'U', coords: [892, 1285], icon: { iconUrl: 'image/pines/pin-fq-u.svg', color: 'cafe' } },
                { name: 'U-1', coords: [915, 1225], icon: { iconUrl: 'image/pines/pin-fq-u1.svg', color: 'cafe' } },
                { name: 'V', coords: [878, 1330], icon: { iconUrl: 'image/pines/pin-fq-v.svg', color: 'cafe' } }
            ],
            icon: { iconUrl: 'image/pines/pin-fq.svg', color: 'cafe' },
            usarIconoGrupal: false
        },
        'Gimnasio Universitario y PE de LEFYD': {
            places: [{ name: 'E', coords: [870, 783], icon: { iconUrl: 'image/pines/pin-gu.svg', color: 'naranja' } }],
            icon: { iconUrl: 'image/pines/pin-gu.svg', color: 'naranja' },
            usarIconoGrupal: false
        },
        'Edificio de Cafeterias': {
            places: [{ name: 'F-1', coords: [629, 1349], icon: { iconUrl: 'image/pines/pin-ec-f1.svg', color: 'rosa-oscuro' }}],
            icon: { iconUrl: 'image/pines/pin-ec.svg', color: 'rosa-oscuro' },
            usarIconoGrupal: false
        },
        'Facultad de Derecho': {
            places: [{ name: 'Z', coords: [890, 1500], icon: { iconUrl: 'image/pines/pin-fd-z.svg', color: 'durazno' } }],
            icon: { iconUrl: 'image/pines/pin-fd.svg', color: 'durazno' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Educativas': {
            places: [
                { name: 'H', coords: [531, 1208], icon: { iconUrl: 'image/pines/pin-fce-h.svg', color: 'rosa-claro' } },
                { name: 'I', coords: [550, 1173], icon: { iconUrl: 'image/pines/pin-fce-i.svg', color: 'rosa-claro' } },
                { name: 'K', coords: [636, 1131], icon: { iconUrl: 'image/pines/pin-fce-k.svg', color: 'rosa-claro' } },
                { name: 'O', coords: [705, 1092], icon: { iconUrl: 'image/pines/pin-fce-o.svg', color: 'rosa-claro' } },
                { name: 'Q', coords: [660, 1216], icon: { iconUrl: 'image/pines/pin-fce-q.svg', color: 'rosa-claro' } }
            ],
            icon: { iconUrl: 'image/pines/pin-fce.svg', color: 'rosa-claro' },
            usarIconoGrupal: false
        },
        'Sala Audiovisual': {
            places: [{ name: 'P', coords: [705, 1184], icon: { iconUrl: 'image/pines/pin-sa-p.svg', color: 'azul-oscuro' } }],
            icon: { iconUrl: 'image/pines/pin-sa.svg', color: 'azul-oscuro' },
            usarIconoGrupal: false
        },
        'Facultad de Ciencias Economicas Administrativas': {
            places: [
                { name: 'L', coords: [590, 1086], icon: { iconUrl: 'image/pines/pin-fcea-l.svg', color: 'azul' } },
                { name: 'R', coords: [634, 1271], icon: { iconUrl: 'image/pines/pin-fcea-r.svg', color: 'azul' } },
                { name: 'S', coords: [760, 1333], icon: { iconUrl: 'image/pines/pin-fcea-s.svg', color: 'azul' } },
                { name: 'X', coords: [910, 1414], icon: { iconUrl: 'image/pines/pin-fcea-x.svg', color: 'azul' }},
                { name: 'Y', coords: [892, 1451], icon: { iconUrl: 'image/pines/pin-fcea-y.svg', color: 'azul' } }
            ],
            icon: { iconUrl: 'image/pines/pin-fcea.svg', color: 'azul' },
            usarIconoGrupal: false
        },
        'Centro de Educacion Continua': {
            places: [{ name: 'W', coords: [894, 1371], icon: { iconUrl: 'image/pines/pin-cec-w.svg', color: 'morado' } }],
            icon: { iconUrl: 'image/pines/pin-cec.svg', color: 'morado' },
            usarIconoGrupal: false
        }
    };

    const imageUrls = [
        ...Object.values(locations).map(data => data.icon.iconUrl),
        ...Object.values(locations).flatMap(data =>
            data.places.filter(place => place.icon).map(place => place.icon.iconUrl)
        )
    ];
    preloadImages(imageUrls);

    let controlsHTML = `
        <div id="search-container">
            <input type="text" 
                id="search-box" 
                placeholder="Buscar aula o edificio..."
                autocomplete="off">
        </div>`;

    console.log("Generando controles para ubicaciones...");
    for (const [building, data] of Object.entries(locations)) {
        controlsHTML += `<div class="building-section"><h3>${building}</h3>`;

        if (data.usarIconoGrupal) {
            const coords = data.places.reduce(([sumLat, sumLng], place) => {
                return [sumLat + place.coords[0], sumLng + place.coords[1]];
            }, [0, 0]);
            const avgCoords = [coords[0] / data.places.length, coords[1] / data.places.length];
            console.log(`Creando marcador compartido para ${building} en [${avgCoords[0]}, ${avgCoords[1]}]`);
            createMarker(avgCoords[0], avgCoords[1], building, building, data.icon, true);
            controlsHTML += `
                <a href="#" class="location-link marker-${data.icon.color}" 
                   onclick="flyToLocation(${avgCoords[0]}, ${avgCoords[1]}, '${building}', '${building}')"
                   data-search="${building.toLowerCase()} ${data.places.map(p => p.name.toLowerCase()).join(' ')}">
                    ${building}
                </a>`;
        } else {
            data.places.forEach(place => {
                const [lat, lng] = place.coords;
                console.log(`Creando marcador para ${building} - ${place.name} en [${lat}, ${lng}]`);
                const icon = place.icon || data.icon;
                createMarker(lat, lng, place.name, building, icon);
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
        console.log("Insertando controles HTML en #location-controls");
        locationControls.innerHTML = controlsHTML;
    } else {
        console.error("No se pudo añadir controles porque #location-controls no existe");
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
    } else {
        console.warn("No se pudo añadir funcionalidad de búsqueda porque #search-box no existe");
    }

    map.on('load', function() {
        const pantallaBienvenida = document.getElementById('pantallaBienvenida');
        const contenido = document.getElementById('contenido');
        if (pantallaBienvenida && contenido) {
            pantallaBienvenida.style.display = 'none';
            contenido.style.display = 'block';
        } else {
            console.warn("Elemento #pantallaBienvenida o #contenido no encontrado");
        }
    });
});

window.flyToLocation = flyToLocation;
/*alan agrega si es necesario e script de reedireccion al tocar en el afi, arriba estan los marcadores*/

