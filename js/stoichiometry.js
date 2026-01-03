class GlobalVariables {
    static mode = "";
    static selectedSpecie = "";
    static reactantsList = [];
    static productsList = [];
    static totalSpeciesChemicalFormulas = [];
    static reactantsMolarWeightsList = [];
    static productsMolarWeightsList = [];
    static totalChemicalsMolarWeights = [];
    static equationSolution = [];
    static ratios = [];
}

class Stoichiometry {
    constructor(chemicalEquation = "") {
        this.chemicalEquation = chemicalEquation;
    }

    balanceEquation() {
        try {
            const generator = new Generator(this.chemicalEquation);
            generator.solveEquations();

            GlobalVariables.equationSolution = generator.equationSolution;
            GlobalVariables.reactantsList = generator.reactantsList;
            GlobalVariables.productsList = generator.productsList;
            GlobalVariables.totalSpeciesChemicalFormulas = [
                ...generator.reactantsList,
                ...generator.productsList
            ];

            return true;
        } catch (error) {
            console.error("Error balancing equation:", error);
            return false;
        }
    }

    calcMolarWeight(chemicalFormula) {
        try {
            const elementsCountDict = new ElementCounter(chemicalFormula).parseFormula();
            let molarWeight = 0;

            for (const [element, count] of Object.entries(elementsCountDict)) {
                if (periodicTable[element]) {
                    molarWeight += count * periodicTable[element];
                } else {
                    console.warn(`Element ${element} not found in periodic table`);
                }
            }

            return parseFloat(molarWeight.toFixed(3));
        } catch (error) {
            console.error(`Error calculating molar weight for ${chemicalFormula}:`, error);
            return 0;
        }
    }

    calcRatio() {
        if (!GlobalVariables.equationSolution.length || GlobalVariables.selectedSpecie === "") {
            return [];
        }

        const selectedIdx = parseInt(GlobalVariables.selectedSpecie);
        if (selectedIdx < 0 || selectedIdx >= GlobalVariables.equationSolution.length) {
            return [];
        }

        const ratios = [];
        const baseCoefficient = GlobalVariables.equationSolution[selectedIdx];

        for (const coefficient of GlobalVariables.equationSolution) {
            ratios.push(coefficient / baseCoefficient);
        }

        GlobalVariables.ratios = ratios;
        return ratios;
    }

    calcSpeciesMolarWeight() {
        try {
            // First ensure we have balanced equation
            if (!GlobalVariables.equationSolution.length) {
                this.balanceEquation();
            }

            // Calculate molar weights
            GlobalVariables.reactantsMolarWeightsList = GlobalVariables.reactantsList.map(
                formula => this.calcMolarWeight(formula)
            );

            GlobalVariables.productsMolarWeightsList = GlobalVariables.productsList.map(
                formula => this.calcMolarWeight(formula)
            );

            GlobalVariables.totalChemicalsMolarWeights = [
                ...GlobalVariables.reactantsMolarWeightsList,
                ...GlobalVariables.productsMolarWeightsList
            ];

            return true;
        } catch (error) {
            console.error("Error calculating species molar weight:", error);
            return false;
        }
    }
}
