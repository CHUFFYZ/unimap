let map;
let markers = {};
let isFlying = false;

function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function flyToLocation(lat, lng, building, placeName) {
    if (!map) {
        return;
    }

    if (isFlying) {
        return;
    }

    isFlying = true;

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

    Object.values(markers).flat().forEach(m => {
        if (m._icon) m._icon.classList.remove('marker-animated');
    });
    const popups = document.querySelectorAll('.leaflet-popup-content-wrapper');
    popups.forEach(popup => popup.classList.remove('popup-animated'));

    map.once('moveend', () => {
        const markerGroup = markers[building];
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
        const maxMarkerAttempts = 5;
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
                setTimeout(animateMarkerAndPopup, 200);
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

    const imageOverlay = L.imageOverlay('image/locations/mapa/campus1.svg', bounds);
    imageOverlay.on('load', () => {
        pantallaBienvenida.classList.add('fade-out');
    });
    imageOverlay.on('error', () => {
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
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        if (markerElements.length > 0) {
            markerElements.forEach(marker => {
                marker.classList.add('will-change-transform');
            });
        }
    });

    map.on('zoomend', () => {
        const svgElement = document.querySelector('.leaflet-overlay-pane svg');
        if (svgElement) {
            svgElement.classList.remove('will-change-transform');
        }

        const markerElements = document.querySelectorAll('.leaflet-marker-pane .marker-inner');
        if (markerElements.length > 0) {
            markerElements.forEach(marker => {
                marker.classList.remove('will-change-transform');
            });
        }
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

    for (const [building, data] of Object.entries(locations)) {
        controlsHTML += `<div class="building-section"><h3>${building}</h3>`;

        if (data.usarIconoGrupal) {
            const coords = data.places.reduce(([sumLat, sumLng], place) => {
                return [sumLat + place.coords[0], sumLng + place.coords[1]];
            }, [0, 0]);
            const avgCoords = [coords[0] / data.places.length, coords[1] / data.places.length];
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
        locationControls.innerHTML = controlsHTML;
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
    }

    map.on('load', function() {
        const pantallaBienvenida = document.getElementById('pantallaBienvenida');
        const contenido = document.getElementById('contenido');
        if (pantallaBienvenida && contenido) {
            pantallaBienvenida.style.display = 'none';
            contenido.style.display = 'block';
        }
    });
});

window.flyToLocation = flyToLocation;