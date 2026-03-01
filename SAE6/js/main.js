(function bootstrapApp() {
  /** @type {HTMLInputElement} */
  const fileInput = document.getElementById("fileInput");
  /** @type {HTMLButtonElement} */
  const computeBtn = document.getElementById("computeBtn");
  /** @type {HTMLButtonElement} */
  const downloadPngBtn = document.getElementById("downloadPngBtn");
  /** @type {HTMLButtonElement} */
  const downloadSvgBtn = document.getElementById("downloadSvgBtn");
  /** @type {HTMLParagraphElement} */
  const statusMessage = document.getElementById("statusMessage");
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("voronoiCanvas");

  const renderer = new window.CanvasVoronoiRenderer(canvas);
  let loadedFileContent = "";

  fileInput.addEventListener("change", async () => {
    clearStatus();
    const file = fileInput.files?.[0];
    if (!file) {
      loadedFileContent = "";
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setStatus("Seuls les fichiers .txt sont acceptés.", true);
      loadedFileContent = "";
      return;
    }

    try {
      loadedFileContent = await file.text();
      setStatus(`Fichier chargé: ${file.name}`);
    } catch (error) {
      loadedFileContent = "";
      setStatus(`Erreur de lecture du fichier: ${String(error)}`, true);
    }
  });

  computeBtn.addEventListener("click", () => {
    clearStatus();
    if (!loadedFileContent) {
      setStatus("Chargez d'abord un fichier .txt valide.", true);
      return;
    }

    const { points, errors } = window.parsePointsFromText(loadedFileContent);
    if (errors.length > 0) {
      setStatus(errors.join(" "), true);
      return;
    }

    if (points.length < 2) {
      setStatus("Au moins deux points sont nécessaires pour un diagramme pertinent.", true);
      return;
    }

    const bounds = window.computeBoundsFromPoints(points);
    const diagram = window.VoronoiEngine.compute(points, bounds);
    renderer.render(diagram, bounds);
    downloadPngBtn.disabled = false;
    downloadSvgBtn.disabled = false;
    setStatus(`Diagramme généré pour ${points.length} points.`);
  });

  downloadPngBtn.addEventListener("click", () => {
    renderer.downloadPNG();
  });

  downloadSvgBtn.addEventListener("click", () => {
    renderer.downloadSVG();
  });

  /**
   * @param {string} message
   * @param {boolean} [isError=false]
   */
  function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("status--error", isError);
  }

  function clearStatus() {
    setStatus("", false);
  }
}());
