import { map, osmMap, currentCampus, isFlying } from './map-constants.js';
import { showRoutesMenu, toggleGeolocation } from './map-navigation.js';
import { toggleInterestPoints } from './map-markers.js';

export function addCustomControls() {
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
}