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
let currentFacingMode = 'environment'; 


async function openCamera() {
    try {
        if (stream) closeCamera(false); 

        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode }, 
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        video.srcObject = stream;
        video.play(); 

        cameraContainer.style.display = 'flex';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        toggleCameraButton.disabled = false; 

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };

        console.log(`Cámara ${currentFacingMode === 'environment' ? 'trasera' : 'frontal'} abierta.`);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
        closeCamera(true); 
    }
}

 {boolean} resetUI 
 
function closeCamera(resetUI = true) {
    if (stream) {
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

async function toggleCamera() {
    if (stream) {
        currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment'; // Cambia el modo
        await openCamera(); 
    }
}



function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataURL = canvas.toDataURL('image/png');

    addPhotoToGallery(imageDataURL);
}

 {string} imageDataURL // Data URL de la imagen capturada

function addPhotoToGallery(imageDataURL) {
    const currentNoPhotosMessage = document.getElementById('noPhotosMessage');
    if (currentNoPhotosMessage) {
        currentNoPhotosMessage.remove();
    }

    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';
    img.classList.add('gallery-item');

    if (photoGallery.firstChild) {
        photoGallery.insertBefore(img, photoGallery.firstChild);
    } else {
        photoGallery.appendChild(img);
    }
}


function clearGallery() { 
    photoGallery.innerHTML = '';
    
    const message = document.createElement('p');
    message.id = 'noPhotosMessage';
    message.textContent = 'No hay fotos aún. ¡Toma una!';
    photoGallery.appendChild(message);

    console.log('Galería de fotos limpiada.');
}



openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
toggleCameraButton.addEventListener('click', toggleCamera);
clearGalleryButton.addEventListener('click', clearGallery); 

window.addEventListener('beforeunload', () => {
    closeCamera(false); 
});

toggleCameraButton.disabled = true;