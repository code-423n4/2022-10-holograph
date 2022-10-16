<div align="center">
  <a href="https://holograph.xyz"><img alt="Holograph" src="https://user-images.githubusercontent.com/21043504/188220186-9c7f55e0-143a-41b4-a6b8-90e8bd54bfd9.png" width=600></a>
  <br />
  <h1>Holograph Protocol</h1>
</div>
<p align="center">
</p>

## Table of Contents

- [Description](#description)
- [Specification](#specification)
- [Architecture](#architecture)
- [Development](#development)
- [Directories](#directory-structure)
- [Branching](#branching-model-and-releases)
- [Contributing](#contributing)
- [Links](#official-links)
- [License](#license)

## Description

Holograph provides omnichain NFT infrastructure for the web3 ecosystem. Holograph Protocol enables the creation, deployment, minting, and bridging of omnichain NFTs with complete data integrity.

## Specification

Please reference the [documentation](https://docs.holograph.xyz/holograph-protocol/technical-specification) for the full technical specification of the protocol

## Architecture

### Core

#### HolographGenesis.sol

Genesis will be deployed on all blockchains that run and support Holograph Protocol. All main components will be deployed via Genesis. Future blockchains will have a Genesis deployment as well.

#### HolographFactory.sol

Factory enables developers to submit a signed version of the following elements to deploy a _Holographed_ smart contract on the blockchain:

- primary deployment chain
- token type (ERC-20, ERC-721, etc.)
- event subscriptions
- custom smart contract bytecode
- custom initialization code

Any additional blockchains that developers want to support can have the same signed data submitted to Factory, allowing for the creation of an identical _Holographed_ contract.
The primary job of Factory is to:

- allow propagation of exact data across all blockchains
- ensure a proper standard is selected and used
- ensure all deployments succeed and work as expected
- ensure that security is enforced and impenetrable

#### HolographRegistry.sol

Registry is a central on-chain location where all Holograph data is stored. Registry keeps a record of all currently supported standards. New standards can be introduced and enabled as well. Any properly deployed _Holographed_ contracts are also stored as reference. This allows for a definitive way to identify whether a smart contract is secure and properly _Holographed_. Verifying entities will be able to identify a _Holographed_ contract to ensure the highest level of security and standards.

#### HolographBridge.sol

This contract contains the code responsible for all the bridge-out and bridge-in logic required to enable bridging. Bridge is a universal smart contract that functions as the primary entry and exit point for any _Holographed_ tokens to and from all supported blockchains. Bridge validates and ensures integrity and standard enforcement for every Bridge-In and Bridge-Out request. Additionally, Bridge implements a universal standard for sending tokens across blockchains by abstracting away complexities into sub-modules that remove the burden of management for developers. This allows for simple one-click/one-transaction native gas token payment-based interactions for all bridge requests.

#### HolographOperator.sol

Operator's primary job is to know the messaging protocols that are utilized by the Holograph protocol for all cross-chain messages, and to ensure the authenticity and validity of all requests being submitted. Operator ensures that only valid bridge requests are sent/received and allowed to be executed inside of the protocol.

#### Holograph.sol

Holograph is the primary entry-point for all users and developers. A single, universal address across all blockchains will enable developers an easy way to interact with the protocol’s features. Holograph keeps references for all current Registry, Factory, and Bridge implementations. Furthermore, it allows for single interface management of the underlying Holograph Protocol.
Holograph provides a reference to the name and ID of all supported blockchains. Additionally, it:

- Enables custom smart contract logic that is chain-dependent
- Frees developers from having to query and monitor the blockchain

### Standards Enforcers

#### Holographer.sol

Holographer exists at the core of all _Holographed_ smart contracts, which is applied whenever a _Holographed_ smart contract is deployed. Holographer pieces together all components and routes all inbound function calls to their proper smart contracts, ensuring security and the enforcement of specified standards. Holographer is isolated on its own private layer and is essentially hard-coded into the blockchain.

#### Enforcer.sol

Enforcer enables and ensures complete standards, compliance, and operability for a given standard type. HolographERC20 and HolographERC721 are perfect examples of such Enforcers. Enforcers store and manage all data within themselves to ensure security, compliance, integrity, and enforcement of all protocols. Communication is established with custom contracts via specific event hooks. The storage/data layer is isolated privately and not directly accessible by custom contracts.

#### PA1D.sol

PA1D is an on-chain royalties contract for non-fungible token types. It supports a universal module that understands and speaks all of the different royalty standards on the blockchain. PA1D is built to be extendable and can have new royalty standards implemented as they are created and agreed upon.

#### Interfaces.sol

The Interfaces contract is used to store and share standardized data. It acts as an external library contract. This allows all the Holograph protocol smart contracts to reference a single instance of data and code.

### External Components

#### Custom Contract

Custom contract is any type of smart contract that was developed outside of Holograph Protocol, and is used to create a _Holographed_ contract. This empowers developers to build their projects however they want. The requirements for enabling a custom contract to be Holograph-able are minimal, and allow for even novice-level developers to implement. Any current and future fungible and non-fungible token type contracts can easily be made Holograph-able.

## Important Flows

### Bridging NFTs

To bridge NFTs, a _Holographed_ contract must be deployed and NFTs minted from the contract. Doing so will ensure that the contract address and token IDs remain the same on all deployed blockchains.

### Estimating Gas

TBD

### Bridging Out

The simplified code path for bridging out is:

1. `HolographBridge.sol` - `bridgeOutRequest` method
2. `HolographRegistery.sol` - `_isHolographedContract` method
3. `enforcer/HolographERC721.sol` - `_bridgeOut` method [This is the Collection Contract]
4. `HolographOperator.sol` - `send` method
5. `Holograph/LayerZeroModule.sol` - `send` method

At step 1, a user submits their bridge request with a valid payload using the estimatedGas value computed in the previous [Estimate Gas](#estimategas) section

At step 2, the code checks that the contract is a _holographable_ contract. This means it has implemented the required functions for a _Holographed_ contract. See `contracts/enforcer/HolographERC721.sol` for an example.

At step 3, we call the `_bridgeOut` function on the _Holographed_ contract and apply various checks and generate a payload with information about the bridge request.

At step 4, we call the `send` method on the `HolographOperator.sol` contract. This method does some final packaging of the payload that will be sent to the messaging layer.

At step 5, we finally call the `send` method to the messaging layer contract `/module/LayerZeroModule.sol`. At this point the NFT has left the source chain.

### Bridging In

The simplified code path for bridging in is:

1. `module/LayerZeroModule.sol` - `lzReceive` method
2. `HolographOperator.sol` - `crossChainMessage` method
3. `HolographOperator.sol` - Emits event `AvailableOperatorJob(jobHash, bridgeInRequestPayload);`

At step 1, the configured messaging layer calls the method `lzReceive` in `module/LayerZeroModule.sol`. We do some checks to make sure only LayerZero call this method.

At step 2, we call `crossChainMessage` on the `HolographOperator.sol` contract. We encode the job, select a primary operator, and 5 substitute operators.

At step 3, the contract will emit a job event. This job event is being observed by our CLI that will then finalize a job. Only users who are in a pod are allowed to finalize jobs.

### Operating

Operators execute destination chain bridge transaction. Operators must run the CLI, bond the protocol’s native token, and execute transactions. The probability of getting selected to perform this work is based on the number of tokens bonded.

### Bonding tokens

There is a testnet faucet available for getting testnet tokens. These are the tokens you need to be able to bond to a pod and operate. Currently deployed Faucet address can be found in the `deployments` dir. Choose the environment/branch, network, and the file will be `Faucet.json`.

### Joining Pods

To become an operator, you must view the pods available to join, select a pod, and bond at least the minimum bond requirement.

1. `HolographOperator.sol` - `getTotalPods`
2. `HolographOperator.sol` - `getPodBondAmounts`
3. `HolographOperator.sol` - `bondUtilityToken`

At step 1, you call `getTotalPods` method to get a list of available pods. If the length of pod is zero, then you can bond into pod `1`.

At step 2, when you call `getPodBondAmounts`, you will get two values: [`_base`, `current`]. The `base` value represents the original minimum bond requirement to join the pod, while the `current` value is the current amount you must provide to join the pod. Please refer to here [TODO - ADD LINK] for more info.

At step 3, you are now able to call the `bondUtilityToken` function with the pod and amounts you want to use to enter the pod. Please note, there is a minimum bond requirement to join but no maximum.

You are now an 0perator. We will launch a CLI in the future that will process jobs on your behalf.

### Leaving Pods

To leave a pod, you have to call the `unbondUtilityToken` in `HolographOperator.sol`.

### Processing Jobs

You must join a pod to become an Oper ator. The simplified code path for operating is:

1. Receive new Block from the network
2. Iterate over block looking for event `AvailableOperatorJob(jobHash, bridgeInRequestPayload);`
3. `HolographOperator.sol` - `getJobDetails` method
4. `HolographOperator.sol` - `jobEstimator` method
5. `HolographOperator.sol` - `executeJob` method

At step 1, the CLI connected via websocket receives notification that new block was mined.

At step 2, the CLI makes a request for the full block information. It then iterates over transactions, looking for the `AvailableOperatorJob` event.

At step 3, the CLI then calls `getJobDetails` in `HolographOperator.sol`. This checks if the current wallet user is the selected operator or a backup operator. If it is the selected operator, then it will continue. Otherwise, the job is kept in memory for a short time and reviewed again in the future to check the job status.

At step 4, the CLI will estimate the cost of executing the job. This is used to make sure the transaction sent has enough gas to complete.

At step 5, the wallet sends a transaction to the `exectureJob` method on the `HolographOperator.sol` contract. In here, further checks are done to validate the job and user's wallet. After this transaction is mined on the blockchain, the NFT will become finalized and available on the new blockchain.

## Development

### Getting Started

1. This project uses [asdf](https://asdf-vm.com/) for versions management. Install following plugins
   - Install [asdf Node plugin](https://github.com/asdf-vm/asdf-nodejs): `asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git`
   - Install [asdf yarn plugin](https://github.com/twuni/asdf-yarn): `asdf plugin-add yarn`
1. Run `asdf install` after to have the correct tool versions.
1. Install dependencies with `yarn install`.
1. Initialize the project with `yarn run init` _(this will copy sample environment configs)_.

### Building

When the project is built, the code in the `src` folder gets written to the `contracts` folder. The files in the `contracts` folder are the "real" files that are used for testing and code verification on all the scanners.

Again, files from the `src` directory are automatically transpiled into the `contracts` directory each time that **hardhat** compiles the contracts.

### Making Changes

**Before pushing your work to the repo, make sure to prepare your code**

Please make use of the `yarn run prettier:fix` command to format the codebase into a universal style.

## 📁 Directory Structure

```
├── config: Network configuration files
├── contracts: Smart contracts that power the Holograph protocol
├── deploy: Deployment scripts for the smart contracts uses Hardhat and our Hardhat and Hardhat-deploy
├── deployments: Deployment build files that include contract addresses on each network
├── scripts: Scripts and helper utilities
├── src: Source contracts that get dynamically transpiled down into the finalized output contracts
└── test:Hardhat tests for the smart contracts
```

## For C4 Wardens

## In Scope \*

1. `HolographBridge.sol` (primary use for FE user to make cross-chain beam request)
2. `HolographOperator.sol` (finalizes cross-chain beam)
3. `Holographer.sol` (wrapper for custom user contract and standards enforcer contract)
4. `HolographERC20.sol` (ERC20 standards enforcer)
5. `HolographERC721.sol` (ERC721 standards enforcer)
6. `HolographFactory.sol` (combines deployment config and deploys holographable contracts)
7. `PA1D.sol` (responds to royalty info for ERC721 contracts)
8. `abstract/ERC20H.sol` (helper contract to use as base when creating custom ERC20 holographable contracts)
9. `abstract/ERC721H.sol` (helper contract to use as base when creating custom ERC721 holographable contracts)

## Out of Scope \*

1. `Holograph.sol` (simple getter/setter contract)
2. `HolographGenesis.sol` (simple getter/setter and one CREATE2 function)
3. `HolographRegistry.sol` (simple getter/setter contract)
4. `HolographTreasury.sol` (not implemented/used/finished)
5. `Interfaces.sol` (simple getter/setter contract)
6. `./abstract` (well known primitives. ERC20H.sol and ERC721H.sol are excluded)
7. `./enums` (no logic)
8. `./interface` (no logic)
9. `./library` (libraries are mostly not used. those that are, are well known/ubiquitous libraries)
10. `./mock` (mock contracts to return fake data for tests)
11. `./proxy` (simple proxy contracts)
12. `./struct` (no logic)
13. `./token` (examples of custom Holographable contracts. Should be used as reference on how to create custom contracts that build on top of the protocol)

## Branching Model and Releases

### Active Branches

| Branch                                                                  | Status                                                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [mainnet](https://github.com/code-423n4/2022-10-holograph/tree/mainnet) | Accepts PRs from `testnet` or `release/x.x.x` when we intend to deploy to mainnet. |
| [testnet](https://github.com/code-423n4/2022-10-holograph/tree/testnet) | Accepts PRs from `develop` that are ready to be deployed to testnet.               |
| [develop](https://github.com/code-423n4/2022-10-holograph/tree/develop) | Accepts PRs from `feature/xyz` branches that are experimental or in testing stage. |
| release/x.x.x                                                           | Accepts PRs from `testnet`.                                                        |

### Overview

We generally follow [this Git branching model](https://nvie.com/posts/a-successful-git-branching-model/).
Please read the linked post if you're planning to make frequent PRs into this repository.

### The `mainnet` branch

The `mainnet` branch contains the code for our latest "stable" mainnet releases.
Updates from `mainnet` always come from the `testnet` branch.
We only ever update the `mainnet` branch when we intend to deploy code that has been tested on testnets to all mainnet networks supported by the Holograph protocol.
Our update process takes the form of a PR merging the `testnet` branch into the `mainnet` branch.

### The `testnet` branch

The `testnet` branch continas the code that is the latest stable testnet release for all supported networks. This branch is deployed and circulated for beta users of the protocol. Updates are merged in from the `develop` branch once they're ready for broad usage.

### The `develop` branch

Our primary development branch is [`develop`](https://github.com/code-423n4/2022-10-holograph/tree/testnet).
`develop` contains the most up-to-date software that is being tested via experimental network deployments.

## Contributing

Read through [CONTRIBUTING.md](./CONTRIBUTING.md) for a general overview of our contribution process.

## Official Links

- [Website](https://holograph.xyz)
- [App](https://app.holograph.xyz)
- [Docs](https://docs.holograph.xyz)
- [Discord](https://discord.com/invite/holograph)
- [Twitter](https://twitter.com/holographxyz)
- [Mirror](https://mirror.xyz/holographxyz.eth)

## License

Files under this repository are licensed under [Holograph Limited Public License](https://github.com/code-423n4/2022-10-holograph/blob/testnet/LICENSE.md) (H-LPL) 1.0.0 unless otherwise stated.
