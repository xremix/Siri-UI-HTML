// Constants for visualization
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.0;
const SCALE_RANGE = MAX_SCALE - MIN_SCALE;
const ACTIVE_SATURATION = 1.0;
const INACTIVE_SATURATION = 0.3;

let audioContext;
let analyser;
let microphone;
let isListening = false;

async function startMicrophone() {
    try {
        // Create audio context and analyser
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        // Start analyzing audio
        isListening = true;
        
        // Restore full saturation when microphone is active
        const container = document.querySelector('.voice-visualization-container');
        container.style.filter = `saturate(${ACTIVE_SATURATION})`;
        
        analyzeAudio();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please ensure you have granted microphone permissions.');
    }
}

function analyzeAudio() {
    if (!isListening) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    // Normalize to 0-1 range
    const normalizedVolume = average / 255;
    
    // Apply the volume to the visualization
    inputVolumeChanged(normalizedVolume);
    
    // Continue analyzing
    requestAnimationFrame(analyzeAudio);
}

function stopMicrophone() {
    if (microphone) {
        microphone.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    isListening = false;
    
    // Decrease saturation of the core container when microphone is inactive
    const container = document.querySelector('.voice-visualization-container');
    container.style.filter = `saturate(${INACTIVE_SATURATION})`;
}

function inputVolumeChanged(loudness) {
    // Ensure loudness is between 0 and 1
    loudness = Math.max(0, Math.min(1, loudness));
    
    // Calculate the scale based on loudness
    const scale = MIN_SCALE + (loudness * SCALE_RANGE);
    
    // Apply the scale to each layer using CSS variable
    const layers = document.querySelectorAll('.voice-visualization-container .layer-wrapper');
    layers.forEach(layer => {
        layer.style.setProperty('--initial-scale', scale);
    });
}

// Wait for DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.voice-visualization-container');
    
    // Set initial saturation since microphone is initially inactive
    container.style.filter = `saturate(${INACTIVE_SATURATION})`;
    
    // Add click event listener to the container
    container.addEventListener('click', () => {
        if (!isListening) {
            startMicrophone();
        } else {
            stopMicrophone();
        }
    });
}); 