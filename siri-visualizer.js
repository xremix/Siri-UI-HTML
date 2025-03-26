class SiriVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isListening = false;
  }

  static get observedAttributes() {
    return ["width", "height", "asset-path"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === "width" || name === "height") {
        this.updateDimensions();
      } else if (name === "asset-path") {
        this.updateAssetPaths();
      }
    }
  }

  updateAssetPaths() {
    const assetPath = this.getAttribute("asset-path") || "assets/siri-visualizer/assets";
    const images = this.shadowRoot.querySelectorAll("img");
    images.forEach(img => {
      const currentSrc = img.getAttribute("src");
      const fileName = currentSrc.split("/").pop();
      img.src = `${assetPath}/${fileName}`;
    });
  }

  updateDimensions() {
    const width = this.getAttribute("width") || "300px";
    const height = this.getAttribute("height") || "300px";
    const container = this.shadowRoot.querySelector(".voice-visualization-container");
    if (container) {
      container.style.width = width;
      container.style.height = height;
    }
  }

  record() {
    if (!this.isListening) {
      this.isListening = true;
      this.dispatchEvent(
        new CustomEvent("toggleMicrophone", {
          bubbles: true,
          composed: true,
          detail: { action: "start" }
        })
      );
    }
  }

  stop() {
    if (this.isListening) {
      this.isListening = false;
      this.dispatchEvent(
        new CustomEvent("toggleMicrophone", {
          bubbles: true,
          composed: true,
          detail: { action: "stop" }
        })
      );
    }
  }

  connectedCallback() {
    const width = this.getAttribute("width") || "300px";
    const height = this.getAttribute("height") || "300px";
    const assetPath = this.getAttribute("asset-path") || "assets/siri-visualizer/assets";

    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: ${width};
                    height: ${height};
                    --min-scale: 0.5;
                    --max-scale: 1.0;
                    --initial-scale: 0.5;
                    --layer1-scale: 1;
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
                    0% { 
                        transform: rotate(0deg) scaleX(1);
                    }
                    50% { 
                        transform: rotate(180deg) scaleX(0.8);
                    }
                    100% { 
                        transform: rotate(360deg) scaleX(1);
                    }
                }
                @keyframes rotateStrongScale {
                    0% { 
                        transform: rotate(0deg) scaleX(1);
                    }
                    50% { 
                        transform: rotate(180deg) scaleX(0.3);
                    }
                    100% { 
                        transform: rotate(360deg) scaleX(1);
                    }
                }
                @keyframes rotate3d{
                    0% { transform: rotate3d(0, 0, 0, 0deg); }
                    100% { transform: rotate3d(1, 1, 1, 360deg); }
                }
                .layer-wrapper#background-circle-active img {
                    opacity: 0;
                    transition: opacity 0.1s ease-out;
                }
                .layer-wrapper#layer-1 img {
                    animation: rotate 4s infinite linear;
                }
                .layer-wrapper#layer-2 img {
                    animation: rotate 4s infinite linear reverse;
                }
                .layer-wrapper#layer-4 img {
                    animation: rotateStrongScale 8s infinite linear;
                }
                .layer-wrapper#layer-3 img {
                    opacity: 0.7;
                    animation: rotate 6s infinite linear;
                }
            </style>
            <div class="voice-visualization-container">
                <div class="layer-wrapper" id="background-circle-active"><img src="${assetPath}/BackgroundCircle-Active.png" alt="Siri Visualizer Active Background"></div>
                <div class="layer-wrapper" id="background-circle"><img src="${assetPath}/BackgroundCircle-alt.png" alt="Siri Visualizer Layer 4"></div>
                <div class="layer-wrapper" id="layer-1"><img src="${assetPath}/Layer1.png" alt="Siri Visualizer Layer 1"></div>
                <div class="layer-wrapper" id="layer-2"><img src="${assetPath}/Layer 2.png" alt="Siri Visualizer Layer 2"></div> 
                <div class="layer-wrapper" id="layer-4"><img src="${assetPath}/Layer 4.png" alt="Siri Visualizer Layer 4"></div> 
                <div class="layer-wrapper" id="layer-3"><img src="${assetPath}/Layer 3.png" alt="Siri Visualizer Layer 3"></div> 
                <div class="layer-wrapper" id="layer-5"><img src="${assetPath}/Layer 5.png" alt="Siri Visualizer Layer 5"></div> 
            </div>
        `;
  }

  setSaturation(value) {
    const container = this.shadowRoot.querySelector(
      ".voice-visualization-container"
    );
    container.style.filter = `saturate(${value})`;
  }

  updateScale(scale) {
    const layers = this.shadowRoot.querySelectorAll(".layer-wrapper");
    layers.forEach((layer) => {
      layer.style.setProperty("--initial-scale", scale);
    });
  }

  updateActiveBackgroundOpacity(volume) {
    const activeBackground = this.shadowRoot.querySelector("#background-circle-active img");
    if (activeBackground) {
      // Convert volume to opacity (assuming volume is between 0 and 1)
      const opacity = Math.min(Math.max(volume, 0), 1);
      activeBackground.style.opacity = opacity;
    }
  }
}

customElements.define("siri-visualizer", SiriVisualizer);
