// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const photoGallery = document.getElementById('photoGallery');
const toggleCameraButton = document.getElementById('toggleCameraButton');
const clearGalleryButton = document.getElementById('clearGalleryButton');

let stream = null; 
let currentFacingMode = 'environment'; // 'environment' (trasera) o 'user' (frontal)

// --- Funciones de la Cámara ---

/**
 * Abre la cámara del dispositivo.
 */
async function openCamera() {
    try {
        // Cierra cualquier stream existente antes de abrir uno nuevo
        if (stream) closeCamera(false); 

        // Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                // Usamos 'ideal' para intentar obtener la cámara actual
                facingMode: { ideal: currentFacingMode }, 
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        video.srcObject = stream;
        video.play(); 

        // Actualización de la UI
        cameraContainer.style.display = 'flex';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        toggleCameraButton.disabled = false; 

        // Ajusta el tamaño del canvas al video una vez que los metadatos se cargan
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };

        console.log(`Cámara ${currentFacingMode === 'environment' ? 'trasera' : 'frontal'} abierta.`);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        // Mostrar error específico en un alert (útil para depuración móvil)
        alert('ERROR: ' + error.name + ' - No se pudo acceder a la cámara. Revisa permisos o HTTPS.'); 
        closeCamera(true); 
    }
}

/**
 * Cierra la cámara y libera los recursos.
 * @param {boolean} resetUI - Indica si se deben restaurar los botones y UI.
 */
function closeCamera(resetUI = true) {
    if (stream) {
        // Detener todos los tracks (video, audio) del stream
        stream.getTracks().forEach(track => track.stop());
        stream = null; 
    }

    if (resetUI) {
        video.srcObject = null;
        cameraContainer.style.display = 'none';
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;
        toggleCameraButton.disabled = true;
        console.log('Cámara cerrada');
    }
}

/**
 * Cambia entre la cámara frontal ('user') y trasera ('environment').
 */
async function toggleCamera() {
    if (stream) {
        currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment'; 
        // Reabre la cámara con el nuevo modo. closeCamera(false) evita el reseteo de la UI.
        closeCamera(false); 
        await openCamera(); 
    }
}

/**
 * Toma una fotografía del frame actual del video.
 */
function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Asegurarse de que el canvas tenga el tamaño correcto antes de dibujar
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibuja el frame del video en el canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convierte el contenido del canvas a Data URL (Base64)
    const imageDataURL = canvas.toDataURL('image/png');

    // Añadir la foto a la galería
    addPhotoToGallery(imageDataURL);
}


// --- Funciones de Galería ---

/**
 * Añade una imagen (Data URL) a la galería de fotos.
 */
function addPhotoToGallery(imageDataURL) {
    // 1. Si existe, remover el mensaje de "No hay fotos"
    const currentNoPhotosMessage = document.getElementById('noPhotosMessage');
    if (currentNoPhotosMessage) {
        currentNoPhotosMessage.remove();
    }

    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';
    img.classList.add('gallery-item');

    // Insertar la nueva imagen al principio de la galería
    if (photoGallery.firstChild) {
        photoGallery.insertBefore(img, photoGallery.firstChild);
    } else {
        photoGallery.appendChild(img);
    }
}

/**
 * Limpia todos los elementos de la galería y restaura el mensaje inicial.
 */
function clearGallery() { 
    // Eliminar todos los hijos del contenedor de la galería
    photoGallery.innerHTML = '';
    
    // Restaurar el mensaje de "No hay fotos"
    const message = document.createElement('p');
    message.id = 'noPhotosMessage';
    message.textContent = 'No hay fotos aún. ¡Toma una!';
    photoGallery.appendChild(message);

    console.log('Galería de fotos limpiada.');
}


// --- Event Listeners ---

openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
toggleCameraButton.addEventListener('click', toggleCamera);
clearGalleryButton.addEventListener('click', clearGallery); // Nuevo listener para limpiar

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera(false); 
});

// Inicializar el estado del botón de cambio de cámara
toggleCameraButton.disabled = true;