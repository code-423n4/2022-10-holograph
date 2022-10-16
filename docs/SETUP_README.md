# Setup Overview

## Requirements

1. `node` version 16.14.2 or greater
2. `yarn` version 1.22.18 or greater

Using `npm` will work but we use `yarn`. If you have `asdf` installed, then you can run `asdf install` and you will have the required versions.

## Installing dependencies

1. `yarn install` or `npm install`

## Initializing repo (IMPORTANT)

Run `yarn run init` to copy the sample env into `.env` .

If you skip this step the following steps can fail!

### Building types

If you are going to write tests or use modify any scripts locally, then we recommend running `yarn typechain` to generate the `typechains-type` folder.

### Compiling (IMPORTANT)

We compile the code from the `/src` folder into the `/contracts` folder. As a reviewer you only need to worry about the files in the `/contracts` folder. They have already been compiled and working as expected. But if you do modify the contracts in the `/src` folder, you will have to run ``yarn clean-compile` for things to work as expected.

1. `yarn clean-compile`

### Building

To build the project you can run `yarn build`. This will look at the `/contracts` folder and generate all the necessary artifacts.

## Running tests

To run the tests you have to have 2 terminal windows open. One window will launch 2 instances of ganache. While the other terminal you will run the test.

1. Terminal window 1: `yarn ganache-x2`
2. Terminal window 2: `yarn test`

### Running Tests Multiple Times

If you run the entire test suit, you will have to close and restart the `yarn ganache-x2` before running the tests again.

For test files 09\_ and above, you can add the `.only` modifier and not have to restart `yarn ganache-x2`.

### Important test files

Here are some of the more important test files to look at for the core functionality.

1. `05_cross-chain_configuation_tests.ts`
2. `06_cross-chain_miniting_tests_l1_l2.ts`
3. `14_holograph_operator_tests.ts`

### Test Specifics

We run two instances of ganache to simulate the two chains. To do the heavy lifting, we run the setup command in the `/tests/utils/index.ts` file by importing it `import setup from './utils';`. From there we can get access to chain 1 and chain 2 via:

1. Chain 1: `l1 = await setup();`
2. Chain 2: `l2 = await setup(true);`

Within any tests you will have access the contract: `l1.registry`.
