const constraints = {
    video: {
      facingMode: 'environment', // Back camera
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };
  
  async function handleScanButton() {
    try {
      // Check if HTTPS is being used
      if (!window.isSecureContext) {
        alert('Please ensure the site is using HTTPS to access the camera.');
        return;
      }
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      document.body.appendChild(video);
  
      // Add a button to capture the image
      const captureButton = document.createElement('button');
      captureButton.textContent = 'Scatta Foto';
      captureButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        font-size: 1rem;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
      `;
      document.body.appendChild(captureButton);
  
      captureButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
  
        // Save the image to the Dexie database
        db.lyrics.add({
          title: 'Scanned Document',
          photo: imageDataUrl,
          photoType: 'image/png',
          text: 'Documento scansionato con la fotocamera.'
        }).then(() => {
          alert('Foto scansionata e salvata con successo!');
        }).catch(error => {
          alert('Errore durante il salvataggio.');
          console.error('Database save error:', error);
        });
  
        // Stop the video
        video.srcObject.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
        document.body.removeChild(captureButton);
      });
    } catch (error) {
      alert(`Errore: ${error.message}`);
      console.error('Camera error:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const scanButton = document.getElementById('scan-button');
    if (scanButton) {
      scanButton.addEventListener('click', handleScanButton);
    }
  });
