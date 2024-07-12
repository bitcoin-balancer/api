[< Back](../../README.md)

# Errors

This file contains all the errors by code that can be thrown by the API. Each module gets a total of 1,000 error codes that can be divided among sub modules.

## `APIError` (1 - 999)

- ...
- ...
- ...

### `validations.ts`

- **1:** `The API Errors cannot be listed with an invalid startAtID. Received: ${startAtID}.`





<br/><br/><br/>

## `Altcha` (1000 - 1999)

- If the errors `1000`, `1001` or `1002` are thrown, generate a new Altcha Challenge in the GUI.
- ...
- ...

### `index.ts`

- **1000:** `The provided altcha payload '${payload}' has an invalid format. Please try again.`
- **1001:** `The provided altcha payload '${payload}' has already been used. Please try again.`
- **1002:** `The solution to the Altcha challenge is invalid or it has expired. Please try again.`