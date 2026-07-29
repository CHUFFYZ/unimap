/*--Mostrar Afi-----------------------------------------------------------------------------*/
document.getElementById("searchForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Evitar el envío normal del formulario
    const month1 = document.getElementById("month1").value;
  
    fetch(`../../back-end/afi/mostrar-afi.php?month1=${month1}`)
        .then(response => response.text())
        .then(data => {
            document.getElementById("results").innerHTML = data; // Mostrar resultados
            
            // Añadir event listeners a los enlaces de ubicación
            const locationLinks = document.querySelectorAll('.location-link-afi');
            locationLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const lat = parseFloat(this.dataset.lat);
                    const lng = parseFloat(this.dataset.lng);
                    const building = this.dataset.building;
                    const place = this.dataset.place;
                    
                    // Llamar a la función flyToLocation definida en zoom2.js
                    if (typeof flyToLocation === 'function') {
                        flyToLocation(lat, lng, building, place);
                        closePopup(); // Cerrar el popup después de hacer clic
                    } else {
                        console.error("Función flyToLocation no encontrada");
                    }
                });
            });
        })
        .catch(error => console.error("Error:", error));
});