class Generator {
    constructor(chemicalEquation) {
        this.chemicalEquation = chemicalEquation;
        this.parameterSymbols = parameterSymbols.replace('i', '');

        try {
            const equationParserObject = new EquationParser(chemicalEquation);
            equationParserObject.parse();

            this.reactantsList = equationParserObject.reactantsList;
            this.productsList = equationParserObject.productsList;
            this.parsedReactants = equationParserObject.parsedReactants;
            this.parsedProducts = equationParserObject.parsedProducts;

            this.presentElementsInReaction = [];
            this.reactantsAssignedParameterDict = {};
            this.productsAssignedParameterDict = {};

            this.equationSolution = null;
            this.balancedCoefficients = null;
            this.balancedEquationStr = null;

        } catch (error) {
            throw new Error(`Failed to parse equation: ${error.message}`);
        }
    }

    getPresentElementsInReaction() {
        if (this.presentElementsInReaction && this.presentElementsInReaction.length > 0) {
            return this.presentElementsInReaction;
        }

        const elementSet = new Set();

        // Get elements from reactants
        for (const reactant of this.reactantsList) {
            try {
                const elements = Object.keys(new ElementCounter(reactant).parseFormula());
                elements.forEach(element => elementSet.add(element));
            } catch (error) {
                console.warn(`Error processing reactant ${reactant}:`, error);
            }
        }

        // Get elements from products
        for (const product of this.productsList) {
            try {
                const elements = Object.keys(new ElementCounter(product).parseFormula());
                elements.forEach(element => elementSet.add(element));
            } catch (error) {
                console.warn(`Error processing product ${product}:`, error);
            }
        }

        this.presentElementsInReaction = Array.from(elementSet);
        return this.presentElementsInReaction;
    }

    assignParameter() {
        this.getPresentElementsInReaction();

        this.reactantsAssignedParameterDict = {};
        this.productsAssignedParameterDict = {};

        const availableSymbols = 'abcdefghjklmnopqrstuvwxyz'.split(''); // بدون i

        // Assign to reactants
        for (let i = 0; i < this.reactantsList.length; i++) {
            const symbol = i < availableSymbols.length ? availableSymbols[i] : `x${i}`;
            this.reactantsAssignedParameterDict[this.reactantsList[i]] = symbol;
        }

        // Assign to products
        const startIdx = this.reactantsList.length;
        for (let i = 0; i < this.productsList.length; i++) {
            const idx = startIdx + i;
            const symbol = idx < availableSymbols.length ? availableSymbols[idx] : `x${idx}`;
            this.productsAssignedParameterDict[this.productsList[i]] = symbol;
        }
    }

    generateLinearEquationsSystem() {
        this.assignParameter();
        const equationsList = [];

        // Get all variables in order
        const allVariables = [];
        for (const reactant of this.reactantsList) {
            allVariables.push(this.reactantsAssignedParameterDict[reactant]);
        }
        for (const product of this.productsList) {
            allVariables.push(this.productsAssignedParameterDict[product]);
        }

        // Generate equations for each element
        for (const element of this.getPresentElementsInReaction()) {
            let equationTerms = [];

            // Add reactant terms (positive)
            for (const reactant of this.reactantsList) {
                if (this.parsedReactants[reactant] && this.parsedReactants[reactant][element]) {
                    const coeff = this.parsedReactants[reactant][element];
                    const param = this.reactantsAssignedParameterDict[reactant];
                    equationTerms.push(`${coeff}*${param}`);
                }
            }

            // Add product terms (negative)
            for (const product of this.productsList) {
                if (this.parsedProducts[product] && this.parsedProducts[product][element]) {
                    const coeff = this.parsedProducts[product][element];
                    const param = this.productsAssignedParameterDict[product];
                    equationTerms.push(`-${coeff}*${param}`);
                }
            }

            // Create equation string if we have terms
            if (equationTerms.length > 0) {
                // Combine terms
                let equation = equationTerms[0];
                for (let i = 1; i < equationTerms.length; i++) {
                    if (equationTerms[i].startsWith('-')) {
                        equation += ` ${equationTerms[i]}`;
                    } else {
                        equation += ` + ${equationTerms[i]}`;
                    }
                }
                equation += " = 0";
                equationsList.push(equation);
            }
        }

        return [equationsList, allVariables.join(','), allVariables];
    }

    solveEquations() {
        try {
            const [equationsList, , allVariables] = this.generateLinearEquationsSystem();

            if (equationsList.length === 0) {
                throw new Error("No equations generated");
            }

            // تعداد معادلات و متغیرها
            const numEquations = equationsList.length;
            const numVariables = allVariables.length;

            // ماتریس ضرایب
            const A = Array(numEquations + 1).fill().map(() => Array(numVariables).fill(0));
            const b = Array(numEquations + 1).fill(0);

            // پرکردن ماتریس از معادلات
            for (let i = 0; i < numEquations; i++) {
                const equation = equationsList[i].replace(' = 0', '');
                const terms = equation.split(/(?=[+-])/);

                for (let term of terms) {
                    term = term.trim();
                    if (!term) continue;

                    // تشخیص علامت
                    let sign = 1;
                    if (term.startsWith('-')) {
                        sign = -1;
                        term = term.substring(1);
                    } else if (term.startsWith('+')) {
                        term = term.substring(1);
                    }

                    // جدا کردن ضریب و متغیر
                    let coefficient = 1;
                    let variable = term;

                    if (term.includes('*')) {
                        const parts = term.split('*');
                        coefficient = parseFloat(parts[0]);
                        variable = parts[1];
                    }

                    const varIndex = allVariables.indexOf(variable);
                    if (varIndex !== -1) {
                        A[i][varIndex] += sign * coefficient;
                    }
                }
            }

            // معادله اضافی برای جلوگیری از جواب صفر: اولین متغیر = 1
            A[numEquations][0] = 1;
            b[numEquations] = 1;

            // حل سیستم معادلات
            const solution = this.solveGaussian(A, b);

            if (!solution) {
                throw new Error("No solution found");
            }

            // تبدیل به اعداد صحیح
            const integerSolution = this.convertToSmallestIntegers(solution);

            // ذخیره نتایج
            this.equationSolution = integerSolution;
            this.balancedCoefficients = {};

            // پر کردن دیکشنری ضرایب
            let idx = 0;
            for (const reactant of this.reactantsList) {
                this.balancedCoefficients[reactant] = integerSolution[idx++];
            }
            for (const product of this.productsList) {
                this.balancedCoefficients[product] = integerSolution[idx++];
            }

            // تولید معادله موازنه شده
            this._generateBalancedEquationStr();

            return integerSolution;

        } catch (error) {
            console.error("Error solving equations:", error);
            throw error;
        }
    }

    solveGaussian(A, b) {
        const n = A.length;
        const m = A[0].length;

        // ماتریس توسعه یافته
        const augmented = A.map((row, i) => [...row, b[i]]);

        // حذف گاوس
        for (let col = 0; col < Math.min(m, n); col++) {
            // پیدا کردن سطر با بزرگترین عنصر در این ستون
            let maxRow = col;
            for (let row = col + 1; row < n; row++) {
                if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
                    maxRow = row;
                }
            }

            // جابجایی سطرها
            [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

            // اگر عنصر صفر است، ادامه بده
            if (Math.abs(augmented[col][col]) < 1e-10) {
                continue;
            }

            // نرمالایز کردن سطر
            const pivot = augmented[col][col];
            for (let j = col; j <= m; j++) {
                augmented[col][j] /= pivot;
            }

            // حذف از سطرهای دیگر
            for (let row = 0; row < n; row++) {
                if (row !== col) {
                    const factor = augmented[row][col];
                    for (let j = col; j <= m; j++) {
                        augmented[row][j] -= factor * augmented[col][j];
                    }
                }
            }
        }

        // استخراج جواب
        const solution = new Array(m).fill(0);
        for (let i = 0; i < Math.min(m, n); i++) {
            solution[i] = augmented[i][m];
        }

        return solution;
    }

    convertToSmallestIntegers(solution) {
        // پیدا کردن کوچکترین مقدار مثبت برای نرمالایز کردن
        const positiveValues = solution.filter(x => x > 0);
        if (positiveValues.length === 0) {
            return solution.map(x => 1);
        }

        // تبدیل کسرها به اعداد صحیح
        const fractions = solution.map(x => this.decimalToFraction(x));

        // پیدا کردن ک.م.م مخرج‌ها
        let lcm = 1;
        for (const [, den] of fractions) {
            lcm = this.lcm(lcm, den);
        }

        // ضرب همه در ک.م.م
        const integers = fractions.map(([num, den]) => num * (lcm / den));

        // تقسیم بر ب.م.م برای ساده‌ترین ضرایب
        let gcd = Math.abs(integers[0]);
        for (let i = 1; i < integers.length; i++) {
            gcd = this.gcd(gcd, Math.abs(integers[i]));
        }

        const final = integers.map(x => Math.round(x / gcd));

        // اطمینان از مثبت بودن
        const hasNegative = final.some(x => x < 0);
        if (hasNegative) {
            return final.map(x => Math.abs(x));
        }

        return final;
    }

    decimalToFraction(decimal, tolerance = 1.0e-6) {
        if (Math.abs(decimal) < tolerance) return [0, 1];

        let numerator = 1;
        let denominator = 1;
        let fraction = numerator / denominator;

        let iteration = 0;
        while (Math.abs(fraction - decimal) > tolerance && iteration < 1000) {
            if (fraction < decimal) {
                numerator++;
            } else {
                denominator++;
                numerator = Math.round(decimal * denominator);
            }
            fraction = numerator / denominator;
            iteration++;
        }

        // ساده کردن
        const gcd = this.gcd(numerator, denominator);
        return [numerator / gcd, denominator / gcd];
    }

    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    lcm(a, b) {
        return Math.abs(a * b) / this.gcd(a, b);
    }

    _generateBalancedEquationStr() {
        if (!this.balancedCoefficients) return;

        const reactants = [];
        for (const reactant of this.reactantsList) {
            const coeff = this.balancedCoefficients[reactant];
            reactants.push(coeff === 1 ? reactant : `${coeff} ${reactant}`);
        }

        const products = [];
        for (const product of this.productsList) {
            const coeff = this.balancedCoefficients[product];
            products.push(coeff === 1 ? product : `${coeff} ${product}`);
        }

        this.balancedEquationStr = `${reactants.join(' + ')} → ${products.join(' + ')}`;
    }

    getBalancedEquation() {
        if (!this.balancedEquationStr) {
            this.solveEquations();
        }
        return this.balancedEquationStr;
    }

    getCoefficients() {
        if (!this.balancedCoefficients) {
            this.solveEquations();
        }
        return { ...this.balancedCoefficients };
    }
}
