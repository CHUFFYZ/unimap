<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIMAP - Ayuda</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap">
    <link rel="icon" href="../image/iconos/logo/LogoBlanco1.svg" type="image/webp"/>
    <link rel="stylesheet" href="../../../css/ayuda.css">
    
</head>
<body>
    <button class="back-button" onclick="window.history.back()">Regresar</button>
    <div class="container">
        <h1>Ayuda con UNIMAP</h1>
        <p>¿Tienes problemas con UNIMAP? ¡Estamos aquí para ayudarte! Envíanos un correo a <a href="mailto:example@gmail.com">example@gmail.com</a> y te responderemos lo antes posible.</p>
        
        <h2>Cómo usar el mapa interactivo</h2>
        <p>A continuación, te explicamos paso a paso cómo funciona el mapa interactivo de UNIMAP y todas las acciones que puedes realizar:</p>
        
        <div class="steps-container" id="steps-container">
            <div class="step">
                <h3>Paso 1: Acceso al mapa</h3>
                <p>Ingresa al módulo de mapas desde la página principal de UNIMAP. Asegúrate de tener una conexión a internet estable para cargar el contenido.</p>
                <img class="step-image" src="../../../image/ayuda/invitado/index.png" alt="Acceso al mapa" onclick="openModal('../../../image/ayuda/invitado/index.png')">
            </div>
            <div class="step">
                <h3>Paso 2: Navegación en el mapa</h3>
                <p>Usa los controles de zoom (+/-) en la esquina superior izquierda para acercar o alejar la vista. También puedes usar la rueda del ratón para ajustar el zoom.</p>
                <img class="step-image" src="../image/sample2.jpg" alt="Controles de zoom" onclick="openModal('../image/sample2.jpg')">
            </div>
            <div class="step">
                <h3>Paso 3: Desplazamiento</h3>
                <p>Haz clic y arrastra el mapa para moverte por diferentes áreas. Esto te permite explorar todas las secciones del mapa interactivo.</p>
            </div>
            <div class="step">
                <h3>Paso 4: Vista completa</h3>
                <p>Presiona el botón de "Vista completa" (ícono de casa) para restablecer el mapa a su vista inicial y ver todo el contenido de una sola vez.</p>
                <img class="step-image" src="../image/sample3.jpg" alt="Vista completa" onclick="openModal('../image/sample3.jpg')">
            </div>
            <div class="step">
                <h3>Paso 5: Información adicional</h3>
                <p>Haz clic en el botón de información (ícono "ℹ️") para ver detalles sobre los controles y atajos de teclado disponibles.</p>
            </div>
            <div class="step">
                <h3>Paso 6: Atajos de teclado</h3>
                <p>Usa los siguientes atajos para una navegación más rápida:</p>
                <ul>
                    <li><strong>+</strong> o <strong>=</strong>: Acercar el zoom</li>
                    <li><strong>-</strong>: Alejar el zoom</li>
                    <li><strong>Inicio</strong>: Restablecer a la vista completa</li>
                </ul>
            </div>
            <!-- Puedes agregar más pasos aquí con o sin imágenes y el diseño se adaptará automáticamente -->
        </div>

        <h2>Galería de imágenes</h2>
        <p>Haz clic en cualquier imagen para verla en detalle. Usa el botón de cerrar para regresar.</p>
        <div class="images-container" id="images-container">
            <div class="image-card" onclick="openModal('../image/sample1.jpg')">
                <img src="../image/sample1.jpg" alt="Mapa interactivo">
                <p>Vista del mapa interactivo</p>
            </div>
            <div class="image-card" onclick="openModal('../image/sample2.jpg')">
                <img src="../image/sample2.jpg" alt="Controles del mapa">
                <p>Controles del mapa</p>
            </div>
            <!-- Agrega más imágenes aquí y se acomodarán automáticamente -->
        </div>

        <div class="info-box">
            <p><strong>¿Necesitas ayuda adicional?</strong></p>
            <p>Contáctanos enviando un correo a <a href="mailto:example@gmail.com">example@gmail.com</a> con una descripción detallada de tu problema. ¡Estamos listos para ayudarte!</p>
        </div>

        <div class="footer" id="footer-date">
          <!-- Universidad Autónoma del Carmen - --> UNIMAP © 
        </div>
    </div>

    <div class="modal" id="image-modal">
        <div class="modal-content">
            <button class="close-button" onclick="closeModal()">✖</button>
            <img id="modal-image" src="" alt="Imagen ampliada">
        </div>
    </div>

    <script>
        // Selecciona el elemento por su ID
        const footerElement = document.getElementById('footer-date');

        // Crea una nueva fecha y obtiene el año
        const currentYear = new Date().getFullYear();

        // Actualiza el contenido del elemento
        footerElement.innerHTML = `UNIMAP © ${currentYear}`;
    </script>
    <script>
        function openModal(imageSrc) {
            const modal = document.getElementById('image-modal');
            const modalImage = document.getElementById('modal-image');
            modalImage.src = imageSrc;
            modal.style.display = 'flex';
        }

        function closeModal() {
            const modal = document.getElementById('image-modal');
            modal.style.display = 'none';
        }

        // Cerrar modal al hacer clic fuera de la imagen
        document.getElementById('image-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    </script>
</body>
</html>