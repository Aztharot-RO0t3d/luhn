import * as readline from 'readline';

const isLuhnValid = (num: string): boolean => {
    const nums = [...num].reverse().map(Number);
    return nums
        .map((digit, index) => (index % 2 !== 0 ? (digit * 2 > 9 ? digit * 2 - 9 : digit * 2) : digit))
        .reduce((acc, val) => acc + val, 0) % 10 === 0;
};

const generateSerialKey = (prefix: string, suffix: string): string => {
    const randomDigits = Array.from({ length: 15 - prefix.length }, () => Math.floor(Math.random() * 10)).join('');
    const fullPrefix = prefix + randomDigits;
    const checkDigit = isLuhnValid(fullPrefix) ? 0 : (10 - (fullPrefix.split('').map(Number).reduce((a, d, i) => a + (i % 2 === 0 ? d : d * 2), 0) % 10)) % 10;
    return `${fullPrefix}${checkDigit}-${suffix}`;
};

interface SerialKeyRepository {
    save(key: string): void;
    getAll(): string[];
}

class InMemorySerialKeyRepository implements SerialKeyRepository {
    private keys: string[] = [];
    save(key: string): void {
        this.keys.push(key);
    }
    getAll(): string[] {
        return this.keys;
    }
}

const generateValidSerialKeys = (prefix: string, suffix: string, count: number, repository: SerialKeyRepository): string[] => {
    const keys: string[] = [];
    while (keys.length < count) {
        const serialKey = generateSerialKey(prefix, suffix);
        if (isLuhnValid(serialKey.replace(/[^0-9]/g, ''))) {
            keys.push(serialKey);
            repository.save(serialKey);
        }
    }
    return keys;
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Introduce el prefijo numérico (máximo 13 dígitos): ", (prefix) => {
    rl.question("Introduce el número de sufijo (por ejemplo, '24'): ", (suffix) => {
        rl.question("¿Cuántas claves válidas deseas generar? (10, 100, 1000, etc.): ", (count) => {
            const numCount = parseInt(count);
            if (isNaN(numCount) || numCount <= 0) {
                console.log("Por favor introduce un número válido.");
                rl.close();
            } else {
                const repository = new InMemorySerialKeyRepository();
                const validKeys = generateValidSerialKeys(prefix, suffix, numCount, repository);

                console.log("\nClaves válidas generadas:");
                console.log(validKeys.join('\n'));

                console.log("\nContenido almacenado en la base de datos:");
                console.log(repository.getAll().join('\n'));

                rl.close();
            }
        });
    });
});
