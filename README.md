
# Generador de Claves de Serie y Verificación con Algoritmo de Luhn

## Descripción General

Este programa en TypeScript genera claves de serie de hasta 15 dígitos con un sufijo de dos dígitos que puede ser personalizado (por ejemplo, "-24"). Las claves de serie se generan de forma que cumplan con el **algoritmo de Luhn** para verificar su validez. El programa incluye las siguientes funcionalidades:

- **Generación de claves de serie válidas** según el algoritmo de Luhn.
- **Validación de las claves generadas** para asegurar que cumplen con Luhn.
- **Almacenamiento de claves válidas** en una base de datos siguiendo el patrón **Repository**.

## Estructura del Código

### 1. Algoritmo de Luhn (`generateLuhnDigit`)

```typescript
const generateLuhnDigit = (numStr: string): number => {
    const digits = numStr.split('').map(Number).reverse();
    const sum = digits.reduce((acc, digit, idx) => {
        if (idx % 2 !== 0) {
            const doubled = digit * 2;
            return acc + (doubled > 9 ? doubled - 9 : doubled);
        } else {
            return acc + digit;
        }
    }, 0);
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
};
```

- **Descripción**: Esta función genera el **dígito de control** que se añade al final de la clave para que cumpla con el algoritmo de Luhn.
- **Parámetro**: `numStr` - una cadena que representa los primeros 14 dígitos de la clave de serie.
- **Retorno**: Un número entre 0 y 9, que es el dígito de control para que la suma total sea múltiplo de 10.
- **Funcionamiento**:
  - Convierte la cadena en un array de dígitos y lo invierte.
  - Multiplica por 2 los dígitos en posiciones impares (según Luhn).
  - Si el valor resultante de la multiplicación es mayor que 9, resta 9.
  - Calcula la suma total y determina el dígito de control necesario para que la suma sea múltiplo de 10.

### 2. Generador de Claves de Serie (`generateSerialKey`)

```typescript
const generateSerialKey = (prefix: string, suffix: string): string => {
    const fullPrefix = prefix.padStart(15, '0');
    const checkDigit = generateLuhnDigit(fullPrefix);
    return `${fullPrefix}${checkDigit}-${suffix}`;
};
```

- **Descripción**: Genera una clave de serie completa con un prefijo de hasta 13 dígitos, un dígito de control calculado mediante Luhn, y un sufijo personalizado.
- **Parámetros**:
  - `prefix` - el prefijo numérico de la clave (hasta 13 dígitos).
  - `suffix` - el sufijo numérico de 2 dígitos (por ejemplo, "24").
- **Retorno**: La clave de serie completa en formato de cadena.
- **Funcionamiento**:
  - Asegura que el prefijo tenga 15 dígitos añadiendo ceros a la izquierda si es necesario.
  - Calcula el dígito de control con `generateLuhnDigit`.
  - Devuelve la clave de serie en el formato `"15 dígitos + dígito de control-sufijo"`.

### 3. Validación de Clave con Luhn (`isLuhnValid`)

```typescript
const isLuhnValid = (serial: string): boolean => {
    const numStr = serial.slice(0, 15);
    const expectedCheckDigit = parseInt(serial[15]);
    return generateLuhnDigit(numStr) === expectedCheckDigit;
};
```

- **Descripción**: Valida que una clave de serie cumpla con el algoritmo de Luhn.
- **Parámetro**: `serial` - la clave de serie de 16 dígitos (15 + dígito de control).
- **Retorno**: `true` si cumple con Luhn, `false` en caso contrario.
- **Funcionamiento**:
  - Extrae los primeros 15 dígitos y el dígito de control de la clave.
  - Calcula el dígito de control esperado con `generateLuhnDigit`.
  - Compara el dígito calculado con el dígito real; si son iguales, la clave es válida.

### 4. Generación de Claves Válidas (`generateKeys`)

```typescript
const generateKeys = (prefix: string, suffix: string, count: number): string[] => {
    const keys = [];
    while (keys.length < count) {
        const key = generateSerialKey(prefix, suffix);
        if (isLuhnValid(key.replace(/-/g, ''))) {
            keys.push(key);
        }
    }
    return keys;
};
```

- **Descripción**: Genera un conjunto de claves de serie válidas.
- **Parámetros**:
  - `prefix` - prefijo numérico de la clave.
  - `suffix` - sufijo numérico de la clave.
  - `count` - cantidad de claves válidas a generar.
- **Retorno**: Un array de claves de serie válidas.
- **Funcionamiento**:
  - Genera claves de serie en un bucle hasta alcanzar el número deseado (`count`).
  - Cada clave generada se valida con `isLuhnValid`. Si es válida, se añade al array `keys`.
  - Este proceso garantiza que todas las claves en el array final cumplan con Luhn.

### 5. Almacenamiento en Base de Datos (`Database` y `SerialKeyRepository`)

```typescript
class Database {
    private keys: string[] = [];
    addKey(key: string): void { this.keys.push(key); }
    getKeys(): string[] { return this.keys; }
}

class SerialKeyRepository {
    private db: Database;
    constructor(db: Database) { this.db = db; }
    save(key: string): void { this.db.addKey(key); }
    findAll(): string[] { return this.db.getKeys(); }
}
```

- **Descripción**: Define un sistema de almacenamiento simple para las claves de serie usando el patrón **Repository**.
- **Clases**:
  - **`Database`**: Simula una base de datos en memoria, con métodos para añadir y recuperar claves.
  - **`SerialKeyRepository`**: Interfaz de acceso a `Database`, que encapsula las operaciones CRUD básicas.
- **Funcionamiento**:
  - `save` permite añadir una clave a la base de datos.
  - `findAll` devuelve todas las claves almacenadas.

### 6. Interfaz para el Usuario

```typescript
rl.question("Introduce el prefijo numérico (máximo 13 dígitos): ", (prefix) => {
    rl.question("Introduce el número de sufijo (por ejemplo, '24'): ", (suffix) => {
        rl.question("¿Cuántas claves deseas generar? (10, 100, 1000, etc.): ", (count) => {
            const numCount = parseInt(count);
            if (isNaN(numCount) || numCount <= 0) {
                console.log("Por favor introduce un número válido.");
            } else {
                const keys = generateKeys(prefix, suffix, numCount);
                keys.forEach(key => repo.save(key));
                console.log("\nClaves válidas generadas:\n" + keys.join('\n'));
                rl.close();
            }
        });
    });
});
```

- **Descripción**: Maneja la entrada del usuario y la generación de claves en base a los parámetros ingresados.
- **Funcionamiento**:
  - Solicita el prefijo, el sufijo y la cantidad de claves deseadas.
  - Llama a `generateKeys` para obtener las claves.
  - Almacena las claves válidas generadas en la base de datos mediante `SerialKeyRepository`.
  - Muestra las claves generadas en la consola.

## Ejecución y Flujo del Programa

1. El usuario ingresa el prefijo, sufijo y número de claves deseadas.
2. El programa llama a `generateKeys` para generar las claves válidas.
3. Cada clave generada se valida con el algoritmo de Luhn.
4. Si una clave es válida, se almacena en la base de datos y se muestra en consola.
5. Las claves válidas pueden ser accedidas o consultadas posteriormente mediante `SerialKeyRepository`.

## Notas Finales

Este programa garantiza que las claves generadas cumplen con el algoritmo de Luhn, permitiendo su uso en sistemas que requieren una validación adicional de número de serie, como tarjetas de crédito u otros sistemas de validación numérica. El patrón Repository facilita la expansión y modificación de la base de datos si se quiere implementar en sistemas reales.
