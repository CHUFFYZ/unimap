// Configuración de PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        
        let pdfDoc = null,
            pageNum = 1,
            pageRendering = false,
            pageNumPending = null,
            scale = 1.5,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        
        // URL del PDF (usa una URL CORS-enabled)
        const url = 'https://www.unacar.mx/control_escolar/Documentos/calendario_escolar/2024-2025/TE_MEDIO_SUPERIOR.pdf';
        
        // Cargar el documento PDF
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('pageCount').textContent = pdfDoc.numPages;
            
            // Renderizar la primera página
            renderPage(pageNum);
        });
        
        function renderPage(num) {
            pageRendering = true;
            
            pdfDoc.getPage(num).then(function(page) {
                const viewport = page.getViewport({scale: scale});
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Renderizar contexto de la página
                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                
                const renderTask = page.render(renderContext);
                
                renderTask.promise.then(function() {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                    
                    // Actualizar contador de página
                    document.getElementById('pageNum').textContent = 
                        `Página ${num} de ${pdfDoc.numPages}`;
                });
            });
        }
        
        // Controladores de botones
        document.getElementById('prev').addEventListener('click', function() {
            if (pageNum <= 1) return;
            pageNum--;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('next').addEventListener('click', function() {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('zoomIn').addEventListener('click', function() {
            scale += 0.25;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('zoomOut').addEventListener('click', function() {
            if (scale <= 0.5) return;
            scale -= 0.25;
            queueRenderPage(pageNum);
        });
        
        document.getElementById('fitWidth').addEventListener('click', function() {
            // Obtener ancho del contenedor y ajustar escala
            const containerWidth = document.getElementById('viewerContainer').clientWidth;
            pdfDoc.getPage(pageNum).then(function(page) {
                const viewport = page.getViewport({scale: 1});
                scale = (containerWidth - 20) / viewport.width;
                queueRenderPage(pageNum);
            });
        });
        
        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }