// Constants for visualization
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.0;
const SCALE_RANGE = MAX_SCALE - MIN_SCALE;
const ACTIVE_SATURATION = 1.0;
const INACTIVE_SATURATION = 0.5;

let audioContext;
let analyser;
let microphone;
let isListening = false;
let visualizer;

function getVisualizer() {
    if (!visualizer) {
        visualizer = document.querySelector('siri-visualizer');
        if (!visualizer) {
            console.warn('Siri visualizer element not found');
            return null;
        }
    }
    return visualizer;
}

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
        const visualizer = getVisualizer();
        if (visualizer) {
            visualizer.setSaturation(ACTIVE_SATURATION);
        }
        
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
    let normalizedVolume = average / 255;

    // Linearly scale between 0 and 0.6
    const MAX_NORMALIZED_VOLUME = 0.4;
    if (normalizedVolume <= 0) normalizedVolume = 0;
    if (normalizedVolume >= MAX_NORMALIZED_VOLUME) normalizedVolume = 1;
    normalizedVolume = normalizedVolume * (0.5 / (MAX_NORMALIZED_VOLUME / 2));

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
    const visualizer = getVisualizer();
    if (visualizer) {
        visualizer.setSaturation(INACTIVE_SATURATION);
    }
}

function inputVolumeChanged(loudness) {
    // Ensure loudness is between 0 and 1
    loudness = Math.max(0, Math.min(1, loudness));
    
    // Calculate the scale based on loudness
    const scale = MIN_SCALE + (loudness * SCALE_RANGE);
    
    // Apply the scale to the visualizer
    const visualizer = getVisualizer();
    if (visualizer) {
        visualizer.updateScale(scale);
        visualizer.updateActiveBackgroundOpacity(loudness);
    }
}

// Wait for DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Get the visualizer element
    visualizer = getVisualizer();
    
    // Set initial saturation since microphone is initially inactive
    if (visualizer) {
        visualizer.setSaturation(INACTIVE_SATURATION);
    }
    
    // Listen for toggle events from the visualizer
    document.addEventListener('toggleMicrophone', () => {
        if (!isListening) {
            startMicrophone();
        } else {
            stopMicrophone();
        }
    });
}); 