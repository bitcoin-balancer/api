[< Back](../../README.md)

# Errors

This file contains all the errors by code that can be thrown by the API. Each module gets a total of 1,000 error codes that can be divided among sub modules.

## `Utils` (1 - 999)

- ...
- ...
- ...

### `index.ts`

- **1:** `Unable to sort list of values as they can only be string | number and must not be mixed. Received: ${typeof a}, ${typeof b}`





<br/><br/><br/>

## `APIError` (1000 - 1999)

- ...
- ...
- ...

### `validations.ts`

- **1000:** `The API Errors cannot be listed with an invalid startAtID. Received: ${startAtID}.`






<br/><br/><br/>

## `Altcha` (2000 - 2999)

- If the errors `2000`, `2001` or `2002` are thrown, generate a new Altcha Challenge in the GUI.
- ...
- ...

### `index.ts`

- **2000:** `The provided altcha payload '${payload}' has an invalid format. Please try again.`
- **2001:** `The provided altcha payload '${payload}' has already been used. Please try again.`
- **2002:** `The solution to the Altcha challenge is invalid or it has expired. Please try again.`





<br/><br/><br/>

## `Auth/User` (3000 - 3999)

- ...
- ...
- ...

### `index.ts`

- **3000:** ``

### `model.ts`

- **3250:** ``