declare var global: any;
import fs from 'fs';
import Web3 from 'web3';
import { BytesLike } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DeployFunction } from '@holographxyz/hardhat-deploy-holographed/types';
import {
  Admin,
  CxipERC721,
  CxipERC721Proxy,
  ERC20Mock,
  Holograph,
  HolographBridge,
  HolographBridgeProxy,
  Holographer,
  HolographERC20,
  HolographERC721,
  HolographFactory,
  HolographFactoryProxy,
  HolographGenesis,
  HolographOperator,
  HolographOperatorProxy,
  HolographRegistry,
  HolographRegistryProxy,
  HolographTreasury,
  HolographTreasuryProxy,
  HToken,
  HolographInterfaces,
  MockERC721Receiver,
  MockLZEndpoint,
  Owner,
  PA1D,
  SampleERC20,
  SampleERC721,
} from '../typechain-types';
import {
  genesisDeriveFutureAddress,
  genesisDeployHelper,
  generateInitCode,
  zeroAddress,
  LeanHardhatRuntimeEnvironment,
  hreSplit,
  generateErc20Config,
  getHolographedContractHash,
  Network,
  NetworkType,
  Signature,
  StrictECDSA,
} from '../scripts/utils/helpers';
import { HolographERC20Event, ConfigureEvents } from '../scripts/utils/events';
import networks from '../config/networks';

const func: DeployFunction = async function (hre1: HardhatRuntimeEnvironment) {
  let { hre, hre2 } = await hreSplit(hre1, global.__companionNetwork);
  const { deployments, getNamedAccounts } = hre;
  const accounts = await hre.ethers.getSigners();
  const deployer: SignerWithAddress = accounts[0];

  const web3 = new Web3();

  const salt = hre.deploymentSalt;

  const futureHolographAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'Holograph',
    generateInitCode(
      ['uint32', 'address', 'address', 'address', 'address', 'address', 'address', 'address', 'address'],
      [
        '0x' + networks[hre.networkName].holographId.toString(16).padStart(8, '0'),
        zeroAddress,
        zeroAddress,
        zeroAddress,
        zeroAddress,
        zeroAddress,
        zeroAddress,
        zeroAddress,
        zeroAddress,
      ]
    )
  );
  hre.deployments.log('the future "Holograph" address is', futureHolographAddress);

  const futureBridgeAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographBridge',
    generateInitCode(['address', 'address', 'address', 'address'], [zeroAddress, zeroAddress, zeroAddress, zeroAddress])
  );
  hre.deployments.log('the future "HolographBridge" address is', futureBridgeAddress);

  const futureBridgeProxyAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographBridgeProxy',
    generateInitCode(
      ['address', 'bytes'],
      [
        zeroAddress,
        generateInitCode(
          ['address', 'address', 'address', 'address', 'address'],
          [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress]
        ),
      ]
    )
  );
  hre.deployments.log('the future "HolographBridgeProxy" address is', futureBridgeProxyAddress);

  const futureFactoryAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographFactory',
    generateInitCode(['address', 'address', 'address'], [zeroAddress, zeroAddress, zeroAddress])
  );
  hre.deployments.log('the future "HolographFactory" address is', futureFactoryAddress);

  const futureFactoryProxyAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographFactoryProxy',
    generateInitCode(
      ['address', 'bytes'],
      [zeroAddress, generateInitCode(['address', 'address', 'address'], [zeroAddress, zeroAddress, zeroAddress])]
    )
  );
  hre.deployments.log('the future "HolographFactoryProxy" address is', futureFactoryProxyAddress);

  const futureOperatorAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographOperator',
    generateInitCode(
      ['address', 'address', 'address', 'address', 'address'],
      [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress]
    )
  );
  hre.deployments.log('the future "HolographOperator" address is', futureOperatorAddress);

  const futureOperatorProxyAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographOperatorProxy',
    generateInitCode(
      ['address', 'bytes'],
      [
        zeroAddress,
        generateInitCode(
          ['address', 'address', 'address', 'address', 'address'],
          [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress]
        ),
      ]
    )
  );
  hre.deployments.log('the future "HolographOperatorProxy" address is', futureOperatorProxyAddress);

  const futureRegistryAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographRegistry',
    generateInitCode(['address', 'bytes32[]'], [zeroAddress, []])
  );
  hre.deployments.log('the future "HolographRegistry" address is', futureRegistryAddress);

  const futureRegistryProxyAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographRegistryProxy',
    generateInitCode(['address', 'bytes'], [zeroAddress, generateInitCode(['address', 'bytes32[]'], [zeroAddress, []])])
  );
  hre.deployments.log('the future "HolographRegistryProxy" address is', futureRegistryProxyAddress);

  const futureTreasuryAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographTreasury',
    generateInitCode(['address', 'address', 'address', 'address'], [zeroAddress, zeroAddress, zeroAddress, zeroAddress])
  );
  hre.deployments.log('the future "HolographTreasury" address is', futureTreasuryAddress);

  const futureTreasuryProxyAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographTreasuryProxy',
    generateInitCode(
      ['address', 'bytes'],
      [
        zeroAddress,
        generateInitCode(
          ['address', 'address', 'address', 'address'],
          [zeroAddress, zeroAddress, zeroAddress, zeroAddress]
        ),
      ]
    )
  );
  hre.deployments.log('the future "HolographTreasuryProxy" address is', futureTreasuryProxyAddress);

  const futureHolographInterfacesAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'HolographInterfaces',
    generateInitCode(['address'], [zeroAddress])
  );
  hre.deployments.log('the future "HolographInterfaces" address is', futureHolographInterfacesAddress);

  const futureRoyaltiesAddress = await genesisDeriveFutureAddress(
    hre,
    salt,
    'PA1D',
    generateInitCode(['address', 'uint256'], [zeroAddress, '0x' + '00'.repeat(32)])
  );
  hre.deployments.log('the future "PA1D" address is', futureRoyaltiesAddress);

  // Future Holograph Utility Token
  const currentNetworkType: NetworkType = networks[hre.networkName].type;
  let primaryNetwork: Network;
  if (currentNetworkType == NetworkType.local) {
    primaryNetwork = networks.localhost;
  } else if (currentNetworkType == NetworkType.testnet) {
    primaryNetwork = networks.eth_goerli;
  } else if (currentNetworkType == NetworkType.mainnet) {
    primaryNetwork = networks.eth;
  } else {
    throw new Error('cannot identity current NetworkType');
  }

  let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
    primaryNetwork,
    deployer.address,
    'HolographUtilityToken',
    'Holograph Utility Token',
    'HLG',
    'Holograph Utility Token',
    '1',
    18,
    ConfigureEvents([]),
    generateInitCode(['address'], [deployer.address]),
    salt
  );

  const holographerBytecode: BytesLike = (await hre.ethers.getContractFactory('Holographer')).bytecode;
  const futureHlgAddress = hre.ethers.utils.getCreate2Address(
    futureFactoryProxyAddress,
    erc20ConfigHash,
    hre.ethers.utils.keccak256(holographerBytecode)
  );
  hre.deployments.log('the future "HolographUtilityToken" address is', futureHlgAddress);

  // Holograph
  let holographDeployedCode: string = await hre.provider.send('eth_getCode', [futureHolographAddress, 'latest']);
  if (holographDeployedCode == '0x' || holographDeployedCode == '') {
    hre.deployments.log('"Holograph" bytecode not found, need to deploy"');
    let holograph = await genesisDeployHelper(
      hre,
      salt,
      'Holograph',
      generateInitCode(
        ['uint32', 'address', 'address', 'address', 'address', 'address', 'address', 'address'],
        [
          '0x' + networks[hre.networkName].holographId.toString(16).padStart(8, '0'),
          futureBridgeProxyAddress,
          futureFactoryProxyAddress,
          futureHolographInterfacesAddress,
          futureOperatorProxyAddress,
          futureRegistryProxyAddress,
          futureTreasuryProxyAddress,
          futureHlgAddress,
        ]
      ),
      futureHolographAddress
    );
  } else {
    hre.deployments.log('"Holograph" is already deployed. Checking configs.');
    let holograph = (await hre.ethers.getContractAt('Holograph', futureHolographAddress)) as Holograph;
    if ((await holograph.getBridge()) != futureBridgeProxyAddress) {
      hre.deployments.log('Updating Bridge reference');
      let tx = await holograph.setBridge(futureBridgeProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holograph.getFactory()) != futureFactoryProxyAddress) {
      hre.deployments.log('Updating Factory reference');
      let tx = await holograph.setFactory(futureFactoryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holograph.getInterfaces()) != futureHolographInterfacesAddress) {
      hre.deployments.log('Updating HolographInterfaces reference');
      let tx = await holograph.setInterfaces(futureHolographInterfacesAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holograph.getOperator()) != futureOperatorProxyAddress) {
      hre.deployments.log('Updating Operator reference');
      let tx = await holograph.setOperator(futureOperatorProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holograph.getRegistry()) != futureRegistryProxyAddress) {
      hre.deployments.log('Updating Registry reference');
      let tx = await holograph.setRegistry(futureRegistryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holograph.getTreasury()) != futureTreasuryProxyAddress) {
      hre.deployments.log('Updating Treasury reference');
      let tx = await holograph.setTreasury(futureTreasuryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holograph.getUtilityToken()) != futureHlgAddress) {
      hre.deployments.log('Updating UtilityToken reference');
      let tx = await holograph.setUtilityToken(futureHlgAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  }

  // HolographBridge
  let bridgeDeployedCode: string = await hre.provider.send('eth_getCode', [futureBridgeAddress, 'latest']);
  if (bridgeDeployedCode == '0x' || bridgeDeployedCode == '') {
    hre.deployments.log('"HolographBridge" bytecode not found, need to deploy"');
    let holographBridge = await genesisDeployHelper(
      hre,
      salt,
      'HolographBridge',
      generateInitCode(
        ['address', 'address', 'address', 'address'],
        [zeroAddress, zeroAddress, zeroAddress, zeroAddress]
      ),
      futureBridgeAddress
    );
  } else {
    hre.deployments.log('"HolographBridge" is already deployed.');
  }

  // HolographBridgeProxy
  let bridgeProxyDeployedCode: string = await hre.provider.send('eth_getCode', [futureBridgeProxyAddress, 'latest']);
  if (bridgeProxyDeployedCode == '0x' || bridgeProxyDeployedCode == '') {
    hre.deployments.log('"HolographBridgeProxy" bytecode not found, need to deploy"');
    let holographBridgeProxy = await genesisDeployHelper(
      hre,
      salt,
      'HolographBridgeProxy',
      generateInitCode(
        ['address', 'bytes'],
        [
          futureBridgeAddress,
          generateInitCode(
            ['address', 'address', 'address', 'address'],
            [futureFactoryProxyAddress, futureHolographAddress, futureOperatorProxyAddress, futureRegistryProxyAddress]
          ),
        ]
      ),
      futureBridgeProxyAddress
    );
  } else {
    hre.deployments.log('"HolographBridgeProxy" is already deployed. Checking configs.');
    let holographBridgeProxy = (await hre.ethers.getContractAt(
      'HolographBridgeProxy',
      futureBridgeProxyAddress
    )) as HolographBridgeProxy;
    let holographBridge = (await hre.ethers.getContractAt(
      'HolographBridge',
      futureBridgeProxyAddress
    )) as HolographBridge;
    if ((await holographBridgeProxy.getBridge()) != futureBridgeAddress) {
      hre.deployments.log('Updating Bridge reference');
      let tx = await holographBridgeProxy.setBridge(futureBridgeAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographBridge.getFactory()) != futureFactoryProxyAddress) {
      hre.deployments.log('Updating Factory reference');
      let tx = await holographBridge.setFactory(futureFactoryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographBridge.getHolograph()) != futureHolographAddress) {
      hre.deployments.log('Updating Holograph reference');
      let tx = await holographBridge.setHolograph(futureHolographAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographBridge.getOperator()) != futureOperatorProxyAddress) {
      hre.deployments.log('Updating Operator reference');
      let tx = await holographBridge.setOperator(futureOperatorProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographBridge.getRegistry()) != futureRegistryProxyAddress) {
      hre.deployments.log('Updating Registry reference');
      let tx = await holographBridge.setRegistry(futureRegistryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  }

  // HolographFactory
  let factoryDeployedCode: string = await hre.provider.send('eth_getCode', [futureFactoryAddress, 'latest']);
  if (factoryDeployedCode == '0x' || factoryDeployedCode == '') {
    hre.deployments.log('"HolographFactory" bytecode not found, need to deploy"');
    let holographFactory = await genesisDeployHelper(
      hre,
      salt,
      'HolographFactory',
      generateInitCode(['address', 'address', 'address'], [zeroAddress, zeroAddress, zeroAddress]),
      futureFactoryAddress
    );
  } else {
    hre.deployments.log('"HolographFactory" is already deployed.');
  }

  // HolographFactoryProxy
  let factoryProxyDeployedCode: string = await hre.provider.send('eth_getCode', [futureFactoryProxyAddress, 'latest']);
  if (factoryProxyDeployedCode == '0x' || factoryProxyDeployedCode == '') {
    hre.deployments.log('"HolographFactoryProxy" bytecode not found, need to deploy"');
    let holographFactoryProxy = await genesisDeployHelper(
      hre,
      salt,
      'HolographFactoryProxy',
      generateInitCode(
        ['address', 'bytes'],
        [
          futureFactoryAddress,
          generateInitCode(
            ['address', 'address'],
            [
              futureHolographAddress, // Holograph
              futureRegistryProxyAddress, // HolographRegistry
            ]
          ),
        ]
      ),
      futureFactoryProxyAddress
    );
  } else {
    hre.deployments.log('"HolographFactoryProxy" is already deployed. Checking configs.');
    let holographFactoryProxy = (await hre.ethers.getContractAt(
      'HolographFactoryProxy',
      futureFactoryProxyAddress
    )) as HolographFactoryProxy;
    let holographFactory = (await hre.ethers.getContractAt(
      'HolographFactory',
      futureFactoryProxyAddress
    )) as HolographFactory;
    if ((await holographFactoryProxy.getFactory()) != futureFactoryAddress) {
      hre.deployments.log('Updating Factory reference');
      let tx = await holographFactoryProxy.setFactory(futureFactoryAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographFactory.getHolograph()) != futureHolographAddress) {
      hre.deployments.log('Updating Holograph reference');
      let tx = await holographFactory.setHolograph(futureHolographAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographFactory.getRegistry()) != futureRegistryProxyAddress) {
      hre.deployments.log('Updating Registry reference');
      let tx = await holographFactory.setRegistry(futureRegistryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  }

  // HolographOperator
  let operatorDeployedCode: string = await hre.provider.send('eth_getCode', [futureOperatorAddress, 'latest']);
  if (operatorDeployedCode == '0x' || operatorDeployedCode == '') {
    hre.deployments.log('"HolographOperator" bytecode not found, need to deploy"');
    let holographOperator = await genesisDeployHelper(
      hre,
      salt,
      'HolographOperator',
      generateInitCode(
        ['address', 'address', 'address', 'address', 'address'],
        [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress]
      ),
      futureOperatorAddress
    );
  } else {
    hre.deployments.log('"HolographOperator" is already deployed.');
  }

  // HolographOperatorProxy
  let operatorProxyDeployedCode: string = await hre.provider.send('eth_getCode', [
    futureOperatorProxyAddress,
    'latest',
  ]);
  if (operatorProxyDeployedCode == '0x' || operatorProxyDeployedCode == '') {
    hre.deployments.log('"HolographOperatorProxy" bytecode not found, need to deploy"');
    let holographOperatorProxy = await genesisDeployHelper(
      hre,
      salt,
      'HolographOperatorProxy',
      generateInitCode(
        ['address', 'bytes'],
        [
          futureOperatorAddress,
          generateInitCode(
            ['address', 'address', 'address', 'address', 'address'],
            [
              futureBridgeProxyAddress,
              futureHolographAddress,
              futureHolographInterfacesAddress,
              futureRegistryProxyAddress,
              futureHlgAddress,
            ]
          ),
        ]
      ),
      futureOperatorProxyAddress
    );
  } else {
    hre.deployments.log('"HolographOperatorProxy" is already deployed. Checking configs.');
    let holographOperatorProxy = (await hre.ethers.getContractAt(
      'HolographOperatorProxy',
      futureOperatorProxyAddress
    )) as HolographOperatorProxy;
    let holographOperator = (await hre.ethers.getContractAt(
      'HolographOperator',
      futureOperatorProxyAddress
    )) as HolographOperator;
    if ((await holographOperatorProxy.getOperator()) != futureOperatorAddress) {
      hre.deployments.log('Updating Operator reference');
      let tx = await holographOperatorProxy.setOperator(futureOperatorAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographOperator.getBridge()) != futureBridgeProxyAddress) {
      hre.deployments.log('Updating Bridge reference');
      let tx = await holographOperator.setBridge(futureBridgeProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographOperator.getHolograph()) != futureHolographAddress) {
      hre.deployments.log('Updating Holograph reference');
      let tx = await holographOperator.setHolograph(futureHolographAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographOperator.getInterfaces()) != futureHolographInterfacesAddress) {
      hre.deployments.log('Updating HolographInterfaces reference');
      let tx = await holographOperator.setInterfaces(futureHolographInterfacesAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographOperator.getRegistry()) != futureRegistryProxyAddress) {
      hre.deployments.log('Updating Registry reference');
      let tx = await holographOperator.setRegistry(futureRegistryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographOperator.getUtilityToken()) != futureHlgAddress) {
      hre.deployments.log('Updating UtilityToken reference');
      let tx = await holographOperator.setUtilityToken(futureHlgAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  }

  // HolographRegistry
  let registryDeployedCode: string = await hre.provider.send('eth_getCode', [futureRegistryAddress, 'latest']);
  if (registryDeployedCode == '0x' || registryDeployedCode == '') {
    hre.deployments.log('"HolographRegistry" bytecode not found, need to deploy"');
    let holographRegistry = await genesisDeployHelper(
      hre,
      salt,
      'HolographRegistry',
      generateInitCode(['address', 'bytes32[]'], [zeroAddress, []]),
      futureRegistryAddress
    );
  } else {
    hre.deployments.log('"HolographRegistry" is already deployed.');
  }

  // HolographRegistryProxy
  let registryProxyDeployedCode: string = await hre.provider.send('eth_getCode', [
    futureRegistryProxyAddress,
    'latest',
  ]);
  if (registryProxyDeployedCode == '0x' || registryProxyDeployedCode == '') {
    hre.deployments.log('"HolographRegistryProxy" bytecode not found, need to deploy"');
    let holographRegistryProxy = await genesisDeployHelper(
      hre,
      salt,
      'HolographRegistryProxy',
      generateInitCode(
        ['address', 'bytes'],
        [
          futureRegistryAddress,
          generateInitCode(
            ['address', 'bytes32[]'],
            [
              futureHolographAddress,
              [
                '0x' + web3.utils.asciiToHex('HolographERC20').substring(2).padStart(64, '0'),
                '0x' + web3.utils.asciiToHex('HolographERC721').substring(2).padStart(64, '0'),
                '0x' + web3.utils.asciiToHex('HolographERC1155').substring(2).padStart(64, '0'),
                '0x' + web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0'),
                '0x' + web3.utils.asciiToHex('CxipERC1155').substring(2).padStart(64, '0'),
                '0x' + web3.utils.asciiToHex('PA1D').substring(2).padStart(64, '0'),
              ],
            ]
          ),
        ]
      ),
      futureRegistryProxyAddress
    );
    let holographRegistry = (await hre.ethers.getContractAt(
      'HolographRegistry',
      futureRegistryProxyAddress
    )) as HolographRegistry;
    if ((await holographRegistry.getUtilityToken()) != futureHlgAddress) {
      hre.deployments.log('Updating UtilityToken reference');
      let tx = await holographRegistry.setUtilityToken(futureHlgAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  } else {
    hre.deployments.log('"HolographRegistryProxy" is already deployed. Checking configs.');
    let holographRegistryProxy = (await hre.ethers.getContractAt(
      'HolographRegistryProxy',
      futureRegistryProxyAddress
    )) as HolographRegistryProxy;
    let holographRegistry = (await hre.ethers.getContractAt(
      'HolographRegistry',
      futureRegistryProxyAddress
    )) as HolographRegistry;
    if ((await holographRegistryProxy.getRegistry()) != futureRegistryAddress) {
      hre.deployments.log('Updating Registry reference');
      let tx = await holographRegistryProxy.setRegistry(futureRegistryAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographRegistry.getHolograph()) != futureHolographAddress) {
      hre.deployments.log('Updating Holograph reference');
      let tx = await holographRegistry.setHolograph(futureHolographAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographRegistry.getUtilityToken()) != futureHlgAddress) {
      hre.deployments.log('Updating UtilityToken reference');
      let tx = await holographRegistry.setUtilityToken(futureHlgAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  }

  // HolographTreasury
  let treasuryDeployedCode: string = await hre.provider.send('eth_getCode', [futureTreasuryAddress, 'latest']);
  if (treasuryDeployedCode == '0x' || treasuryDeployedCode == '') {
    hre.deployments.log('"HolographTreasury" bytecode not found, need to deploy"');
    let holographTreasury = await genesisDeployHelper(
      hre,
      salt,
      'HolographTreasury',
      generateInitCode(
        ['address', 'address', 'address', 'address'],
        [zeroAddress, zeroAddress, zeroAddress, zeroAddress]
      ),
      futureTreasuryAddress
    );
  } else {
    hre.deployments.log('"HolographTreasury" is already deployed.');
  }

  // HolographTreasuryProxy
  let treasuryProxyDeployedCode: string = await hre.provider.send('eth_getCode', [
    futureTreasuryProxyAddress,
    'latest',
  ]);
  if (treasuryProxyDeployedCode == '0x' || treasuryProxyDeployedCode == '') {
    hre.deployments.log('"HolographTreasuryProxy" bytecode not found, need to deploy"');
    let holographTreasuryProxy = await genesisDeployHelper(
      hre,
      salt,
      'HolographTreasuryProxy',
      generateInitCode(
        ['address', 'bytes'],
        [
          futureTreasuryAddress,
          generateInitCode(
            ['address', 'address', 'address', 'address'],
            [futureBridgeProxyAddress, futureHolographAddress, futureOperatorProxyAddress, futureRegistryProxyAddress]
          ),
        ]
      ),
      futureTreasuryProxyAddress
    );
  } else {
    hre.deployments.log('"HolographTreasuryProxy" is already deployed. Checking configs.');
    let holographTreasuryProxy = (await hre.ethers.getContractAt(
      'HolographTreasuryProxy',
      futureTreasuryProxyAddress
    )) as HolographTreasuryProxy;
    let holographTreasury = (await hre.ethers.getContractAt(
      'HolographTreasury',
      futureTreasuryProxyAddress
    )) as HolographTreasury;
    if ((await holographTreasuryProxy.getTreasury()) != futureTreasuryAddress) {
      hre.deployments.log('Updating Treasury reference');
      let tx = await holographTreasuryProxy.setTreasury(futureTreasuryAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographTreasury.getBridge()) != futureBridgeProxyAddress) {
      hre.deployments.log('Updating Bridge reference');
      let tx = await holographTreasury.setBridge(futureBridgeProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographTreasury.getOperator()) != futureOperatorProxyAddress) {
      hre.deployments.log('Updating Operator reference');
      let tx = await holographTreasury.setOperator(futureOperatorProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
    if ((await holographTreasury.getRegistry()) != futureRegistryProxyAddress) {
      hre.deployments.log('Updating Registry reference');
      let tx = await holographTreasury.setRegistry(futureRegistryProxyAddress, {
        nonce: await hre.ethers.provider.getTransactionCount(deployer.address),
      });
      await tx.wait();
    }
  }

  // HolographInterfaces
  let interfacesDeployedCode: string = await hre.provider.send('eth_getCode', [
    futureHolographInterfacesAddress,
    'latest',
  ]);
  if (interfacesDeployedCode == '0x' || interfacesDeployedCode == '') {
    hre.deployments.log('"HolographInterfaces" bytecode not found, need to deploy"');
    let interfaces = await genesisDeployHelper(
      hre,
      salt,
      'HolographInterfaces',
      generateInitCode(['address'], [deployer.address]),
      futureHolographInterfacesAddress
    );
    global.__deployedHolographInterfaces = true;
  } else {
    hre.deployments.log('"HolographInterfaces" is already deployed.');
    global.__deployedHolographInterfaces = false;
  }

  // PA1D
  let royaltiesDeployedCode: string = await hre.provider.send('eth_getCode', [futureRoyaltiesAddress, 'latest']);
  if (royaltiesDeployedCode == '0x' || royaltiesDeployedCode == '') {
    hre.deployments.log('"PA1D" bytecode not found, need to deploy"');
    let royalties = await genesisDeployHelper(
      hre,
      salt,
      'PA1D',
      generateInitCode(['address', 'uint256'], [deployer.address, '0x' + '00'.repeat(32)]),
      futureRoyaltiesAddress
    );
  } else {
    hre.deployments.log('"PA1D" is already deployed..');
  }
};

export default func;
func.tags = [
  'DeploySources',

  'Holograph',
  'HolographBridge',
  'HolographBridgeProxy',
  'HolographFactory',
  'HolographFactoryProxy',
  'HolographOperator',
  'HolographOperatorProxy',
  'HolographRegistry',
  'HolographRegistryProxy',
  'HolographTreasury',
  'HolographTreasuryProxy',
  'HolographInterfaces',
  'PA1D',
];
func.dependencies = ['HolographGenesis'];
