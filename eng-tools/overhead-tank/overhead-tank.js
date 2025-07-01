// overhead-tank.js

// 1. Get references to the HTML elements
    // Oil Header Pressure
    const OilHeaderPressureSlider = document.getElementById('OilHeaderPressure');
    const displayOilHeaderPressure = document.getElementById('displayOilHeaderPressure');
    
    // Oil Header Pressure
    const OrificeDiameterSlider = document.getElementById('OrificeDiameter');
    const displayOrificeDiameter = document.getElementById('displayOrificeDiameter');

    // Oil Density
    const OilDensityInput = document.getElementById('OilDensity');

    // Oil Viscosity
    const OilViscosityInput = document.getElementById('OilViscosity');

    // Supply Line Inner Diameter
    const SupplyLineInnerDiameterInput = document.getElementById('SupplyLineInnerDiameter');

    // Tanks Volume
    const TankVolumeInput = document.getElementById('TankVolume');

    // Tanks Height
    const TankElevationInput = document.getElementById('TankElevation');

 




// 2. Initialize your JavaScript variable

//General variables

let DischargeCoefficient = 0.61; // Discharge coefficient for the orifice
let SupplyLineOilVolume = 0; // Volume of oil in the supply line in litre
let TankOilVolume = 0; // Volume of oil in the tank in litre

let currentTime = 0; // Current time in seconds
let timeStep = 0.1; // Time step for the simulation in seconds
let simulationIntervalId;
let totalSimulationDuration = 60 * 60; // Total duration of the simulation in seconds





// This variable will hold the current value of the slider ar input
let OilHeaderPressure = parseFloat(OilHeaderPressureSlider.value);  //barg
let OrificeDiameter = parseFloat(OrificeDiameterSlider.value);      // mm
let OilDensity = parseFloat(OilDensityInput.value)                  // // kg/m3
let OilViscosity = parseFloat(OilViscosityInput.value)              // mm2/s
let SupplyLineInnerDiameter = parseFloat(SupplyLineInnerDiameterInput.value)   // mm
let TankVolume = parseFloat(TankVolumeInput.value)          
let TankElevation = parseFloat(TankElevationInput.value)              // m

// calulate initial variables
let SupplyLineVolume = (Math.pow((SupplyLineInnerDiameter / 100) * Math.PI, 2) / 4) * TankElevation * 10 ;   // Volume of the supply line in l 
let SupplyLineOilPercentage = (SupplyLineOilVolume / SupplyLineVolume) * 100; // Percentage of oil in the supply line
let TankOilPercentage = (TankOilVolume / TankVolume) * 100;  // Percentage of oil in the tank
let OrificeDownstreamPressure = 0   // Downstream pressure at the orifice in barg
let flowRate = 0; // Flow rate in m3/s
let deltaPressure = OilHeaderPressure

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
        //console.log("Current Oil Header Pressure:", OilHeaderPressure);
    });


OrificeDiameterSlider.addEventListener('input', function() {
   
    OrificeDiameter = parseFloat(this.value);
    displayOrificeDiameter.textContent = OrificeDiameter.toFixed(1); // .toFixed(1) for one decimal place
    displayOrificeDiameterPro.textContent = OrificeDiameter.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilDensityInput.addEventListener('input', function() {
   
    OilDensity = parseFloat(this.value);
    displayOilDensityPro.textContent = OilDensity.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

OilViscosityInput.addEventListener('input', function() {
   
    OilViscosity = parseFloat(this.value);
    displayOilViscosityPro.textContent = OilViscosity.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

SupplyLineInnerDiameterInput.addEventListener('input', function() {

    SupplyLineInnerDiameter = parseFloat(this.value);
    displaySupplyLineInnerDiameterPro.textContent = SupplyLineInnerDiameter.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place


});

TankVolumeInput.addEventListener('input', function() {
   
    TankVolume = parseFloat(this.value);
    displayTankVolumePro.textContent = TankVolume.toFixed(0); // not currently distplayed in html // .toFixed(1) for one decimal place

});

TankElevationInput.addEventListener('input', function() {
   
    TankElevation = parseFloat(this.value);
    displayTankElevationPro.textContent = TankElevation.toFixed(1); // not currently distplayed in html // .toFixed(1) for one decimal place

});


// 4. Calulation of process data

//function calculateProcessData() {
    // Calculate the flow rate using the orifice equation
   //const flowRate = DischargeCoefficient * Math.PI * Math.pow(OrificeDiameter / 1000, 2) * Math.sqrt(2 * OilHeaderPressure * 100000 / OilDensity); // Convert diameter to meters and pressure to Pascals
    //const flowRateLMIN = flowRate * 1000 * 60; // Convert m3/s to l/min

    // Calculate the velocity in the supply line
    //const SupplyLineInnerDiameter = parseFloat(SupplyLineInnerDiameterInput.value);
    //const velocity = flowRate / (Math.PI * Math.pow(SupplyLineInnerDiameter / 2000, 2)); // Convert diameter to meters


    // Display the results in the process data panel
    //displayFlowRatePro.textContent = flowRateLMIN.toFixed(2); // Display flow rate in m3/s
    //displayVelocityPro.textContent = velocity.toFixed(2); // Display velocity in m/s
//}



// 5. Auxiliary Functions





function CalculateFlowRate() {
    // Calculate the flow rate in liter per minutes using the orifice equation
    let deltaPressure = OilHeaderPressure - (SupplyLineOilPercentage * TankElevation * (OilDensity / 1000) * 9.81); // Calculate the pressure difference
    flowRate = DischargeCoefficient * Math.PI * Math.pow(OrificeDiameter / 1000, 2) * Math.sqrt(2 * deltaPressure * 100000 / OilDensity); // Convert diameter to meters and pressure to Pascals
    return flowRate * 1000 * 60; // Convert m3/s to l/min
}




// 6. Simulation Loop

function startSimulation() {
    // Reset variables if needed
    TankOilVolume = TankVolume;
    currentTime = 0;

    // Set up the interval
    simulationIntervalId = setInterval(runSimulationStep, timeStep * 1000); // timeStep in milliseconds

    console.log("Simulation started.");
}

function runSimulationStep() {
    if (currentTime <= totalSimulationDuration) {
        // 1. Calculate instantaneous flow rate (using existing logic or a modified version)

        let flowRateLMIN = CalculateFlowRate();

        // 2. Calculate volume change
        let deltaVolume = flowRateLMIN / 60 * timeStep;  // Convert l/min to l/s and multiply by timeStep in seconds

        // 3. Update volume
        //TankOilVolume += deltaVolume;

        SupplyLineOilVolume += deltaVolume; // Update the oil volume in the supply line

        SupplyLineOilPercentage = (SupplyLineOilVolume / SupplyLineVolume) * 100; // Percentage of oil in the supply line

        // 4. Update current time
        currentTime += timeStep;

        // 5. Update UI (e.g., display TankOilVolume, update canvas)

        // Display the results in the process data panel
        displaySupplyLineOilVolumePro.textContent = SupplyLineOilPercentage.toFixed(2); // Display flow rate in m3/s

        console.log(deltaPressure.toFixed(2))


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


const StartButton = document.getElementById('StartButton');
StartButton.addEventListener('click', function() {
    startSimulation(); 
});

const StopButton = document.getElementById('StopButton');
StopButton.addEventListener('click', function() {
    stopSimulation(); 
});
