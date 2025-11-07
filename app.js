// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el Canvas
const photoGallery = document.getElementById('photoGallery');
const noPhotosMessage = document.getElementById('noPhotosMessage');
const toggleCameraButton = document.getElementById('toggleCameraButton');

let stream = null; // Variable para almacenar el MediaStream de la cámara
let currentFacingMode = 'environment'; // 'environment' (trasera) o 'user' (frontal)

// --- Funciones de la Cámara ---

/**
 * Abre la cámara del dispositivo.
 */
async function openCamera() {
    try {
        // Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode }, // Solicita la cámara actual
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        // Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Asignar el Stream al Elemento <video>
        video.srcObject = stream;
        video.play(); // Asegurarse de que el video se reproduzca

        // Actualización de la UI
        cameraContainer.style.display = 'flex'; // Mostrar el contenedor de la cámara
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        toggleCameraButton.disabled = false; // Habilitar el botón de cambio de cámara

        console.log(`Cámara ${currentFacingMode === 'environment' ? 'trasera' : 'frontal'} abierta exitosamente`);

        // Ajustar el tamaño del canvas al video para asegurar la captura correcta
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos o verifica si hay una cámara disponible.');
        closeCamera(); // Asegurarse de cerrar si hubo un error
    }
}

/**
 * Toma una fotografía del frame actual del video y la añade a la galería.
 */
function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Asegurarse de que el canvas tenga el tamaño correcto antes de dibujar
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el Frame de Video en el Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Conversión a Data URL
    const imageDataURL = canvas.toDataURL('image/png');

    // (Opcional) Visualización y Depuración
    console.log('Foto capturada en base64 (longitud):', imageDataURL.length, 'caracteres');

    // Añadir la foto a la galería
    addPhotoToGallery(imageDataURL);
}

/**
 * Cierra la cámara y libera los recursos.
 */
function closeCamera() {
    if (stream) {
        // Detener todos los tracks del stream (video, audio, etc.)
        stream.getTracks().forEach(track => track.stop());
        stream = null; // Limpiar la referencia

        // Limpiar y ocultar UI
        video.srcObject = null;
        cameraContainer.style.display = 'none'; // Ocultar el contenedor de la cámara

        // Restaurar el botón 'Abrir Cámara'
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;
        toggleCameraButton.disabled = true; // Deshabilitar el botón de cambio de cámara

        console.log('Cámara cerrada');
    }
}

/**
 * Cambia entre la cámara frontal y trasera.
 */
async function toggleCamera() {
    if (stream) {
        closeCamera(); // Cierra la cámara actual
        currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment'; // Cambia el modo
        await openCamera(); // Abre la cámara con el nuevo modo
    } else {
        alert('La cámara no está abierta para poder cambiarla.');
    }
}

// --- Galería de Fotos ---

/**
 * Añade una imagen (Data URL) a la galería de fotos.
 * @param {string} imageDataURL - La URL de datos de la imagen en base64.
 */
function addPhotoToGallery(imageDataURL) {
    // Eliminar el mensaje de "No hay fotos" si existe
    if (noPhotosMessage) {
        noPhotosMessage.remove();
    }

    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';
    img.classList.add('gallery-item'); // Añadir clase para estilos

    // Insertar la nueva imagen al principio de la galería
    // Esto asegura que las fotos más recientes aparezcan primero
    if (photoGallery.firstChild) {
        photoGallery.insertBefore(img, photoGallery.firstChild);
    } else {
        photoGallery.appendChild(img);
    }
}

// --- Event Listeners y Limpieza ---

// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
toggleCameraButton.addEventListener('click', toggleCamera); // Listener para el botón de cambio de cámara

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera();
});

// Inicializar el estado del botón de cambio de cámara
toggleCameraButton.disabled = true;

 if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registrado con éxito:', registration);
                    })
                    .catch(error => {
                        console.error('Fallo el registro del Service Worker:', error);
                    });
            });
        }

// hacer una galeria de fotos tomadas y mostrarlar debajo del canvas de forma temporal sin borrar la foto anterior
// teniendo un scroll horizontal si hay muchas fotos
//esto utlizando el canvas con la url temporal de la foto tomada
// agregar el boton para cambiar a camara frontal y trasera