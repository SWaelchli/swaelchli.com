document.addEventListener('DOMContentLoaded', function () {
    const inputs = [
        'DesiredWeight_g', 
        'DesiredHydration_%', 
        'StarterWeight_g', 
        'StarterHydration_%'
    ];

    function calculate() {
        // 1. Get Values
        const totalWeight = parseFloat(document.getElementById('DesiredWeight_g').value) || 0;
        const targetHydr = (parseFloat(document.getElementById('DesiredHydration_%').value) || 0) / 100;
        const sWeight = parseFloat(document.getElementById('StarterWeight_g').value) || 0;
        const sHydr = (parseFloat(document.getElementById('StarterHydration_%').value) || 0) / 100;
        const saltRatio = 0.02; // Assuming 2% salt

        // 2. Math Logi
        // Break down starter
        const sFlour = sWeight / (1 + sHydr);
        const sWater = sWeight - sFlour;

        // Calculate total flour needed: Total = Flour + (Flour * Hydr) + (Flour * Salt)
        const totalFlour = totalWeight / (1 + targetHydr + saltRatio);

        // Calculate final ingredients
        const addedFlour = totalFlour - sFlour;
        const addedWater = (totalFlour * targetHydr) - sWater;
        const salt = totalFlour * saltRatio;

        // 3. Update HTML (using the IDs from output section)
        // We use .textContent to update the numbers safely
        document.getElementById('res_Starter').textContent = sWeight.toFixed(1);
        document.getElementById('res_Flour').textContent = Math.max(0, addedFlour).toFixed(1);
        document.getElementById('res_Water').textContent = Math.max(0, addedWater).toFixed(1);
        document.getElementById('res_Salt').textContent = Math.max(0, salt).toFixed(1);
    }

    // Add listeners to all inputs
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculate);
    });

    // Run once on load
    calculate();
});
