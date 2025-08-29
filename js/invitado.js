function toggleGuestMode() {
    const checkbox = document.getElementById('guestMode');
    const acceptButton = document.getElementById('acceptButton');
    // Mostrar u ocultar el botón "Aceptar" según el estado del toggle
    if (checkbox.checked) {
        acceptButton.style.display = 'inline-block';
    } else {
        acceptButton.style.display = 'none';
    }
  }
  
  function redirectToGuest() {
    // Redirige a la página para invitados
    window.location.href = "../../index.html";
  }