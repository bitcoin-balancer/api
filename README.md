# `api`

The `api` is a RESTful service that seamlessly integrates with your configured exchange(s), feeds real-time market data to indicators, and executes your defined trading strategy. It enables you to:

* **Automate your strategy** – Implement a customized version of the Value Averaging or Dollar-Cost Averaging strategy with ease
* **Trade on any exchange** – Stay flexible by using your preferred exchange platform
* **Effortless configuration** – Manage and fine-tune your strategy’s parameters directly via the [`gui`](https://github.com/bitcoin-balancer/gui)

With the `api`, you can confidently execute a proven trading strategy, optimizing returns while minimizing manual effort.





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