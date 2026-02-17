document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const importFile = document.getElementById('importFile');
    const generateBtn = document.getElementById('generateBtn');
    const exportSVGBtn = document.getElementById('exportSVGBtn');
    const exportPNGBtn = document.getElementById('exportPNGBtn');
    const clearBtn = document.getElementById('clearBtn');
    const statusDiv = document.getElementById('status');

    let points = [];

    function setStatus(message) {
        statusDiv.textContent = message;
    }

    function parseFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const lines = content.split('\n');
                const parsedPoints = [];
                for (const line of lines) {
                    if (line.trim() === '') continue;
                    const parts = line.split(',');
                    if (parts.length !== 2) {
                        setStatus(`Erreur: Format invalide dans la ligne "${line}"`);
                        continue;
                    }
                    const x = parseFloat(parts[0].trim());
                    const y = parseFloat(parts[1].trim());
                    if (isNaN(x) || isNaN(y)) {
                        setStatus(`Erreur: Coordonnées invalides dans la ligne "${line}"`);
                        continue;
                    }
                    parsedPoints.push({ x, y });
                }
                resolve(parsedPoints);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    function generateVoronoi() {
        if (points.length === 0) {
            setStatus('Aucun point à afficher. Veuillez importer un fichier.');
            return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let minDistance = Infinity;
                let closestPointIndex = 0;

                for (let i = 0; i < points.length; i++) {
                    const point = points[i];
                    const currentDistance = distance({ x, y }, point);
                    if (currentDistance < minDistance) {
                        minDistance = currentDistance;
                        closestPointIndex = i;
                    }
                }

                const color = getColor(closestPointIndex);
                const index = (y * width + x) * 4;
                imageData.data[index] = color.r;
                imageData.data[index + 1] = color.g;
                imageData.data[index + 2] = color.b;
                imageData.data[index + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        ctx.fillStyle = 'black';
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function getColor(index) {
        const colors = [
            { r: 255, g: 0, b: 0 },
            { r: 0, g: 255, b: 0 },
            { r: 0, g: 0, b: 255 },
            { r: 255, g: 255, b: 0 },
            { r: 255, g: 0, b: 255 },
            { r: 0, g: 255, b: 255 },
            { r: 128, g: 0, b: 0 },
            { r: 0, g: 128, b: 0 },
            { r: 0, g: 0, b: 128 },
            { r: 128, g: 128, b: 0 },
            { r: 128, g: 0, b: 128 },
            { r: 0, g: 128, b: 128 },
        ];
        return colors[index % colors.length];
    }

    function exportSVG() {
        if (points.length === 0) {
            setStatus('Aucun point à exporter. Veuillez importer un fichier et générer le diagramme.');
            return;
        }

        let svgContent = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let minDistance = Infinity;
                let closestPointIndex = 0;

                for (let i = 0; i < points.length; i++) {
                    const point = points[i];
                    const currentDistance = distance({ x, y }, point);
                    if (currentDistance < minDistance) {
                        minDistance = currentDistance;
                        closestPointIndex = i;
                    }
                }

                const color = getColor(closestPointIndex);
                svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${color.r}, ${color.g}, ${color.b})" />`;
            }
        }

        for (const point of points) {
            svgContent += `<circle cx="${point.x}" cy="${point.y}" r="2" fill="black" />`;
        }
        svgContent += '</svg>';

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voronoi.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function exportPNG() {
        if (points.length === 0) {
            setStatus('Aucun point à exporter. Veuillez importer un fichier et générer le diagramme.');
            return;
        }

        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'voronoi.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        points = [];
        setStatus('Canvas effacé.');
    }

    importFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        parseFile(file)
            .then(parsedPoints => {
                points = parsedPoints;
                setStatus(`${points.length} points importés. Cliquez sur Générer pour afficher le diagramme.`);
            })
            .catch(error => {
                setStatus('Erreur lors de la lecture du fichier.');
                console.error(error);
            });
    });

    generateBtn.addEventListener('click', generateVoronoi);
    exportSVGBtn.addEventListener('click', exportSVG);
    exportPNGBtn.addEventListener('click', exportPNG);
    clearBtn.addEventListener('click', clearCanvas);

    window.testDistance = function() {
        console.log('Test de la fonction distance:');
        console.log(distance({ x: 0, y: 0 }, { x: 3, y: 4 })); // Devrait être 5
        console.log(distance({ x: 1, y: 1 }, { x: 1, y: 1 })); // Devrait être 0
    };

    window.testParsing = function() {
        console.log('Test de la fonction de parsing:');
        const testContent = "1,2\n3,4\n,5\n6,7\n8,\n9,10";
        const lines = testContent.split('\n');
        const parsedPoints = [];
        for (const line of lines) {
            if (line.trim() === '') continue;
            const parts = line.split(',');
            if (parts.length !== 2) {
                console.log(`Erreur: Format invalide dans la ligne "${line}"`);
                continue;
            }
            const x = parseFloat(parts[0].trim());
            const y = parseFloat(parts[1].trim());
            if (isNaN(x) || isNaN(y)) {
                console.log(`Erreur: Coordonnées invalides dans la ligne "${line}"`);
                continue;
            }
            parsedPoints.push({ x, y });
        }
        console.log(parsedPoints);
    };
});
