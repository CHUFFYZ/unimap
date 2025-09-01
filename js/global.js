
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            document.getElementById('imagenBienvenida').classList.add('fadeOut');
        }, 2000);
    });

/*-----------------*/
    const h2 = document.querySelector('.palpitante2 h2');
    function restartAnimation() {
      h2.style.animation = 'none'; 
      h2.offsetHeight; 
      h2.style.animation = 'palpitante2 8s ease-in-out forwards 3s'; 
    }
    restartAnimation();
    setInterval(restartAnimation, 20000);
/*-----------------------------*/
// Debe tener una función para mostrar/ocultar
function showPopup() {
    document.getElementById('popup-overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('popup').style.display = 'none';
}
