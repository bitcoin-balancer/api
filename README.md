# `api`

The `api` is a user-friendly RESTful interface designed to simplify the implementation of Value Averaging Strategies on any Bitcoin Spot Market. Its intuitive design and powerful features empower you to:

* **Automate Your Investment Strategy:**  Execute Value Averaging trades automatically, freeing you from manual execution and market timing concerns.
* **Adapt to Any Market:**  Seamlessly deploy your Value Averaging Strategy across multiple Bitcoin Spot Markets, providing flexibility and adaptability.
* **Configure with Ease:**  Manage and configure your Value Averaging parameters through a user-friendly GUI, simplifying setup and customization.

With the Balancer API, you can confidently implement a proven investment strategy, maximizing your potential returns while minimizing the time and effort required. 




<br/>

## Docs

- [Errors](./docs/errors/index.md)





<br/>

## Docker Image

[jesusgraterol/balancer-api](https://hub.docker.com/r/jesusgraterol/balancer-api)




<br/>

## Scripts

Build the API

```bash
npm run build
```





<br/>

## Tests

**Important:** these tests are to be executed from [`cli`](https://github.com/bitcoin-balancer/cli) as they must run in a containerized environment.

```bash
# run the integration tests
npm run test:integration

# run the unit tests
npm run test:unit

# run the benchmarks
npm run test:bench
```





<br/>

## License

[Apache v2.0](https://www.apache.org/licenses/LICENSE-2.0)