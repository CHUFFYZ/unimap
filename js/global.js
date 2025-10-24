
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            document.getElementById('imagenBienvenida').classList.add('fadeOut');
        }, 2000);
    });

/*-----------------*/
    const p2 = document.querySelector('.palpitante2 h2');
    const p4 = document.querySelector('.palpitante4 h2');
    function restartAnimation() {
        p2.style.animation = 'none'; 
        p2.offsetHeight; 
        p2.style.animation = 'palpitante2 8s ease-in-out forwards 3s'; 
        p4.style.animation = 'none'; 
        p4.offsetHeight; 
        p4.style.animation = 'palpitante4 8s ease-in-out forwards 3s';
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
