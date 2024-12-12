// Wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  
  // Reference to the Scan button in the "aggiungi.html" page
  const scanButton = document.getElementById('scan-button'); // Ensure your scan button has this ID
  const outputImage = document.createElement('img'); // To display scanned image if needed
  
  scanButton.addEventListener('click', async () => {
    try {
      console.log('Scan button clicked. Accessing the camera...');
      
      // Request access to the user's camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Create video element to preview the camera
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.setAttribute('playsinline', true);
      videoElement.play();

      // Show video stream to the user for scanning
      document.body.appendChild(videoElement); // Display the video on the page
      
      // Wait 3 seconds before taking the snapshot
      setTimeout(async () => {
        console.log('Taking snapshot...');
        
        // Create a canvas to capture the frame from the video
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Stop the video stream
        videoElement.pause();
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.remove();

        // Extract image data from the canvas
        const imageData = canvas.toDataURL('image/png');

        // Use OpenCV to process the image
        const processedImage = await processImageWithOpenCV(imageData);

        // Extract text using Tesseract.js
        const extractedText = await extractTextWithTesseract(processedImage);

        // **Show Extracted Text in a Popup**
        alert(`Extracted Text: \n\n${extractedText}`);

        // **Highlight the Extracted Text on the Image**
        displayTextOnImage(processedImage, extractedText);
        
      }, 3000); // Wait for 3 seconds to capture the frame
    } catch (error) {
      console.error('Error during scan:', error);
    }
  });

  /**
   * Function to process the image using OpenCV.
   * This will convert the image to grayscale, increase the contrast, and detect edges.
   * 
   * @param {string} imageDataURL - The base64 image URL captured from the canvas.
   * @returns {string} - The processed image in base64 format.
   */
  async function processImageWithOpenCV(imageDataURL) {
    return new Promise((resolve, reject) => {
      // Create an image element from the captured image
      const img = new Image();
      img.src = imageDataURL;

      img.onload = () => {
        // Create an OpenCV Mat object
        const src = cv.imread(img);
        const gray = new cv.Mat();
        const blurred = new cv.Mat();
        const edges = new cv.Mat();

        try {
          // Convert the image to grayscale
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

          // Apply Gaussian Blur to reduce noise
          cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

          // Detect edges using Canny edge detection
          cv.Canny(blurred, edges, 75, 200);

          // Save the result back into an image
          const canvas = document.createElement('canvas');
          cv.imshow(canvas, edges);
          const base64Data = canvas.toDataURL('image/png');

          // Clean up memory
          src.delete();
          gray.delete();
          blurred.delete();
          edges.delete();

          resolve(base64Data);
        } catch (error) {
          reject('Error processing image with OpenCV:', error);
        }
      };

      img.onerror = (error) => {
        reject('Error loading image:', error);
      };
    });
  }

  /**
   * Function to extract text using Tesseract.js.
   * 
   * @param {string} imageDataURL - The base64 image URL processed by OpenCV.
   * @returns {Promise<string>} - Extracted text from the image.
   */
  async function extractTextWithTesseract(imageDataURL) {
    try {
      const result = await Tesseract.recognize(imageDataURL, 'eng', {
        logger: (m) => console.log(m.progress ? `Progress: ${m.progress * 100}%` : '')
      });

      console.log('Tesseract result:', result.data.text);
      return result.data.text;
    } catch (error) {
      console.error('Error extracting text with Tesseract:', error);
      return 'Error extracting text';
    }
  }

  /**
   * Function to highlight extracted text on the image.
   * This will overlay the extracted text on the image.
   * 
   * @param {string} imageDataURL - The base64 image URL.
   * @param {string} extractedText - The extracted text to be displayed.
   */
  function displayTextOnImage(imageDataURL, extractedText) {
    const img = new Image();
    img.src = imageDataURL;
    img.style.maxWidth = '100%';
    img.style.border = '2px solid #00FF00'; // Highlight border around image

    // Wait for image to load
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw the original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw the extracted text on the image
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // Highlighted text color
      ctx.fillText(extractedText, 10, 30); // Position text at (10, 30)

      // Add the canvas to the page
      document.body.appendChild(canvas);
    };
  }
});
