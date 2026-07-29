<?php
ob_start();
session_start();

error_log("Session data on auth.php: " . print_r($_SESSION, true));
error_log("Session ID: " . session_id());
error_log("Cookie lifetime: " . ini_get('session.cookie_lifetime'));

$allowed = ['alumno', 'profesor'];

if (!isset($_SESSION['alumno']) && !isset($_SESSION['profesor'])) {
    error_log("Neither 'alumno' nor 'profesor' session set");
    $error = "Sesión no iniciada.";
} elseif (isset($_SESSION['alumno']) && (!isset($_SESSION['alumno']['tipo']) || !in_array($_SESSION['alumno']['tipo'], $allowed))) {
    error_log("Invalid or missing 'tipo' for alumno: " . ($_SESSION['alumno']['tipo'] ?? 'not set'));
    $error = "Acceso restringido a alumnos.";
} elseif (isset($_SESSION['profesor']) && (!isset($_SESSION['profesor']['tipo']) || !in_array($_SESSION['profesor']['tipo'], $allowed))) {
    error_log("Invalid or missing 'tipo' for profesor: " . ($_SESSION['profesor']['tipo'] ?? 'not set'));
    $error = "Acceso restringido a profesores.";
} elseif (isset($_SESSION['alumno']) && (!isset($_SESSION['alumno']['nombre']) || !isset($_SESSION['alumno']['apellido']))) {
    error_log("Missing 'nombre' or 'apellido' for alumno");
    $error = "Datos de usuario incompletos.";
} elseif (isset($_SESSION['profesor']) && (!isset($_SESSION['profesor']['nombre']) || !isset($_SESSION['profesor']['apellido']))) {
    error_log("Missing 'nombre' or 'apellido' for profesor");
    $error = "Datos de usuario incompletos.";
} elseif (isset($_SESSION['alumno']) && (!isset($_SESSION['alumno']['session_expiry']) || time() > $_SESSION['alumno']['session_expiry'])) {
    error_log("Session expired or 'session_expiry' not set for alumno. Current time: " . time() . ", Expiry: " . ($_SESSION['alumno']['session_expiry'] ?? 'not set'));
    $error = "Sesión expirada.";
} elseif (isset($_SESSION['profesor']) && (!isset($_SESSION['profesor']['session_expiry']) || time() > $_SESSION['profesor']['session_expiry'])) {
    error_log("Session expired or 'session_expiry' not set for profesor. Current time: " . time() . ", Expiry: " . ($_SESSION['profesor']['session_expiry'] ?? 'not set'));
    $error = "Sesión expirada.";
}

if (isset($error)) {
    session_unset();
    session_destroy();
    header("HTTP/1.1 403 Forbidden");
    $redirect_url = isset($_SESSION['alumno']) ? '../sesion-alumn.php' : '../sesion-profe.php';
    echo $error . " Redirigiendo...";
    header("Refresh: 1; URL=$redirect_url");
    exit();
}

ob_end_flush();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIMAP - Consulta de Cubículos de Profesores</title>
    <link rel="shortcut icon" href="../../../image/iconos/logo/LogoBlanco1.svg">
    <link rel="stylesheet" href="../../../css/cubiculos.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header>
        <h1 id="titulo-facultad">Cubículos de Profesores</h1>
        <div class="log">
            <a id="logoweb" class="fl" href="cubiculos.php"><img src="../../../image/iconos/logo/unimap.webp" alt="Logo Universidad"></a>
        </div>
    </header>

    <section id="introduccion">
        <h2>Bienvenido al sistema de consulta de cubículos</h2>
        <p>
            En esta plataforma, podrás consultar la información de los profesores de las diferentes facultades de nuestra universidad. 
            Cada profesor tiene asignado un cubículo donde puedes encontrarlo durante sus horas de atención. 
            Además, algunos profesores tienen el rol de <strong>tutores</strong>, quienes brindan apoyo adicional a los estudiantes.
        </p>
        <p>
            Selecciona una facultad en el menú desplegable y haz clic en "Consultar" para ver la lista de profesores y sus detalles.
        </p>
    </section>

    <section id="seleccion-facultad">
        <div class="selector-container">
            <label for="facultad">Selecciona una facultad:</label>
            <select id="facultad">
                <option value="">-- Selecciona --</option>
                <option value="FCI">Facultad de Ciencias de la Informacion</option>
                <!--
                <option value="FCEA">Facultad de Ciencias Economico Administrativas</option>
                <option value="FQ">Facultad de Quimica</option>
                <option value="FA">Facultad de Arquitectura</option>-->
            </select>
            <button onclick="mostrarGaleria()">
                <i class="fas fa-search"></i> Consultar
            </button>
            <button onclick="recargarPagina()">
                <i class="fas fa-sync-alt"></i> Recargar
            </button>
        </div>
    </section>


    <section id="galeria" class="hidden">
        <a class="btn-volver" onclick="window.history.back()">
        <i> ⇤ Volver al Mapa</i>
        </a>
    </section>

    <script>
        
        const profesores = {
            FCI: [
                { nombre: "Dr. Jose Angel Perez Rejon", edificio: "CTI", piso: "1", cubiculo: 110, horario:"7:00am-3:00pm", rol: "Profesor, Tutor", imagen: "../../../image/docentes/FCI/perez-rejon.jpeg"  },
                { nombre: "Dr. Ma del Rosario Vasquez Aragon", edificio: "CTI", piso: "3", cubiculo: 305, horario:"9:00am-5:00pm", rol: "Profesor, Tutor", imagen: "../../../image/docentes/FCI/vasquez-aragon.jpg"  },
                { nombre: "Ing. Alejandra Soto Valenzuela", edificio: "CTI", piso: "2",cubiculo: 206, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/FCI/soto-valenzuela.jpeg"  },
                { nombre: "Ing. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "3", cubiculo: 302, horario:"7:00am-3:00pm", rol: "Profesor, Gestor", imagen: "../../../image/docentes/FCI/canto-rodriguez.jpeg"  },
                { nombre: "Lic. Chuina Estrellita Hernandez Rosado", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/FCI/hernandez-rosado.jpeg"  },
                { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "1", cubiculo: 114, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/FCI/zavaleta-carrillo.jpeg"  },
                { nombre: "Dr. Elvira Elvia Morales Turrubiates", edificio: "CTI", piso: "2", cubiculo: 202, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Ana Alberta Canepa Saenz", edificio: "CTI", piso: "2",cubiculo: 203, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Benjamin Tass Herrera ", edificio: "CTI", piso: "2",cubiculo: 204, horario:"9:00am-5:00pm", rol: "Profesor, Gestor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Carlos Roman de la Cruz Dorantes", edificio: "CTI", piso: "2", cubiculo: 208, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Gustavo Verduzco Reyes", edificio: "CTI", piso: "2",cubiculo: 209, horario:"9:00am-5:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
    /*director de facultad*/   { nombre: "Dr. Jose Alonso Perez Cruz", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Director FCI", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Damaris Perez Cruz", edificio: "CTI", piso: "2",cubiculo: 210, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Beatriz Herrera Sanchez ", edificio: "CTI", piso: "1",cubiculo: 115, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
             //   { nombre: "Ing. Fernando Sanchez Martinez", edificio: "CTI", piso: "1",cubiculo: 109, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Abril Ayala Sanchez", edificio: "CTI", piso: "3", cubiculo: 308, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Ana Alberta Canepa Saenz", edificio: "CTI", piso: "2",cubiculo: 203, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Eduardo Orbe Trujillo", edificio: "CTI", piso: "3",cubiculo: 308, horario:"9:00am-5:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Judith del Carmen Santiago Perez", edificio: "CTI", piso: "3", cubiculo: 308, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Lic. Karla Georgina Zepeda Soberanis", edificio: "CTI", piso: "2",cubiculo: 206, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Jose Felipe Cocon Suarez", edificio: "CTI", piso: "3", cubiculo: 312, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Jose Gabriel Reding Dominguez", edificio: "CTI", piso: "3",cubiculo: 310, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
            /*direccion */    { nombre: "Ing. Saide Dariola Duran Matin", edificio: "CTI", piso: "1",cubiculo: 1, horario:"9:00am-5:00pm", rol: "Secretaria Academica", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Lic. Cesar Octavio Guerra Guerrero", edificio: "CTI", piso: "2", cubiculo: 207, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
              /*sin identificar */  { nombre: "Lic. Nelly Isbael Angel Hernandez", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Reyna Luz Torres Ortiz", edificio: "CTI", piso: "1", cubiculo: 116, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Rubi Gomez Ramon", edificio: "CTI", piso: "2",cubiculo: 201, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
             /*direccion, estrellita, juan padilla */   { nombre: "Lic. Veronica Salvador Leon", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Secretaria", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Asuncion Cordero Garcia", edificio: "CTI", piso: "3", cubiculo: 313, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Ricardo Armando Barrera Camara", edificio: "CTI", piso: "1",cubiculo: 111, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
              /*secretaria direccion */  { nombre: "Lic. Gabriela Orozco Jimenez", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Secretaria", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Victor Hugo Hernandez Hernandez", edificio: "CTI", piso: "3",cubiculo: 311, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
             //   { nombre: "Ing. Edgar Javier Garcia Ocampo", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Ramon Hernandez Camara", edificio: "CTI", piso: "2", cubiculo: 206, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Jesus Alejandro Flores Hernandez", edificio: "CTI", piso: "3",cubiculo: 313, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. Juan Enrique Pedraza Rejon", edificio: "CTI", piso: "2", cubiculo: 206, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
              //  { nombre: "Lic. Selenia Nohemi Gonzalez Carpio", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Ing. David Habib Fuque Heuan", edificio: "CTI", piso: "1",cubiculo: 117, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  },
                { nombre: "Dr. Ulises Daniel Barradas Arenas", edificio: "CTI", piso: "3", cubiculo: 301, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../../../image/docentes/profesor.png"  }
                /*se agrega mas por si acaso*/
        
            ]/*,
            FCEA: [
                { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "2", cubiculo: 201, tutor: true, imagen: "../image/docentes/zavaleta-carrillo.jpeg" },
                { nombre: "Dr. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "2", cubiculo: 202, tutor: false, imagen: "../image/docentes/canto-rodriguez.jpeg" },
                { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "2", cubiculo: 201, tutor: true, imagen: "../image/docentes/zavaleta-carrillo.jpeg" },
                { nombre: "Dr. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "2", cubiculo: 202, tutor: false, imagen: "../image/docentes/canto-rodriguez.jpeg" },
                { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "2", cubiculo: 201, tutor: true, imagen: "../image/docentes/zavaleta-carrillo.jpeg" },
                { nombre: "Dr. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "2", cubiculo: 202, tutor: false, imagen: "../image/docentes/canto-rodriguez.jpeg" },
                { nombre: "F. Carlos Alberto Guerra Rodriguez", edificio: "CTI", piso: "2", cubiculo: 250, tutor: true, imagen: "../image/carlos.png" }
                
                
            ],
            FQ: [
                { nombre: "Dr. Jose Angel Perez Rejon", edificio: "CTI", piso: "1", cubiculo: 101, tutor: true, imagen: "../image/docentes/ingeniero.jpeg"  },
                { nombre: "Ing. Alejandra Soto Valenzuela", edificio: "CTI", piso: "1",cubiculo: 102, tutor: false, imagen: "../image/docentes/hernandez-rosado.jpeg"  },
                { nombre: "Dr. Jose Angel Perez Rejon", edificio: "CTI", piso: "1", cubiculo: 101, tutor: true, imagen: "../image/docentes/ingeniero.jpeg"  },
                { nombre: "Ing. Alejandra Soto Valenzuela", edificio: "CTI", piso: "1",cubiculo: 102, tutor: false, imagen: "../image/docentes/hernandez-rosado.jpeg"  },
                { nombre: "Dr. Jose Angel Perez Rejon", edificio: "CTI", piso: "1", cubiculo: 101, tutor: true, imagen: "../image/docentes/ingeniero.jpeg"  },
                { nombre: "Ing. Alejandra Soto Valenzuela", edificio: "CTI", piso: "1",cubiculo: 102, tutor: false, imagen: "../image/docentes/hernandez-rosado.jpeg"  }
                
            ],
            FA: [
            { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "2", cubiculo: 201, tutor: true, imagen: "../image/docentes/zavaleta-carrillo.jpeg" },
            { nombre: "Dr. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "2", cubiculo: 202, tutor: false, imagen: "../image/docentes/canto-rodriguez.jpeg" },
            { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "2", cubiculo: 201, tutor: true, imagen: "../image/docentes/zavaleta-carrillo.jpeg" },
            { nombre: "Dr. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "2", cubiculo: 202, tutor: false, imagen: "../image/docentes/canto-rodriguez.jpeg" },
            { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "2", cubiculo: 201, tutor: true, imagen: "../image/docentes/zavaleta-carrillo.jpeg" },
            { nombre: "Dr. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "2", cubiculo: 202, tutor: false, imagen: "../image/docentes/canto-rodriguez.jpeg" },
            ]*/
        };

        function mostrarGaleria() {
            const facultad = document.getElementById('facultad').value;
            const titulo = document.getElementById('titulo-facultad');
            const galeria = document.getElementById('galeria');
            const introduccion = document.getElementById('introduccion');

            
            titulo.textContent = `Cubículos de Profesores - ${facultad.charAt(0).toUpperCase() + facultad.slice(1)}`;

            galeria.innerHTML = '<a class="btn-volver" onclick="window.history.back()"><i >⇤ Volver al Mapa</i> </a>';

            const profesoresFacultad = profesores[facultad];

            profesoresFacultad.forEach(profesor => {
                const profesorHTML = `
                    <div class="profesor">
                        <img src="${profesor.imagen}" alt="${profesor.nombre}">
                        <div class="info">
                            <p><strong>Nombre:</strong> ${profesor.nombre}</p>
                            <p><strong>Edificio:</strong> ${profesor.edificio}</p>
                            <p><strong>Piso:</strong> ${profesor.piso}</p>
                            <p><strong>Cubículo:</strong> ${profesor.cubiculo}</p>
                            <p><strong>Horario:</strong> ${profesor.horario}</p>
                            <p><strong>Rol:</strong> ${profesor.rol}</p>
                        </div>
                    </div>
                `;
                galeria.innerHTML += profesorHTML;
            });

            // Ocultar introducción y mostrar galería
            introduccion.classList.add('hidden');
            galeria.classList.remove('hidden');
        }

        function recargarPagina() {
            location.reload();
        }

    </script>
</body>
</html>