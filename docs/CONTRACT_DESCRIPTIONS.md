# Contract Descriptions

## Core Contracts

These are the main contracts that enable holograph to enable bridging between blockchains while maintaining the same contract address and NFT information on all chains.

### HolographGenesis.sol

Genesis will be deployed on all blockchains that run and support Holograph Protocol. All main components will be deployed via Genesis. Future blockchains will have a Genesis deployment as well.

### HolographFactory.sol

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

### HolographRegistry.sol

Registry is a central on-chain location where all Holograph data is stored. Registry keeps a record of all currently supported standards. New standards can be introduced and enabled as well. Any properly deployed _Holographed_ contracts are also stored as reference. This allows for a definitive way to identify whether a smart contract is secure and properly _Holographed_. Verifying entities will be able to identify a _Holographed_ contract to ensure the highest level of security and standards.

### HolographBridge.sol

This contract is contains the code is responsible for the all the bridge out and bridge in logic required to enable bridging. Bridge is a universal smart contract that functions as the primary entry and exit point for any _Holographed_ tokens to and from all supported blockchains. Bridge validates and ensures integrity and standard enforcement for every Bridge-In and Bridge-Out request. Additionally, Bridge implements a universal standard for sending tokens across blockchains by abstracting away complexities into sub-modules that remove the burden of management for developers. This allows for simple one-click/one-transaction native gas token payment-based interactions for all bridge requests.

### HolographOperator.sol

Operator's primary job is to know the messaging protocols that are utilized by the Holograph protocol for all cross-chain messages, and to ensure the authenticity and validity of all requests being submitted. Operator ensures that only valid bridge requests are sent/received and allowed to be executed inside of the protocol.

### Holograph.sol

Holograph is the primary entry-point for all users and developers. A single, universal address across all blockchains will enable developers an easy way to interact with the protocol’s features. Holograph keeps references for all current Registry, Factory, and Bridge implementations. Furthermore, it allows for single interface management of the underlying Holograph Protocol.
Holograph provides a reference to the name and ID of all supported blockchains. Additionally, it:

- Enables custom smart contract logic that is chain-dependent
- Frees developers from having to query and monitor the blockchain

## Enforcer Contracts

Enforcer enables and ensures complete standards, compliance, and operability for a given standard type. HolographERC20 and HolographERC721 are perfect examples of such Enforcers. Enforcers store and manage all data within themselves to ensure security, compliance, integrity, and enforcement of all protocols. Communication is established with custom contracts via specific event hooks. The storage/data layer is isolated privately and not directly accessible by custom contracts.

### enforcer/Holographer.sol

Holographer exists at the core of all _Holographed_ smart contracts, which is applied whenever a _Holographed_ smart contract is deployed. Holographer pieces together all components and routes all inbound function calls to their proper smart contracts, ensuring security and the enforcement of specified standards. Holographer is isolated on its own private layer and is essentially hard-coded into the blockchain.

### enforcer/HolographERC20.sol

This enforcer interacts with our bridge flow to allow ERC20 tokens to be moved between blockchains. It is `EIP721` compliant and supports the `HolographERC20Interface`.

### enforcer/HolographERC71.sol

This enforcer interacts with our bridge flow to allow ERC721 tokens to be moved between blockchains. It supports the `HolographERC721Interface`.

### enforcer/PA1D.sol

PA1D is an on-chain royalties contract for non-fungible token types. It supports a universal module that understands and speaks all of the different royalty standards on the blockchain. PA1D is built to be extendable and can have new royalty standards implemented as they are created and agreed upon.

## Abstract Contracts

### abstract/ERC20H.sol

A base implementation of a holographable ERC20 contract.

### abstract/ERC721H.sol

A base implementation of a holographable ERC20 contract.

## Interface Contracts

The Interfaces contract is used to store and share standardized data. It acts as an external library contract. This allows all the Holograph protocol smart contracts to reference a single instance of data and code.
