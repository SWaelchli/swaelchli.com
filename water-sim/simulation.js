// --- Configuration ---
const CANVAS_WIDTH = 600; // Will be scaled by CSS, but determines internal resolution mapping
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 64; // 64x64 cells
const DIFFUSION_RATE = 0.9; // How quickly density spreads (0 to 1, higher spreads faster)
const MAX_DENSITY = 50; // Maximum density a cell can hold
const MIN_DENSITY_DISPLAY = 0.5; // Minimum density to start showing light blue

// --- DOM Elements ---
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const simulationSpeedSlider = document.getElementById('simulationSpeed');
const speedValueSpan = document.getElementById('speedValue');
const sourceRateSlider = document.getElementById('sourceRate');
const sourceRateValueSpan = document.getElementById('sourceRateValue');
const drainRateSlider = document.getElementById('drainRate');
const drainRateValueSpan = document.getElementById('drainRateValue');
const addSourceBtn = document.getElementById('addSourceBtn');
const removeSourceBtn = document.getElementById('removeSourceBtn');
const addDrainBtn = document.getElementById('addDrainBtn');
const removeDrainBtn = document.getElementById('removeDrainBtn');
const drawObstructionBtn = document.getElementById('drawObstructionBtn');
const eraseObstructionBtn = document.getElementById('eraseObstructionBtn');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');

// --- Simulation State ---
let grid = []; // Stores density values
let newGrid = []; // Used for calculating next state to avoid interference
let obstacles = []; // True if cell is an obstacle, false otherwise
let sources = []; // { x, y, rate }
let drains = []; // { x, y, rate }

let animationFrameId = null;
let lastUpdateTime = 0;
let simulationInterval = 50; // Initial speed in ms
let isRunning = true;

const CELL_SIZE_X = CANVAS_WIDTH / GRID_SIZE;
const CELL_SIZE_Y = CANVAS_HEIGHT / GRID_SIZE;

// Enum for current interaction mode
const InteractionMode = {
    NONE: 'none',
    ADD_SOURCE: 'add_source',
    REMOVE_SOURCE: 'remove_source',
    ADD_DRAIN: 'add_drain',
    REMOVE_DRAIN: 'remove_drain',
    DRAW_OBSTRUCTION: 'draw_obstruction',
    ERASE_OBSTRUCTION: 'erase_obstruction'
};
let currentInteractionMode = InteractionMode.NONE;

// --- Initialization ---
function initializeGrid() {
    grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    obstacles = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    sources = [];
    drains = [];

    // Add border obstructions
    for (let i = 0; i < GRID_SIZE; i++) {
        obstacles[i][0] = true; // Top border
        obstacles[i][GRID_SIZE - 1] = true; // Bottom border
        obstacles[0][i] = true; // Left border
        obstacles[GRID_SIZE - 1][i] = true; // Right border
    }
}

// --- Simulation Loop ---
function simulate(currentTime) {
    if (!isRunning) {
        animationFrameId = requestAnimationFrame(simulate);
        return;
    }

    const deltaTime = currentTime - lastUpdateTime;
    if (deltaTime >= simulationInterval) {
        updateSimulation();
        lastUpdateTime = currentTime;
    }

    drawGrid();
    animationFrameId = requestAnimationFrame(simulate);
}

function updateSimulation() {
    // 1. Apply sources and drains
    applySourcesAndDrains();

    // 2. Diffuse water
    diffuseWater();

    // 3. Clamp and apply obstacles
    applyObstaclesAndClamp();
}

function applySourcesAndDrains() {
    const currentSourceRate = parseFloat(sourceRateSlider.value);
    const currentDrainRate = parseFloat(drainRateSlider.value);

    // Apply sources
    sources.forEach(source => {
        if (!obstacles[source.y][source.x]) { // Ensure source isn't on an obstacle
            grid[source.y][source.x] = Math.min(MAX_DENSITY, grid[source.y][source.x] + currentSourceRate);
        }
    });

    // Apply drains (3x3 area)
    drains.forEach(drain => {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = drain.x + dx;
                const ny = drain.y + dy;

                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !obstacles[ny][nx]) {
                    grid[ny][nx] = Math.max(0, grid[ny][nx] - currentDrainRate);
                }
            }
        }
    });
}

function diffuseWater() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (obstacles[y][x]) {
                newGrid[y][x] = 0; // Obstacles don't hold water
                continue;
            }

            let sumNeighbors = 0;
            let numNeighbors = 0;

            // Check 4 direct neighbors (up, down, left, right)
            const neighbors = [
                { dx: 0, dy: -1 }, // Up
                { dx: 0, dy: 1 },  // Down
                { dx: -1, dy: 0 }, // Left
                { dx: 1, dy: 0 }   // Right
            ];

            neighbors.forEach(n => {
                const nx = x + n.dx;
                const ny = y + n.dy;

                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !obstacles[ny][nx]) {
                    sumNeighbors += grid[ny][nx];
                    numNeighbors++;
                }
            });

            // Calculate average density of valid neighbors
            const avgNeighborDensity = numNeighbors > 0 ? sumNeighbors / numNeighbors : grid[y][x];

            // Update current cell based on its density and neighbor average
            newGrid[y][x] = grid[y][x] + DIFFUSION_RATE * (avgNeighborDensity - grid[y][x]);
        }
    }

    // Copy newGrid to grid for the next iteration
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x] = newGrid[y][x];
        }
    }
}

function applyObstaclesAndClamp() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (obstacles[y][x]) {
                grid[y][x] = 0; // Obstacles always have zero water
            } else {
                // Clamp density between 0 and MAX_DENSITY
                grid[y][x] = Math.max(0, Math.min(MAX_DENSITY, grid[y][x]));
            }
        }
    }
}

// --- Drawing ---
function drawGrid() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const density = grid[y][x];

            if (obstacles[y][x]) {
                ctx.fillStyle = '#333'; // Obstacle color
            } else if (density > MIN_DENSITY_DISPLAY) {
                // Linear interpolation for blue shades
                const intensity = Math.min(1, density / MAX_DENSITY); // Normalize density to 0-1
                const blue = Math.floor(255 - (intensity * 255)); // Darker blue for higher intensity
                ctx.fillStyle = `rgb(${blue}, ${blue}, 255)`; // From light blue to dark blue
            } else {
                ctx.fillStyle = 'white'; // No water
            }
            ctx.fillRect(x * CELL_SIZE_X, y * CELL_SIZE_Y, CELL_SIZE_X, CELL_SIZE_Y);
        }
    }

    // Draw sources (red circles)
    sources.forEach(source => {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(source.x * CELL_SIZE_X + CELL_SIZE_X / 2, source.y * CELL_SIZE_Y + CELL_SIZE_Y / 2, CELL_SIZE_X * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    // Draw drains (green squares)
    drains.forEach(drain => {
        ctx.fillStyle = 'lime';
        ctx.fillRect(drain.x * CELL_SIZE_X, drain.y * CELL_SIZE_Y, CELL_SIZE_X, CELL_SIZE_Y);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(drain.x * CELL_SIZE_X, drain.y * CELL_SIZE_Y, CELL_SIZE_X, CELL_SIZE_Y);
    });
}

// --- Event Handlers ---
function getGridCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    const gridX = Math.floor(canvasX / CELL_SIZE_X);
    const gridY = Math.floor(canvasY / CELL_SIZE_Y);

    return { x: gridX, y: gridY };
}

canvas.addEventListener('mousedown', (event) => {
    const { x, y } = getGridCoords(event);

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return; // Out of bounds

    if (currentInteractionMode === InteractionMode.ADD_SOURCE) {
        if (!obstacles[y][x] && !sources.some(s => s.x === x && s.y === y)) {
            sources.push({ x, y });
        }
    } else if (currentInteractionMode === InteractionMode.REMOVE_SOURCE) {
        sources = sources.filter(s => !(s.x === x && s.y === y));
    } else if (currentInteractionMode === InteractionMode.ADD_DRAIN) {
        if (!obstacles[y][x] && !drains.some(d => d.x === x && d.y === y)) {
            drains.push({ x, y });
        }
    } else if (currentInteractionMode === InteractionMode.REMOVE_DRAIN) {
        drains = drains.filter(d => !(d.x === x && d.y === y));
    } else if (currentInteractionMode === InteractionMode.DRAW_OBSTRUCTION) {
        if (!isBorderCell(x, y)) {
            obstacles[y][x] = true;
            // Remove any source/drain that might be on the new obstruction
            sources = sources.filter(s => !(s.x === x && s.y === y));
            drains = drains.filter(d => !(d.x === x && d.y === y));
            grid[y][x] = 0; // Clear water from new obstruction
        }
    } else if (currentInteractionMode === InteractionMode.ERASE_OBSTRUCTION) {
        if (!isBorderCell(x, y)) {
            obstacles[y][x] = false;
        }
    }
    drawGrid(); // Update immediately on interaction
});

canvas.addEventListener('mousemove', (event) => {
    if (event.buttons === 1) { // Left mouse button is down
        const { x, y } = getGridCoords(event);

        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return; // Out of bounds

        if (currentInteractionMode === InteractionMode.DRAW_OBSTRUCTION) {
            if (!isBorderCell(x, y)) {
                obstacles[y][x] = true;
                sources = sources.filter(s => !(s.x === x && s.y === y)); // Remove source/drain
                drains = drains.filter(d => !(d.x === x && d.y === y));
                grid[y][x] = 0;
            }
        } else if (currentInteractionMode === InteractionMode.ERASE_OBSTRUCTION) {
            if (!isBorderCell(x, y)) {
                obstacles[y][x] = false;
            }
        }
        drawGrid(); // Update immediately on interaction
    }
});

function isBorderCell(x, y) {
    return x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1;
}

// --- UI Control Event Listeners ---
simulationSpeedSlider.addEventListener('input', (event) => {
    simulationInterval = 100 - parseInt(event.target.value) + 1; // Faster at higher slider value
    speedValueSpan.textContent = `${simulationInterval} ms/update`;
});

sourceRateSlider.addEventListener('input', (event) => {
    sourceRateValueSpan.textContent = `${parseFloat(event.target.value).toFixed(1)} density/tick`;
});

drainRateSlider.addEventListener('input', (event) => {
    drainRateValueSpan.textContent = `${parseFloat(event.target.value).toFixed(1)} density/tick`;
});

addSourceBtn.addEventListener('click', () => { currentInteractionMode = InteractionMode.ADD_SOURCE; highlightButton(addSourceBtn); });
removeSourceBtn.addEventListener('click', () => { currentInteractionMode = InteractionMode.REMOVE_SOURCE; highlightButton(removeSourceBtn); });
addDrainBtn.addEventListener('click', () => { currentInteractionMode = InteractionMode.ADD_DRAIN; highlightButton(addDrainBtn); });
removeDrainBtn.addEventListener('click', () => { currentInteractionMode = InteractionMode.REMOVE_DRAIN; highlightButton(removeDrainBtn); });
drawObstructionBtn.addEventListener('click', () => { currentInteractionMode = InteractionMode.DRAW_OBSTRUCTION; highlightButton(drawObstructionBtn); });
eraseObstructionBtn.addEventListener('click', () => { currentInteractionMode = InteractionMode.ERASE_OBSTRUCTION; highlightButton(eraseObstructionBtn); });

startPauseBtn.addEventListener('click', () => {
    isRunning = !isRunning;
    startPauseBtn.textContent = isRunning ? 'Pause' : 'Start';
    if (isRunning) {
        lastUpdateTime = performance.now(); // Reset last update time to prevent large initial delta
        requestAnimationFrame(simulate); // Restart if paused
    }
});

resetBtn.addEventListener('click', () => {
    isRunning = false;
    startPauseBtn.textContent = 'Start';
    cancelAnimationFrame(animationFrameId); // Stop any ongoing animation frame
    initializeGrid();
    drawGrid();
    currentInteractionMode = InteractionMode.NONE; // Reset mode
    clearButtonHighlights();
});

function highlightButton(button) {
    // Remove highlight from all mode buttons first
    [addSourceBtn, removeSourceBtn, addDrainBtn, removeDrainBtn, drawObstructionBtn, eraseObstructionBtn].forEach(btn => {
        btn.style.backgroundColor = ''; // Revert to default from style.css
        btn.style.boxShadow = '';
    });
    // Apply highlight to the clicked button
    button.style.backgroundColor = '#007bff'; // Blue for active mode
    button.style.boxShadow = '0 0 10px rgba(0, 123, 255, 0.5)';
}

function clearButtonHighlights() {
    [addSourceBtn, removeSourceBtn, addDrainBtn, removeDrainBtn, drawObstructionBtn, eraseObstructionBtn].forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.boxShadow = '';
    });
}

// --- Initial Setup ---
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
initializeGrid();
drawGrid();
lastUpdateTime = performance.now(); // Initialize for the first frame
requestAnimationFrame(simulate); // Start the simulation loop