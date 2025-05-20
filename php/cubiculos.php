<?php
ob_start(); // Inicia el búfer de salida
session_start();
$allowed = ['alumno']; // Solo acceso alumnos
if (!isset($_SESSION['alumno']) || 
    !isset($_SESSION['alumno']['tipo']) || 
    !in_array($_SESSION['alumno']['tipo'], $allowed)) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a alumnos. Redirigiendo...";
    header("Refresh: 1; URL=iniciosesion.php");
    exit();
}
ob_end_flush(); // Libera el búfer y envía la salida
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Cubículos de Profesores</title>
    <link rel="icon"  href="../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../css/cubiculos.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header>
        <h1 id="titulo-facultad">Cubículos de Profesores</h1>
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
        <a class="btn-volver" href="mapaALUM.php">
        <i> ⇤ Volver al Mapa</i>
        </a>
    </section>

    <script>
        
        const profesores = {
            FCI: [
                { nombre: "Dr. Jose Angel Perez Rejon", edificio: "CTI", piso: "1", cubiculo: 101, horario:"7:00am-3:00pm", rol: "Profesor, Tutor", imagen: "../image/docentes/FCI/perez-rejon.jpeg"  },
                { nombre: "Dr. Ma del Rosario Vasquez Aragon", edificio: "CTI", piso: "3", cubiculo: 305, horario:"7:00am-5:00pm", rol: "Profesor", imagen: "../image/docentes/FCI/vasquez-aragon.jpg"  },
                { nombre: "Ing. Alejandra Soto Valenzuela", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/FCI/soto-valenzuela.jpeg"  },
                { nombre: "Ing. Juan Carlos Canto Rodriguez", edificio: "CTI", piso: "3", cubiculo: 302, horario:"7:00am-3:00pm", rol: "Profesor, Gestor", imagen: "../image/docentes/FCI/canto-rodriguez.jpeg"  },
                { nombre: "Lic. Chuina Estrellita Hernandez Rosado", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/FCI/hernandez-rosado.jpeg"  },
                { nombre: "Ing. Patricia Zavaleta Carrillo", edificio: "CTI", piso: "1", cubiculo: 114, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/FCI/zavaleta-carrillo.jpeg"  },
                { nombre: "Dr. Elvira Elvia Morales Turrubiates", edificio: "CTI", piso: "2", cubiculo: 202, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Ana Alberta Canepa Saenz", edificio: "CTI", piso: "2",cubiculo: 203, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Benjamin Tass Herrera ", edificio: "CTI", piso: "2",cubiculo: 204, horario:"7:00am-5:00pm", rol: "Profesor, Gestor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Carlos Roman de la Cruz Dorantes", edificio: "CTI", piso: "2", cubiculo: 208, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Gustavo Verduzco Reyes", edificio: "CTI", piso: "2",cubiculo: 209, horario:"7:00am-5:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Jose Alonso Perez Cruz", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Director FCI", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Damaris Perez Cruz", edificio: "CTI", piso: "2",cubiculo: 210, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Beatriz Herrera Sanchez ", edificio: "CTI", piso: "1",cubiculo: 115, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Fernando Sanchez Martinez", edificio: "CTI", piso: "1",cubiculo: 109, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Abril Ayala Sanchez", edificio: "CTI", piso: "3", cubiculo: 308, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Ana Alberta Canepa Saenz", edificio: "CTI", piso: "2",cubiculo: 203, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Eduardo Orbe Trujillo", edificio: "CTI", piso: "3",cubiculo: 308, horario:"7:00am-5:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Judith del Carmen Santiago Perez", edificio: "CTI", piso: "3", cubiculo: 308, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Lic. Karla Georgina Zepeda Soberanis", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Jose Felipe Cocon Suarez", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Jose Gabriel Reding Dominguez", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Saide Dariola Duran Matin", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-5:00pm", rol: "Secretaria Academica", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Lic. Cesar Guerra Guerrero", edificio: "CTI", piso: "2", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Lic. Nelly Isbael Angel Hernandez", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Reyna Luz Torres Ortiz", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Rubi Gomez Ramon", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Lic. Veronica Salvador Leon", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Secretaria", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Asuncion Cordero Garcia", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Ricardo Armando Barrera Camara", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Lic. Gabriela Orozco Jimenez", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Secretaria", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Victor Hugo Hernandez Hernandez", edificio: "CTI", piso: "3",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Edgar Javier Garcia Ocampo", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Ramon Hernandez Camara", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Jesus Alejandro Flores Hernandez", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. Juan Enrique Pedraza Rejon", edificio: "CTI", piso: "2", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Lic. Selenia Nohemi Gonzalez Carpio", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Ing. David Habib Fuque Heuan", edificio: "CTI", piso: "1",cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  },
                { nombre: "Dr. Ulises Daniel Barradas Arenas", edificio: "CTI", piso: "1", cubiculo: 1, horario:"7:00am-3:00pm", rol: "Profesor", imagen: "../image/docentes/profesor.png"  }
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

            galeria.innerHTML = '<a class="btn-volver" href="mapaALUM.php"><i >Volver al Mapa</i> </a>';

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