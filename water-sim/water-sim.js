// water-sim.js

// --- Simulation Parameters ---
const GRID_WIDTH = 120; // Number of cells horizontally
const GRID_HEIGHT = 90; // Number of cells vertically
const CELL_SIZE = 7;    // Size of each cell in pixels for rendering
const SIM_SPEED = 10;   // Number of simulation steps per animation frame. Higher values
                        // make the simulation faster but might reduce stability or smoothness.
const DENSITY_DECAY_RATE = 0.005; // Rate at which water density naturally dissipates (like evaporation)
const FLOW_FACTOR = 0.5;   // Controls how much density flows between cells based on difference.
                        // Higher values result in faster flow.
const MAX_DENSITY = 1.0;    // Maximum possible water density in a cell (normalized 0-1)
const MIN_DENSITY = 0.0;    // Minimum possible water density in a cell

// --- Visualization Colors (RGB arrays) ---
// Water color gradient based on density (alpha channel will be determined by density)
const WATER_COLOR_BASE_R = 50;
const WATER_COLOR_BASE_G = 150;
const WATER_COLOR_BASE_B = 255; // A light blue
const OBSTACLE_COLOR = [50, 50, 50]; // Dark gray for obstacles
const SOURCE_COLOR = [0, 200, 0];   // Green for water source
const DRAIN_COLOR = [200, 0, 0];    // Red for water drain

// --- Global Simulation State ---
let canvas;         // The HTML canvas element for drawing
let ctx;            // The 2D rendering context of the canvas

let densityGrid = [];       // Primary grid storing current water density
let newDensityGrid = [];    // Temporary grid for calculating next simulation state to avoid
                            // affecting calculations based on already updated values in current step.
let typeGrid = [];          // Grid storing cell types: 0=empty, 1=obstacle, 2=source, 3=drain

let mouseIsDown = false;    // Flag to track if the mouse button is pressed
let currentTool = 'obstacle'; // Current active tool: 'obstacle', 'source', 'drain', 'erase'
let sourceCell = null;      // [x, y] coordinates of the water source cell
let drainCell = null;       // [x, y] coordinates of the water drain cell

// --- Initialization Function ---
/**
 * Initializes the simulation: creates canvas, sets up grids, and attaches event listeners.
 * Called once the DOM content is fully loaded.
 */
function initSimulation() {
    // Create and append the canvas element to the main content area
    canvas = document.createElement('canvas');
    canvas.id = 'waterCanvas';
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
    // Add canvas as the first child of the 'main' element
    document.querySelector('main').prepend(canvas);

    // Get the 2D rendering context
    ctx = canvas.getContext('2d');

    // Initialize all grid cells
    for (let y = 0; y < GRID_HEIGHT; y++) {
        densityGrid[y] = new Array(GRID_WIDTH).fill(MIN_DENSITY);
        newDensityGrid[y] = new Array(GRID_WIDTH).fill(MIN_DENSITY);
        typeGrid[y] = new Array(GRID_WIDTH).fill(0); // 0 for empty
    }

    // Set up user interaction handlers
    setupEventListeners();
    // Create the control buttons for selecting tools
    createToolControls();

    // Start the main simulation and rendering loop
    requestAnimationFrame(gameLoop);
}

// --- Simulation Logic (Per Step) ---
/**
 * Executes a single step of the fluid simulation.
 * Calculates density changes based on flow, sources, drains, and obstacles.
 */
function simulateStep() {
    // Create a temporary grid to store the total change for each cell during this step.
    // This allows all calculations for the current step to refer to the 'densityGrid'
    // from the beginning of the step, preventing issues with values changing mid-calculation.
    let densityChanges = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        densityChanges[y] = new Array(GRID_WIDTH).fill(0); // Initialize with zero changes
    }

    // Pass 1: Calculate all potential density changes (inflows/outflows, decay, source/drain effects)
    // based on the 'densityGrid' state at the start of this step.
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const currentCellType = typeGrid[y][x];

            if (currentCellType === 1) { // Obstacle
                // Obstacles always remain empty, so no flow in or out.
                // Their density will be explicitly set to MIN_DENSITY in Pass 2.
                continue;
            }

            if (currentCellType === 2) { // Source
                // Source continuously adds density to reach MAX_DENSITY
                densityChanges[y][x] += (MAX_DENSITY - densityGrid[y][x]);
                continue; // Source doesn't participate in normal flow calculations
            }

            if (currentCellType === 3) { // Drain
                // Drain continuously removes all density
                densityChanges[y][x] -= densityGrid[y][x];
                continue; // Drain doesn't participate in normal flow calculations
            }

            // For regular (empty) cells, calculate decay and flow
            let currentDensity = densityGrid[y][x];
            if (currentDensity <= MIN_DENSITY) {
                // If there's no water, nothing to decay or flow
                continue;
            }

            // Apply density decay (like evaporation)
            densityChanges[y][x] -= DENSITY_DECAY_RATE;

            // Calculate flow to direct neighbors (up, down, left, right)
            const neighbors = [
                [x, y - 1], // Up
                [x, y + 1], // Down
                [x - 1, y], // Left
                [x + 1, y]  // Right
            ];

            for (const [nx, ny] of neighbors) {
                // Check if neighbor coordinates are within grid bounds
                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                    // Check if neighbor is not an obstacle
                    if (typeGrid[ny][nx] !== 1) {
                        let neighborDensity = densityGrid[ny][nx];
                        let densityDifference = currentDensity - neighborDensity;

                        // Water flows from higher density to lower density
                        if (densityDifference > 0) {
                            // Calculate the amount of flow based on the difference and FLOW_FACTOR.
                            // Ensure flowAmount does not exceed the current cell's available water.
                            let flowAmount = densityDifference * FLOW_FACTOR;
                            flowAmount = Math.min(flowAmount, currentDensity);

                            // Record outflow from current cell
                            densityChanges[y][x] -= flowAmount;
                            // Record inflow to neighbor cell
                            densityChanges[ny][nx] += flowAmount;
                        }
                    }
                }
            }
        }
    }

    // Pass 2: Apply all calculated changes to the main density grid and clamp values.
    // This ensures all updates happen simultaneously based on the starting state of the step.
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (typeGrid[y][x] === 1) { // Obstacles are always empty
                densityGrid[y][x] = MIN_DENSITY;
            } else {
                // Apply the calculated change and clamp the new density
                let newDensity = densityGrid[y][x] + densityChanges[y][x];
                densityGrid[y][x] = Math.max(MIN_DENSITY, Math.min(MAX_DENSITY, newDensity));
            }
        }
    }
}

// --- Rendering Function ---
/**
 * Draws the current state of the simulation onto the canvas.
 * Colors cells based on their type and water density.
 */
function drawSimulation() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cellType = typeGrid[y][x];
            const density = densityGrid[y][x];

            // Begin drawing a new rectangle for the current cell
            ctx.beginPath();
            ctx.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            // Determine fill style based on cell type
            if (cellType === 1) { // Obstacle
                ctx.fillStyle = `rgb(${OBSTACLE_COLOR[0]}, ${OBSTACLE_COLOR[1]}, ${OBSTACLE_COLOR[2]})`;
            } else if (cellType === 2) { // Source
                ctx.fillStyle = `rgb(${SOURCE_COLOR[0]}, ${SOURCE_COLOR[1]}, ${SOURCE_COLOR[2]})`;
            } else if (cellType === 3) { // Drain
                ctx.fillStyle = `rgb(${DRAIN_COLOR[0]}, ${DRAIN_COLOR[1]}, ${DRAIN_COLOR[2]})`;
            } else { // Empty or Water
                // Water density directly influences the alpha (transparency) of the water color
                // Higher density means more opaque (less transparent) blue.
                const alpha = density;
                ctx.fillStyle = `rgba(${WATER_COLOR_BASE_R}, ${WATER_COLOR_BASE_G}, ${WATER_COLOR_BASE_B}, ${alpha})`;
            }
            ctx.fill(); // Fill the current rectangle with the chosen style
        }
    }
}

// --- Main Game Loop ---
/**
 * The main animation loop of the simulation.
 * It repeatedly calls simulation steps and then redraws the canvas.
 */
function gameLoop() {
    // Perform multiple simulation steps per frame to achieve desired speed
    for (let i = 0; i < SIM_SPEED; i++) {
        simulateStep();
    }
    // Redraw the canvas after all simulation steps for this frame
    drawSimulation();
    // Request the next animation frame, creating a continuous loop
    requestAnimationFrame(gameLoop);
}

// --- User Interaction Functions ---

/**
 * Converts mouse event coordinates (clientX, clientY) to grid cell coordinates.
 * @param {MouseEvent} event The mouse event object.
 * @returns {number[]} An array [gridX, gridY] representing the cell coordinates.
 */
function getGridCoords(event) {
    // Get the canvas's position and dimensions on the page
    const rect = canvas.getBoundingClientRect();
    // Calculate scaling factor in case canvas is scaled by CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calculate mouse position relative to the canvas's top-left corner
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    // Convert canvas pixel coordinates to grid cell coordinates
    const gridX = Math.floor(canvasX / CELL_SIZE);
    const gridY = Math.floor(canvasY / CELL_SIZE);
    return [gridX, gridY];
}

/**
 * Handles mouse interactions on the canvas (drawing/erasing obstacles).
 * This function is called on mousedown and mousemove events.
 * @param {MouseEvent} event The mouse event object.
 */
function handleCanvasInteraction(event) {
    const [gridX, gridY] = getGridCoords(event);

    // Ensure coordinates are within grid bounds
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        return; // Out of bounds
    }

    if (mouseIsDown) {
        // Apply the current drawing tool
        if (currentTool === 'obstacle') {
            // Set cell type to obstacle and ensure no water is on it
            typeGrid[gridY][gridX] = 1;
            densityGrid[gridY][gridX] = MIN_DENSITY;
        } else if (currentTool === 'erase') {
            // Set cell type back to empty
            typeGrid[gridY][gridX] = 0;
        }
        // Note: Source/Drain placement handled by placeSpecialPoint()
    }
}

/**
 * Changes the currently active tool.
 * @param {string} tool The name of the tool to activate ('obstacle', 'source', 'drain', 'erase').
 */
function handleToolClick(tool) {
    currentTool = tool;
    // Update active button styling
    document.querySelectorAll('.tool-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tool}Tool`).classList.add('active');
}

/**
 * Activates a special placement mode for source or drain.
 * The user then clicks on the canvas to place the item.
 * @param {string} type 'source' or 'drain'.
 */
function placeSpecialPoint(type) {
    // Change cursor to indicate placement mode
    canvas.style.cursor = 'crosshair';

    // Define a one-time click handler for placing the point
    const clickHandler = (e) => {
        const [gridX, gridY] = getGridCoords(e);
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
            return; // Out of bounds, do nothing
        }

        // Before placing, clear the previous special point of the same type if it exists
        if (type === 'source' && sourceCell) {
            typeGrid[sourceCell[1]][sourceCell[0]] = 0; // Set previous source cell back to empty
            densityGrid[sourceCell[1]][sourceCell[0]] = MIN_DENSITY; // Ensure it's empty
        } else if (type === 'drain' && drainCell) {
            typeGrid[drainCell[1]][drainCell[0]] = 0; // Set previous drain cell back to empty
        }

        // Set the new position for the special point
        if (type === 'source') {
            sourceCell = [gridX, gridY];
            typeGrid[gridY][gridX] = 2; // Set cell type to source
        } else if (type === 'drain') {
            drainCell = [gridX, gridY];
            typeGrid[gridY][gridX] = 3; // Set cell type to drain
        }

        // Remove the temporary click handler and reset cursor
        canvas.removeEventListener('click', clickHandler);
        canvas.style.cursor = 'default';
    };

    // Add the temporary click handler to the canvas
    canvas.addEventListener('click', clickHandler);
}

/**
 * Sets up all necessary event listeners for user interaction with the canvas.
 */
function setupEventListeners() {
    // Mouse down on canvas: start drawing if tool is obstacle or erase
    canvas.addEventListener('mousedown', (e) => {
        if (currentTool === 'obstacle' || currentTool === 'erase') {
            mouseIsDown = true;
            handleCanvasInteraction(e); // Apply tool immediately on mousedown
        }
    });

    // Mouse up on canvas: stop drawing
    canvas.addEventListener('mouseup', () => {
        mouseIsDown = false;
    });

    // Mouse move on canvas: continue drawing if mouse is down and tool is appropriate
    canvas.addEventListener('mousemove', handleCanvasInteraction);

    // Mouse leaves canvas: stop drawing
    canvas.addEventListener('mouseleave', () => {
        mouseIsDown = false;
    });
}

/**
 * Dynamically creates and appends the tool control buttons to the main content area.
 */
function createToolControls() {
    const main = document.querySelector('main');
    const toolContainer = document.createElement('div');
    toolContainer.className = 'tool-controls';

    // Define the tools and their properties
    const tools = [
        { id: 'obstacleTool', text: 'Draw Obstacle', tool: 'obstacle' },
        { id: 'eraseTool', text: 'Erase', tool: 'erase' },
        { id: 'sourceTool', text: 'Place Source', tool: 'source' },
        { id: 'drainTool', text: 'Place Drain', tool: 'drain' }
    ];

    // Create a button for each tool
    tools.forEach(toolInfo => {
        const button = document.createElement('button');
        button.id = toolInfo.id;
        button.className = 'tool-button';
        button.textContent = toolInfo.text;

        // Set 'Draw Obstacle' as the default active tool
        if (toolInfo.tool === 'obstacle') {
            button.classList.add('active');
        }

        // Attach click event listener for tool selection
        button.addEventListener('click', () => {
            handleToolClick(toolInfo.tool);
            // If it's a special placement tool (source/drain), activate placement mode
            if (toolInfo.tool === 'source' || toolInfo.tool === 'drain') {
                placeSpecialPoint(toolInfo.tool);
            }
        });
        toolContainer.appendChild(button);
    });

    // Append the container of tool buttons to the main content
    main.appendChild(toolContainer);
}

// Attach the initialization function to the DOMContentLoaded event,
// ensuring the script runs after the HTML structure is fully loaded.
document.addEventListener('DOMContentLoaded', initSimulation);
