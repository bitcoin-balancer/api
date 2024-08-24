[< Back](../../README.md)

# Errors

This file contains all the errors by code that can be thrown by the API. Each module gets a total of 1,000 error codes that can be divided among sub modules.

## `Utils` (1 - 999)

- ...
- ...
- ...

### `index.ts`

- **1:** `Unable to sort list of primitive values as they can only be string | number and must not be mixed. Received: ${typeof a}, ${typeof b}`
- **2:** `Unable to sort list of record values as they can only be string | number and must not be mixed. Received: ${typeof a[key]}, ${typeof b[key]}`





<br/><br/><br/><br/><br/><br/>

## `APIError` (1000 - 1999)

- ...
- ...
- ...

### `validations.ts`

- **1000:** `The API Errors cannot be listed with an invalid startAtID. Received: ${startAtID}.`
- **1001:** `The maximum number of API Errors that can be retrieved at a time is ${__QUERY_LIMIT}. Received: ${limit}`






<br/><br/><br/><br/><br/><br/>

## `Altcha` (2000 - 2999)

- ...
- ...
- ...

### `index.ts`

- **2000:** `The provided altcha payload '${payload}' has an invalid format. Please try again.`
- **2001:** `The solution to the Altcha challenge is invalid or it has expired. Please try again.`





<br/><br/><br/><br/><br/><br/>

## `Auth/User` (3000 - 3999)

- ...
- ...
- ...

### `index.ts`

- **3000:** `The OTP Token '${token}' for uid '${uid}' is invalid.`
- **3001:** `The uid '${uid}' was not found in the users object.`
- **3002:** `The user '${uid}' is not authorized to perform the action. Has ${__users[uid].authority} and needs ${requiredAuthority}`
- **3003:** `The user '${uid}' could not be found in the local users' object.`
- **3004:** `The password doesn't match the one stored in the database. Please double check it and try again.`
- **3005:** `The provided credentials are invalid. Please double-check them and try again. If your account is new, you must set a password via the "Password Update" section before signing in.`


### `model.ts`

- **3250:** `The otp_secret retrieved for uid '${uid}' doesn't exist or is invalid. Received: ${rows.length ? rows[0].otp_secret : 'undefined'}`
- **3251:** `The password_hash retrieved for user '${nickname}' doesn't exist or is invalid. Please go through the "Update Password" process before trying sign in again.`
- **3252:** `The user record retrieved for nickname '${nickname}' doesn't exist.`
- **3253:** `The sign in data could not be retrieved for '${nickname}' because it doesn't exist.`


### `validations.ts`

- **3500:** `The nickname '${nickname}' is invalid.`
- **3501:** `The nickname '${nickname}' is already being used by another user.`
- **3502:** `The root's authority must be 5. Received: ${authority}`
- **3503:** `The root account cannot be created with an invalid|weak password.`
- **3504:** `A password cannot be provided when creating a nonroot user.`
- **3505:** `The nonroot user's authority must range 1 - 4. Received: ${authority}`
- **3506:** `The uid '${uid}' is invalid.`
- **3507:** `The record for uid '${uid}' could not be found in the database.`
- **3508:** `The record for uid '${uid}' belongs to the root account and is not allowed for the requested action.`
- **3509:** `The password for uid '${uid}' is invalid or too weak. Make sure the password meets the requirements and try again.`
- **3510:** `The OTP Token '${token}' is invalid.`
- **3511:** `If the startAtEventTime arg is provided, it must be a valid timestamp. Received: ${startAtEventTime}`
- **3512:** `The maximum number of password update records that can be retrieved at a time is ${__PASSWORD_UPDATE_QUERY_LIMIT}. Received: ${limit}`





<br/><br/><br/><br/><br/><br/>

## `Auth/JWT` (4000 - 4999)

- In the vast majority of cases, if the error **`4252`** is raised, it means the JWT has expired
- ...
- ...

### `index.ts`

- **4000:** ``

### `jwt.ts`

- **4250:** `Failed to sign the JWT. Error: ${extractMessage(err)}`
- **4251:** `The signed JWT '${token}' has an invalid format.`
- **4252:** `Failed to verify the JWT. Error: ${extractMessage(err)}`
- **4253:** `The data decoded from the JWT is not a valid object or contains an invalid UUID.`

### `validations.ts`

- **4500:** `The uid '${uid}' is invalid.`
- **4501:** `The refresh JWT '${refreshJWT}' is invalid.`
- **4502:** `The UID decoded from the Refresh JWT '${decodedUID}' is different to the one stored in the database '${uidFromRecord}'.`

### `model.ts`

- **4750:** `The provided Refresh JWT did not match any uids stored in the database.`





<br/><br/><br/><br/><br/><br/>

## `IPBlacklist` (5000 - 5999)

- ...
- ...
- ...

### `index.ts`

- **5000:** `The ip '${ip}' is blacklisted and should not be served.`

### `validations.ts`

- **5250:** `The IP Address '${ip}' is invalid.`
- **5251:** `The IP Address Blacklisting notes are invalid. Received '${notes}'`
- **5252:** `The identifier '${id}' for the IP Blacklist Record is invalid.`
- **5253:** `The IP Address '${ip}' has already been blacklisted by another record.`
- **5254:** `The registration '${id}' cannot be unregistered because it doesn't exist.`
- **5255:** `The IP Blacklist records cannot be listed with an invalid startAtID. Received: ${startAtID}.`
- **5256:** `The maximum number of IP Blacklist records that can be retrieved at a time is ${__BLACKLIST_QUERY_LIMIT}. Received: ${limit}`





<br/><br/><br/><br/><br/><br/>

## `RequestGuard` (6000 - 6999)

- If the error **`6002`** is thrown, retry the request after ~1-2 minutes
- ...
- ...

### `index.ts`

- **6000:** `The API cannot accept requests when TEST_MODE is enabled.`
- **6001:** `The API cannot accept requests when RESTORE_MODE is enabled.`
- **6002:** `The API cannot accept requests because it has not yet been initialized. Please try again in a few minutes.`

### `validations.ts`

- **6250:** `The request's IP Address '${ip}' is invalid and therefore cannot be served.`
- **6251:** `The request cannot be served because the required arguments were not sent.`
- **6252:** `The arg '${argKey}' is required but it was not sent in the request.`
- **6253:** `The Authorization Header is invalid. Please review the docs and try again.`





<br/><br/><br/><br/><br/><br/>

## `Version` (7000 - 7999)

- ...
- ...
- ...

### `index.ts`

- **7000:** `The package.json file retrieved from ${url} does not contain a valid version.`
- **7001:** `The list of commits retrieved from ${url} are invalid.`





<br/><br/><br/><br/><br/><br/>

## `Server` (8000 - 8999)

- ...
- ...
- ...

### `index.ts`

- **8000:** ``

### `validations.ts`

- **8250:** `The alarms configuration is not a valid object.`
- **8251:** `The maxFileSystemUsage must be a number ranging 30-99. Received: ${config.maxFileSystemUsage}`
- **8252:** `The maxMemoryUsage must be a number ranging 30-99. Received: ${config.maxMemoryUsage}`
- **8253:** `The maxCPULoad must be a number ranging 30-99. Received: ${config.maxMemoryUsage}`
- **8254:** ``





<br/><br/><br/><br/><br/><br/>

## `Socket IO` (9000 - 9999)

- ...
- ...
- ...

### `index.ts`

- **9000:** `The event ${name} could not be emitted.`

### `utils.ts`

- **9250:** `The socket's handshake doesn't contain cookies. Received: ${cookie}`
- **9251:** `The Refresh JWT could not be extracted from the signed cookie. Received: ${jwt}`
- **9252:** ``






<br/><br/><br/><br/><br/><br/>

## `Notification` (10000 - 10999)

- ...
- ...
- ...

### `index.ts`

- **10000:** ``

### `utils.ts`

- **10250:** ``

### `validations.ts`

- **10500:** `The maximum number of API Errors that can be retrieved at a time is ${__QUERY_LIMIT}. Received: ${limit}`
- **10501:** `The API Errors cannot be listed with an invalid startAtID. Received: ${startAtID}.`






<br/><br/><br/><br/><br/><br/>

## `Candlestick` (11000 - 11999)

- ...
- ...
- ...

### `index.ts`

- **11000:** ``






<br/><br/><br/><br/><br/><br/>

## `Exchange` (12000 - 12999)

- ...
- ...
- ...

### `index.ts`

- **12000:** ``

### `utils.ts`

- **12250:** ``

### `validations.ts`

- **12500:** `The exchange returned an invalid HTTP response code '${res.code}'. ${extractErrorPayload(res.data)}`






<br/><br/><br/><br/><br/><br/>

## `Binance` (13000 - 13999)

- ...
- ...
- ...

### `index.ts`

- **13000:** ``

### `utils.ts`

- **13250:** ``

### `validations.ts`

- **13500:** `Binance returned an invalid list of candlesticks.`
- **13501:** `Binance returned an invalid list of tickers.`
- **13502:** ``






<br/><br/><br/><br/><br/><br/>

## `Bitfinex` (14000 - 14999)

- ...
- ...
- ...

### `index.ts`

- **14000:** ``

### `utils.ts`

- **14250:** ``

### `validations.ts`

- **14500:** `Bitfinex returned an invalid list of candlesticks.`
- **14501:** ``






<br/><br/><br/><br/><br/><br/>

## `Kraken` (15000 - 15999)

- ...
- ...
- ...

### `index.ts`

- **15000:** ``

### `utils.ts`

- **15250:** ``

### `validations.ts`

- **15500:** `The Kraken API returned an invalid response object.`
- **15501:** `The Kraken API returned the following errors: ${res.error.join(' | ')}.`
- **15502:** `The Kraken API returned a response object with an invalid \'result\' property.`
- **15503:** `Kraken returned an invalid list of candlesticks.`






<br/><br/><br/><br/><br/><br/>

## `Market State` (20000 - 20999)

- ...
- ...
- ...

### `index.ts`

- **20000:** ``






<br/><br/><br/><br/><br/><br/>

## `Window` (21000 - 21999)

- ...
- ...
- ...

### `index.ts`

- **21000:** ``
- **21001:** ``

### `utils.ts`

- **21250:** ``

### `validations.ts`

- **21500:** `The provided window configuration is not a valid object.`
- **21501:** `The refetchFrequency '${newConfig.refetchFrequency}' is invalid as it must be a valid number ranging 2.5 and 60.`
- **21502:** `The requirement '${newConfig.requirement}' is invalid as it must be a valid number ranging 1 and 100.`
- **21503:** `The strongRequirement '${newConfig.strongRequirement}' is invalid as it must be a valid number ranging 1 and 100.`
- **21504:** `The requirement '${newConfig.requirement}' must be less than the strong requirement '${newConfig.strongRequirement}'.`
- **21505:** `The size '${newConfig.size}' is invalid as it must be a valid integer ranging 128 and 512.`
- **21506:** `The candlestick interval '${newConfig.interval}' is invalid. Supported values include: ${JSON.stringify(ExchangeService.CANDLESTICK_INTERVALS)}.`
- **21507:** `The number of candlesticks retrieved from the exchange '${candlesticks.id.length}' doesn't match the window size set in the configuration '${config.size}'`






<br/><br/><br/><br/><br/><br/>

## `Liquidity` (22000 - 22999)

- ...
- ...
- ...

### `index.ts`

- **22000:** ``

### `utils.ts`

- **22250:** ``

### `validations.ts`

- **22500:** ``






<br/><br/><br/><br/><br/><br/>

## `Coins` (23000 - 23999)

- ...
- ...
- ...

### `index.ts`

- **23000:** ``

### `utils.ts`

- **23250:** ``

### `validations.ts`

- **23500:** `The provided coins configuration is not a valid object.`
- **23501:** `The size '${newConfig.size}' is invalid as it must be a valid number ranging 128 and 512.`
- **23502:** `The interval '${newConfig.interval}' is invalid as it must be a valid number ranging 5 and 3600 seconds.`
- **23503:** `The requirement '${newConfig.requirement}' is invalid as it must be a valid number ranging 1 and 100.`
- **23504:** `The strongRequirement '${newConfig.strongRequirement}' is invalid as it must be a valid number ranging 1 and 100.`
- **23505:** `The whitelistedSymbols property is not a valid array.`
- **23506:** `The whitelisted symbol '${symbol}' is invalid as it must only contain uppercased letters and/or numbers.`
- **23507:** `The limit '${newConfig.limit}' is invalid as it must be a valid integer ranging 1 and 24.`




