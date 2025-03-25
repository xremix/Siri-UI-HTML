class SiriVisualizer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isListening = false;
    }

    static get observedAttributes() {
        return ['width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateDimensions();
        }
    }

    updateDimensions() {
        const width = this.getAttribute('width') || '300px';
        const height = this.getAttribute('height') || '300px';
        this.shadowRoot.querySelector('.voice-visualization-container').style.width = width;
        this.shadowRoot.querySelector('.voice-visualization-container').style.height = height;
    }

    connectedCallback() {
        const width = this.getAttribute('width') || '300px';
        const height = this.getAttribute('height') || '300px';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: ${width};
                    height: ${height};
                    --min-scale: 0.6;
                    --max-scale: 1.0;
                    --initial-scale: 0.6;
                    --layer1-scale: 1.3;
                }
                .voice-visualization-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }
                .layer-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(var(--initial-scale));
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease-out;
                }
                img {
                    position: absolute;
                    max-width: 100%;
                    height: auto;
                }
                @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .layer-wrapper:nth-child(1) img {
                    transform: scale(var(--layer1-scale));
                }
                .layer-wrapper:nth-child(2) img {
                    animation: rotate 4s infinite linear;
                }
                .layer-wrapper:nth-child(3) img {
                    animation: rotate 4s infinite linear reverse;
                }
                .layer-wrapper:nth-child(4) img {
                    animation: rotate 5s infinite linear;
                }
                .layer-wrapper:nth-child(5) img {
                    animation: rotate 6s infinite linear;
                }
            </style>
            <div class="voice-visualization-container">
                <div class="layer-wrapper"><img src="assets/BackgroundCircle-alt.png" alt="Siri Visualizer Layer 4"></div>
                <div class="layer-wrapper"><img src="assets/Layer1.png" alt="Siri Visualizer Layer 1"></div>
                <div class="layer-wrapper"><img src="assets/Layer 2.png" alt="Siri Visualizer Layer 2"></div> 
                <div class="layer-wrapper"><img src="assets/Layer 4.png" alt="Siri Visualizer Layer 4"></div> 
                <div class="layer-wrapper"><img src="assets/Layer 3.png" alt="Siri Visualizer Layer 3"></div> 
            </div>
        `;

        // Add click event listener
        const container = this.shadowRoot.querySelector('.voice-visualization-container');
        container.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toggleMicrophone', {
                bubbles: true,
                composed: true
            }));
        });
    }

    setSaturation(value) {
        const container = this.shadowRoot.querySelector('.voice-visualization-container');
        container.style.filter = `saturate(${value})`;
    }

    updateScale(scale) {
        const layers = this.shadowRoot.querySelectorAll('.layer-wrapper');
        layers.forEach(layer => {
            layer.style.setProperty('--initial-scale', scale);
        });
    }
}

customElements.define('siri-visualizer', SiriVisualizer); 