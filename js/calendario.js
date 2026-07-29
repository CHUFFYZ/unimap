let map;
let markers = {};
let isFlying = false;

function preloadImage(url) {
    const img = new Image();
    img.src = url;
    img.onerror = () => console.error(`Error al cargar imagen: ${url}`);
    return img;
}

// Función para esperar a que PDF.js se cargue completamente
function waitForPDFJS(maxAttempts = 50) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        function checkPDFJS() {
            attempts++;
            
            if (typeof pdfjsLib !== 'undefined' && pdfjsLib.getDocument) {
                
                resolve(pdfjsLib);
                return;
            }
            
            if (attempts >= maxAttempts) {
                reject(new Error(`PDF.js no se cargó después de ${maxAttempts} intentos. Verifica tu conexión a internet.`));
                return;
            }
            
            
            setTimeout(checkPDFJS, 100); // Esperar 100ms entre intentos
        }
        
        checkPDFJS();
    });
}

// Función para inicializar el mapa con el PDF local
async function initializePDFMap() {
    const mapElement = document.getElementById('map');
    
    try {
        if (!mapElement) {
            console.error("Elemento #map no encontrado en el DOM");
            return;
        }

        // Mostrar mensaje de carga inicial
        mapElement.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; font-family: 'Poppins', Arial, sans-serif; text-align: center; background: linear-gradient(135deg, #667eea 0%, #020075 100%); color: white;">
                <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); max-width: 400px;">
                    <div style="font-size: 4em; margin-bottom: 20px; animation: bounce 2s infinite;">📅</div>
                    <h2 style="margin: 0 0 15px 0; font-weight: 600; font-size: 1.5em;">Iniciando Calendario</h2>
                    <p id="loading-message" style="margin: 0; font-size: 1em; opacity: 0.9; min-height: 24px;">Verificando componentes...</p>
                    <div style="width: 250px; height: 6px; background: rgba(255,255,255,0.3); border-radius: 3px; margin: 25px auto; overflow: hidden;">
                        <div id="progress-bar" style="width: 10%; height: 100%; background: rgba(255,255,255,0.9); border-radius: 3px; transition: width 0.3s ease; box-shadow: 0 0 10px rgba(255,255,255,0.5);"></div>
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.7;">UNACAR - Vista Interactiva</div>
                </div>
            </div>
            <style>
                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
                    40%, 43% { transform: translateY(-20px); }
                    70% { transform: translateY(-10px); }
                    90% { transform: translateY(-5px); }
                }
            </style>
        `;

        const loadingMessage = document.getElementById('loading-message');
        const progressBar = document.getElementById('progress-bar');
        
        function updateProgress(width, message) {
            if (loadingMessage) loadingMessage.textContent = message;
            if (progressBar) progressBar.style.width = width + '%';
        }

        // Paso 1: Verificar que PDF.js esté disponible
        
        updateProgress(20, 'Cargando motor PDF...');
        
        const pdfjsLib = await waitForPDFJS();
        
        
        // Configurar worker si no está configurado
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs`;

            
        }

        // Paso 2: Definir ruta del archivo PDF (ACTUALIZADA)
        const localPdfUrl = '../image/calendario/calendario-escolar.pdf';
        
        
        updateProgress(40, 'Localizando archivo PDF...');

        // Paso 3: Cargar el PDF
        
        updateProgress(50, 'Cargando documento PDF...');
        
        const loadingTask = pdfjsLib.getDocument({
            url: localPdfUrl,
            cMapUrl: '../js/pdfjs/web/cmaps/',
            cMapPacked: true
        });
        
        const pdf = await loadingTask.promise;
        

        // Paso 4: Obtener la primera página
        updateProgress(65, 'Obteniendo contenido...');
        const page = await pdf.getPage(1);
        

        // Paso 5: Configurar renderizado
        updateProgress(75, 'Preparando imagen...');
        
        // Escala optimizada para XAMPP (menor para mejor rendimiento)
        const scale = 1.2; // Reducido para mejor performance en localhost
        const viewport = page.getViewport({ scale: scale });

        const w = viewport.width;
        const h = viewport.height;
        const bounds = [[0, 0], [h, w]];

        

        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.height = h;
        canvas.width = w;
        const context = canvas.getContext('2d');

        // Optimizaciones de canvas para localhost
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        // Paso 6: Renderizar PDF
        updateProgress(85, 'Renderizando calendario...');
        
        
        await page.render(renderContext).promise;
        

        // Paso 7: Generar imagen
        updateProgress(95, 'Generando vista interactiva...');
        const imgUrl = canvas.toDataURL('image/jpeg', 0.92); // Calidad optimizada
        

        // Precargar imagen
        preloadImage(imgUrl);

        // Paso 8: Crear mapa
        updateProgress(100, 'Finalizando...');
        

        // Limpiar contenedor
        setTimeout(() => {
            mapElement.innerHTML = '';

            // Crear mapa Leaflet
            map = L.map('map', {
                crs: L.CRS.Simple,
                minZoom: -2,
                maxZoom: .5,
                maxBounds: bounds,
                maxBoundsViscosity: 1.0,
                zoomDelta: 0.5,
                zoomSnap: 0.25,
                wheelPxPerZoomLevel: 80,
                fadeAnimation: false,
                zoomAnimation: true,
                markerZoomAnimation: false,
                preferCanvas: true // Mejor rendimiento en localhost
            });

            // Agregar imagen como overlay
            const imageOverlay = L.imageOverlay(imgUrl, bounds, {
                interactive: true,
                crossOrigin: false,
                opacity: 1,
                alt: 'Calendario Escolar UNACAR'
            });

            imageOverlay.on('error', (e) => {
                console.error("Error al cargar imagen en el mapa:", e);
            });

            imageOverlay.on('load', () => {
                
            });

            imageOverlay.addTo(map);

            // Configurar vista inicial
            map.fitBounds(bounds, { padding: [10, 10] });
            
            // Centrar después de un breve delay
            setTimeout(() => {
                map.setView([h / 2.1, w / 1.935], -1);
            }, 150);

            // Controles personalizados
            L.Control.CalendarControls = L.Control.extend({
                onAdd: function(map) {
                    const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
                    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    container.style.border = '1px solid rgba(0,0,0,0.1)';
                    
                    // Zoom In
                    this._zoomInButton = this._createButton(
                        '<span style="font-size: 18px; font-weight: bold;">+</span>',
                        'Acercar zoom', 'leaflet-control-zoom-in', container,
                        () => this._changeZoom(0.5)
                    );
                    
                    // Zoom Out
                    this._zoomOutButton = this._createButton(
                        '<span style="font-size: 20px; font-weight: bold;">−</span>',
                        'Alejar zoom', 'leaflet-control-zoom-out', container,
                        () => this._changeZoom(-0.5)
                    );
                    
                    // Vista completa
                    this._homeButton = this._createButton(
                        '<span style="font-size: 16px;">🏠</span>',
                        'Vista completa del calendario', 'leaflet-control-zoom-home', container,
                        () => this._resetView()
                    );

                    // Información
                    this._infoButton = this._createButton(
                        '<span style="font-size: 14px;">ℹ️</span>',
                        'Información y controles', 'leaflet-control-info', container,
                        () => this._showInfo()
                    );

                    this._updateDisabled();
                    map.on('zoomend zoomlevelschange', this._updateDisabled, this);
                    
                    return container;
                },

                _createButton: function(html, title, className, container, fn) {
                    const button = L.DomUtil.create('a', className, container);
                    button.innerHTML = html;
                    button.href = '#';
                    button.title = title;
                    button.setAttribute('role', 'button');
                    button.setAttribute('aria-label', title);
                    
                    // Estilos mejorados
                    Object.assign(button.style, {
                        width: '34px',
                        height: '34px',
                        lineHeight: '32px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: 'white',
                        display: 'block',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                    });

                    // Eventos
                    L.DomEvent
                        .on(button, 'mousedown dblclick', L.DomEvent.stopPropagation)
                        .on(button, 'click', L.DomEvent.stop)
                        .on(button, 'click', (e) => {
                            if (!isFlying) {
                                isFlying = true;
                                button.style.backgroundColor = '#f0f0f0';
                                fn();
                                setTimeout(() => { 
                                    isFlying = false;
                                    button.style.backgroundColor = 'white';
                                }, 300);
                            }
                        })
                        .on(button, 'mouseenter', () => {
                            if (!button.classList.contains('leaflet-disabled')) {
                                button.style.backgroundColor = '#f8f8f8';
                            }
                        })
                        .on(button, 'mouseleave', () => {
                            if (!button.classList.contains('leaflet-disabled')) {
                                button.style.backgroundColor = 'white';
                            }
                        });

                    return button;
                },

                _changeZoom: function(delta) {
                    const currentZoom = this._map.getZoom();
                    const newZoom = Math.max(
                        this._map.getMinZoom(),
                        Math.min(this._map.getMaxZoom(), currentZoom + delta)
                    );
                    this._map.setZoom(newZoom, { animate: true });
                },

                _resetView: function() {
                    this._map.fitBounds(bounds, { 
                        padding: [15, 15], 
                        animate: true, 
                        duration: 0.6 
                    });
                },

                _showInfo: function() {
                    const infoHTML = `
                        <div style="font-family: 'Poppins', Arial, sans-serif; line-height: 1.6;">
                            <h3 style="margin: 0 0 15px 0; color: #2196F3; font-size: 1.2em;">📅 Calendario Escolar UNACAR</h3>
                            <div style="margin-bottom: 15px;">
                                <strong>🖱️ Controles del ratón:</strong><br>
                                • Rueda: Hacer zoom<br>
                                • Arrastrar: Mover vista<br>
                                • Doble clic: Acercar zoom
                            </div>
                            <div style="margin-bottom: 15px;">
                                <strong>⌨️ Atajos de teclado:</strong><br>
                                • <kbd>+</kbd> / <kbd>=</kbd>: Acercar<br>
                                • <kbd>-</kbd>: Alejar<br>
                                • <kbd>Inicio</kbd>: Vista completa
                            </div>
                            <div style="font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 10px; margin-top: 15px;">
                                Calendario académico ${new Date().getFullYear()}<br>
                                Universidad Autónoma del Carmen
                            </div>
                        </div>
                    `;

                    // Crear popup de información
                    const popup = L.popup({
                        maxWidth: 300,
                        className: 'calendar-info-popup'
                    })
                    .setLatLng([h / 3, w / 2])
                    .setContent(infoHTML)
                    .openOn(this._map);
                },

                _updateDisabled: function() {
                    const map = this._map;
                    const disabledClass = 'leaflet-disabled';

                    L.DomUtil.removeClass(this._zoomInButton, disabledClass);
                    L.DomUtil.removeClass(this._zoomOutButton, disabledClass);

                    if (map.getZoom() >= map.getMaxZoom()) {
                        L.DomUtil.addClass(this._zoomInButton, disabledClass);
                        this._zoomInButton.style.opacity = '0.5';
                    } else {
                        this._zoomInButton.style.opacity = '1';
                    }

                    if (map.getZoom() <= map.getMinZoom()) {
                        L.DomUtil.addClass(this._zoomOutButton, disabledClass);
                        this._zoomOutButton.style.opacity = '0.5';
                    } else {
                        this._zoomOutButton.style.opacity = '1';
                    }
                }
            });

            // Agregar controles
            map.removeControl(map.zoomControl);
            map.addControl(new L.Control.CalendarControls({ position: 'topleft' }));

            // Badge de información
            const badge = L.control({ position: 'bottomright' });
            badge.onAdd = function() {
                const div = L.DomUtil.create('div');
                div.innerHTML = `
                    <div style="
                        background: rgba(255, 255, 255, 0.95);
                        padding: 8px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        color: #333;
                        width: 170px; 
                        overflow-wrap: break-word;
                        border: 1px solid rgba(0,0,0,0.1);
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                        font-family: 'Poppins', Arial, sans-serif;
                        backdrop-filter: blur(3px);
                        cursor: default;
                    ">
                        <div style="font-weight: 600; margin-bottom: 2px; color: #2196F3;">📅 Calendario Escolar</div>
                        <div style="font-size: 10px; color: #666;">Año académico ${new Date().getFullYear()}</div>
                        <div style="font-size: 9px; color: #999; margin-top: 2px;">UNACAR</div>
                        <div style="font-size: 7px; color: #ee453f; margin-top: 2px;">¡importante! </div>
                        <div style="font-size: 7px; color: #999; margin-top: 2px;">Este calendario ha sido tomado de la pagina official de la unacar, si es de su interes consulte: </div>
                        <a style="font-size: 7px; color: #44abff; margin-top: 0px;" href="https://www.unacar.mx/control_escolar/calendario.html">https://www.unacar.mx/control_escolar/calendario.html</a>
                    </div>
                `;
                return div;
            };
            badge.addTo(map);

            
            
            
            
            
            

        }, 800); // Delay para efecto visual suave

    } catch (error) {
        console.error("Error crítico al inicializar el calendario:", error);
        
        if (mapElement) {
            let errorContent = '';
            const errorType = error.message;

            if (errorType.includes('PDF.js no se cargó')) {
                errorContent = `
                    <div style="padding: 50px; text-align: center; color: #333; font-family: 'Poppins', Arial, sans-serif; line-height: 1.7;">
                        <div style="font-size: 5em; margin-bottom: 25px; opacity: 0.7;">⚠️</div>
                        <h2 style="color: #d32f2f; margin-bottom: 20px; font-size: 1.5em;">Problema de Conectividad</h2>
                        <p style="margin-bottom: 20px; font-size: 1.1em;"><strong>PDF.js no se pudo cargar desde Internet</strong></p>
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
                            <p style="margin: 0 0 10px 0; font-weight: bold;">🔧 Posibles soluciones:</p>
                            <ol style="margin: 0; padding-left: 20px;">
                                <li>Verifica tu conexión a Internet</li>
                                <li>Desactiva temporalmente el antivirus/firewall</li>
                                <li>Prueba en otro navegador (Chrome, Firefox, Edge)</li>
                                <li>Recarga con Ctrl+F5 para limpiar caché</li>
                                <li>Desactiva bloqueadores de anuncios</li>
                            </ol>
                        </div>
                        <button onclick="location.reload()" style="padding: 15px 30px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 500;">
                            🔄 Reintentar Carga
                        </button>
                    </div>
                `;
            } else if (errorType.includes('404') || errorType.includes('Failed to fetch') || errorType.includes('NetworkError')) {
                errorContent = `
                    <div style="padding: 50px; text-align: center; color: #333; font-family: 'Poppins', Arial, sans-serif; line-height: 1.7;">
                        <div style="font-size: 5em; margin-bottom: 25px;">📄</div>
                        <h2 style="color: #d32f2f; margin-bottom: 20px; font-size: 1.5em;">Archivo PDF No Encontrado</h2>
                        <p style="margin-bottom: 20px; font-size: 1.1em;"><strong>No se pudo encontrar el calendario en la ubicación especificada</strong></p>
                        
                        <div style="background: #e8f4fd; border: 1px solid #bee5eb; color: #0c5460; padding: 20px; border-radius: 10px; margin: 25px 0; font-size: 0.95em;">
                            📂 <strong>Buscando en:</strong> <br>
                            <code style="background: rgba(255,255,255,0.8); padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">../image/calendario/calendario-escolar.pdf</code>
                        </div>

                        <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                            <p style="margin: 0 0 15px 0; font-weight: bold; text-align: center;">📋 Pasos para solucionarlo:</p>
                            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li><strong>Descarga el PDF:</strong> Ve al <a href="https://www.unacar.mx/control_escolar/calendario.html" target="_blank" style="color: #2196F3; text-decoration: none;">sitio oficial de UNACAR ↗</a></li>
                                <li><strong>Crea las carpetas:</strong> Desde tu carpeta del proyecto, crea <code>image/calendario/</code></li>
                                <li><strong>Guarda el archivo:</strong> Coloca el PDF como <code>calendario-escolar.pdf</code></li>
                                <li><strong>Verifica la ruta:</strong> La estructura debe ser correcta</li>
                            </ol>
                        </div>

                        <div style="margin-top: 30px;">
                            <a href="https://www.unacar.mx/control_escolar/calendario.html" target="_blank" 
                               style="display: inline-block; padding: 15px 25px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; margin: 0 10px; font-family: inherit; font-weight: 500;">
                                📥 Descargar PDF
                            </a>
                            <button onclick="location.reload()" style="padding: 15px 25px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-weight: 500;">
                                🔄 Verificar de Nuevo
                            </button>
                        </div>
                        
                        <div style="margin-top: 25px; font-size: 0.85em; color: #666; font-style: italic;">
                            💡 Tip: Asegúrate de que XAMPP esté ejecutándose y que las rutas sean correctas
                        </div>
                    </div>
                `;
            } else {
                errorContent = `
                    <div style="padding: 50px; text-align: center; color: #333; font-family: 'Poppins', Arial, sans-serif; line-height: 1.7;">
                        <div style="font-size: 5em; margin-bottom: 25px;">❌</div>
                        <h2 style="color: #d32f2f; margin-bottom: 20px; font-size: 1.5em;">Error Técnico Inesperado</h2>
                        <p style="margin-bottom: 20px;">Ha ocurrido un problema durante la carga del calendario.</p>
                        
                        <details style="margin: 25px 0; text-align: left; max-width: 700px; margin-left: auto; margin-right: auto; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
                            <summary style="cursor: pointer; font-weight: bold; padding: 15px; text-align: center; color: #1976D2; border-bottom: 1px solid #dee2e6;">
                                🔧 Ver Información Técnica
                            </summary>
                            <div style="padding: 20px; font-family: 'Courier New', monospace; font-size: 0.8em; background: #ffffff; margin: 0; word-break: break-all; color: #666; line-height: 1.4;">
                                <strong>Mensaje de Error:</strong><br>
                                ${error.message}<br><br>
                                ${error.stack ? `<strong>Stack Trace:</strong><br>${error.stack.replace(/\n/g, '<br>')}` : ''}
                            </div>
                        </details>

                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 20px; border-radius: 10px; margin: 25px 0; max-width: 500px; margin-left: auto; margin-right: auto;">
                            <p style="margin: 0; font-size: 0.9em;">
                                <strong>💡 Sugerencias:</strong><br>
                                • Verifica la consola del navegador (F12)<br>
                                • Asegúrate de que XAMPP esté funcionando<br>
                                • Prueba recargar la página<br>
                                • Verifica que el archivo PDF exista
                            </p>
                        </div>

                        <button onclick="location.reload()" style="padding: 15px 30px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 500;">
                            🔄 Intentar de Nuevo
                        </button>
                    </div>
                `;
            }

            mapElement.innerHTML = errorContent;
        }
    }
}

// Función para manejar atajos de teclado
function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        // Solo funcionar si el mapa está activo o enfocado
        if (!map || !document.getElementById('map')) return;
        
        const mapContainer = document.getElementById('map');
        const isMapFocused = mapContainer.contains(document.activeElement) || 
                            document.activeElement === document.body;

        if (isMapFocused) {
            switch(e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    if (!isFlying && map.getZoom() < map.getMaxZoom()) {
                        isFlying = true;
                        map.setZoom(map.getZoom() + 0.5);
                        setTimeout(() => { isFlying = false; }, 250);
                    }
                    break;
                case '-':
                    e.preventDefault();
                    if (!isFlying && map.getZoom() > map.getMinZoom()) {
                        isFlying = true;
                        map.setZoom(map.getZoom() - 0.5);
                        setTimeout(() => { isFlying = false; }, 250);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    if (!isFlying && map) {
                        isFlying = true;
                        map.fitBounds([[0, 0], [map._canvas?.height || 1000, map._canvas?.width || 1000]], { 
                            padding: [15, 15], 
                            animate: true 
                        });
                        setTimeout(() => { isFlying = false; }, 600);
                    }
                    break;
            }
        }
    });
}

// Inicializar cuando todo esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    
    
    
    initializePDFMap().then(() => {
        setupKeyboardControls();
        
        
    }).catch((error) => {
        console.error("Error fatal en la inicialización:", error);
    });
});