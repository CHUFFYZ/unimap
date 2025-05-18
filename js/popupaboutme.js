/* -----pop up para el aboutme -----------------------------------------------------------------------*/ 
function showPopup(img, name, telefono, correo, carrera, matricula) {
    document.getElementById('popup-img').src = img;
    document.getElementById('popup-name').textContent = name;
    document.getElementById('popup-matricula').textContent = 'Matrícula: ' + matricula;
    document.getElementById('popup-carrera').textContent = 'Carrera: ' + carrera;
    document.getElementById('popup-correo').textContent = 'Correo: ' + correo;
    document.getElementById('popup-telefono').textContent = 'Teléfono: ' + telefono;
    document.getElementById('popup').style.display = 'block';
  }
  function closePopup() {
    document.getElementById('popup').style.display = 'none';
  }
  