document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const exportSvgBtn = document.getElementById('exportSvgBtn');
    const exportPngBtn = document.getElementById('exportPngBtn');
    const container = document.getElementById('voronoi-container');
    const fileLabel = document.querySelector('.file-input-wrapper label');

    let currentSvg = null;

    fileInput.addEventListener('change', handleFileUpload);
    exportSvgBtn.addEventListener('click', exportToSvg);
    exportPngBtn.addEventListener('click', exportToPng);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        fileLabel.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const points = parsePoints(text);
            if (points.length > 0) {
                generateVoronoi(points);
                exportSvgBtn.disabled = false;
                exportPngBtn.disabled = false;
            } else {
                alert("Aucun point valide trouvé dans le fichier.");
            }
        };
        reader.readAsText(file);
    }

    function parsePoints(text) {
        const lines = text.split('\n');
        const points = [];
        lines.forEach(line => {
            const parts = line.trim().split(',');
            if (parts.length === 2) {
                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);
                if (!isNaN(x) && !isNaN(y)) {
                    points.push([x, y]);
                }
            }
        });
        return points;
    }

    function generateVoronoi(points) {
        container.innerHTML = ''; // Clear previous

        // Determine bounds
        const xValues = points.map(p => p[0]);
        const yValues = points.map(p => p[1]);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);

        // Add some padding
        const padding = 20;
        const width = (maxX - minX) + padding * 2;
        const height = (maxY - minY) + padding * 2;

        // Create SVG
        const svg = d3.select('#voronoi-container')
            .append('svg')
            .attr('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`)
            .attr('width', 800) // Default display size
            .attr('height', 800 * (height / width))
            .style('background-color', 'white');

        currentSvg = svg.node();

        // Delaunay triangulation
        const delaunay = d3.Delaunay.from(points);
        const voronoi = delaunay.voronoi([minX - padding, minY - padding, maxX + padding, maxY + padding]);

        // Draw cells
        svg.append('g')
            .selectAll('path')
            .data(points.map((_, i) => voronoi.renderCell(i)))
            .join('path')
            .attr('d', d => d)
            .attr('fill', () => d3.schemeTableau10[Math.floor(Math.random() * 10)]) // Random colors
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
             .attr('opacity', 0.8);

        // Draw points
        svg.append('g')
            .selectAll('circle')
            .data(points)
            .join('circle')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('r', 2)
            .attr('fill', 'black');
    }

    function exportToSvg() {
        if (!currentSvg) return;
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(currentSvg);
        
        // Add name spaces.
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if(!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)){
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        const link = document.createElement("a");
        link.href = url;
        link.download = "voronoi.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportToPng() {
        if (!currentSvg) return;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Use the SVG's viewBox to determine the size
        const viewBox = currentSvg.viewBox.baseVal;
        const width = viewBox.width;
        const height = viewBox.height;

        // Set high resolution for PNG
        const scale = 2; 
        canvas.width = width * scale;
        canvas.height = height * scale;

        const image = new Image();
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(currentSvg);

         // Add name spaces.
         if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

        image.onload = function() {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, width * scale, height * scale);

            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = "voronoi.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        image.src = url;
    }
});
