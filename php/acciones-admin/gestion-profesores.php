<?php
ob_start(); // Inicia el búfer de salida
session_start();
$allowed = ['administrativo']; // Solo acceso administrativo
if (!isset($_SESSION['admin']) || 
    !isset($_SESSION['admin']['tipo']) || 
    !in_array($_SESSION['admin']['tipo'], $allowed)) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acceso restringido a administrativos. Redirigiendo...";
    header("Refresh: 1; URL=../sesionADMIN.php");
    exit();
}

// Generate CSRF token if not set
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

ob_end_flush(); // Libera el búfer y envía la salida

require_once '../../DB-coneccion.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Profesores - UNIMAP</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="icon" href="../../image/LogoBlanco1.webp" type="image/webp"/>
    <link rel="stylesheet" href="../../css/gestion-alumnos.css">
</head>
<body>
    <header class="welcome-header">
        <div>
            <h2>Bienvenido Administrativo</h2>
            <h4>Modificacion/Eliminacion</h4>
            <p>Sistema de Gestión de Profesores - UNIMAP</p>
        </div>
        <div class="log">
            <img src="../../image/LogoBlanco.webp" alt="Logo Universidad">
        </div>
    </header>

    <div class="container">
        <div class="section">
            <a href="altas-profesores.php" class="btn-secondary"><i class="fas fa-arrow-left"></i> Regresar</a>
        </div>

        <?php if(isset($_SESSION['error'])): ?>
            <div class="error-message"><?= htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
        <?php endif; ?>
        <?php if(isset($_SESSION['success'])): ?>
            <div class="success-message"><?= htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?></div>
        <?php endif; ?>

        <!-- Baja de Alumnos -->
        <div class="section">
            <h2>Baja de Profesores</h2>
            <!-- Baja Individual -->
            <form id="deleteForm" method="POST" action="backend/eliminar-profesor.php" class="excel-form">
                <div class="form-group">
                    <label for="matricula_delete">Matrícula:</label>
                    <input type="number" id="matricula_delete" name="matricula_delete" required>
                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
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
                                <td>********</td>
                                <td><?= htmlspecialchars($_SESSION['delete_info']['telefono']) ?></td>
                                <td><?= htmlspecialchars($_SESSION['delete_info']['email']) ?></td>
                                <td>
                                    <form method="POST" action="backend/confirmar-eliminar-profesor.php">
                                        <input type="hidden" name="matricula" value="<?= $_SESSION['delete_info']['matricula'] ?>">
                                        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
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
                    <h3>Profesores Seleccionados para Eliminar</h3>
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
                    <h3>Todos los Profesores</h3>
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
                            $stmt = $pdo->query("SELECT matricula, telefono, email FROM Profesores");
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
            </div>
        </div>

        <div class="section">
            <h2>Consulta y Modificación</h2>
            <button class="btn-secondary" onclick="cancelModifications()">Cancelar</button>
            <div class="table-container">
                <table id="studentsTable">
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
                        <?php
                        $stmt = $pdo->query("SELECT matricula, telefono, email FROM profesores");
                        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                            echo "<tr data-matricula='{$row['matricula']}'>
                                <td class='matricula'>{$row['matricula']}</td>
                                <td class='contrasena'>********</td>
                                <td class='telefono'>{$row['telefono']}</td>
                                <td class='email'>{$row['email']}</td>
                                <td><button class='btn-primary modify-row'><i class='fas fa-pencil-alt'></i> Modificar</button></td>
                            </tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>

        let selectedForDelete = [];

        function toggleBulkDelete() {
            const section = document.getElementById('bulkDeleteSection');
            section.classList.toggle('active');
        }

        function attachDeleteListeners() {
            document.querySelectorAll('.mark-delete').forEach(btn => {
                btn.removeEventListener('click', handleDelete); 
                btn.addEventListener('click', handleDelete);
            });
        }

        function handleDelete() {
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
        }

        document.getElementById('selectedDelete').addEventListener('click', function(e) {
            const btn = e.target.closest('.remove-delete');
            if (!btn) return;

            const row = btn.closest('tr');
            const matricula = row.dataset.matricula;
            selectedForDelete = selectedForDelete.filter(m => m !== matricula);

            const allStudentsTable = document.getElementById('allStudentsDelete').querySelector('tbody');
            allStudentsTable.innerHTML += `
                <tr data-matricula="${matricula}">
                    <td>${row.cells[0].textContent}</td>
                    <td>${row.cells[1].textContent}</td>
                    <td>${row.cells[2].textContent}</td>
                    <td><button class="btn-delete mark-delete"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
            row.remove();
            attachDeleteListeners(); 
        });

        function confirmBulkDelete() {
            if (selectedForDelete.length === 0) {
                alert('No hay profesores seleccionados para eliminar');
                return;
            }
            if (confirm('¿Está seguro de eliminar los profesores seleccionados?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'backend/eliminar-masivo-profesor.php';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'matriculas';
                input.value = JSON.stringify(selectedForDelete);
                form.appendChild(input);
                // Add CSRF token
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                csrfInput.value = '<?= htmlspecialchars($_SESSION['csrf_token']) ?>';
                form.appendChild(csrfInput);
                document.body.appendChild(form);
                form.submit();
            }
        }

        function cancelBulkDelete() {
            const selectedTable = document.getElementById('selectedDelete');
            const allStudentsTable = document.getElementById('allStudentsDelete').querySelector('tbody');

            selectedForDelete.forEach(matricula => {
                const row = selectedTable.querySelector(`tr[data-matricula="${matricula}"]`);
                if (row) {
                    allStudentsTable.innerHTML += `
                        <tr data-matricula="${matricula}">
                            <td>${row.cells[0].textContent}</td>
                            <td>${row.cells[1].textContent}</td>
                            <td>${row.cells[2].textContent}</td>
                            <td><button class="btn-delete mark-delete"><i class="fas fa-trash"></i></button></td>
                        </tr>
                    `;
                }
            });

            selectedForDelete = [];
            selectedTable.innerHTML = '';
            toggleBulkDelete();
            attachDeleteListeners(); 
        }

        attachDeleteListeners();

        let originalData = null;
        let modifyingRow = null;

        function toggleModify(row) {
            if (modifyingRow && modifyingRow !== row) {
                resetRow(modifyingRow);
            }

            modifyingRow = row;
            const matricula = row.dataset.matricula;
            originalData = {
                matricula: row.cells[0].textContent,
                telefono: row.cells[2].textContent,
                email: row.cells[3].textContent
            };

            row.cells[0].innerHTML = `<input type="number" value="${row.cells[0].textContent}" readonly>`;
            row.cells[1].innerHTML = `<input type="text" placeholder="Nueva contraseña (opcional, mín. 8 caracteres, letras y números)">`;
            row.cells[2].innerHTML = `<input type="tel" value="${row.cells[2].textContent}">`;
            row.cells[3].innerHTML = `<input type="email" value="${row.cells[3].textContent}">`;
            row.cells[4].innerHTML = `<button class='btn-primary save-row'><i class='fas fa-save'></i> Guardar</button>`;
        }

        function resetRow(row) {
            row.cells[0].innerHTML = row.dataset.matricula;
            row.cells[1].innerHTML = '********';
            row.cells[2].innerHTML = originalData.telefono;
            row.cells[3].innerHTML = originalData.email;
            row.cells[4].innerHTML = `<button class='btn-primary modify-row'><i class='fas fa-pencil-alt'></i> Modificar</button>`;
            modifyingRow = null;
            originalData = null;
        }

        function saveModifications(row) {
            const contrasena = row.cells[1].querySelector('input').value;
            if (contrasena && (contrasena.length < 8 || !/[A-Za-z]/.test(contrasena) || !/[0-9]/.test(contrasena))) {
                alert('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.');
                return;
            }

            const modifiedData = {
                matricula: row.cells[0].querySelector('input').value,
                contrasena: contrasena,
                telefono: row.cells[2].querySelector('input').value,
                email: row.cells[3].querySelector('input').value
            };

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'backend/modificar-profesor.php';
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'profesor';
            input.value = JSON.stringify(modifiedData);
            form.appendChild(input);
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = '<?= htmlspecialchars($_SESSION['csrf_token']) ?>';
            form.appendChild(csrfInput);
            document.body.appendChild(form);
            form.submit();
        }

        function cancelModifications() {
            if (modifyingRow) {
                resetRow(modifyingRow);
            }
        }

        document.getElementById('studentsTable').addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;

            const row = btn.closest('tr');
            if (btn.classList.contains('modify-row')) {
                toggleModify(row);
            } else if (btn.classList.contains('save-row')) {
                saveModifications(row);
            }
        });
    </script>
</body>
</html>