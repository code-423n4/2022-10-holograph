# Holograph Protocol contest details

- $71,250 USDC main award pot
- $3,750 USDC gas optimization award pot
- Join [C4 Discord](https://discord.gg/code4rena) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2022-10-holograph-contest/submit)
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts October 18, 2022 20:00 UTC
- Ends October 25, 2022 20:00 UTC

## 📃 Description

Holograph provides omnichain NFT infrastructure for the web3 ecosystem. Holograph Protocol enables the creation, deployment, minting, & bridging of omnichain NFTs with complete data integrity.

## 🧙 Setup Instructions and Codebase Overview:

- [Holograph Protocol Specification](https://docs.holograph.xyz/holograph-protocol/technical-specification)
- [Holograph Code REPO - Specific branch and commit](https://github.com/code-423n4/2022-10-holograph/tree/main)
- [Holograph Code Setup](https://github.com/code-423n4/2022-10-holograph/blob/main/docs/SETUP_README.md)
- [Holograph Contract Descriptions](https://github.com/code-423n4/2022-10-holograph/blob/main/docs/CONTRACT_DESCRIPTIONS.md)
- [Holograph Flows (Bridge / Operator / Pods)](https://github.com/code-423n4/2022-10-holograph/blob/main/docs/IMPORTANT_FLOWS.md)
- [Holograph Full Detailed README](https://github.com/code-423n4/2022-10-holograph/blob/main/README_DETAILS.md)

## 🛫 Quick Start

### Install dependencies

```bash
yarn install
```

### Setup sample env

```bash
yarn run init
```

### Compile contracts

```bash
yarn clean-compile
```

### Run local chains (restart ganache after every full test run)

Terminal 1

```bash
yarn ganache-x2
```

### Run the tests

Terminal 2

```bash
yarn test
```

After this completes, don't forget to restart ganache. Some tests may fail upon running a second time.

### Building

When the project is built, the code in the `src` folder gets written to the `contracts` folder. The files in the `contracts` folder are the "real" files that are used for testing and code verification on all the scanners.

Again, files from the `src` directory are automatically transpiled into the `contracts` directory each time that **hardhat** compiles the contracts.

## 🔎 Contracts in Scope

| File                           | Description                                                                        | Lines Of Code |
| ------------------------------ | ---------------------------------------------------------------------------------- | ------------- |
| `HolographBridge.sol`          | primary use for FE user to make cross-chain beam request                           | 226           |
| `HolographOperator.sol`        | finalizes cross-chain beam                                                         | 434           |
| `HolographFactory.sol`         | combines deployment config and deploys holographable contracts                     | 135           |
| `module/LayerZeroModule.sol`   | controls the exit and entry points for bridging                                    | 228           |
| `enforcer/Holographer.sol`     | wrapper for custom user contract and standards enforcer contract                   | 83            |
| `enforcer/PA1D.sol`            | responds to royalty info for ERC721 contracts                                      | 367           |
| `enforcer/HolographERC721.sol` | ERC721 standards enforcer                                                          | 482           |
| `enforcer/HolographERC20.sol`  | ERC20 standards enforcer                                                           | 495           |
| `abstract/ERC721H.sol`         | helper contract to use as base when creating custom ERC721 holographable contracts | 82            |
| `abstract/ERC20H.sol`          | helper contract to use as base when creating custom ERC20 holographable contracts  | 82            |

## 🤔 Areas Of Concern

1. Bridging NFTs
   - Can bridge tokens be sent out to a secondary network?
   - Can bridge tokens be received on the secondary network?
   - Can someone bridge an NFT while not being the owner of the NFT?
   - Can a payload be constructed to exploit or spoof a bridge request?
2. Jobs
   - Can a bridge job be created to manually select an operator?
   - Can a bridge job be created to manually select a pod?
   - Can a bridge job be completed by the primary operator?
   - Can a bridge job be completed by a secondary operator, if the primary operator has not completed the job?
   - Can a bridge job be completed by ANYONE after primary and secondary operators fail to complete a job?
   - Are job operators who fail to complete jobs slashed correctly?
3. Operator
   - Can an operator bond to a pod?
   - Can an operator bond to a pod that does not exist?
   - Can an operator join a pod without bonding?
   - Are the bond amounts computed correct?
   - Can the bond amount be exploited? spoofed?
   - Are operators
   - Can an operator remove their bond?
   - Can an operator remove their bond after being slashed?

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
