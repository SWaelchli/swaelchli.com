// overhead-tank.js

// --- Global Constants and Initial Parameters ---
const CANVAS = document.getElementById('tankCanvas');
const CTX = CANVAS.getContext('2d');

const PI = Math.PI;
const G = 9.81; // Acceleration due to gravity (m/s^2)
const DT_SIMULATION = 0.1; // Simulation time step in seconds (determines granularity of updates)
const M_TO_PIXELS = 50; // Conversion factor: 1 meter = 50 pixels for tank height/diameter visualization

let animationFrameId = null; // To store the requestAnimationFrame ID

// --- Simulation Parameters (User Adjustable) ---
let tankHeightM = parseFloat(document.getElementById('tankHeight').value); // meters
let tankDiameterM = parseFloat(document.getElementById('tankDiameter').value); // meters
let inletFlowRateLPM = parseFloat(document.getElementById('inletFlowRate').value); // Liters per minute
let outletFlowRateSettingLPM = parseFloat(document.getElementById('outletFlowRateSetting').value); // Liters per minute (desired consumption)
let oilDensityKgM3 = parseFloat(document.getElementById('oilDensity').value); // kg/m^3
let oilViscosityCSt = parseFloat(document.getElementById('oilViscosity').value); // centiStokes
let orificeDiameterMM = parseFloat(document.getElementById('orificeDiameter').value); // mm
let simulationSpeedMultiplier = parseFloat(document.getElementById('simulationSpeed').value);

// --- Simulation State Variables ---
let currentOilLevelM = 0; // Current oil height in meters
let actualInletFlowRateLPM = 0; // The actual flow into the tank
let actualOutletFlowRateLPM = 0; // The actual flow out of the tank (to equipment)
let overflowRateLPM = 0; // Flow rate out of the overflow line
let currentHeaderPressureKPa = 0; // Pressure at the bottom of the tank / header
let tankVolumeL = 0; // Current volume in Liters

let simulationRunning = false;

// --- API 614 Alarms (configurable) ---
const ALARM_HIGH_LEVEL_PERCENT = 90; // % of tank height
const ALARM_LOW_LEVEL_PERCENT = 20; // % of tank height

// --- Derived/Calculated Parameters ---
let tankCrossSectionalAreaM2;
let totalTankCapacityL;
let overflowLevelM; // The height at which overflow begins
let orificeAreaM2;

// --- DOM Elements for Display and Controls ---
const displayTankHeight = document.getElementById('displayTankHeight');
const displayTankDiameter = document.getElementById('displayTankDiameter');
const displayInletFlowRate = document.getElementById('displayInletFlowRate');
const displayOutletFlowRateSetting = document.getElementById('displayOutletFlowRateSetting');
const displayOilDensity = document.getElementById('displayOilDensity');
const displayOilViscosity = document.getElementById('displayOilViscosity');
const displayOrificeDiameter = document.getElementById('displayOrificeDiameter');
const displaySimulationSpeed = document.getElementById('displaySimulationSpeed');

const displayOilLevelHeight = document.getElementById('displayOilLevelHeight');
const displayOilLevelPercent = document.getElementById('displayOilLevelPercent');
const displayActualInletFlowRate = document.getElementById('displayActualInletFlowRate');
const displayActualOutletFlowRate = document.getElementById('displayActualOutletFlowRate');
const displayOverflowRate = document.getElementById('displayOverflowRate');
const displayHeaderPressure = document.getElementById('displayHeaderPressure');
const displayTankVolume = document.getElementById('displayTankVolume');
const displayTotalCapacity = document.getElementById('displayTotalCapacity');

const startStopButton = document.getElementById('startStopButton');
const resetButton = document.getElementById('resetButton');

const highLevelAlarmEl = document.getElementById('highLevelAlarm');
const lowLevelAlarmEl = document.getElementById('lowLevelAlarm');

// --- Canvas Drawing Parameters ---
const TANK_X = CANVAS.width / 2;
const TANK_Y_OFFSET = 100; // Offset from top of canvas
const TANK_WIDTH_FACTOR = 0.8; // Tank width as fraction of canvas width
const TANK_HEIGHT_FACTOR = 0.8; // Tank height as fraction of canvas height

let tankPixelHeight;
let tankPixelRadius;

// --- Helper Functions ---

/**
 * Converts Liters per minute to cubic meters per second.
 * @param {number} lpm - Liters per minute.
 * @returns {number} - Cubic meters per second.
 */
function lpmToM3s(lpm) {
    return lpm / 60000;
}

/**
 * Converts cubic meters per second to Liters per minute.
 * @param {number} m3s - Cubic meters per second.
 * @returns {number} - Liters per minute.
 */
function m3sToLPM(m3s) {
    return m3s * 60000;
}

/**
 * Calculates the current header pressure based on oil level and density.
 * P = rho * g * h
 * @param {number} density - Oil density in kg/m^3.
 * @param {number} height - Oil height in meters.
 * @returns {number} - Pressure in Pascals.
 */
function calculatePressurePa(density, height) {
    return density * G * height; // Pascals
}

/**
 * Updates all derived parameters based on current user inputs.
 */
function updateDerivedParameters() {
    tankCrossSectionalAreaM2 = PI * Math.pow(tankDiameterM / 2, 2);
    totalTankCapacityL = tankCrossSectionalAreaM2 * tankHeightM * 1000; // m^3 to Liters
    overflowLevelM = tankHeightM; // Overflow is at the very top of the tank for this simulation
    orificeAreaM2 = PI * Math.pow((orificeDiameterMM / 1000) / 2, 2); // mm to meters
}

/**
 * Initializes or resets the simulation state and updates displays.
 */
function initializeSimulation() {
    // Reset state variables
    currentOilLevelM = 0;
    actualInletFlowRateLPM = 0;
    actualOutletFlowRateLPM = 0;
    overflowRateLPM = 0;
    currentHeaderPressureKPa = 0;
    tankVolumeL = 0;

    // Update derived parameters based on current user inputs
    updateDerivedParameters();

    // Reset alarms
    highLevelAlarmEl.style.display = 'none';
    lowLevelAlarmEl.style.display = 'none';

    // Redraw immediately to reflect initial state
    drawTank();
    updateMetricsDisplay();
}

/**
 * Draws the tank, oil level, flow paths, and labels on the canvas.
 */
function drawTank() {
    // Clear canvas
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

    // Calculate pixel dimensions
    tankPixelHeight = tankHeightM * M_TO_PIXELS;
    tankPixelRadius = (tankDiameterM / 2) * M_TO_PIXELS;

    const tankTopY = TANK_Y_OFFSET;
    const tankBottomY = TANK_Y_OFFSET + tankPixelHeight;
    const tankCenterPx = TANK_X; // Center of the tank horizontally

    // Draw Tank Body
    CTX.strokeStyle = '#333';
    CTX.lineWidth = 3;
    CTX.beginPath();
    CTX.arc(tankCenterPx, tankTopY, tankPixelRadius, Math.PI, 2 * Math.PI); // Top ellipse (half)
    CTX.lineTo(tankCenterPx + tankPixelRadius, tankBottomY);
    CTX.arc(tankCenterPx, tankBottomY, tankPixelRadius, 0, Math.PI); // Bottom ellipse (full)
    CTX.lineTo(tankCenterPx - tankPixelRadius, tankTopY);
    CTX.stroke();
    CTX.closePath();

    // Draw Oil
    const oilFillHeightPx = currentOilLevelM * M_TO_PIXELS;
    if (oilFillHeightPx > 0) {
        const oilTopY = tankBottomY - oilFillHeightPx;
        CTX.fillStyle = '#007bff'; // Blue for oil
        CTX.beginPath();
        // Adjust the radius for the ellipse based on the current oil level's position relative to the tank's center
        // This is a simplification; a more accurate ellipse would account for the curvature.
        const currentOilRadius = tankPixelRadius * (1 - (tankBottomY - oilTopY) / tankPixelHeight * 0.1); // Slight narrowing as it goes up
        CTX.ellipse(tankCenterPx, oilTopY, currentOilRadius, tankPixelRadius * 0.15, 0, 0, 2 * Math.PI); // Top surface ellipse of oil
        CTX.rect(tankCenterPx - tankPixelRadius, oilTopY, tankPixelRadius * 2, oilFillHeightPx); // Main body of oil
        CTX.fill();
        // Draw the bottom ellipse of the oil (same as tank bottom)
        CTX.beginPath();
        CTX.arc(tankCenterPx, tankBottomY, tankPixelRadius, 0, Math.PI);
        CTX.fillStyle = '#007bff';
        CTX.fill();
    }

    // Draw Inlet Line
    const inletX = tankCenterPx - tankPixelRadius - 50;
    const inletY = tankTopY + tankPixelHeight / 4;
    CTX.strokeStyle = '#28a745'; // Green for inlet
    CTX.lineWidth = 5 + (actualInletFlowRateLPM / 100); // Thicker for more flow
    CTX.beginPath();
    CTX.moveTo(inletX, inletY);
    CTX.lineTo(tankCenterPx - tankPixelRadius -10, inletY);
    CTX.stroke();
    // Inlet arrow
    drawArrow(CTX, tankCenterPx - tankPixelRadius - 0, inletY, 20, 0, CTX.strokeStyle);


    // Draw Outlet Line
    const outletX = tankCenterPx + tankPixelRadius + 50;
    const outletY = tankBottomY - 20; // Near the bottom
    CTX.strokeStyle = '#dc3545'; // Red for outlet
    CTX.lineWidth = 5 + (actualOutletFlowRateLPM / 100); // Thicker for more flow
    CTX.beginPath();
    CTX.moveTo(tankCenterPx + tankPixelRadius + 10, outletY);
    CTX.lineTo(outletX, outletY);
    CTX.stroke();
    // Outlet arrow
    drawArrow(CTX, tankCenterPx + tankPixelRadius + 0, outletY, 20, Math.PI, CTX.strokeStyle); // Pointing right

    // Draw Overflow Line
    const overflowLineY = TANK_Y_OFFSET; // Top of the tank
    CTX.strokeStyle = overflowRateLPM > 0 ? '#ffc107' : '#999'; // Yellow if active, grey if not
    CTX.lineWidth = 5 + (overflowRateLPM / 100);
    CTX.beginPath();
    CTX.moveTo(tankCenterPx + tankPixelRadius + 20, overflowLineY);
    CTX.lineTo(tankCenterPx + tankPixelRadius + 80, overflowLineY);
    CTX.lineTo(tankCenterPx + tankPixelRadius + 80, overflowLineY + 50); // Downwards
    CTX.stroke();
    // Overflow indicator (small arrow if flowing)
    if (overflowRateLPM > 0) {
        drawArrow(CTX, tankCenterPx + tankPixelRadius + 70, overflowLineY + 30, 20, Math.PI / 2, CTX.strokeStyle);
    }

    // --- Labels for Tank Dimensions ---
    CTX.fillStyle = '#333';
    CTX.font = '14px Arial';
    CTX.textAlign = 'center';

    // Tank Height Label
    CTX.fillText(`H: ${tankHeightM.toFixed(1)} m`, tankCenterPx + tankPixelRadius + 70, tankTopY + tankPixelHeight / 2);
    CTX.beginPath();
    CTX.moveTo(tankCenterPx + tankPixelRadius + 30, tankTopY);
    CTX.lineTo(tankCenterPx + tankPixelRadius + 30, tankBottomY);
    CTX.stroke();
    CTX.beginPath();
    CTX.moveTo(tankCenterPx + tankPixelRadius + 25, tankTopY);
    CTX.lineTo(tankCenterPx + tankPixelRadius + 35, tankTopY);
    CTX.moveTo(tankCenterPx + tankPixelRadius + 25, tankBottomY);
    CTX.lineTo(tankCenterPx + tankPixelRadius + 35, tankBottomY);
    CTX.stroke();


    // Tank Diameter Label
    CTX.fillText(`D: ${tankDiameterM.toFixed(1)} m`, tankCenterPx, tankBottomY + 30 + tankPixelRadius);
    CTX.beginPath();
    CTX.moveTo(tankCenterPx - tankPixelRadius, tankBottomY + 40 + tankPixelRadius);
    CTX.lineTo(tankCenterPx + tankPixelRadius, tankBottomY + 40 + tankPixelRadius);
    CTX.stroke();
    CTX.beginPath();
    CTX.moveTo(tankCenterPx - tankPixelRadius, tankBottomY + 35 + tankPixelRadius);
    CTX.lineTo(tankCenterPx - tankPixelRadius, tankBottomY + 45 + tankPixelRadius);
    CTX.moveTo(tankCenterPx + tankPixelRadius, tankBottomY + 35 + tankPixelRadius);
    CTX.lineTo(tankCenterPx + tankPixelRadius, tankBottomY + 45 + tankPixelRadius);
    CTX.stroke();
}

/**
 * Helper function to draw an arrow.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {number} x - X coordinate of the arrow tip.
 * @param {number} y - Y coordinate of the arrow tip.
 * @param {number} size - Size of the arrow head.
 * @param {number} angle - Angle of the arrow in radians (0 for right, PI for left, PI/2 for down).
 * @param {string} color - Color of the arrow.
 */
function drawArrow(ctx, x, y, size, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.7, -size * 0.4);
    ctx.lineTo(-size * 0.7, size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

/**
 * Updates numerical metrics displayed on the HTML page.
 */
function updateMetricsDisplay() {
    const oilLevelPercent = (currentOilLevelM / tankHeightM) * 100;
    const currentVolumeM3 = currentOilLevelM * tankCrossSectionalAreaM2;
    tankVolumeL = currentVolumeM3 * 1000; // Convert to Liters

    displayOilLevelHeight.textContent = currentOilLevelM.toFixed(2);
    displayOilLevelPercent.textContent = oilLevelPercent.toFixed(2);
    displayActualInletFlowRate.textContent = actualInletFlowRateLPM.toFixed(2);
    displayActualOutletFlowRate.textContent = actualOutletFlowRateLPM.toFixed(2);
    displayOverflowRate.textContent = overflowRateLPM.toFixed(2);
    displayHeaderPressure.textContent = (currentHeaderPressureKPa).toFixed(2); // Already in kPa
    displayTankVolume.textContent = tankVolumeL.toFixed(2);
    displayTotalCapacity.textContent = totalTankCapacityL.toFixed(2);

    // Update alarm indicators
    if (oilLevelPercent >= ALARM_HIGH_LEVEL_PERCENT) {
        highLevelAlarmEl.style.display = 'block';
    } else {
        highLevelAlarmEl.style.display = 'none';
    }

    if (oilLevelPercent <= ALARM_LOW_LEVEL_PERCENT) {
        lowLevelAlarmEl.style.display = 'block';
    } else {
        lowLevelAlarmEl.style.display = 'none';
    }
}

/**
 * Core simulation logic for one time step.
 */
function simulateStep() {
    const dtAdjusted = DT_SIMULATION * simulationSpeedMultiplier; // Adjust dt by simulation speed

    // 1. Calculate Qin (actual inlet flow)
    // For simplicity, actualInletFlowRateLPM is directly user-controlled
    actualInletFlowRateLPM = inletFlowRateLPM;

    // 2. Calculate Qout (outlet flow to equipment)
    // Torricelli's Law for gravity-driven flow, influenced by current head and orifice size
    // v = sqrt(2gh)
    // Q = v * A_orifice
    let velocityM_S = 0;
    if (currentOilLevelM > 0) { // Only flow if there's oil
        velocityM_S = Math.sqrt(2 * G * currentOilLevelM);
    }
    const QoutM3S = velocityM_S * orificeAreaM2;
    actualOutletFlowRateLPM = m3sToLPM(QoutM3S);

    // Ensure outlet flow doesn't exceed the desired consumption (if applicable for a real system with a pump)
    // For a gravity rundown tank, the orifice limits the max flow, so actualOutletFlowRateLPM is the limit
    if (actualOutletFlowRateLPM > outletFlowRateSettingLPM) {
        actualOutletFlowRateLPM = outletFlowRateSettingLPM; // Limit by demand
    }


    // 3. Mass Balance: dV/dt = Qin - Qout - Qoverflow
    const QinM3S = lpmToM3s(actualInletFlowRateLPM);
    const QoutEffectiveM3S = lpmToM3s(actualOutletFlowRateLPM); // Use actual outflow for balance

    let dVM3 = (QinM3S - QoutEffectiveM3S) * dtAdjusted; // Change in volume in m^3

    // Calculate new volume
    let newVolumeM3 = (currentOilLevelM * tankCrossSectionalAreaM2) + dVM3;

    // Handle overflow
    const maxVolumeM3 = totalTankCapacityL / 1000; // Tank capacity in m^3
    overflowRateLPM = 0; // Reset overflow

    if (newVolumeM3 > maxVolumeM3) {
        overflowRateLPM = m3sToLPM((newVolumeM3 - maxVolumeM3) / dtAdjusted);
        newVolumeM3 = maxVolumeM3; // Cap volume at max capacity
    } else if (newVolumeM3 < 0) {
        newVolumeM3 = 0; // Don't go below zero
        actualInletFlowRateLPM = 0; // Stop inlet if tank is empty and can't go negative
        actualOutletFlowRateLPM = 0; // Stop outlet if tank is empty
        overflowRateLPM = 0;
    }

    // Update oil level
    currentOilLevelM = newVolumeM3 / tankCrossSectionalAreaM2;

    // 4. Calculate Header Pressure
    // Pressure at the outlet / header, based on static head of oil.
    currentHeaderPressureKPa = calculatePressurePa(oilDensityKgM3, currentOilLevelM) / 1000; // Convert Pa to kPa

    // Update visualization and metrics
    drawTank();
    updateMetricsDisplay();

    // Continue simulation if running
    if (simulationRunning) {
        animationFrameId = requestAnimationFrame(simulateStep);
    }
}

// --- Event Listeners for User Inputs ---
document.getElementById('tankHeight').addEventListener('input', (e) => {
    tankHeightM = parseFloat(e.target.value);
    displayTankHeight.textContent = tankHeightM.toFixed(1);
    initializeSimulation(); // Recalculate based on new dimensions
});

document.getElementById('tankDiameter').addEventListener('input', (e) => {
    tankDiameterM = parseFloat(e.target.value);
    displayTankDiameter.textContent = tankDiameterM.toFixed(1);
    initializeSimulation(); // Recalculate based on new dimensions
});

document.getElementById('inletFlowRate').addEventListener('input', (e) => {
    inletFlowRateLPM = parseFloat(e.target.value);
    displayInletFlowRate.textContent = inletFlowRateLPM;
});

document.getElementById('outletFlowRateSetting').addEventListener('input', (e) => {
    outletFlowRateSettingLPM = parseFloat(e.target.value);
    displayOutletFlowRateSetting.textContent = outletFlowRateSettingLPM;
});

document.getElementById('oilDensity').addEventListener('input', (e) => {
    oilDensityKgM3 = parseFloat(e.target.value);
    displayOilDensity.textContent = oilDensityKgM3;
    // Pressure changes with density, so re-evaluate immediately
    currentHeaderPressureKPa = calculatePressurePa(oilDensityKgM3, currentOilLevelM) / 1000;
    updateMetricsDisplay();
});

document.getElementById('oilViscosity').addEventListener('input', (e) => {
    oilViscosityCSt = parseFloat(e.target.value);
    displayOilViscosity.textContent = oilViscosityCSt;
    // Viscosity primarily affects pressure drop in pipes, not directly Torricelli's law
    // For this basic simulation, we're not fully modeling pipe friction.
    // In a more advanced simulation, this would impact actual Qout.
});

document.getElementById('orificeDiameter').addEventListener('input', (e) => {
    orificeDiameterMM = parseFloat(e.target.value);
    displayOrificeDiameter.textContent = orificeDiameterMM;
    updateDerivedParameters(); // Orifice area changes
});

document.getElementById('simulationSpeed').addEventListener('input', (e) => {
    simulationSpeedMultiplier = parseFloat(e.target.value);
    displaySimulationSpeed.textContent = `${simulationSpeedMultiplier.toFixed(1)}x`;
});

startStopButton.addEventListener('click', () => {
    if (simulationRunning) {
        // Stop simulation
        cancelAnimationFrame(animationFrameId);
        simulationRunning = false;
        startStopButton.textContent = 'Start Simulation';
        startStopButton.style.backgroundColor = '#28a745';
    } else {
        // Start simulation
        simulationRunning = true;
        startStopButton.textContent = 'Stop Simulation';
        startStopButton.style.backgroundColor = '#ffc107'; // Yellow for running
        simulateStep(); // Start the animation loop
    }
});

resetButton.addEventListener('click', () => {
    // Stop simulation if running
    if (simulationRunning) {
        cancelAnimationFrame(animationFrameId);
        simulationRunning = false;
        startStopButton.textContent = 'Start Simulation';
        startStopButton.style.backgroundColor = '#28a745';
    }

    // Reset all input sliders to their default values
    document.getElementById('tankHeight').value = 5;
    document.getElementById('tankDiameter').value = 2;
    document.getElementById('inletFlowRate').value = 300;
    document.getElementById('outletFlowRateSetting').value = 250;
    document.getElementById('oilDensity').value = 850;
    document.getElementById('oilViscosity').value = 50;
    document.getElementById('orificeDiameter').value = 20;
    document.getElementById('simulationSpeed').value = 1;

    // Manually trigger input events to update displayed values and simulation state
    const inputEvent = new Event('input');
    document.getElementById('tankHeight').dispatchEvent(inputEvent);
    document.getElementById('tankDiameter').dispatchEvent(inputEvent);
    document.getElementById('inletFlowRate').dispatchEvent(inputEvent);
    document.getElementById('outletFlowRateSetting').dispatchEvent(inputEvent);
    document.getElementById('oilDensity').dispatchEvent(inputEvent);
    document.getElementById('oilViscosity').dispatchEvent(inputEvent);
    document.getElementById('orificeDiameter').dispatchEvent(inputEvent);
    document.getElementById('simulationSpeed').dispatchEvent(inputEvent);

    initializeSimulation(); // Re-initialize the simulation to defaults
});

// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    initializeSimulation();
});