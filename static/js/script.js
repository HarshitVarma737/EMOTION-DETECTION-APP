// Get DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const resultDiv = document.getElementById('result');

const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('upload');
const captureButton = document.getElementById('capture');

// Webcam setup
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Webcam error:", err);
    });

// Capture from webcam
captureButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    sendImage(canvas.toDataURL());
});

// Upload image
uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = 640;
            canvas.height = 480;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            sendImage(canvas.toDataURL());
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

// Send to backend
function sendImage(base64Image) {
    fetch('/detect_emotion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Image })
    })
    .then(res => res.json())
    .then(data => {
        const emojiMap = {
            angry: "😠",
            fearful: "😨",
            disgusted: "🤢",
            sad: "😢",
            happy: "😊",
            surprised: "😲",
            neutral: "😐"
        };
        const emoji = emojiMap[data.emotion] || "❓";
        displayEmotionResult(data.emotion, emoji);
    })
    .catch(err => {
        console.error("API error:", err);
        resultDiv.innerText = "Something went wrong.";
    });
}

// VOICE FEEDBACK
// Initialize the SpeechSynthesis API
const synth = window.speechSynthesis;

// Function to speak the detected emotion
function speakEmotion(emotion) {
    const utterance = new SpeechSynthesisUtterance(emotion);
    utterance.rate = 1;      // Speed of speech
    utterance.pitch = 1;     // Pitch of the voice
    utterance.volume = 1;    // Volume (0 to 1)
    synth.speak(utterance);
}

// Function to display the result and provide voice feedback
function displayEmotionResult(emotion, emoji) {
    resultDiv.innerHTML = `<span>${emoji} Detected Emotion: <strong>${emotion}</strong></span>`;
    resultDiv.style.animation = 'popIn 0.6s ease-in-out';
    
    // Call the speakEmotion function to provide voice feedback
    speakEmotion(emotion);
}