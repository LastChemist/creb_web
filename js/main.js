class ChemicalApp {
    constructor() {
        this.stoichiometryData = {
            reactants: [],
            products: [],
            molarWeightsReactants: [],
            molarWeightsProducts: [],
            gramInputs: [],
            moleInputs: [],
            radioButtons: [],
            selectedIndex: null,
            allCompounds: [],
            totalMolarWeights: [],
            balancedCoefficients: null,
            equationSolution: null
        };

        this.currentEquationSolver = null;
        this.solutionStepsExpanded = false;
        this.currentEquation = "";

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupExamples();
        this.setupCopyButtons();
    }

    setupEventListeners() {
        // Tabs
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // Balancer
        document.getElementById('balance-button').addEventListener('click', () => this.balanceEquation());
        document.getElementById('clear-button').addEventListener('click', () => this.clearBalancer());

        // Stoichiometry
        document.getElementById('calculate-stoich-button').addEventListener('click', () => this.calculateStoichiometry());
        document.getElementById('clear-stoich-button').addEventListener('click', () => this.clearStoichiometry());
        document.getElementById('load-balanced-button').addEventListener('click', () => this.loadBalancedToStoichiometry());
        document.getElementById('view-table-button').addEventListener('click', () => this.showFullTableViewer());

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('close-table-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('export-table-btn').addEventListener('click', () => this.exportTableToClipboard());

        // Solution steps
        document.getElementById('toggle-solution-btn').addEventListener('click', () => this.toggleSolutionSteps());

        // Equation input
        const equationInput = document.getElementById('equation-input');
        equationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.balanceEquation();
        });
        equationInput.addEventListener('input', (e) => {
            this.currentEquation = e.target.value.trim();
        });
        equationInput.focus();
    }

    setupExamples() {
        const examples = [
            "H2 + O2 -> H2O",
            "CH4 + O2 -> CO2 + H2O",
            "Fe + O2 -> Fe2O3",
            "NaOH + H2SO4 = Na2SO4 + H2O",
            "KMnO4 + HCl = KCl + MnCl2 + Cl2 + H2O",
            "Al + HCl = AlCl3 + H2",
            "C6H12O6 + O2 = CO2 + H2O",
            "NH3 + O2 = NO + H2O",
            "Cu + HNO3 = Cu(NO3)2 + NO + H2O",
            "K4Fe(CN)6 + KMnO4 + H2SO4 = Fe2(SO4)3 + MnSO4 + KNO3 + CO2 + K2SO4 + H2O"
        ];

        document.querySelectorAll('.example-btn').forEach((btn, i) => {
            if (i < examples.length) {
                btn.dataset.equation = examples[i];
                btn.textContent = examples[i].replace(/->/g, '→').replace(/=/g, '=');
                btn.addEventListener('click', (e) => {
                    this.loadExample(e.target.dataset.equation);
                });
            }
        });
    }

    setupCopyButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.copy-btn')) {
                const btn = e.target.closest('.copy-btn');
                const targetId = btn.dataset.target;
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    this.copyToClipboard(targetEl.textContent, `${targetId.replace('-', ' ')} copied!`);
                }
            }
        });
    }

    switchTab(e) {
        const tabId = e.target.dataset.tab;

        // Update buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Show tab content
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    loadExample(equation) {
        const input = document.getElementById('equation-input');
        input.value = equation;
        input.focus();
        this.currentEquation = equation;

        // Clear previous results but keep the equation
        document.getElementById('output-container').classList.add('hidden');
        document.getElementById('error-container').classList.add('hidden');
        document.getElementById('solution-steps-container').classList.add('hidden');
        document.getElementById('copy-status').textContent = '';
        this.currentEquationSolver = null;

        const toggleBtn = document.getElementById('toggle-solution-btn');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Detailed Solution Steps';
        this.solutionStepsExpanded = false;
    }

    clearBalancer() {
        document.getElementById('equation-input').value = '';
        this.currentEquation = '';
        document.getElementById('output-container').classList.add('hidden');
        document.getElementById('error-container').classList.add('hidden');
        document.getElementById('solution-steps-container').classList.add('hidden');
        document.getElementById('copy-status').textContent = '';
        this.currentEquationSolver = null;

        const toggleBtn = document.getElementById('toggle-solution-btn');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Detailed Solution Steps';
        this.solutionStepsExpanded = false;
    }

    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-container').classList.remove('hidden');
        document.getElementById('output-container').classList.add('hidden');
        document.getElementById('solution-steps-container').classList.add('hidden');
    }

    showResult(balancedEq, equationSolver) {
        document.getElementById('balanced-equation').textContent = balancedEq;

        if (equationSolver && equationSolver.balancedCoefficients) {
            let coeffText = "Coefficients: ";
            const entries = Object.entries(equationSolver.balancedCoefficients);
            for (let i = 0; i < entries.length; i++) {
                const [compound, coeff] = entries[i];
                coeffText += `${compound}: ${coeff}`;
                if (i < entries.length - 1) {
                    coeffText += ", ";
                }
            }
            document.getElementById('coefficients-text').textContent = coeffText;
        } else {
            document.getElementById('coefficients-text').textContent = '';
        }

        // Generate solution steps
        if (equationSolver) {
            const solutionSteps = this.generateSolutionSteps(equationSolver);
            document.getElementById('solution-steps-content').innerHTML = solutionSteps;
            document.getElementById('solution-steps-container').classList.add('hidden');
        }

        document.getElementById('output-container').classList.remove('hidden');
        document.getElementById('error-container').classList.add('hidden');

        // Update stoichiometry tab
        document.getElementById('stoich-equation-text').textContent = `Balanced Equation: ${balancedEq}`;
    }

    balanceEquation() {
        const equation = document.getElementById('equation-input').value.trim();
        this.currentEquation = equation;

        if (!equation) {
            this.showError("Please enter a chemical equation");
            return;
        }

        try {
            const equationSolver = new Generator(equation);
            equationSolver.solveEquations();

            if (!equationSolver.balancedEquationStr) {
                throw new Error("Could not balance the equation");
            }

            this.currentEquationSolver = equationSolver;
            this.showResult(equationSolver.balancedEquationStr, equationSolver);

        } catch (error) {
            this.showError(`Error: ${error.message}`);
        }
    }

    formatValue(value, isMolarWeight = false) {
        if (value === null || value === undefined || value === '') {
            return "";
        }

        try {
            const num = typeof value === 'number' ? value : parseFloat(value);

            if (isNaN(num)) {
                return String(value);
            }

            if (Math.abs(num) < 1e-10) {
                return "0";
            }

            if (isMolarWeight) {
                return num.toFixed(3);
            }

            if (Math.abs(num) < 0.001 && Math.abs(num) > 1e-10) {
                return num.toExponential(2);
            }

            if (Math.abs(num) >= 1e6) {
                return num.toExponential(2);
            }

            if (Math.abs(num - Math.round(num)) < 1e-5) {
                return Math.round(num).toString();
            }

            let formatted = num.toFixed(6);
            formatted = formatted.replace(/\.?0+$/, '');

            if (!formatted.includes('.') && Math.abs(num - Math.round(num)) > 1e-5) {
                return num.toFixed(1);
            }

            return formatted;

        } catch (error) {
            return String(value);
        }
    }

    generateSolutionSteps(equationSolver) {
        try {
            const steps = [];
            let stepNum = 1;

            // Step 1: Parse reactants and products
            steps.push(`
            <div class="solution-step">
                <div class="step-header">
                    <div class="step-number">${stepNum}</div>
                    <div class="step-title">Parse Reactants and Products</div>
                </div>
                <div class="step-content">
                    <div class="step-line">Original equation: ${this.currentEquation}</div>
                    <div class="step-line">Reactants: ${equationSolver.reactantsList.join(', ')}</div>
                    <div class="step-line">Products: ${equationSolver.productsList.join(', ')}</div>
                </div>
            </div>
        `);

            stepNum++;

            // Step 2: Identify elements - FIXED: Ensure we call the correct method
            // First make sure we have parsed elements
            const elements = equationSolver.getPresentElementsInReaction ?
                equationSolver.getPresentElementsInReaction() :
                equationSolver.presentElementsInReaction || [];

            steps.push(`
            <div class="solution-step">
                <div class="step-header">
                    <div class="step-number">${stepNum}</div>
                    <div class="step-title">Identify All Elements</div>
                </div>
                <div class="step-content">
                    <div class="step-line">Elements present: ${elements.join(', ')}</div>
                    <div class="step-line">Number of elements: ${elements.length}</div>
                </div>
            </div>
        `);

            stepNum++;

            // Step 3: Assign variables and create equations
            // Make sure parameters are assigned
            if (equationSolver.assignParameter) {
                equationSolver.assignParameter();
            }

            const [equationsList] = equationSolver.generateLinearEquationsSystem
                ? equationSolver.generateLinearEquationsSystem()
                : [[], '', []];

            const varMapping = [];
            for (const reactant of equationSolver.reactantsList) {
                const varName = equationSolver.reactantsAssignedParameterDict
                    ? equationSolver.reactantsAssignedParameterDict[reactant]
                    : '?';
                varMapping.push(`${varName} → ${reactant}`);
            }
            for (const product of equationSolver.productsList) {
                const varName = equationSolver.productsAssignedParameterDict
                    ? equationSolver.productsAssignedParameterDict[product]
                    : '?';
                varMapping.push(`${varName} → ${product}`);
            }

            const equationDisplay = equationsList.map((eq, i) => {
                const element = elements[i] || `Element ${i}`;
                return `${element}: ${eq} = 0`;
            });

            steps.push(`
            <div class="solution-step">
                <div class="step-header">
                    <div class="step-number">${stepNum}</div>
                    <div class="step-title">Set Up Algebraic Equations</div>
                </div>
                <div class="step-content">
                    ${varMapping.map(m => `<div class="step-line">${m}</div>`).join('')}
                    <div class="step-line"></div>
                    ${equationDisplay.map(eq => `<div class="step-line">${eq}</div>`).join('')}
                </div>
            </div>
        `);

            stepNum++;

            // Step 4: Solve and get coefficients - FIXED: Check if coefficients exist
            if (equationSolver && equationSolver.balancedCoefficients) {
                const coeffSteps = ["Final integer coefficients:"];
                for (const [compound, coeff] of Object.entries(equationSolver.balancedCoefficients)) {
                    coeffSteps.push(`${compound}: ${coeff}`);
                }

                steps.push(`
                <div class="solution-step">
                    <div class="step-header">
                        <div class="step-number">${stepNum}</div>
                        <div class="step-title">Obtain Integer Coefficients</div>
                    </div>
                    <div class="step-content">
                        ${coeffSteps.map(step => `<div class="step-line">${step}</div>`).join('')}
                    </div>
                </div>
            `);

                stepNum++;

                // Step 5: Final equation - FIXED: Check if balanced equation exists
                if (equationSolver.balancedEquationStr) {
                    steps.push(`
                    <div class="solution-step">
                        <div class="step-header">
                            <div class="step-number">${stepNum}</div>
                            <div class="step-title">Final Balanced Equation</div>
                        </div>
                        <div class="step-content">
                            <div class="step-line">${equationSolver.balancedEquationStr}</div>
                        </div>
                    </div>
                `);
                }
            } else {
                // If no coefficients, show error
                steps.push(`
                <div class="solution-step">
                    <div class="step-header">
                        <div class="step-number">${stepNum}</div>
                        <div class="step-title">Balancing Failed</div>
                    </div>
                    <div class="step-content">
                        <div class="step-line" style="color: red;">Could not balance the equation. Please check your input.</div>
                    </div>
                </div>
            `);
            }

            return steps.join('');

        } catch (error) {
            console.error("Error generating steps:", error);
            return `<div class="error-message">Could not generate solution steps: ${error.message}</div>`;
        }
    }

    toggleSolutionSteps() {
        this.solutionStepsExpanded = !this.solutionStepsExpanded;
        const container = document.getElementById('solution-steps-container');
        const btn = document.getElementById('toggle-solution-btn');

        if (this.solutionStepsExpanded) {
            container.classList.remove('hidden');
            btn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Detailed Solution Steps';
        } else {
            container.classList.add('hidden');
            btn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Detailed Solution Steps';
        }
    }

    copyToClipboard(text, message) {
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            this.showCopyStatus(message, 'green');
        }).catch(err => {
            this.showCopyStatus(`Failed to copy: ${err}`, 'red');
        });
    }

    showCopyStatus(message, color) {
        const status = document.getElementById('copy-status');
        status.textContent = message;
        status.style.color = color;

        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    }

    loadBalancedToStoichiometry() {
        if (!this.currentEquationSolver) {
            this.updateStoichResult("Please balance an equation first", "red");
            return;
        }

        try {
            const equation = document.getElementById('equation-input').value.trim();
            const stoichiometryCalc = new Stoichiometry(equation);

            // Balance and calculate molar weights
            stoichiometryCalc.balanceEquation();
            stoichiometryCalc.calcSpeciesMolarWeight();

            // Store data
            this.stoichiometryData.reactants = GlobalVariables.reactantsList;
            this.stoichiometryData.products = GlobalVariables.productsList;
            this.stoichiometryData.molarWeightsReactants = GlobalVariables.reactantsMolarWeightsList;
            this.stoichiometryData.molarWeightsProducts = GlobalVariables.productsMolarWeightsList;
            this.stoichiometryData.allCompounds = [...GlobalVariables.reactantsList, ...GlobalVariables.productsList];
            this.stoichiometryData.totalMolarWeights = GlobalVariables.totalChemicalsMolarWeights;
            this.stoichiometryData.balancedCoefficients = this.currentEquationSolver.balancedCoefficients;
            this.stoichiometryData.equationSolution = this.currentEquationSolver.equationSolution;

            // Build grid
            const gridHTML = this.buildChemicalGrid();
            document.getElementById('stoichiometry-grid').innerHTML = gridHTML;
            document.getElementById('scrollable-grid-container').classList.remove('hidden');

            this.updateStoichResult("Select a compound and enter values to calculate", "grey");

        } catch (error) {
            this.updateStoichResult(`Error loading equation: ${error.message}`, "red");
        }
    }

    buildChemicalGrid() {
        const reactants = this.stoichiometryData.reactants;
        const products = this.stoichiometryData.products;
        const mwReactants = this.stoichiometryData.molarWeightsReactants;
        const mwProducts = this.stoichiometryData.molarWeightsProducts;
        const totalCompounds = reactants.length + products.length;

        // Clear previous inputs
        this.stoichiometryData.selectedIndex = null;

        let html = `
            <div class="grid-header">
                <div class="grid-label"></div>
        `;

        // Reactant headers
        reactants.forEach((r, i) => {
            html += `
                <div class="compound-cell">
                    <div class="compound-name compound-reactant">${r}</div>
                    <div class="compound-mw">${this.formatValue(mwReactants[i], true)} g/mol</div>
                </div>
            `;
        });

        html += `<div class="arrow-cell">→</div>`;

        // Product headers
        products.forEach((p, i) => {
            html += `
                <div class="compound-cell">
                    <div class="compound-name compound-product">${p}</div>
                    <div class="compound-mw">${this.formatValue(mwProducts[i], true)} g/mol</div>
                </div>
            `;
        });

        html += `</div>`;

        // Checkbox row
        html += `
            <div class="grid-row">
                <div class="grid-label">Select Compound:</div>
        `;

        for (let i = 0; i < totalCompounds; i++) {
            if (i === reactants.length) html += '<div class="arrow-cell"></div>';
            html += `
                <div class="checkbox-cell">
                    <input type="checkbox" class="stoich-checkbox" id="checkbox-${i}" 
                           onchange="app.handleCheckboxChange(${i}, this)">
                </div>
            `;
        }

        html += `</div>`;

        // Grams row
        html += `
            <div class="grams-row">
                <div class="grid-label">Grams (g):</div>
        `;

        for (let i = 0; i < totalCompounds; i++) {
            if (i === reactants.length) html += '<div class="arrow-cell"></div>';
            html += `
                <div class="input-cell">
                    <div class="input-with-copy">
                        <input type="text" class="stoich-input" id="gram-${i}" 
                               placeholder="Enter value" disabled 
                               oninput="app.handleInputChange(${i}, 'gram')">
                        <button class="copy-btn" onclick="app.copyInputValue('gram-${i}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        // Moles row
        html += `
            <div class="moles-row">
                <div class="grid-label">Moles (mol):</div>
        `;

        for (let i = 0; i < totalCompounds; i++) {
            if (i === reactants.length) html += '<div class="arrow-cell"></div>';
            html += `
                <div class="input-cell">
                    <div class="input-with-copy">
                        <input type="text" class="stoich-input" id="mole-${i}" 
                               placeholder="Enter value" disabled 
                               oninput="app.handleInputChange(${i}, 'mole')">
                        <button class="copy-btn" onclick="app.copyInputValue('mole-${i}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        html += `</div>`;

        return html;
    }

    handleCheckboxChange(index, checkbox) {
        // Uncheck all others
        for (let i = 0; i < this.stoichiometryData.allCompounds.length; i++) {
            if (i !== index) {
                const otherCheckbox = document.getElementById(`checkbox-${i}`);
                if (otherCheckbox) otherCheckbox.checked = false;
            }
        }

        // Update selected index
        this.stoichiometryData.selectedIndex = checkbox.checked ? index : null;

        // Enable/disable inputs
        for (let i = 0; i < this.stoichiometryData.allCompounds.length; i++) {
            const isSelected = i === this.stoichiometryData.selectedIndex;
            const gramInput = document.getElementById(`gram-${i}`);
            const moleInput = document.getElementById(`mole-${i}`);

            if (gramInput) {
                gramInput.disabled = !isSelected;
                gramInput.className = isSelected ? 'stoich-input selected' : 'stoich-input';
                if (!isSelected) gramInput.value = '';
            }

            if (moleInput) {
                moleInput.disabled = !isSelected;
                moleInput.className = isSelected ? 'stoich-input selected' : 'stoich-input';
                if (!isSelected) moleInput.value = '';
            }
        }
    }

    handleInputChange(index, type) {
        // Clear the other input field
        const otherType = type === 'gram' ? 'mole' : 'gram';
        const otherInput = document.getElementById(`${otherType}-${index}`);
        if (otherInput) otherInput.value = '';
    }

    copyInputValue(inputId) {
        const input = document.getElementById(inputId);
        if (input && input.value) {
            const type = inputId.startsWith('gram') ? 'Grams' : 'Moles';
            this.copyToClipboard(input.value, `${type} value copied!`);
        }
    }

    calculateStoichiometry() {
        if (this.stoichiometryData.selectedIndex === null) {
            this.updateStoichResult("Please select a compound first!", "red");
            return;
        }

        const selectedIdx = this.stoichiometryData.selectedIndex;
        const gramInput = document.getElementById(`gram-${selectedIdx}`);
        const moleInput = document.getElementById(`mole-${selectedIdx}`);

        const grams = gramInput?.value.trim();
        const moles = moleInput?.value.trim();

        if (!grams && !moles) {
            this.updateStoichResult("Enter gram or mole value for selected compound", "orange");
            return;
        }

        try {
            // Get coefficients and molar weights
            const coefficients = this.stoichiometryData.equationSolution;
            const molarWeights = this.stoichiometryData.totalMolarWeights;

            if (!coefficients || coefficients.length === 0) {
                throw new Error("No balanced coefficients found");
            }

            const selectedCoeff = coefficients[selectedIdx];
            const selectedMW = molarWeights[selectedIdx];

            let baseMoles;

            if (moles) {
                baseMoles = parseFloat(moles);
            } else {
                const gramValue = parseFloat(grams);
                baseMoles = gramValue / selectedMW;
            }

            // Calculate for all compounds
            for (let i = 0; i < coefficients.length; i++) {
                const ratio = coefficients[i] / selectedCoeff;
                const calculatedMoles = baseMoles * ratio;
                const calculatedGrams = calculatedMoles * molarWeights[i];

                const gramInputEl = document.getElementById(`gram-${i}`);
                const moleInputEl = document.getElementById(`mole-${i}`);

                if (gramInputEl) {
                    gramInputEl.value = this.formatValue(calculatedGrams);
                }
                if (moleInputEl) {
                    moleInputEl.value = this.formatValue(calculatedMoles);
                }
            }

            const compoundName = this.stoichiometryData.allCompounds[selectedIdx];
            this.updateStoichResult(`✓ Calculated stoichiometry for ${compoundName}`, "green");

        } catch (error) {
            this.updateStoichResult(`Error: ${error.message}`, "red");
        }
    }

    updateStoichResult(message, color) {
        const el = document.getElementById('stoich-result-text');
        el.textContent = message;
        el.style.color = color === 'red' ? '#c62828' :
            color === 'green' ? '#2e7d32' :
                color === 'orange' ? '#ff9800' : '#616161';
    }

    clearStoichiometry() {
        // Clear inputs
        for (let i = 0; i < this.stoichiometryData.allCompounds.length; i++) {
            const gramInput = document.getElementById(`gram-${i}`);
            const moleInput = document.getElementById(`mole-${i}`);
            const checkbox = document.getElementById(`checkbox-${i}`);

            if (gramInput) {
                gramInput.value = '';
                gramInput.disabled = true;
                gramInput.className = 'stoich-input';
            }
            if (moleInput) {
                moleInput.value = '';
                moleInput.disabled = true;
                moleInput.className = 'stoich-input';
            }
            if (checkbox) checkbox.checked = false;
        }

        this.stoichiometryData.selectedIndex = null;
        this.updateStoichResult("Select a compound and enter values to calculate", "grey");
    }

    showFullTableViewer() {
        if (!this.stoichiometryData.allCompounds.length) {
            this.updateStoichResult("Please load a balanced equation first", "red");
            return;
        }

        const tableHTML = this.buildFullTable();
        document.getElementById('table-content').innerHTML = tableHTML;
        document.getElementById('table-modal').classList.remove('hidden');
    }

    buildFullTable() {
        const compounds = this.stoichiometryData.allCompounds;
        const molarWeights = this.stoichiometryData.totalMolarWeights;
        const numReactants = this.stoichiometryData.reactants.length;

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Compound</th>
                        <th>Molar Weight (g/mol)</th>
                        <th>Grams (g)</th>
                        <th>Moles (mol)</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
        `;

        compounds.forEach((compound, i) => {
            const mw = molarWeights[i];
            const gramInput = document.getElementById(`gram-${i}`);
            const moleInput = document.getElementById(`mole-${i}`);

            const grams = gramInput?.value ? this.formatValue(gramInput.value) : "—";
            const moles = moleInput?.value ? this.formatValue(moleInput.value) : "—";
            const mwFormatted = mw ? this.formatValue(mw, true) : "—";
            const type = i < numReactants ? "Reactant" : "Product";
            const typeClass = i < numReactants ? "type-reactant" : "type-product";
            const compoundClass = i < numReactants ? "compound-reactant-data" : "compound-product-data";

            html += `
                <tr>
                    <td class="compound-cell-data ${compoundClass}">${compound}</td>
                    <td>${mwFormatted}</td>
                    <td>${grams}</td>
                    <td>${moles}</td>
                    <td class="type-cell ${typeClass}">${type}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        return html;
    }

    exportTableToClipboard() {
        const compounds = this.stoichiometryData.allCompounds;
        const molarWeights = this.stoichiometryData.totalMolarWeights;
        const numReactants = this.stoichiometryData.reactants.length;

        let text = "Compound,Molar Weight (g/mol),Grams (g),Moles (mol),Type\n";

        compounds.forEach((compound, i) => {
            const mw = molarWeights[i];
            const gramInput = document.getElementById(`gram-${i}`);
            const moleInput = document.getElementById(`mole-${i}`);

            const grams = gramInput?.value || "";
            const moles = moleInput?.value || "";
            const mwFormatted = mw ? this.formatValue(mw, true) : "";
            const type = i < numReactants ? "Reactant" : "Product";

            text += `${compound},${mwFormatted},${grams},${moles},${type}\n`;
        });

        this.copyToClipboard(text, "Table data copied to clipboard!");
    }

    closeModal() {
        document.getElementById('table-modal').classList.add('hidden');
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ChemicalApp();
    window.app = app;
});
