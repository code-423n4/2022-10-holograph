//declare var global: any;
//import Web3 from 'web3';
//import { AbiItem } from 'web3-utils';
//import { expect, assert } from 'chai';
//import { PreTest } from './utils';
//import setup from './utils';
//import { BigNumberish, BytesLike, BigNumber, ContractFactory } from 'ethers';
//import {
//  Signature,
//  StrictECDSA,
//  zeroAddress,
//  functionHash,
//  XOR,
//  hexToBytes,
//  stringToHex,
//  buildDomainSeperator,
//  randomHex,
//  generateInitCode,
//  generateErc20Config,
//  generateErc721Config,
//  LeanHardhatRuntimeEnvironment,
//  getGasUsage,
//} from '../scripts/utils/helpers';
//import {
//  HolographERC20Event,
//  HolographERC721Event,
//  HolographERC1155Event,
//  ConfigureEvents,
//  AllEventsEnabled,
//} from '../scripts/utils/events';
//import ChainId from '../scripts/utils/chain';
//import {
//  Admin,
//  CxipERC721,
//  ERC20Mock,
//  Holograph,
//  HolographBridge,
//  HolographBridgeProxy,
//  Holographer,
//  HolographERC20,
//  HolographERC721,
//  HolographFactory,
//  HolographFactoryProxy,
//  HolographGenesis,
//  HolographRegistry,
//  HolographRegistryProxy,
//  HToken,
//  HolographInterfaces,
//  MockERC721Receiver,
//  Owner,
//  PA1D,
//  SampleERC20,
//  SampleERC721,
//} from '../typechain-types';
//import { DeploymentConfigStruct } from '../typechain-types/HolographFactory';
//
//describe('Testing LZ Endpoint costs (L1 & L2)', async function () {
//  const lzReceiveABI = {
//    inputs: [
//      {
//        internalType: 'uint16',
//        name: '',
//        type: 'uint16',
//      },
//      {
//        internalType: 'bytes',
//        name: '_srcAddress',
//        type: 'bytes',
//      },
//      {
//        internalType: 'uint64',
//        name: '',
//        type: 'uint64',
//      },
//      {
//        internalType: 'bytes',
//        name: '_payload',
//        type: 'bytes',
//      },
//    ],
//    name: 'lzReceive',
//    outputs: [],
//    stateMutability: 'payable',
//    type: 'function',
//  } as AbiItem;
//  const lzReceive = function (web3: Web3, params: any[]): BytesLike {
//    return l1.web3.eth.abi.encodeFunctionCall(lzReceiveABI, params);
//  };
//
//  let l1: PreTest;
//  let l2: PreTest;
//
//  let totalNFTs: number = 2;
//  let firstNFTl1: BigNumber = BigNumber.from(1);
//  let firstNFTl2: BigNumber = BigNumber.from(1);
//  let secondNFTl1: BigNumber = BigNumber.from(2);
//  let secondNFTl2: BigNumber = BigNumber.from(2);
//  let thirdNFTl1: BigNumber = BigNumber.from(3);
//  let thirdNFTl2: BigNumber = BigNumber.from(3);
//  let fourthNFTl1: BigNumber = BigNumber.from(4);
//  let fourthNFTl2: BigNumber = BigNumber.from(4);
//  let fifthNFTl1: BigNumber = BigNumber.from(5);
//  let fifthNFTl2: BigNumber = BigNumber.from(5);
//
//  let payloadThirdNFTl1: BytesLike;
//  let payloadThirdNFTl2: BytesLike;
//
//  const tokenURIs: string[] = [
//    'undefined',
//    'QmS9hKVbDDaBi65xLSG4Han6da49szSJ1ZuwtkBwNkGZaK/metadata.json',
//    'QmS9hKVbDDaBi65xLSG4Han6da49szSJ1ZuwtkBwNkGZaK/metadata.json',
//    'QmS9hKVbDDaBi65xLSG4Han6da49szSJ1ZuwtkBwNkGZaK/metadata.json',
//    'QmS9hKVbDDaBi65xLSG4Han6da49szSJ1ZuwtkBwNkGZaK/metadata.json',
//    'QmS9hKVbDDaBi65xLSG4Han6da49szSJ1ZuwtkBwNkGZaK/metadata.json',
//  ];
//
//  let gasUsage: {
//    [key: string]: BigNumber;
//  } = {};
//
//  before(async function () {
//    l1 = await setup();
//    l2 = await setup(true);
//
//    firstNFTl2 = BigNumber.from('0x' + l2.network.holographId.toString(16).padStart(8, '0') + '00'.repeat(28)).add(
//      firstNFTl1
//    );
//    secondNFTl2 = BigNumber.from('0x' + l2.network.holographId.toString(16).padStart(8, '0') + '00'.repeat(28)).add(
//      secondNFTl1
//    );
//    thirdNFTl2 = BigNumber.from('0x' + l2.network.holographId.toString(16).padStart(8, '0') + '00'.repeat(28)).add(
//      thirdNFTl1
//    );
//    fourthNFTl2 = BigNumber.from('0x' + l2.network.holographId.toString(16).padStart(8, '0') + '00'.repeat(28)).add(
//      fourthNFTl1
//    );
//    fifthNFTl2 = BigNumber.from('0x' + l2.network.holographId.toString(16).padStart(8, '0') + '00'.repeat(28)).add(
//      fifthNFTl1
//    );
//
//    gasUsage['#3 bridge from l1'] = BigNumber.from(0);
//    gasUsage['#3 bridge from l2'] = BigNumber.from(0);
//    gasUsage['#1 mint on l1'] = BigNumber.from(0);
//    gasUsage['#1 mint on l2'] = BigNumber.from(0);
//
//    payloadThirdNFTl1 =
//      functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//      generateInitCode(
//        ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//        [
//          l1.network.holographId,
//          l1.cxipErc721Holographer.address,
//          l1.deployer.address,
//          l2.deployer.address,
//          thirdNFTl1.toHexString(),
//          generateInitCode(['uint8', 'string'], [1, tokenURIs[3]]),
//        ]
//      ).substring(2);
//
//    payloadThirdNFTl2 =
//      functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//      generateInitCode(
//        ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//        [
//          l2.network.holographId,
//          l1.cxipErc721Holographer.address,
//          l2.deployer.address,
//          l1.deployer.address,
//          thirdNFTl2.toHexString(),
//          generateInitCode(['uint8', 'string'], [1, tokenURIs[3]]),
//        ]
//      ).substring(2);
//  });
//
//  after(async function () {});
//
//  beforeEach(async function () {});
//
//  afterEach(async function () {});
//
//  describe('Enable operators for l1 and l2', async function () {
//    it('should add 100 operator wallets for each chain', async function () {
//      for (let i = 0, l = 100; i < l; i++) {
//        await l1.operator.bondUtilityToken(randomHex(20), BigNumber.from('1000000000000000000'), 0);
//        await l2.operator.bondUtilityToken(randomHex(20), BigNumber.from('1000000000000000000'), 0);
//      }
//      await expect(l1.operator.bondUtilityToken(randomHex(20), BigNumber.from('1000000000000000000'), 0)).to.not.be
//        .reverted;
//      await expect(l2.operator.bondUtilityToken(randomHex(20), BigNumber.from('1000000000000000000'), 0)).to.not.be
//        .reverted;
//    });
//  });
//
//  describe('Deploy cross-chain contracts via bridge deploy', async function () {
//    describe('CxipERC721', async function () {
//      it('deploy l1 equivalent on l2', async function () {
//        let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
//          l1.network,
//          l1.deployer.address,
//          'CxipERC721Proxy',
//          'CXIP ERC721 Collection (' + l1.hre.networkName + ')',
//          'CXIP',
//          1000,
//          // AllEventsEnabled(),
//          ConfigureEvents([
//            HolographERC721Event.bridgeIn,
//            HolographERC721Event.bridgeOut,
//            HolographERC721Event.afterBurn,
//          ]),
//          generateInitCode(
//            ['bytes32', 'address', 'bytes'],
//            [
//              '0x' + l1.web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0'),
//              l1.registry.address,
//              generateInitCode(['address'], [l1.deployer.address]),
//            ]
//          ),
//          l1.salt
//        );
//
//        let cxipErc721Address = await l2.registry.getHolographedHashAddress(erc721ConfigHash);
//
//        expect(cxipErc721Address).to.equal(zeroAddress);
//
//        cxipErc721Address = await l1.registry.getHolographedHashAddress(erc721ConfigHash);
//
//        let sig = await l1.deployer.signMessage(erc721ConfigHashBytes);
//        let signature: Signature = StrictECDSA({
//          r: '0x' + sig.substring(2, 66),
//          s: '0x' + sig.substring(66, 130),
//          v: '0x' + sig.substring(130, 132),
//        } as Signature);
//
//        let payload: BytesLike =
//          functionHash('deployIn(bytes)') +
//          generateInitCode(
//            ['bytes'],
//            [
//              generateInitCode(
//                ['tuple(bytes32,uint32,bytes32,bytes,bytes)', 'tuple(bytes32,bytes32,uint8)', 'address'],
//                [
//                  [
//                    erc721Config.contractType,
//                    erc721Config.chainType,
//                    erc721Config.salt,
//                    erc721Config.byteCode,
//                    erc721Config.initCode,
//                  ],
//                  [signature.r, signature.s, signature.v],
//                  l1.deployer.address,
//                ]
//              ),
//            ]
//          ).substring(2);
//
//        await expect(l1.bridge.deployOut(l2.network.holographId, erc721Config, signature, l1.deployer.address))
//          .to.emit(l1.mockLZEndpoint, 'LzEvent')
//          .withArgs(ChainId.hlg2lz(l2.network.holographId), l1.operator.address.toLowerCase(), payload);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        await expect(l2.operator.executeJob(payload))
//          .to.emit(l2.factory, 'BridgeableContractDeployed')
//          .withArgs(cxipErc721Address, erc721ConfigHash);
//
//        expect(await l2.registry.getHolographedHashAddress(erc721ConfigHash)).to.equal(cxipErc721Address);
//      });
//
//      it('deploy l2 equivalent on l1', async function () {
//        let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
//          l2.network,
//          l2.deployer.address,
//          'CxipERC721Proxy',
//          'CXIP ERC721 Collection (' + l2.hre.networkName + ')',
//          'CXIP',
//          1000,
//          // AllEventsEnabled(),
//          ConfigureEvents([
//            HolographERC721Event.bridgeIn,
//            HolographERC721Event.bridgeOut,
//            HolographERC721Event.afterBurn,
//          ]),
//          generateInitCode(
//            ['bytes32', 'address', 'bytes'],
//            [
//              '0x' + l2.web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0'),
//              l2.registry.address,
//              generateInitCode(['address'], [l2.deployer.address]),
//            ]
//          ),
//          l2.salt
//        );
//
//        let cxipErc721Address = await l1.registry.getHolographedHashAddress(erc721ConfigHash);
//
//        expect(cxipErc721Address).to.equal(zeroAddress);
//
//        cxipErc721Address = await l2.registry.getHolographedHashAddress(erc721ConfigHash);
//
//        let sig = await l2.deployer.signMessage(erc721ConfigHashBytes);
//        let signature: Signature = StrictECDSA({
//          r: '0x' + sig.substring(2, 66),
//          s: '0x' + sig.substring(66, 130),
//          v: '0x' + sig.substring(130, 132),
//        } as Signature);
//
//        let payload: BytesLike =
//          functionHash('deployIn(bytes)') +
//          generateInitCode(
//            ['bytes'],
//            [
//              generateInitCode(
//                ['tuple(bytes32,uint32,bytes32,bytes,bytes)', 'tuple(bytes32,bytes32,uint8)', 'address'],
//                [
//                  [
//                    erc721Config.contractType,
//                    erc721Config.chainType,
//                    erc721Config.salt,
//                    erc721Config.byteCode,
//                    erc721Config.initCode,
//                  ],
//                  [signature.r, signature.s, signature.v],
//                  l1.deployer.address,
//                ]
//              ),
//            ]
//          ).substring(2);
//
//        await expect(l2.bridge.deployOut(l1.network.holographId, erc721Config, signature, l2.deployer.address))
//          .to.emit(l2.mockLZEndpoint, 'LzEvent')
//          .withArgs(ChainId.hlg2lz(l1.network.holographId), l2.operator.address.toLowerCase(), payload);
//
//        await expect(
//          l1.mockLZEndpoint
//            .connect(l1.lzEndpoint)
//            .adminCall(
//              l1.operator.address,
//              lzReceive(l1.web3, [ChainId.hlg2lz(l2.network.holographId), l2.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l1.operator, 'AvailableOperatorJob')
//          .withArgs(l1.web3.utils.keccak256(payload as string), payload);
//
//        await expect(l1.operator.executeJob(payload))
//          .to.emit(l1.factory, 'BridgeableContractDeployed')
//          .withArgs(cxipErc721Address, erc721ConfigHash);
//
//        expect(await l1.registry.getHolographedHashAddress(erc721ConfigHash)).to.equal(cxipErc721Address);
//      });
//    });
//  });
//
//  describe('CxipERC721', async function () {
//    describe('check current state', async function () {
//      it('l1 should have a total supply of 0 on l1', async function () {
//        expect(await l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).totalSupply()).to.equal(0);
//      });
//
//      it('l1 should have a total supply of 0 on l2', async function () {
//        expect(await l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).totalSupply()).to.equal(0);
//      });
//
//      it('l2 should have a total supply of 0 on l2', async function () {
//        expect(await l2.cxipErc721Enforcer.attach(l2.cxipErc721Holographer.address).totalSupply()).to.equal(0);
//      });
//
//      it('l2 should have a total supply of 0 on l1', async function () {
//        expect(await l1.cxipErc721Enforcer.attach(l2.cxipErc721Holographer.address).totalSupply()).to.equal(0);
//      });
//    });
//
//    describe('validate mint functionality', async function () {
//      it('l1 should mint token #1 as #1 on l1', async function () {
//        await expect(l1.cxipErc721.attach(l1.cxipErc721Holographer.address).cxipMint(firstNFTl1, 1, tokenURIs[1]))
//          .to.emit(l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, firstNFTl1);
//
//        gasUsage['#1 mint on l1'] = gasUsage['#1 mint on l1'].add(await getGasUsage(l1.hre));
//      });
//
//      it('l1 should mint token #1 not as #1 on l2', async function () {
//        await expect(l2.cxipErc721.attach(l1.cxipErc721Holographer.address).cxipMint(firstNFTl1, 1, tokenURIs[1]))
//          .to.emit(l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, firstNFTl2);
//
//        gasUsage['#1 mint on l2'] = gasUsage['#1 mint on l2'].add(await getGasUsage(l1.hre));
//      });
//
//      it('mint tokens #2 and #3 on l1 and l2', async function () {
//        await expect(l1.cxipErc721.attach(l1.cxipErc721Holographer.address).cxipMint(secondNFTl1, 1, tokenURIs[2]))
//          .to.emit(l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, secondNFTl1);
//
//        await expect(l2.cxipErc721.attach(l1.cxipErc721Holographer.address).cxipMint(secondNFTl1, 1, tokenURIs[2]))
//          .to.emit(l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, secondNFTl2);
//
//        await expect(l1.cxipErc721.attach(l1.cxipErc721Holographer.address).cxipMint(thirdNFTl1, 1, tokenURIs[3]))
//          .to.emit(l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, thirdNFTl1);
//
//        await expect(l2.cxipErc721.attach(l1.cxipErc721Holographer.address).cxipMint(thirdNFTl1, 1, tokenURIs[3]))
//          .to.emit(l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, thirdNFTl2);
//      });
//    });
//
//    describe('validate bridge functionality', async function () {
//      it('token #3 bridge out on l1 should succeed', async function () {
//        let payload: BytesLike = payloadThirdNFTl1;
//
//        await expect(
//          l1.bridge.erc721out(
//            l2.network.holographId,
//            l1.cxipErc721Holographer.address,
//            l1.deployer.address,
//            l2.deployer.address,
//            thirdNFTl1
//          )
//        )
//          .to.emit(l1.mockLZEndpoint, 'LzEvent')
//          .withArgs(ChainId.hlg2lz(l2.network.holographId), l1.operator.address.toLowerCase(), payload);
//
//        gasUsage['#3 bridge from l1'] = gasUsage['#3 bridge from l1'].add(await getGasUsage(l1.hre));
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        gasUsage['#3 bridge from l1'] = gasUsage['#3 bridge from l1'].add(await getGasUsage(l2.hre));
//
//        await expect(
//          l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).ownerOf(thirdNFTl1)
//        ).to.be.revertedWith('ERC721: token does not exist');
//      });
//
//      it('token #3 bridge out on l2 should succeed', async function () {
//        let payload: BytesLike = payloadThirdNFTl2;
//
//        await expect(
//          l2.bridge.erc721out(
//            l1.network.holographId,
//            l1.cxipErc721Holographer.address,
//            l2.deployer.address,
//            l1.deployer.address,
//            thirdNFTl2
//          )
//        )
//          .to.emit(l2.mockLZEndpoint, 'LzEvent')
//          .withArgs(ChainId.hlg2lz(l1.network.holographId), l2.operator.address.toLowerCase(), payload);
//
//        gasUsage['#3 bridge from l2'] = gasUsage['#3 bridge from l2'].add(await getGasUsage(l2.hre));
//
//        await expect(
//          l1.mockLZEndpoint
//            .connect(l1.lzEndpoint)
//            .adminCall(
//              l1.operator.address,
//              lzReceive(l1.web3, [ChainId.hlg2lz(l2.network.holographId), l2.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l1.operator, 'AvailableOperatorJob')
//          .withArgs(l1.web3.utils.keccak256(payload as string), payload);
//
//        gasUsage['#3 bridge from l2'] = gasUsage['#3 bridge from l2'].add(await getGasUsage(l1.hre));
//
//        await expect(
//          l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).ownerOf(thirdNFTl2)
//        ).to.be.revertedWith('ERC721: token does not exist');
//      });
//
//      it('token #3 bridge in on l2 should succeed', async function () {
//        let payload: BytesLike = payloadThirdNFTl1;
//
//        await expect(l2.operator.executeJob(payload))
//          .to.emit(l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l2.deployer.address, thirdNFTl1.toHexString());
//
//        gasUsage['#3 bridge from l1'] = gasUsage['#3 bridge from l1'].add(await getGasUsage(l2.hre));
//
//        expect(await l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).ownerOf(thirdNFTl1)).to.equal(
//          l2.deployer.address
//        );
//      });
//
//      it('token #3 bridge in on l1 should succeed', async function () {
//        let payload: BytesLike = payloadThirdNFTl2;
//
//        await expect(l1.operator.executeJob(payload))
//          .to.emit(l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(zeroAddress, l1.deployer.address, thirdNFTl2.toHexString());
//
//        gasUsage['#3 bridge from l2'] = gasUsage['#3 bridge from l2'].add(await getGasUsage(l1.hre));
//
//        expect(await l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).ownerOf(thirdNFTl2)).to.equal(
//          l1.deployer.address
//        );
//      });
//    });
//
//    describe('Get gas calculations', async function () {
//      it('SampleERC721 #1 mint on l1', async function () {
//        process.stdout.write('          #1 mint on l1 gas used: ' + gasUsage['#1 mint on l1'].toString() + '\n');
//        assert(!gasUsage['#1 mint on l1'].isZero(), 'zero sum returned');
//      });
//
//      it('SampleERC721 #1 mint on l2', async function () {
//        process.stdout.write('          #1 mint on l2 gas used: ' + gasUsage['#1 mint on l2'].toString() + '\n');
//        assert(!gasUsage['#1 mint on l2'].isZero(), 'zero sum returned');
//      });
//
//      it('SampleERC721 #1 transfer on l1', async function () {
//        await expect(
//          l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).transfer(l1.wallet1.address, firstNFTl1)
//        )
//          .to.emit(l1.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(l1.deployer.address, l1.wallet1.address, firstNFTl1);
//
//        process.stdout.write('          #1 transfer on l1 gas used: ' + (await getGasUsage(l1.hre)).toString() + '\n');
//      });
//
//      it('SampleERC721 #1 transfer on l2', async function () {
//        await expect(
//          l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address).transfer(l2.wallet1.address, firstNFTl2)
//        )
//          .to.emit(l2.cxipErc721Enforcer.attach(l1.cxipErc721Holographer.address), 'Transfer')
//          .withArgs(l2.deployer.address, l2.wallet1.address, firstNFTl2);
//
//        process.stdout.write('          #1 transfer on l2 gas used: ' + (await getGasUsage(l2.hre)).toString() + '\n');
//      });
//
//      it('SampleERC721 #3 bridge from l1', async function () {
//        process.stdout.write(
//          '          #3 bridge from l1 gas used: ' + gasUsage['#3 bridge from l1'].toString() + '\n'
//        );
//        assert(!gasUsage['#3 bridge from l1'].isZero(), 'zero sum returned');
//      });
//
//      it('SampleERC721 #3 bridge from l2', async function () {
//        process.stdout.write(
//          '          #3 bridge from l2 gas used: ' + gasUsage['#3 bridge from l2'].toString() + '\n'
//        );
//        assert(!gasUsage['#3 bridge from l2'].isZero(), 'zero sum returned');
//      });
//    });
//
//    describe('Calculate LayerZero gas usage', async function () {
//      it('l1 erc721in cost 1', async function () {
//        let payload: BytesLike =
//          functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//          generateInitCode(
//            ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//            [
//              l1.network.holographId,
//              l1.cxipErc721Holographer.address,
//              l1.deployer.address,
//              l2.deployer.address,
//              firstNFTl1.toHexString(),
//              generateInitCode(['uint8', 'string'], [1, tokenURIs[1]]),
//            ]
//          ).substring(2);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l1 erc721in cost 2', async function () {
//        let payload: BytesLike =
//          functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//          generateInitCode(
//            ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//            [
//              l1.network.holographId,
//              l1.cxipErc721Holographer.address,
//              l1.deployer.address,
//              l2.deployer.address,
//              secondNFTl1.toHexString(),
//              generateInitCode(['uint8', 'string'], [1, tokenURIs[2]]),
//            ]
//          ).substring(2);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l1 erc721in cost 3', async function () {
//        let payload: BytesLike =
//          functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//          generateInitCode(
//            ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//            [
//              l1.network.holographId,
//              l1.cxipErc721Holographer.address,
//              l1.deployer.address,
//              l2.deployer.address,
//              thirdNFTl1.toHexString(),
//              generateInitCode(['uint8', 'string'], [1, tokenURIs[3]]),
//            ]
//          ).substring(2);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l1 erc721in cost 4', async function () {
//        let payload: BytesLike =
//          functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//          generateInitCode(
//            ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//            [
//              l1.network.holographId,
//              l1.cxipErc721Holographer.address,
//              l1.deployer.address,
//              l2.deployer.address,
//              fourthNFTl1.toHexString(),
//              generateInitCode(['uint8', 'string'], [1, tokenURIs[4]]),
//            ]
//          ).substring(2);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l1 erc721in cost 5', async function () {
//        let payload: BytesLike =
//          functionHash('erc721in(uint32,address,address,address,uint256,bytes)') +
//          generateInitCode(
//            ['uint32', 'address', 'address', 'address', 'uint256', 'bytes'],
//            [
//              l1.network.holographId,
//              l1.cxipErc721Holographer.address,
//              l1.deployer.address,
//              l2.deployer.address,
//              fifthNFTl1.toHexString(),
//              generateInitCode(['uint8', 'string'], [1, tokenURIs[5]]),
//            ]
//          ).substring(2);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l2 erc721in cost 1', async function () {
//        let payload: BytesLike = randomHex(4) + randomHex(32, false);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        process.stdout.write(
//          '\n' +
//            'Expecting ' +
//            (52000 + (((payload as string).length - 2) / 2) * 25).toString() +
//            ' of gas to be used' +
//            '\n'
//        );
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l2 erc721in cost 2', async function () {
//        let payload: BytesLike = randomHex(4) + randomHex(64, false);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        process.stdout.write(
//          '\n' +
//            'Expecting ' +
//            (52000 + (((payload as string).length - 2) / 2) * 25).toString() +
//            ' of gas to be used' +
//            '\n'
//        );
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l2 erc721in cost 3', async function () {
//        let payload: BytesLike = randomHex(4) + randomHex(128, false);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        process.stdout.write(
//          '\n' +
//            'Expecting ' +
//            (52000 + (((payload as string).length - 2) / 2) * 25).toString() +
//            ' of gas to be used' +
//            '\n'
//        );
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l2 erc721in cost 4', async function () {
//        let payload: BytesLike = randomHex(4) + randomHex(256, false);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        process.stdout.write(
//          '\n' +
//            'Expecting ' +
//            (52000 + (((payload as string).length - 2) / 2) * 25).toString() +
//            ' of gas to be used' +
//            '\n'
//        );
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//
//      it('l2 erc721in cost 5', async function () {
//        let payload: BytesLike = randomHex(4) + randomHex(1024, false);
//
//        await expect(
//          l2.mockLZEndpoint
//            .connect(l2.lzEndpoint)
//            .adminCall(
//              l2.operator.address,
//              lzReceive(l2.web3, [ChainId.hlg2lz(l1.network.holographId), l1.operator.address, 0, payload])
//            )
//        )
//          .to.emit(l2.operator, 'AvailableOperatorJob')
//          .withArgs(l2.web3.utils.keccak256(payload as string), payload);
//
//        process.stdout.write(
//          '\n' +
//            'Expecting ' +
//            (52000 + (((payload as string).length - 2) / 2) * 25).toString() +
//            ' of gas to be used' +
//            '\n'
//        );
//        await getGasUsage(l2.hre, 'erc721in available job', true);
//      });
//    });
//  });
//});
