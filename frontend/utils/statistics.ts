/**
 * Statistics Utilities - Funciones para análisis estadístico de experimentos DoE
 */

/**
 * Calcula la media de un array de números
 */
export function calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

/**
 * Calcula la desviación estándar de un array de números
 */
export function calculateStdDev(values: number[], mean: number): number {
    if (values.length <= 1) return 0;

    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((acc, val) => acc + val, 0) / (values.length - 1); // Sample variance

    return Math.sqrt(variance);
}

/**
 * Calcula el intervalo de confianza al 95% usando distribución t de Student
 */
export function calculateConfidenceInterval(
    mean: number,
    stdDev: number,
    n: number,
    confidence: number = 0.95
): [number, number] {
    if (n <= 1) return [mean, mean];

    // Valores críticos aproximados de t de Student para 95% CI
    // Para n pequeño usamos aproximación conserv adora
    const tCritical = getTCriticalValue(n - 1, confidence);

    const standardError = stdDev / Math.sqrt(n);
    const marginOfError = tCritical * standardError;

    return [mean - marginOfError, mean + marginOfError];
}

/**
 * Obtiene el valor crítico de la distribución t de Student
 * Aproximación para grados de libertad comunes con 95% confianza
 */
function getTCriticalValue(degreesOfFreedom: number, confidence: number): number {
    // Para 95% de confianza (alpha = 0.05, dos colas)
    if (confidence === 0.95) {
        const tValues: Record<number, number> = {
            1: 12.706,
            2: 4.303,
            3: 3.182,
            4: 2.776,
            5: 2.571,
            6: 2.447,
            7: 2.365,
            8: 2.306,
            9: 2.262,
            10: 2.228,
            15: 2.131,
            20: 2.086,
            30: 2.042,
            60: 2.000,
            120: 1.980
        };

        // Si degrees of freedom está  en la tabla, usarlo directamente
        if (tValues[degreesOfFreedom]) {
            return tValues[degreesOfFreedom];
        }

        // Interpolar o usar aproximación
        if (degreesOfFreedom > 120) {
            return 1.96; // Aproximación normal para n grande
        }

        // Para valores intermedios, usar el más cercano conservador
        const keys = Object.keys(tValues).map(Number).sort((a, b) => a - b);
        for (let i = 0; i < keys.length - 1; i++) {
            if (degreesOfFreedom > keys[i] && degreesOfFreedom < keys[i + 1]) {
                return tValues[keys[i]]; // Usar el valor más conservador
            }
        }

        return 2.0; // Valor por defecto conservador
    }

    // Para otras confianzas, usar aproximación
    return 1.96;
}

/**
 * Realiza análisis de varianza (ANOVA) de un factor para comparar 3 grupos
 * Retorna F-statistic y p-value aproximado
 */
export function performANOVA(
    groupA: number[],
    groupB: number[],
    groupC: number[]
): { fStatistic: number; pValue: number } {
    const nA = groupA.length;
    const nB = groupB.length;
    const nC = groupC.length;
    const nTotal = nA + nB + nC;

    if (nTotal < 3) {
        return { fStatistic: 0, pValue: 1 };
    }

    // Calcular medias de cada grupo
    const meanA = calculateMean(groupA);
    const meanB = calculateMean(groupB);
    const meanC = calculateMean(groupC);

    // Calcular media general (grand mean)
    const allValues = [...groupA, ...groupB, ...groupC];
    const grandMean = calculateMean(allValues);

    // Calcular suma de cuadrados entre grupos (SSB - Sum of Squares Between)
    const ssb =
        nA * Math.pow(meanA - grandMean, 2) +
        nB * Math.pow(meanB - grandMean, 2) +
        nC * Math.pow(meanC - grandMean, 2);

    // Calcular suma de cuadrados dentro de grupos (SSW - Sum of Squares Within)
    const sswA = groupA.reduce((sum, val) => sum + Math.pow(val - meanA, 2), 0);
    const sswB = groupB.reduce((sum, val) => sum + Math.pow(val - meanB, 2), 0);
    const sswC = groupC.reduce((sum, val) => sum + Math.pow(val - meanC, 2), 0);
    const ssw = sswA + sswB + sswC;

    // Grados de libertad
    const dfBetween = 2; // k - 1, donde k = 3 grupos
    const dfWithin = nTotal - 3; // N - k

    if (dfWithin <= 0) {
        return { fStatistic: 0, pValue: 1 };
    }

    // Cuadrados medios
    const msb = ssb / dfBetween;
    const msw = ssw / dfWithin;

    // F-statistic
    const fStatistic = msw > 0 ? msb / msw : 0;

    // P-value aproximado (usando tabla F simplificada para df1=2)
    const pValue = approximateFPValue(fStatistic, dfBetween, dfWithin);

    return { fStatistic, pValue };
}

/**
 * Aproxima el p-value de una distribución F
 * Para dfBetween = 2 (3 grupos)
 */
function approximateFPValue(fStat: number, dfBetween: number, dfWithin: number): number {
    // Valores críticos de F para df1=2 y varios df2 con alpha=0.05
    const fCritical05: Record<number, number> = {
        3: 9.55,
        4: 6.94,
        5: 5.79,
        6: 5.14,
        7: 4.74,
        8: 4.46,
        9: 4.26,
        10: 4.10,
        15: 3.68,
        20: 3.49,
        30: 3.32,
        60: 3.15,
        120: 3.07
    };

    // Valores críticos para alpha=0.01
    const fCritical01: Record<number, number> = {
        3: 30.82,
        4: 18.00,
        5: 13.27,
        6: 10.92,
        7: 9.55,
        8: 8.65,
        9: 8.02,
        10: 7.56,
        15: 6.36,
        20: 5.85,
        30: 5.39,
        60: 4.98,
        120: 4.79
    };

    // Obtener valores críticos cercanos
    let criticalValue05 = 3.0; // Valor por defecto
    let criticalValue01 = 5.0;

    const dfKey = Object.keys(fCritical05).map(Number).find(key => key >= dfWithin);
    if (dfKey && fCritical05[dfKey]) {
        criticalValue05 = fCritical05[dfKey];
        criticalValue01 = fCritical01[dfKey];
    }

    // Aproximar p-value
    if (fStat >= criticalValue01) {
        return 0.001; // p < 0.01
    } else if (fStat >= criticalValue05) {
        return 0.025; // 0.01 < p < 0.05
    } else if (fStat >= criticalValue05 * 0.7) {
        return 0.075; // Cerca del umbral
    } else {
        return 0.25; // No significativo
    }
}

/**
 * Identifica el grupo con el mejor rendimiento (mayor media)
 */
export function identifyWinner(
    meanA: number,
    meanB: number,
    meanC: number
): 'A' | 'B' | 'C' {
    if (meanA >= meanB && meanA >= meanC) {
        return 'A';
    } else if (meanB >= meanA && meanB >= meanC) {
        return 'B';
    } else {
        return 'C';
    }
}
