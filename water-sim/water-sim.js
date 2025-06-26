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