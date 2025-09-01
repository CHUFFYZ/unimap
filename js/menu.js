document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const menuToggle = document.getElementById('menu-toggle');
    const menuContainer = document.getElementById('menu-container');
    const usuarioToggle = document.getElementById('usuario-toggle');
    const menuUsuario = document.getElementById('menu-usuario');
    
    // Estado del menú
    let currentMenu = null;
    let isAnimating = false;
    let scrollPosition = 0;

    // Funciones de utilidad
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

    function closeMenu(menu, callback) {
        if (!menu || !menu.classList.contains('active') || isAnimating) return;
        
        isAnimating = true;
        menu.classList.add('exit');
        
        setTimeout(() => {
            menu.classList.remove('active', 'exit');
            enableScroll();
            if (currentMenu === menu) currentMenu = null;
            isAnimating = false;
            if (callback) callback();
        }, 300);
    }

    function openMenu(menu) {
        if (isAnimating) return;
        
        // Si ya es el menú activo, no hacer nada
        if (currentMenu === menu) return;
        
        // Si hay otro menú abierto, cerrarlo primero
        if (currentMenu) {
            closeMenu(currentMenu, () => {
                disableScroll();
                menu.classList.add('active');
                currentMenu = menu;
            });
        } else {
            disableScroll();
            menu.classList.add('active');
            currentMenu = menu;
        }
    }

    // Configuración de eventos para menu-toggle
    menuToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        
        if (menuContainer.classList.contains('active')) {
            closeMenu(menuContainer);
        } else {
            openMenu(menuContainer);
        }
    });

    // Configuración especial para usuario-toggle
    usuarioToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        
        if (menuUsuario.classList.contains('active')) {
            closeMenu(menuUsuario);
        } else {
            // Forzar la apertura después de cerrar cualquier otro menú
            if (currentMenu && currentMenu !== menuUsuario) {
                closeMenu(currentMenu, () => {
                    openMenu(menuUsuario);
                });
            } else {
                openMenu(menuUsuario);
            }
        }
    });

    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!currentMenu || isAnimating) return;
        
        const clickedInsideMenu = currentMenu.contains(event.target);
        const clickedOnToggle = event.target === menuToggle || event.target === usuarioToggle;
        const clickedOnToggleChild = menuToggle.contains(event.target) || usuarioToggle.contains(event.target);
        
        if (!clickedInsideMenu && !clickedOnToggle && !clickedOnToggleChild) {
            closeMenu(currentMenu);
        }
    });

    // Cerrar menús al redimensionar
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && currentMenu) {
            closeMenu(currentMenu);
        }
    });
});