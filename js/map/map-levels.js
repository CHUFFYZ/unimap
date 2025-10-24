import {
    map, currentCampus, currentFloorOverlay, levelMenu, buildingMarker,
    markersLayers, setCurrentFloorOverlay, setLevelMenu, setBuildingMarker
} from '../../js/map/map-constants.js';

export function startLevelExploration(campus, faculty, buildingCode) {
    const buildingData = locations[campus][faculty].places.find(p => p.name === buildingCode);
    if (!buildingData || !buildingData.floors) return;
    const floors = buildingData.floors;
    const { w, h } = campuses[campus];
    const bounds = [[0, 0], [h, w]];
    if (currentFloorOverlay) {
        map.removeLayer(currentFloorOverlay);
        setCurrentFloorOverlay(null);
    }
    setBuildingMarker(null);
    if (markers[campus][faculty]) {
        setBuildingMarker(markers[campus][faculty].find(m => {
            const latlng = m.getLatLng();
            return Math.abs(latlng.lat - buildingData.coords[0]) < 0.0001 && Math.abs(latlng.lng - buildingData.coords[1]) < 0.0001;
        }));
        if (buildingMarker && buildingMarker._icon) {
            buildingMarker._icon.style.display = 'none';
        }
    }
    const initialFloorSvgUrl = `../../../image/locations/CP/galeria/${buildingCode}/p1.svg`;
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svgElement.setAttribute("preserveAspectRatio", "none");
    svgElement.innerHTML = `<image href="${initialFloorSvgUrl}" x="0" y="0" width="100%" height="100%" />`;
    setCurrentFloorOverlay(L.svgOverlay(svgElement, bounds, {
        opacity: 1,
        interactive: false
    }).addTo(map));
    const mapContainer = document.getElementById('map');
    mapContainer.style.position = 'relative';
    if (levelMenu) {
        document.body.removeChild(levelMenu);
    }
    setLevelMenu(document.createElement('div'));
    levelMenu.id = 'level-menu';
    for (let i = 1; i <= floors; i++) {
        const levelBtn = document.createElement('button');
        levelBtn.textContent = `P${i}`;
        levelBtn.addEventListener('click', () => {
            if (currentFloorOverlay) {
                map.removeLayer(currentFloorOverlay);
            }
            const floorSvgUrl = `../../../image/locations/CP/galeria/${buildingCode}/p${i}.svg`;
            const newSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            newSvgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            newSvgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
            newSvgElement.setAttribute("preserveAspectRatio", "none");
            newSvgElement.innerHTML = `<image href="${floorSvgUrl}" x="0" y="0" width="100%" height="100%" />`;
            setCurrentFloorOverlay(L.svgOverlay(newSvgElement, bounds, {
                opacity: 1,
                interactive: false
            }).addTo(map));
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
        map.addLayer(markersLayers[currentCampus]);
    });
    levelMenu.appendChild(closeBtn);
    document.body.appendChild(levelMenu);
    levelMenu.querySelector('button:not(.close-levels)').click();
    map.removeLayer(markersLayers[currentCampus]);
    map.invalidateSize();
}