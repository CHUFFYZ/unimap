document.addEventListener('DOMContentLoaded', () => {
    const languageSelector = document.getElementById('languageSelector');
    let currentTranslations = {}; // Variable para almacenar las traducciones del idioma actual

    // Función para cargar dinámicamente el archivo de idioma
    const loadTranslations = async (lang) => {
        try {
            // Eliminar el script de traducción anterior si existe
            const oldScript = document.getElementById('translations-script');
            if (oldScript) {
                oldScript.remove();
            }

            // Crear un nuevo elemento script
            const script = document.createElement('script');
            script.src = `../js/idiomas/${lang}.js`; // Ruta a tu archivo de traducción
            script.id = 'translations-script'; // Le damos un ID para poder eliminarlo después
            script.onload = () => {
                // Cuando el script se carga, la variable de traducción global estará disponible
                // Asignar el objeto de traducción correcto a currentTranslations
                switch (lang) {
                    case 'es':
                        currentTranslations = translations_es;
                        break;
                    case 'en':
                        currentTranslations = translations_en;
                        break;
                    case 'fr': // Si agregas más idiomas, inclúyelos aquí
                        currentTranslations = translations_fr;
                        break;
                    default:
                        currentTranslations = translations_es; // Fallback
                }
                applyTranslations(); // Aplicar las traducciones una vez cargadas
            };
            script.onerror = () => {
                console.error(`Error al cargar el archivo de traducción para ${lang}. Asegúrate de que el archivo 'js/translations/${lang}.js' existe y está bien formado.`);
                currentTranslations = translations_es; // Fallback a español si falla la carga
                applyTranslations();
            };
            document.head.appendChild(script); // Añadir el script al <head>
        } catch (error) {
            console.error("Error general al cargar las traducciones:", error);
            currentTranslations = translations_es; // Fallback
            applyTranslations();
        }
    };

    // Función para aplicar las traducciones a los elementos HTML
    const applyTranslations = () => {
        document.documentElement.lang = localStorage.getItem('selectedLanguage') || 'es'; // Actualiza el atributo lang del HTML

        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (currentTranslations && currentTranslations[key]) {
                element.innerHTML = currentTranslations[key]; // Usamos innerHTML para permitir entidades HTML
            }
        });
    };

    // Al cargar la página:
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es'; // Obtiene el idioma guardado o 'es'
    if (languageSelector) {
        languageSelector.value = savedLanguage; // Establece el selector al idioma guardado
        languageSelector.addEventListener('change', (event) => {
            const newLang = event.target.value;
            localStorage.setItem('selectedLanguage', newLang); // Guarda el nuevo idioma

            // --- ¡AQUÍ ESTÁ EL CAMBIO CLAVE! ---
            window.location.reload(); // Recarga la página completa
            // --- FIN DEL CAMBIO ---
        });
    }

    // Carga las traducciones iniciales (esto se ejecutará cada vez que la página se recargue)
    loadTranslations(savedLanguage);
});