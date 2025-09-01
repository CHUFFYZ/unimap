<?php
ob_start();
session_start();

// Configurar logging para depuración
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php_errors.log');

// Registrar datos de sesión para depuración
error_log("Session data on perfil-usuario.php: " . print_r($_SESSION, true));
error_log("Session ID: " . session_id());
error_log("Cookie lifetime: " . ini_get('session.cookie_lifetime'));

$allowed = ['alumno'];

if (!isset($_SESSION['alumno'])) {
    error_log("Session 'alumno' not set");
    $error = "Sesión no iniciada.";
} elseif (!isset($_SESSION['alumno']['tipo']) || !in_array($_SESSION['alumno']['tipo'], $allowed)) {
    error_log("Invalid or missing 'tipo': " . ($_SESSION['alumno']['tipo'] ?? 'not set'));
    $error = "Acceso restringido a alumnos.";
} elseif (!isset($_SESSION['alumno']['nombre']) || !isset($_SESSION['alumno']['apellido'])) {
    error_log("Missing 'nombre' or 'apellido'");
    $error = "Datos de usuario incompletos.";
} elseif (!isset($_SESSION['alumno']['session_expiry']) || time() > $_SESSION['alumno']['session_expiry']) {
    error_log("Session expired or 'session_expiry' not set. Current time: " . time() . ", Expiry: " . ($_SESSION['alumno']['session_expiry'] ?? 'not set'));
    $error = "Sesión expirada.";
}

if (isset($error)) {
    session_unset();
    session_destroy();
    header("HTTP/1.1 403 Forbidden");
    echo $error . " Redirigiendo...";
    header("Refresh: 1; URL=../sesion-alumn.php");
    exit();
}

// Obtener datos del usuario desde la sesión y la base de datos
$matricula = $_SESSION['alumno']['matricula'];
$userData = null;
$dbError = null;

try {
    // Conexión a la base de datos
    $databasePath = '../../../DB/usuarios.db';
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener datos del usuario
    $stmt = $pdo->prepare("SELECT matricula, nombre, apellido, telefono, email, contrasena FROM alumnos WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        // Si no hay datos de la BD, usar valores por defecto
        $userData = [
            'telefono' => 'No disponible',
            'email' => 'No disponible',
            'contrasena' => null
        ];
        error_log("No user data found for matricula: $matricula");
    }

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    $dbError = "Error técnico. No se pudieron cargar algunos datos.";
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    $dbError = $e->getMessage();
}

// Manejo de imagen de usuario
$imageExtension = 'webp';
$imagePath = "../../../image/usuarios/$matricula/{$matricula}user.$imageExtension";
$defaultImage = "../../../image/usuarios/user-unknown/user.webp";
$displayImage = file_exists($imagePath) ? $imagePath : $defaultImage;

// Procesar cambio de imagen
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['user_image'])) {
    $uploadDir = "../../../image/usuarios/$matricula/";
    $targetFile = $uploadDir . "{$matricula}user";

    // Crear directorio si no existe
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            error_log("Failed to create directory: $uploadDir");
            $uploadError = "Error al crear el directorio para la imagen.";
            $uploadOk = 0;
        } else {
            $uploadOk = 1;
        }
    } else {
        $uploadOk = 1;
    }

    $imageFileType = strtolower(pathinfo($_FILES["user_image"]["name"], PATHINFO_EXTENSION));

    // Verificar si es una imagen real
    $check = getimagesize($_FILES["user_image"]["tmp_name"]);
    if ($check === false) {
        error_log("File is not an image: " . $_FILES["user_image"]["tmp_name"]);
        $uploadError = "El archivo no es una imagen.";
        $uploadOk = 0;
    }

    // Verificar tamaño del archivo
    if ($_FILES["user_image"]["size"] > 5000000) { // 5MB
        error_log("File too large: " . $_FILES["user_image"]["size"]);
        $uploadError = "El archivo es muy grande. Máximo 5MB.";
        $uploadOk = 0;
    }

    // Permitir ciertos formatos
    $allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($imageFileType, $allowedFormats)) {
        error_log("Invalid file format: $imageFileType");
        $uploadError = "Solo se permiten archivos JPG, JPEG, PNG y WEBP.";
        $uploadOk = 0;
    }

    if ($uploadOk == 1) {
        // Determinar si WebP es soportado
        $useWebP = function_exists('imagewebp') && in_array($imageFileType, ['jpg', 'jpeg', 'png']);
        error_log("WebP support: " . ($useWebP ? "enabled" : "disabled"));
        $targetExtension = $useWebP ? 'webp' : $imageFileType;
        $targetFile .= '.' . $targetExtension;

        // Procesar la imagen
        $sourceImage = null;
        switch ($imageFileType) {
            case 'jpg':
            case 'jpeg':
                if (function_exists('imagecreatefromjpeg')) {
                    $sourceImage = imagecreatefromjpeg($_FILES["user_image"]["tmp_name"]);
                } else {
                    error_log("imagecreatefromjpeg not available");
                    $uploadError = "Formato JPEG no soportado por el servidor.";
                    $uploadOk = 0;
                }
                break;
            case 'png':
                if (function_exists('imagecreatefrompng')) {
                    $sourceImage = imagecreatefrompng($_FILES["user_image"]["tmp_name"]);
                } else {
                    error_log("imagecreatefrompng not available");
                    $uploadError = "Formato PNG no soportado por el servidor.";
                    $uploadOk = 0;
                }
                break;
            case 'webp':
                if (function_exists('imagecreatefromwebp')) {
                    $sourceImage = imagecreatefromwebp($_FILES["user_image"]["tmp_name"]);
                } else {
                    error_log("imagecreatefromwebp not available");
                    $uploadError = "Formato WEBP no soportado por el servidor.";
                    $uploadOk = 0;
                }
                break;
        }

        if ($sourceImage && $uploadOk == 1) {
            if ($useWebP) {
                // Convertir a WebP si es soportado
                if (imagewebp($sourceImage, $targetFile, 80)) {
                    $uploadSuccess = "Imagen actualizada correctamente.";
                    $imageExtension = 'webp';
                } else {
                    error_log("Failed to save WebP image: $targetFile");
                    $uploadError = "Error al guardar la imagen en formato WebP.";
                }
            } else {
                // Guardar en el formato original
                switch ($imageFileType) {
                    case 'jpg':
                    case 'jpeg':
                        $saved = function_exists('imagejpeg') ? imagejpeg($sourceImage, $targetFile, 80) : false;
                        break;
                    case 'png':
                        $saved = function_exists('imagepng') ? imagepng($sourceImage, $targetFile) : false;
                        break;
                    case 'webp':
                        $saved = copy($_FILES["user_image"]["tmp_name"], $targetFile);
                        break;
                }
                if (isset($saved) && $saved) {
                    $uploadSuccess = "Imagen actualizada correctamente.";
                    $imageExtension = $imageFileType;
                } else {
                    error_log("Failed to save image in original format: $targetFile");
                    $uploadError = "Error al guardar la imagen. Formato no soportado por el servidor.";
                }
            }
            imagedestroy($sourceImage);
            $displayImage = $targetFile;
        } else if ($uploadOk == 1) {
            error_log("Failed to process image: $imageFileType");
            $uploadError = "Error al procesar la imagen. Formato no soportado por el servidor.";
        }
    }
}

ob_end_flush();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIMAP - Perfil de Usuario</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap">
    <link rel="icon" href="../image/iconos/logo/LogoBlanco1.svg" type="image/webp"/>
    <link rel="stylesheet" href="../../../css/usuario.css">
</head>
<body>
    <button class="back-button" onclick="window.history.back()">Regresar</button>
    <div class="container">
        <h1>Perfil de Usuario</h1>
        <p>Aquí puedes ver y gestionar tu información personal en UNIMAP.</p>

        <?php if (isset($uploadError)): ?>
        <div class="error-box">
            <p><strong>Error:</strong> <?php echo htmlspecialchars($uploadError); ?></p>
        </div>
        <?php endif; ?>

        <?php if (isset($uploadSuccess)): ?>
        <div class="success-box">
            <p><strong>Éxito:</strong> <?php echo htmlspecialchars($uploadSuccess); ?></p>
        </div>
        <?php endif; ?>

        <?php if ($dbError): ?>
        <div class="error-box">
            <p><strong>Error:</strong> <?php echo htmlspecialchars($dbError); ?></p>
        </div>
        <?php endif; ?>

        <div class="profile-container">
            <!-- Sección de imagen de usuario -->
            <div class="profile-image-section">
                <h2>Imagen de Perfil</h2>
                <div class="image-container">
                    <div class="user-image" onclick="openImageModal()">
                        <img src="<?php echo htmlspecialchars($displayImage); ?>" alt="Imagen de usuario" id="profileImage">
                        <div class="image-overlay">
                            <span>Click para ampliar</span>
                        </div>
                    </div>
                    <button class="change-image-btn" onclick="openImageUpload()">Cambiar Imagen</button>
                </div>
            </div>

            <!-- Sección de información personal -->
            <div class="profile-section">
                <h2>Información Personal</h2>
                <div class="field-group">
                    <div class="field">
                        <label>Matrícula:</label>
                        <div class="field-value">
                            <span id="matricula"><?php echo htmlspecialchars($_SESSION['alumno']['matricula']); ?></span>
                        </div>
                    </div>
                    <div class="field">
                        <label>Nombre:</label>
                        <div class="field-value">
                            <span id="nombre"><?php echo htmlspecialchars($_SESSION['alumno']['nombre']); ?></span>
                        </div>
                    </div>
                    <div class="field">
                        <label>Apellido:</label>
                        <div class="field-value">
                            <span id="apellido"><?php echo htmlspecialchars($_SESSION['alumno']['apellido']); ?></span>
                        </div>
                    </div>
                    <div class="field">
                        <label>Teléfono:</label>
                        <div class="field-value">
                            <span id="telefono"><?php echo htmlspecialchars($userData['telefono'] ?? 'No disponible'); ?></span>
                        </div>
                    </div>
                    <div class="field">
                        <label>Email:</label>
                        <div class="field-value">
                            <span id="email"><?php echo htmlspecialchars($userData['email'] ?? 'No disponible'); ?></span>
                        </div>
                    </div>
                    <div class="field password-field">
                        <label>Contraseña:</label>
                        <div class="field-value password-container">
                            <button class="change-password-btn" onclick="redirectToChangePassword()">Cambiar Contraseña</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="info-box">
            <p><strong>¿Necesitas actualizar tu información?</strong></p>
            <p>Contáctanos enviando un correo a <a href="mailto:soporte@unacar.mx">soporte@unacar.mx</a> con los datos que deseas modificar. ¡Estamos aquí para ayudarte!</p>
        </div>

        <div class="footer" id="footer-date">
            UNIMAP ©
        </div>
    </div>

    <!-- Modal para ampliar imagen -->
    <div class="modal" id="image-modal">
        <div class="modal-content">
            <button class="close-button" onclick="closeImageModal()">✖</button>
            <img id="modal-image" src="" alt="Imagen ampliada">
        </div>
    </div>

    <!-- Modal para cambiar imagen -->
    <div class="modal" id="upload-modal">
        <div class="modal-content upload-content">
            <button class="close-button" onclick="closeUploadModal()">✖</button>
            <h3>Cambiar Imagen de Perfil</h3>
            <form method="post" enctype="multipart/form-data" id="imageUploadForm">
                <div class="upload-area">
                    <input type="file" name="user_image" id="user_image" accept="image/*" required>
                    <label for="user_image">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Click para seleccionar imagen</span>
                        <small>Formatos: JPG, PNG, WEBP (máx. 5MB)</small>
                    </label>
                </div>
                <div class="upload-buttons">
                    <button type="button" onclick="closeUploadModal()" class="cancel-btn">Cancelar</button>
                    <button type="submit" class="upload-btn">Subir Imagen</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Actualizar año en el footer
        const footerElement = document.getElementById('footer-date');
        const currentYear = new Date().getFullYear();
        footerElement.innerHTML = `UNIMAP © ${currentYear}`;

        function redirectToChangePassword() {
            window.location.href = '/cambiar-contrasena.php';
        }

        // Funciones para manejo de modales
        function openImageModal() {
            const modal = document.getElementById('image-modal');
            const modalImage = document.getElementById('modal-image');
            const profileImage = document.getElementById('profileImage');
            modalImage.src = profileImage.src;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeImageModal() {
            const modal = document.getElementById('image-modal');
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        function openImageUpload() {
            const modal = document.getElementById('upload-modal');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeUploadModal() {
            const modal = document.getElementById('upload-modal');
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        // Asegurar que los modales estén ocultos al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            const imageModal = document.getElementById('image-modal');
            const uploadModal = document.getElementById('upload-modal');
            imageModal.classList.remove('show');
            uploadModal.classList.remove('show');

            // Cerrar modales al hacer clic fuera
            imageModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeImageModal();
                }
            });

            uploadModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeUploadModal();
                }
            });

            // Preview de imagen seleccionada
            document.getElementById('user_image').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const label = e.target.nextElementSibling;
                    label.querySelector('span').textContent = file.name;
                }
            });
        });
    </script>
</body>
</html>