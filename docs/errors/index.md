[< Back](../../README.md)

# Errors

This file contains all the errors by code that can be thrown by the API. Each module gets a total of 1,000 error codes that can be divided among sub modules.

## Environment (1 - 999)

### `environment.utils.ts`

- **1:** `The environment property '${key}' has not been properly set. Received: ${val}`
- **2:** `The environment property '${key}' has a value of ${val} which is not in the list of allowed values: ${allowedValues}.`
- **3:** `The environment property '${key}' is not an integer. Received: ${val}`
- **4:** `The environment property '${key}' is not an object and could not be parsed. Received: ${val}`
- **5:** `The secret '${srcPath}' could not be read. ${extractMessage(e)}`
- **6:** `The secret '${srcPath}' has no content. Received: ${content}`
- **7:** `The parsed value is not a valid object. Received: ${parsedVal}`
- **8:** `The secret parsed value is not a valid object. Received: ${parsedVal}`