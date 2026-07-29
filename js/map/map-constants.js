export let map;
export let osmMap;
export let osmLayer;
export let baseLayers = {}, intermediateBaseLayers = {}, detailedBaseLayers = {}, detailedLayers = {}, markersLayers = {};
export let markers = {
    'Campus Principal': {}, 'Campus 2': {}, 'Campus 3': {}, 'Jardin Botanico': {},
    'Centro Cultural Universitario': {}, 'Museo Guanal': {}, 'Campus Sabancuy': {}
};
export let interestMarkers = {
    'Campus Principal': [], 'Campus 2': [], 'Campus 3': [], 'Jardin Botanico': [],
    'Centro Cultural Universitario': [], 'Museo Guanal': [], 'Campus Sabancuy': []
};
export let isFlying = false;
export let interestPointsActive = {
    'Campus Principal': false, 'Campus 2': false, 'Campus 3': false, 'Jardin Botanico': false,
    'Centro Cultural Universitario': false, 'Museo Guanal': false, 'Campus Sabancuy': false
};
export let geolocationActive = false;
export let currentPinMarker = null;
export let userMarker = null;
export let accuracyCircle = null;
export let routeLayers = {};
export let stopMarkers = [];
export let currentDestination = null;
export let firstGeoUpdate = false;
export let currentCampus = 'Campus Principal';
export let ignoreNextZoomEnd = false;
export let routesMenu = null;
export let routesActive = false;
export let selectedRoutes = [];
export let fullscreenCloseListener = null;
export let panoramaCloseListener = null;
export let geolocationWatchId = null;
export let currentFloorOverlay = null;
export let levelMenu = null;
export let buildingMarker = null;

export const campusColors = {
    'Campus Principal': 'yellow',
    'Campus 2': 'yellow',
    'Campus 3': 'yellow',
    'Jardin Botanico': 'green',
    'Centro Cultural Universitario': 'orange',
    'Museo Guanal': 'gris',
    'Campus Sabancuy': 'yellow'
};