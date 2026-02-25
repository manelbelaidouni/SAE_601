/**
 * VoronoiApp Class
 * Handles the logic for importing coordinates, generating Voronoi diagrams, 
 * and exporting the results.
 */
class VoronoiApp {
    constructor() {
        // Only run UI logic if we are in a browser environment with a document
        if (typeof document === 'undefined') return;
        // UI Elements
        this.fileInput = document.getElementById('fileInput');
        this.fileNameDisplay = document.getElementById('fileNameDisplay');
        this.exportSvgBtn = document.getElementById('exportSvgBtn');
        this.exportPngBtn = document.getElementById('exportPngBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.container = document.getElementById('voronoi-container');

        // State
        this.points = [];
        this.currentSvg = null;
        this.colorScheme = d3.schemeTableau10;

        this.init();
    }

    /**
     * Initialize event listeners
     */
    init() {
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.exportSvgBtn.addEventListener('click', () => this.exportToSvg());
        this.exportPngBtn.addEventListener('click', () => this.exportToPng());
        this.clearBtn.addEventListener('click', () => this.clear());

        // Handle window resize to ensure diagram remains centered/fitted
        window.addEventListener('resize', this.debounce(() => {
            if (this.points.length > 0) this.render();
        }, 200));
    }

    /**
     * Debounce utility
     */
    debounce(fn, ms) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), ms);
        };
    }

    /**
     * Resets the application state
     */
    clear() {
        this.points = [];
        this.currentSvg = null;
        this.container.innerHTML = '<div class="placeholder-msg"><p>Importez un fichier .txt pour commencer</p></div>';
        this.container.classList.add('empty-state');
        this.fileInput.value = '';
        this.fileNameDisplay.textContent = 'Aucun fichier';
        this.toggleButtons(false);
    }

    /**
     * Handles file selection and reading
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.fileNameDisplay.textContent = file.name;

        try {
            const text = await file.text();
            this.points = this.parsePoints(text);

            if (this.points.length >= 2) {
                this.render();
                this.toggleButtons(true);
            } else {
                throw new Error("Le fichier doit contenir au moins 2 points valides.");
            }
        } catch (error) {
            alert(`Erreur : ${error.message}`);
            this.clear();
        }
    }

    /**
     * Parses the CSV-like text into an array of coordinate pairs
     */
    parsePoints(text) {
        return text.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.includes(','))
            .map(line => {
                const [x, y] = line.split(',').map(val => parseFloat(val));
                return [x, y];
            })
            .filter(([x, y]) => !isNaN(x) && !isNaN(y));
    }

    /**
     * Renders the Voronoi diagram using D3.js
     */
    render() {
        this.container.innerHTML = '';
        this.container.classList.remove('empty-state');

        // Calculate bounds with padding
        const pad = 20;
        const xMin = d3.min(this.points, d => d[0]) - pad;
        const xMax = d3.max(this.points, d => d[0]) + pad;
        const yMin = d3.min(this.points, d => d[1]) - pad;
        const yMax = d3.max(this.points, d => d[1]) + pad;

        const width = xMax - xMin;
        const height = yMax - yMin;

        // Create SVG with responsive viewBox
        const svg = d3.select('#voronoi-container')
            .append('svg')
            .attr('viewBox', `${xMin} ${yMin} ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        this.currentSvg = svg.node();

        // Calculate Delaunay and Voronoi
        const delaunay = d3.Delaunay.from(this.points);
        const voronoi = delaunay.voronoi([xMin, yMin, xMax, yMax]);

        // Render cells
        const cells = svg.append('g')
            .attr('class', 'cells')
            .selectAll('path')
            .data(this.points)
            .enter()
            .append('path')
            .attr('d', (d, i) => voronoi.renderCell(i))
            .attr('fill', (d, i) => this.colorScheme[i % 10])
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('opacity', 0.85)
            .on('mouseover', function () {
                d3.select(this).attr('opacity', 1).attr('stroke-width', 2);
            })
            .on('mouseout', function () {
                d3.select(this).attr('opacity', 0.85).attr('stroke-width', 1);
            });

        // Render points
        svg.append('g')
            .attr('class', 'points')
            .selectAll('circle')
            .data(this.points)
            .enter()
            .append('circle')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('r', 1.5)
            .attr('fill', '#1e293b');
    }

    /**
     * Enables or disables export and clear buttons
     */
    toggleButtons(enabled) {
        this.exportSvgBtn.disabled = !enabled;
        this.exportPngBtn.disabled = !enabled;
        this.clearBtn.disabled = !enabled;
    }

    /**
     * Exports current SVG to a file with optimized dimensions (1000x1000)
     */
    exportToSvg() {
        if (!this.currentSvg) return;

        // Clone to avoid modifying the UI version
        const svgClone = this.currentSvg.cloneNode(true);
        svgClone.setAttribute('width', '1000');
        svgClone.setAttribute('height', '1000');

        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        this.download(svgUrl, "diagramme-voronoi.svg");
    }

    /**
     * Exports current SVG to a PNG file with HD resolution (2000x2000)
     */
    exportToPng() {
        if (!this.currentSvg) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // High Resolution 2000x2000 for ideal visualization
        canvas.width = 2000;
        canvas.height = 2000;

        const img = new Image();
        const svgData = new XMLSerializer().serializeToString(this.currentSvg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, 2000, 2000);

            const pngUrl = canvas.toDataURL("image/png");
            this.download(pngUrl, "diagramme-voronoi.png");
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    /**
     * Helper to trigger a file download
     */
    download(url, filename) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Export for tests and browser
if (typeof window !== 'undefined') {
    window.VoronoiApp = VoronoiApp;
}

// Standard Browser instantiation (skip if in Vitest)
if (typeof document !== 'undefined' && !window.__VITEST__) {
    const startApp = () => {
        // Prevent instantiation if required elements are missing (safety for various loading states)
        if (!document.getElementById('fileInput')) return;

        if (!window.voronoiAppInstance) {
            window.voronoiAppInstance = new VoronoiApp();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
}