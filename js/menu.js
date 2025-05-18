document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.getElementById('menu-toggle');
    var menuContainer = document.getElementById('menu-container');
    let scrollPosition = 0;

    function disableScroll() {
        scrollPosition = window.pageYOffset;
        document.body.classList.add('menu-no-scroll');
        document.body.style.top = `-${scrollPosition}px`;
    }

    function enableScroll() {
        document.body.classList.remove('menu-no-scroll');
        window.scrollTo(0, scrollPosition);
        document.body.style.top = '';
    }

    menuToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        if (menuContainer.classList.contains('active')) {
            menuContainer.classList.add('exit');
            setTimeout(() => {
                menuContainer.classList.remove('active');
                menuContainer.classList.remove('exit');
                enableScroll();
            }, 300);
        } else {
            disableScroll();
            menuContainer.classList.add('active');
        }
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', function (event) {
        if (!menuContainer.contains(event.target) && !menuToggle.contains(event.target)) {
            if (menuContainer.classList.contains('active')) {
                menuContainer.classList.add('exit');
                setTimeout(() => {
                    menuContainer.classList.remove('active');
                    menuContainer.classList.remove('exit');
                    enableScroll();
                }, 300);
            }
        }
    });

    // Cerrar el menú al cambiar el tamaño de la pantalla
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            if (menuContainer.classList.contains('active')) {
                menuContainer.classList.add('exit');
                setTimeout(() => {
                    menuContainer.classList.remove('active');
                    menuContainer.classList.remove('exit');
                    enableScroll();
                }, 300);
            }
        }
    });
});