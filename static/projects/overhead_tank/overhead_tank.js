// overhead-tank.js
document.addEventListener('DOMContentLoaded', (event) => {

// 1. Get references to the HTML elements

// Canvas elements
const tankCanvas = document.getElementById('tankCanvas');
const tankContext = tankCanvas.getContext('2d');


// Oil Header Pressure
const OilHeaderPressureSlider = document.getElementById('OilHeaderPressure');
const displayOilHeaderPressure = document.getElementById('displayOilHeaderPressure');

// Oil Header Pressure
const OrificeDiameterSlider = document.getElementById('OrificeDiameter');
const displayOrificeDiameter = document.getElementById('displayOrificeDiameter');

// Oil Density
const OilDensityKGM3Input = document.getElementById('OilDensityKGM3');

// Oil Viscosity
const OilViscosityInput = document.getElementById('OilViscosity');

// Supply Line Inner Diameter
const SupplyLineInnerDiameterInput = document.getElementById('SupplyLineInnerDiameter');

// Tanks Volume
const TankVolumeInput = document.getElementById('TankVolume');

// Tanks Height
const TankElevationMInput = document.getElementById('TankElevationM');

// Tanks Height
const NormOilConsumptionLMINInput = document.getElementById('NormOilConsumptionLMIN');

// Datadisplay elements for process data panel
const displaySupplyLineOilVolumePro = document.getElementById('displaySupplyLineOilVolumePro');
const displayOilHeaderPressurePro = document.getElementById('displayOilHeaderPressurePro');
const displayOrificeDiameterPro = document.getElementById('displayOrificeDiameterPro');
const displayOilDensityKGM3Pro = document.getElementById('displayOilDensityKGM3Pro');
const displayOilViscosityPro = document.getElementById('displayOilViscosityPro');
const displaySupplyLineInnerDiameterPro = document.getElementById('displaySupplyLineInnerDiameterPro');
const displayTankVolumePro = document.getElementById('displayTankVolumePro');
const displayTankElevationMPro = document.getElementById('displayTankElevationMPro');
const displayflowRateLMINPro = document.getElementById('displayflowRateLMINPro');
const displayActOilConsumptionLMINPro = document.getElementById('displayActOilConsumptionLMINPro');
const displayTankOilVolumePro = document.getElementById('displayTankOilVolumePro');
const displaycurrentTimePro = document.getElementById('displaycurrentTimePro');


const fixedPropertyInputs = [
    OilDensityKGM3Input,
    OilViscosityInput,
    SupplyLineInnerDiameterInput,
    TankVolumeInput,
    TankElevationMInput,
    NormOilConsumptionLMINInput
];


// 2. Initialize your JavaScript variable

//General variables

let DischargeCoefficient = 0.61; // Discharge coefficient for the orifice
let TankAreaToVolumeRatio = 0.0625 // 1 / Tank Area  --> TankVolume * TankAreaToVolumeRatio = Height




let currentTime = 0; // Current time in seconds
let timeStep = 0.1; // Time step for the simulation in seconds
let simulationIntervalId;
let totalSimulationDuration = 60 * 60; // Total duration of the simulation in seconds




//  Chart variables
let oilLevelChart; // Variable to hold the Chart.js instance
let chartData = {
    labels: [], // Stores time values
    datasets: [{
        label: 'Stored Oil (%)',
        data: [],
        borderColor: 'rgb(236, 40, 40)', // Red
        backgroundColor: 'rgba(250, 116, 116, 0.2)',
        tension: 0.1,
        fill: true
    }]
};


// This variable will hold the current value of the slider ar input
let OilHeaderPressure = parseFloat(OilHeaderPressureSlider.value);  //barg
let MachineOilPressure = OilHeaderPressure
let OrificeDiameter = parseFloat(OrificeDiameterSlider.value);      // mm
let OilDensityKGM3 = parseFloat(OilDensityKGM3Input.value)                  // // kg/m3
let OilViscosity = parseFloat(OilViscosityInput.value)              // mm2/s
let SupplyLineInnerDiameter = parseFloat(SupplyLineInnerDiameterInput.value)   // mm
let TankVolume = parseFloat(TankVolumeInput.value)          
let TankElevationM = parseFloat(TankElevationMInput.value)              // m
let NormOilConsumptionLMIN = parseFloat(NormOilConsumptionLMINInput.value)       // l/min

// Set initial variables

let SupplyLineOilVolume = 0; // Volume of oil in the supply line in litre
let TankOilVolume = 0; // Volume of oil in the tank in litre
let SupplyLineVolume = 0
let SupplyLineOilPercentage = 0
let TankOilPercentage = 0
let StoredOilPercentage = 0
let ActOilConsumptionLMIN = 0
let flowRateLMIN = 0
let hydrostaticPressureBARG = 0

updateUI();


function CalulateBoundryVarialbles() {
    // Ensure that values are positive before calculation to prevent NaN or Infinity
    safeSupplyLineInnerDiameter = SupplyLineInnerDiameter > 0 ? SupplyLineInnerDiameter : 1; // Use a small positive default if 0 or negative
    safeTankElevationM = TankElevationM > 0 ? TankElevationM : 1; // Use a small positive default if 0 or negative
    safeTankVolume = TankVolume > 0 ? TankVolume : 1; // Use a small positive default if 0 or negative

    SupplyLineVolume = Math.PI * Math.pow((safeSupplyLineInnerDiameter / 100) / 2, 2) * (safeTankElevationM * 10);   // TankElevation from m to dm, Volume of the supply line in l 
    SupplyLineOilPercentage = (SupplyLineOilVolume / SupplyLineVolume) * 100; // Percentage of oil in the supply line
    SupplyLineOilPercentage = Math.max(0, Math.min(SupplyLineOilPercentage, 100)); // Ensure percentage is between 0 and 100
    TankOilPercentage = (TankOilVolume / safeTankVolume) * 100;  // Percentage of oil in the tank
    TankOilPercentage = Math.max(0, Math.min(TankOilPercentage, 100)); // Ensure percentage is between 0 and 100

    MachineFlowCoefficient = (NormOilConsumptionLMIN * 0.06) * Math.sqrt((OilDensityKGM3 / 1000)/ OilHeaderPressure) * 1.156   // Cv Flow Factor
}

CalulateBoundryVarialbles()


// Function to initialize the chart
function initializeChart() {
    const ctx = document.getElementById('oilLevelChart').getContext('2d');
    oilLevelChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Important for custom sizing
            animation: {
                duration: 0 // Disable animation for smoother updates
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Volume (%)'
                    },
                    min: 0,
                    max: 100 // Since we are plotting percentages
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Oil Tank Level Trends'
                }
            }
        }
    });
}

// Call initializeChart when the script loads
initializeChart();


// 3. Add an event listener to the sliders
// The 'input' event fires continuously as the slider is dragged
    OilHeaderPressureSlider.addEventListener('input', function() {
        // Update the JavaScript variable
        OilHeaderPressure = parseFloat(this.value);

        // update the displayed value CONTROL PANEL
        displayOilHeaderPressure.textContent = OilHeaderPressure.toFixed(1); // .toFixed(1) for one decimal place

        // update the displayed value PROCESS DATA PANEL
        displayOilHeaderPressurePro.textContent = OilHeaderPressure.toFixed(1); // .toFixed(1) for one decimal place


            // You can now use the 'OilHeaderPressure' variable in your JavaScript code

    });


OrificeDiameterSlider.addEventListener('input', function() {
   
    OrificeDiameter = parseFloat(this.value);
    displayOrificeDiameter.textContent = OrificeDiameter.toFixed(1); // .toFixed(1) for one decimal place
    //displayOrificeDiameterPro.textContent = OrificeDiameter.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilDensityKGM3Input.addEventListener('input', function() {
   
    OilDensityKGM3 = parseFloat(this.value);
    //displayOilDensityKGM3Pro.textContent = OilDensityKGM3.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilViscosityInput.addEventListener('input', function() {
   
    OilViscosity = parseFloat(this.value);
    //displayOilViscosityPro.textContent = OilViscosity.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

SupplyLineInnerDiameterInput.addEventListener('input', function() {

    SupplyLineInnerDiameter = parseFloat(this.value);
    //displaySupplyLineInnerDiameterPro.textContent = SupplyLineInnerDiameter.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place
    CalulateBoundryVarialbles ();


});

TankVolumeInput.addEventListener('input', function() {
   
    TankVolume = parseFloat(this.value);
    //displayTankVolumePro.textContent = TankVolume.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place
    CalulateBoundryVarialbles ();

});

TankElevationMInput.addEventListener('input', function() {
   
    TankElevationM = parseFloat(this.value);
    //displayTankElevationMPro.textContent = TankElevationM.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place
    CalulateBoundryVarialbles ();

});

NormOilConsumptionLMINInput.addEventListener('input', function() {
   
    NormOilConsumptionLMIN = parseFloat(this.value);
    //displayNormOilConsumptionLMINPro.textContent = NormOilConsumptionLMIN.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place
    CalulateBoundryVarialbles ();

});




// 5. Auxiliary Functions




function CalculateflowRateLMIN() {
    // Ensure that values are positive before calculation to prevent NaN or Infinity
    safeOilDensityKGM3 = OilDensityKGM3 > 0 ? OilDensityKGM3 : 1; // Use a small positive default if 0 or negative
    safeOrificeDiameter = OrificeDiameter > 0 ? OrificeDiameter : 0.001; // Use a small positive default if 0 or negative

    // Calculate the flow rate in liter per minutes using the orifice equation
    hydrostaticPressureBARG = (((SupplyLineOilPercentage / 100) * TankElevationM * safeOilDensityKGM3 * 9.81)/100000) + (((TankOilPercentage / 100) * (TankVolume/1000) * TankAreaToVolumeRatio * safeOilDensityKGM3 * 9.81)/100000); // hydrostatic pressure in barg
    let RawDeltaPressureBAR = OilHeaderPressure - hydrostaticPressureBARG; //deltaPressure in bar, header pressure - hydrostatic pressure
    // Determine the sign of the flow rate based on rawDeltaPressure
    let flowDirection = Math.sign(RawDeltaPressureBAR);

    if (flowDirection == 1) {
        // Flow is from tank to supply line (positive flow), the flow goes through the orifice

        let absoluteDeltaPressurePA = Math.abs(RawDeltaPressureBAR) * 100000; // absolute value of delta pressure in in bar
        
        // Ensure denominator is not zero or negative for Math.sqrt
        const safeDenom = (2 * absoluteDeltaPressurePA / safeOilDensityKGM3);
        let flowRateMagnitudeM3S = 0;
        if (safeDenom >= 0) {
            flowRateMagnitudeM3S = DischargeCoefficient * Math.PI * Math.pow(safeOrificeDiameter / 1000, 2) * Math.sqrt(safeDenom);
        
    
        // Apply the determined sign to the flow rate magnitude and Convert m3/s to l/min
        flowRateLMIN = flowDirection * flowRateMagnitudeM3S * 1000 * 60;
        
        
        return flowRateLMIN; // Convert m3/s to l/min
        } 
        
    } else {
            // If denominator is negative, the flow bypasses the orifice and can be calulated by using the MachineFlowCoefficient
            flowRateLMIN = flowDirection * (((MachineFlowCoefficient / 1.156) / Math.sqrt((OilDensityKGM3 / 1000) / Math.max(hydrostaticPressureBARG, 0.0001))) / 0.06); // Convert m3/h to l/min
            return flowRateLMIN;
    }
}

function CalculateActOilConsumptionLMIN() {

    if (OilHeaderPressure >= hydrostaticPressureBARG) {
        if (OilHeaderPressure <= 0) {
            ActOilConsumptionLMIN = 0;
            MachineOilPressure = 0;
            return ActOilConsumptionLMIN;
        } else {

        
            ActOilConsumptionLMIN = ((MachineFlowCoefficient / 1.156) / Math.sqrt((OilDensityKGM3 / 1000) / Math.max(OilHeaderPressure, 0.0001))) / 0.06
            MachineOilPressure = OilHeaderPressure
            return ActOilConsumptionLMIN;
        }
    } else {
        ActOilConsumptionLMIN = flowRateLMIN * -1
        MachineOilPressure = hydrostaticPressureBARG
        return ActOilConsumptionLMIN;
    }

}

function DrawVerticalFlowArrow(arrowX, arrowY, arrowSize, arrowLength, FlowRate, FlowDirection) {          //(X Position, Y Position, Size of Arrowhead, Length of Arrow Line, Flow direction (1 or -1))
    

    tankContext.strokeStyle = '#007bff'; // Blue color for the arrow
    tankContext.lineWidth = 2;

    FlowRate = FlowRate * FlowDirection

    if (FlowRate * FlowDirection  > 1) { // Flow into the tank (Up)

        tankContext.beginPath();
        tankContext.moveTo(arrowX, arrowY + arrowLength / 2);
        tankContext.lineTo(arrowX, arrowY - arrowLength / 2);
        // Arrowhead
        tankContext.lineTo(arrowX + arrowSize / 2, arrowY - arrowLength / 2 + arrowSize);
        tankContext.moveTo(arrowX, arrowY - arrowLength / 2);
        tankContext.lineTo(arrowX - arrowSize / 2, arrowY - arrowLength / 2 + arrowSize);
        tankContext.stroke();
        tankContext.closePath();

    } else if (FlowRate * FlowDirection  < -1) { // Flow out of the tank (Down)

        tankContext.beginPath();
        tankContext.moveTo(arrowX, arrowY - arrowLength / 2);
        tankContext.lineTo(arrowX, arrowY + arrowLength / 2);
        // Arrowhead
        tankContext.lineTo(arrowX - arrowSize / 2, arrowY + arrowLength / 2 - arrowSize);
        tankContext.moveTo(arrowX, arrowY + arrowLength / 2);
        tankContext.lineTo(arrowX + arrowSize / 2, arrowY + arrowLength / 2 - arrowSize);
        tankContext.stroke();
        tankContext.closePath(); 

    } else {

        // No significant flow, draw a small vertical line or nothing
        tankContext.beginPath();
        tankContext.moveTo(arrowX, arrowY - 10);
        tankContext.lineTo(arrowX, arrowY + 10);
        tankContext.stroke();
        tankContext.closePath();
        
    }
}

function DrawHorizontalFlowArrow(arrowX, arrowY, arrowSize, arrowLength, FlowRate, FlowDirection) {          //(X Position, Y Position, Size of Arrowhead, Length of Arrow Line, Flow direction (1 or -1))
    

    tankContext.strokeStyle = '#007bff'; // Blue color for the arrow
    tankContext.lineWidth = 2;

    if (FlowRate * FlowDirection  > 1) { // Flow into the tank (left to right in the visual pipe)
        tankContext.beginPath();
        tankContext.moveTo(arrowX - arrowLength / 2, arrowY);
        tankContext.lineTo(arrowX + arrowLength / 2, arrowY);
        // Arrowhead
        tankContext.lineTo(arrowX + arrowLength / 2 - arrowSize, arrowY - arrowSize / 2);
        tankContext.moveTo(arrowX + arrowLength / 2, arrowY);
        tankContext.lineTo(arrowX + arrowLength / 2 - arrowSize, arrowY + arrowSize / 2);
        tankContext.stroke();
        tankContext.closePath();
    } else if (FlowRate * FlowDirection < -1) { // Flow out of the tank (right to left in the visual pipe)
        tankContext.beginPath();
        tankContext.moveTo(arrowX + arrowLength / 2, arrowY);
        tankContext.lineTo(arrowX - arrowLength / 2, arrowY);
        // Arrowhead
        tankContext.lineTo(arrowX - arrowLength / 2 + arrowSize, arrowY - arrowSize / 2);
        tankContext.moveTo(arrowX - arrowLength / 2, arrowY);
        tankContext.lineTo(arrowX - arrowLength / 2 + arrowSize, arrowY + arrowSize / 2);
        tankContext.stroke();
        tankContext.closePath();
    } else {
        // No significant flow, draw a small horizontal line or nothing
        tankContext.beginPath();
        tankContext.moveTo(arrowX - 10, arrowY);
        tankContext.lineTo(arrowX + 10, arrowY);
        tankContext.stroke();
        tankContext.closePath();
    }
}

function UpdateProcessDataPanel() {
    
    // Display the results in the process data panel
    displaySupplyLineOilVolumePro.textContent = SupplyLineOilPercentage.toFixed(2); // Display flow rate in m3/s
    displayflowRateLMINPro.textContent = flowRateLMIN.toFixed(2); // Display flow rate in l/min
    displayActOilConsumptionLMINPro.textContent = ActOilConsumptionLMIN.toFixed(2); // Display flow rate in l/min
    displaycurrentTimePro.textContent = currentTime.toFixed(2); // Display the current time in s
    displayTankOilVolumePro.textContent = TankOilPercentage.toFixed(2); // Display the current time in s
    
}

function ResetProcessDataPanel() {
    
    displaySupplyLineOilVolumePro.textContent = "0.00"; // Reset supply line oil volume percentage
    displayflowRateLMINPro.textContent = "0.00"; // Reset flow rate
    displayActOilConsumptionLMINPro.textContent = "0.00"; // Reset flow rate
    displaycurrentTimePro.textContent = "0.00"; // Reset current time
    displayTankOilVolumePro.textContent = "0.00"; // Reset tank oil volume percentage
    
}


function updateUI() {
    
    tankContext.clearRect(0, 0, tankCanvas.width, tankCanvas.height); // Clear the canvas
    resetDrawing();

    // Update and draw pressure gauges
    // Pressure to the supply lines that go to the machines
    drawPressureGauge(tankContext, 330, 360, MachineOilPressure, "");
    tankContext.lineWidth = 2;
    tankContext.fillStyle = '#000000'; // Fill color for the oil level
    context.beginPath();
    context.moveTo(330, 380);
    context.lineTo(330, 390);
    context.stroke();
    context.closePath();

    // Pressure in the Oil Header
    drawPressureGauge(tankContext, 540, 360, OilHeaderPressure, "");
    tankContext.lineWidth = 2;
    tankContext.fillStyle = '#000000'; // Fill color for the oil level
    context.beginPath();
    context.moveTo(540, 380);
    context.lineTo(540, 390);
    context.stroke();
    context.closePath();
    // Hydrostatic pressure from the tank
    drawPressureGauge(tankContext, 400, 320, hydrostaticPressureBARG, "");
    tankContext.lineWidth = 2;
    tankContext.fillStyle = '#000000'; // Fill color for the oil level
    context.beginPath();
    context.moveTo(420, 320);
    context.lineTo(430, 320);
    context.stroke();
    context.closePath();

    // Add dynamic displays for Pressure, Flow Rate, and Flow Direction Arrow
    tankContext.font = '16px Arial';
    tankContext.fillStyle = '#333'; // Dark gray color for text

    // Display Flow to Tank
    
    tankContext.save();
    tankContext.translate(400, 240);
    tankContext.rotate(-Math.PI/2);
    tankContext.textAlign = "center";
    tankContext.fillText(`${flowRateLMIN.toFixed(1)} l/min`, 0, 0);
    tankContext.restore();

    DrawVerticalFlowArrow(410, 240, 10, 50, flowRateLMIN, 1) //Flow to and from Overhead tank

    // Display Flow to Machine
    tankContext.fillText(`${ActOilConsumptionLMIN.toFixed(1)} l/min`, 220, 360);

    DrawHorizontalFlowArrow(220, 370, 10, 50, ActOilConsumptionLMIN, -1) //Flow to Machines

    //Display header 

    
    //Oil Tank Level

    tankContext.lineWidth = 3;
    tankContext.fillStyle = '#9E6851'; // Fill color for the oil level
    tankContext.fillRect(393.5, 24 + (158 * (1 - TankOilPercentage / 100)), 83, 158 * (TankOilPercentage / 100)); // Fill the tank based on the percentage

    tankContext.strokeStyle = '#000000';
    tankContext.strokeRect(393.5, 24, 83, 158);

    // Supply Line Oil Level
    tankContext.strokeStyle = '#9E6851';
    tankContext.lineWidth = 6;
    tankContext.beginPath();
    tankContext.moveTo(435, 360);
    tankContext.lineTo(435, 360 - (180 * (SupplyLineOilPercentage / 100))); // Draw the oil level line in the supply line
    tankContext.stroke();
    tankContext.closePath();

}


// 6. Simulation Loop

function startSimulation() {

    //Disable fixed property inputs ---
    setFixedPropertyInputsEnabled(false);

    
    // Set up the interval
    simulationIntervalId = setInterval(runSimulationStep, timeStep * 1000); // timeStep in milliseconds

    CalulateBoundryVarialbles();
    console.log("Simulation started.");

}


function runSimulationStep() {
    if (currentTime <= totalSimulationDuration) {
        // 1. Calculate instantaneous flow rate (using existing logic or a modified version)

        flowRateLMIN = CalculateflowRateLMIN();
        ActOilConsumptionLMIN = CalculateActOilConsumptionLMIN();



        // 2. Calculate volume change
        let deltaVolume = flowRateLMIN / 60 * timeStep;  // Convert l/min to l/s and multiply by timeStep in seconds

        // 3. Update volume
        
        // Add checks for SupplyLineVolume and TankVolume to prevent division by zero in percentages
        const currentSupplyLineVolume = SupplyLineVolume > 0 ? SupplyLineVolume : 1; // Use a safe default
        const currentTankVolume = TankVolume > 0 ? TankVolume : 1; // Use a safe default

        if (SupplyLineOilPercentage < 100 || (TankOilPercentage == 0 && Math.sign(flowRateLMIN) == -1)) {
        SupplyLineOilVolume += deltaVolume; // Update the oil volume in the supply line

        SupplyLineOilPercentage = (SupplyLineOilVolume / currentSupplyLineVolume) * 100; // Percentage of oil in the supply line
        SupplyLineOilPercentage = Math.max(0, Math.min(SupplyLineOilPercentage, 100)); // Ensure percentage is between 0 and 100

        } else {
            TankOilVolume += deltaVolume; // Update the oil volume in the tank
            TankOilVolume = Math.min(TankOilVolume,TankVolume)   // make sure that the Tank is not filled beyond it

            TankOilPercentage = (TankOilVolume / currentTankVolume) * 100; // Percentage of oil in the tank
            TankOilPercentage = Math.max(0, Math.min(TankOilPercentage, 100)); // Ensure percentage is between 0 and 100

        }

        StoredOilPercentage = 100 * (TankOilVolume + SupplyLineOilVolume) / (currentSupplyLineVolume + currentTankVolume); // percentage of combined pipe and tank volume
        StoredOilPercentage  = Math.max(0, Math.min(StoredOilPercentage , 100)); // Ensure percentage is between 0 and 100


        // 4. Update current time
        currentTime += timeStep;

        // Add data to chart
        chartData.labels.push(currentTime.toFixed(1)); // Store time
        chartData.datasets[0].data.push((StoredOilPercentage).toFixed(2)); // Store tank percentage
        oilLevelChart.update(); // Update the chart to show new data

        // 5. Update UI (e.g., display TankOilVolume, update canvas)
        updateUI();
        UpdateProcessDataPanel()


    } else {
        // Simulation finished
        stopSimulation();
    }
}



// Function to stop the simulation
function stopSimulation() {
    clearInterval(simulationIntervalId);
    console.log("Simulation stopped.");
}

// Function to reset the simulation
function resetSimulation() {
    // Reset all variables to their initial state
    currentTime = 0;
    SupplyLineOilVolume = 0;
    TankOilVolume = 0;

    
    // Reset the canvas drawing (if applicable)
    tankContext.clearRect(0, 0, tankCanvas.width, tankCanvas.height); // Clear the canvas

    // Redraw the initial state of the system (if applicable)
    CalulateBoundryVarialbles();
    resetDrawing();


    // reset Process Data Panel
    ResetProcessDataPanel();

  
    // Clear chart data on reset
    chartData.labels = [];
    chartData.datasets[0].data = [];
    oilLevelChart.update(); // Update chart to reflect empty data

    //  Enable fixed property inputs ---
    setFixedPropertyInputsEnabled(true);

    // Update the UI
    
    updateUI();
    
  
    // Reset the simulation interval
    if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
    }
    simulationIntervalId = null; // Clear the interval ID
    console.log("Simulation reset.");
}

//Function to enable/disable fixed property inputs ---
function setFixedPropertyInputsEnabled(enabled) {
    fixedPropertyInputs.forEach(input => {
        input.disabled = !enabled; // Set disabled to true if not enabled, false if enabled
        // Also remove any invalid-input styling when enabled
        if (enabled) {
            input.classList.remove('invalid-input');
        }
    });
}


const StartButton = document.getElementById('StartButton');
StartButton.addEventListener('click', function() {
    startSimulation(); 
});

const StopButton = document.getElementById('StopButton');
StopButton.addEventListener('click', function() {
    stopSimulation(); 
});

const ResetButton = document.getElementById('ResetButton');
ResetButton.addEventListener('click', function() {
    resetSimulation(); 
});

});
