class ElementCounter {
    constructor(chemicalFormula) {
        this.chemicalFormula = chemicalFormula;
    }

    parseFormula() {
        let formula = this.chemicalFormula;

        // Handle nested parentheses
        const expandParentheses = (formulaStr) => {
            while (formulaStr.includes('(')) {
                formulaStr = formulaStr.replace(/\(([^()]+)\)(\d*)/g, (match, content, count) => {
                    const repeatCount = count ? parseInt(count) : 1;
                    return content.repeat(repeatCount);
                });
            }
            return formulaStr;
        };

        formula = expandParentheses(formula);

        // Count elements
        const elementCounts = {};
        const elementPattern = /([A-Z][a-z]*)(\d*)/g;
        let match;

        while ((match = elementPattern.exec(formula)) !== null) {
            const element = match[1];
            const count = match[2] === '' ? 1 : parseInt(match[2]);
            elementCounts[element] = (elementCounts[element] || 0) + count;
        }

        return elementCounts;
    }
}

class EquationParser {
    constructor(chemicalEquation) {
        // جایگزین کردن جداکننده‌های مختلف با =
        this.chemicalEquation = chemicalEquation
            .replace(/->|→/g, '=')
            .replace(/\s+/g, ' ')
            .trim();
        
        this.equationSplitter = "=";
        this.chemicalSpeciesSplitter = "+";
        this.reactantsList = [];
        this.productsList = [];
        this.parsedReactants = {};
        this.parsedProducts = {};
    }

    splitIntoChemicalSpecies() {
        const splittedEquation = this.chemicalEquation.split(this.equationSplitter);

        if (splittedEquation.length !== 2) {
            throw new Error("Invalid equation format. Use '=' or '->' to separate reactants and products");
        }

        this.reactantsList = splittedEquation[0]
            .split(this.chemicalSpeciesSplitter)
            .map(species => species.trim())
            .filter(species => species.length > 0);

        this.productsList = splittedEquation[1]
            .split(this.chemicalSpeciesSplitter)
            .map(species => species.trim())
            .filter(species => species.length > 0);

        if (this.reactantsList.length === 0 || this.productsList.length === 0) {
            throw new Error("Equation must have at least one reactant and one product");
        }
    }

    countElementsInChemicalSpecie() {
        this.parsedReactants = {};
        this.parsedProducts = {};

        for (const reactant of this.reactantsList) {
            this.parsedReactants[reactant] = new ElementCounter(reactant).parseFormula();
        }

        for (const product of this.productsList) {
            this.parsedProducts[product] = new ElementCounter(product).parseFormula();
        }
    }

    parse() {
        this.splitIntoChemicalSpecies();
        this.countElementsInChemicalSpecie();
        return [this.parsedReactants, this.parsedProducts];
    }
}
