<?php
ob_start(); // Inicia el búfer de salida
session_start();
$allowed = ['administrativo']; // Solo acceso administrativo
if (!isset($_SESSION['admin']) || 
    !isset($_SESSION['admin']['tipo']) || 
    !in_array($_SESSION['admin']['tipo'], $allowed)) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a administrativos. Redirigiendo...";
    header("Refresh: 1; URL=sesionADMIN.php");
    exit();
}
ob_end_flush(); // Libera el búfer y envía la salida

require_once '../../DB-coneccion.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Alumnos - UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon" href="../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../../css/gestion-alumnos.css">
</head>
<body>
    <header class="welcome-header">
        <div>
            <h2>Bienvenido Administrativo</h2>
            <h4>Modificacion/Eliminacion</h4>
            <p>Sistema de Gestión de Alumnos - UNIMAP</p>
        </div>
        <div class="log">
            <img src="../image/LogoBlanco.webp" alt="Logo Universidad">
        </div>
    </header>

    <div class="container">
        <div class="section">
            <a href="altas-alumnos.php" class="btn-secondary"><i class="fas fa-arrow-left"></i> Regresar</a>
        </div>
        
        <!-- Baja de Alumnos -->
        <div class="section">
            <h2>Baja de Alumnos</h2>
            <!-- Baja Individual -->
            <form id="deleteForm" method="POST" action="backend/eliminar-alumn.php" class="excel-form">
                <div class="form-group">
                    <label for="matricula_delete">Matrícula:</label>
                    <input type="number" id="matricula_delete" name="matricula_delete" required>
                </div>
                <button type="submit" class="btn-primary">Buscar</button>
            </form>

            <!-- Resultado de Búsqueda -->
            <?php if(isset($_SESSION['delete_info'])): ?>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Contraseña</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><?= htmlspecialchars($_SESSION['delete_info']['matricula']) ?></td>
                                <td><?= htmlspecialchars($_SESSION['delete_info']['contrasena']) ?></td>
                                <td><?= htmlspecialchars($_SESSION['delete_info']['telefono']) ?></td>
                                <td><?= htmlspecialchars($_SESSION['delete_info']['email']) ?></td>
                                <td>
                                    <form method="POST" action="backend/confirmar-eliminar.php">
                                        <input type="hidden" name="matricula" value="<?= $_SESSION['delete_info']['matricula'] ?>">
                                        <button type="submit" class="btn-delete"><i class="fas fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <?php unset($_SESSION['delete_info']); ?>
            <?php endif; ?>

            <!-- Baja Masiva -->
            <button class="btn-primary" onclick="toggleBulkDelete()">Eliminar Muchos</button>
            <div class="bulk-delete-section" id="bulkDeleteSection">
                <div class="table-container">
                    <h3>Alumnos Seleccionados para Eliminar</h3>
                    <table id="deleteTable">
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="selectedDelete"></tbody>
                    </table>
                    <h3>Todos los Alumnos</h3>
                    <table id="allStudentsDelete">
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $pdo = new PDO("sqlite:../../DB/usuarios.db");
                            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                            $stmt = $pdo->query("SELECT matricula, telefono, email FROM alumnos");
                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                echo "<tr data-matricula='{$row['matricula']}'>
                                    <td>{$row['matricula']}</td>
                                    <td>{$row['telefono']}</td>
                                    <td>{$row['email']}</td>
                                    <td><button class='btn-delete mark-delete'><i class='fas fa-trash'></i></button></td>
                                </tr>";
                            }
                            ?>
                        </tbody>
                    </table>
                </div>
                <button class="btn-primary" onclick="confirmBulkDelete()">Aceptar</button>
                <button class="btn-secondary" onclick="cancelBulkDelete()">Cancelar</button>
                <button class="btn-secondary" onclick="toggleBulkDelete()">Cerrar</button>
            </div>
        </div>

        <!-- Consulta y Modificación -->
        <div class="section">
            <h2>Consulta y Modificación</h2>
            <button class="btn-primary" onclick="toggleModify()" id="modifyBtn"><i class="fas fa-pencil-alt"></i> Modificar</button>
            <div class="table-container">
                <table id="studentsTable">
                    <thead>
                        <tr>
                            <th>Matrícula</th>
                            <th>Contraseña</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $stmt = $pdo->query("SELECT matricula, contrasena, telefono, email FROM alumnos");
                        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                            echo "<tr>
                                <td class='matricula'>{$row['matricula']}</td>
                                <td class='contrasena'>{$row['contrasena']}</td>
                                <td class='telefono'>{$row['telefono']}</td>
                                <td class='email'>{$row['email']}</td>
                            </tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
            <div class="modify-section" id="modifySection">
                <button class="btn-primary" onclick="saveModifications()">Aceptar</button>
                <button class="btn-secondary" onclick="cancelModifications()">Cancelar</button>
            </div>
        </div>
    </div>

    <div class="barra">
        <p>© 2025 Universidad Autonoma del Carmen. Todos los derechos reservados.</p>
    </div>

    <script>

        // Bulk Delete Functionality
        let selectedForDelete = [];
        
        function toggleBulkDelete() {
            const section = document.getElementById('bulkDeleteSection');
            section.classList.toggle('active');
        }

        document.querySelectorAll('.mark-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const matricula = row.dataset.matricula;
                
                if (!selectedForDelete.includes(matricula)) {
                    selectedForDelete.push(matricula);
                    const selectedTable = document.getElementById('selectedDelete');
                    selectedTable.innerHTML += `
                        <tr data-matricula="${matricula}">
                            <td>${row.cells[0].textContent}</td>
                            <td>${row.cells[1].textContent}</td>
                            <td>${row.cells[2].textContent}</td>
                            <td><button class="btn-primary remove-delete"><i class="fas fa-undo"></i></button></td>
                        </tr>
                    `;
                    row.remove();
                }
            });
        });

        function confirmBulkDelete() {
            if (selectedForDelete.length === 0) {
                alert('No hay alumnos seleccionados para eliminar');
                return;
            }
            if (confirm('¿Está seguro de eliminar los alumnos seleccionados?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'backend/eliminar-masivo.php';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'matriculas';
                input.value = JSON.stringify(selectedForDelete);
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            }
        }

        function cancelBulkDelete() {
            selectedForDelete = [];
            document.getElementById('selectedDelete').innerHTML = '';
            toggleBulkDelete();
            location.reload();
        }

        // Modify Functionality
        let originalData = [];
        
        function toggleModify() {
            const section = document.getElementById('modifySection');
            const table = document.getElementById('studentsTable');
            const modifyBtn = document.getElementById('modifyBtn');
            
            section.classList.toggle('active');
            if (section.classList.contains('active')) {
                originalData = [];
                table.querySelectorAll('tbody tr').forEach(row => {
                    originalData.push({
                        matricula: row.cells[0].textContent,
                        contrasena: row.cells[1].textContent,
                        telefono: row.cells[2].textContent,
                        email: row.cells[3].textContent
                    });
                    row.cells[0].innerHTML = `<input type="number" value="${row.cells[0].textContent}" readonly>`;
                    row.cells[1].innerHTML = `<input type="text" value="${row.cells[1].textContent}">`;
                    row.cells[2].innerHTML = `<input type="tel" value="${row.cells[2].textContent}">`;
                    row.cells[3].innerHTML = `<input type="email" value="${row.cells[3].textContent}">`;
                });
                modifyBtn.innerHTML = '<i class="fas fa-eye"></i> Ver';
            } else {
                table.querySelectorAll('tbody tr').forEach((row, index) => {
                    row.cells[0].textContent = originalData[index].matricula;
                    row.cells[1].textContent = originalData[index].contrasena;
                    row.cells[2].textContent = originalData[index].telefono;
                    row.cells[3].textContent = originalData[index].email;
                });
                modifyBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Modificar';
            }
        }

        function saveModifications() {
            const modifiedData = [];
            document.getElementById('studentsTable').querySelectorAll('tbody tr').forEach(row => {
                modifiedData.push({
                    matricula: row.cells[0].querySelector('input').value,
                    contrasena: row.cells[1].querySelector('input').value,
                    telefono: row.cells[2].querySelector('input').value,
                    email: row.cells[3].querySelector('input').value
                });
            });

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'backend/modificar-alumn.php';
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'alumnos';
            input.value = JSON.stringify(modifiedData);
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }

        function cancelModifications() {
            toggleModify();
        }
    </script>
</body>
</html>