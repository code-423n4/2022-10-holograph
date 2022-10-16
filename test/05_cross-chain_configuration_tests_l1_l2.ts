declare var global: any;
import { expect, assert } from 'chai';
import { PreTest } from './utils';
import setup from './utils';
import { BigNumberish, BytesLike, BigNumber, ContractFactory } from 'ethers';
import {
  Signature,
  StrictECDSA,
  zeroAddress,
  functionHash,
  XOR,
  buildDomainSeperator,
  randomHex,
  generateInitCode,
  generateErc20Config,
  generateErc721Config,
  getGasUsage,
} from '../scripts/utils/helpers';
import {
  HolographERC20Event,
  HolographERC721Event,
  HolographERC1155Event,
  ConfigureEvents,
} from '../scripts/utils/events';

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
  HolographRegistry,
  HolographRegistryProxy,
  HToken,
  HolographInterfaces,
  MockERC721Receiver,
  Owner,
  PA1D,
  SampleERC20,
  SampleERC721,
} from '../typechain-types';
import { DeploymentConfigStruct } from '../typechain-types/HolographFactory';

describe('Testing cross-chain configurations (L1 & L2)', async function () {
  let l1: PreTest;
  let l2: PreTest;

  let gasUsage: {
    [key: string]: BigNumber;
  } = {};

  before(async function () {
    l1 = await setup();
    l2 = await setup(true);

    gasUsage['hToken deploy l1 on l2'] = BigNumber.from(0);
    gasUsage['hToken deploy l2 on l1'] = BigNumber.from(0);
    gasUsage['SampleERC20 deploy l1 on l2'] = BigNumber.from(0);
    gasUsage['SampleERC20 deploy l2 on l1'] = BigNumber.from(0);
    gasUsage['SampleERC721 deploy l1 on l2'] = BigNumber.from(0);
    gasUsage['SampleERC721 deploy l2 on l1'] = BigNumber.from(0);
    gasUsage['CxipERC721 deploy l1 on l2'] = BigNumber.from(0);
    gasUsage['CxipERC721 deploy l2 on l1'] = BigNumber.from(0);
  });

  after(async function () {});

  beforeEach(async function () {});

  afterEach(async function () {});

  describe('Validate cross-chain data', async function () {
    describe('CxipERC721', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.cxipErc721Proxy.address).to.not.equal(l2.cxipErc721Proxy.address);
      });
    });

    describe('ERC20Mock', async function () {
      it('contract addresses should match', async function () {
        expect(l1.erc20Mock.address).to.equal(l2.erc20Mock.address);
      });
    });

    describe('Holograph', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holograph.address).to.equal(l2.holograph.address);
      });
    });

    describe('HolographBridge', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographBridge.address).to.equal(l2.holographBridge.address);
      });
    });

    describe('HolographBridgeProxy', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographBridgeProxy.address).to.equal(l2.holographBridgeProxy.address);
      });
    });

    describe('Holographer', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.holographer.address).to.not.equal(l2.holographer.address);
      });
    });

    describe('HolographERC20', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographErc20.address).to.equal(l2.holographErc20.address);
      });
    });

    describe('HolographERC721', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographErc721.address).to.equal(l2.holographErc721.address);
      });
    });

    describe('HolographFactory', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographFactory.address).to.equal(l2.holographFactory.address);
      });
    });

    describe('HolographFactoryProxy', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographFactoryProxy.address).to.equal(l2.holographFactoryProxy.address);
      });
    });

    describe('HolographGenesis', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographGenesis.address).to.equal(l2.holographGenesis.address);
      });
    });

    describe('HolographOperator', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographOperator.address).to.equal(l2.holographOperator.address);
      });
    });

    describe('HolographOperatorProxy', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographOperatorProxy.address).to.equal(l2.holographOperatorProxy.address);
      });
    });

    describe('HolographRegistry', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographRegistry.address).to.equal(l2.holographRegistry.address);
      });
    });

    describe('HolographRegistryProxy', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographRegistryProxy.address).to.equal(l2.holographRegistryProxy.address);
      });
    });

    describe('HolographTreasury', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographTreasury.address).to.equal(l2.holographTreasury.address);
      });
    });

    describe('HolographTreasuryProxy', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographTreasuryProxy.address).to.equal(l2.holographTreasuryProxy.address);
      });
    });

    describe('hToken', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.hToken.address).to.not.equal(l2.hToken.address);
      });
    });

    describe('HolographInterfaces', async function () {
      it('contract addresses should match', async function () {
        expect(l1.holographInterfaces.address).to.equal(l2.holographInterfaces.address);
      });
    });

    describe('MockERC721Receiver', async function () {
      it('contract addresses should match', async function () {
        expect(l1.mockErc721Receiver.address).to.equal(l2.mockErc721Receiver.address);
      });
    });

    describe('PA1D', async function () {
      it('contract addresses should match', async function () {
        expect(l1.pa1d.address).to.equal(l2.pa1d.address);
      });
    });

    describe('SampleERC20', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.sampleErc20.address).to.not.equal(l2.sampleErc20.address);
      });
    });

    describe('SampleERC721', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.sampleErc721.address).to.not.equal(l2.sampleErc721.address);
      });
    });

    describe('HolographRegistry', async function () {
      it('contract addresses should match', async function () {
        expect(l1.registry.address).to.equal(l2.registry.address);
      });
    });

    describe('HolographFactory', async function () {
      it('contract addresses should match', async function () {
        expect(l1.factory.address).to.equal(l2.factory.address);
      });
    });

    describe('HolographBridge', async function () {
      it('contract addresses should match', async function () {
        expect(l1.bridge.address).to.equal(l2.bridge.address);
      });
    });

    describe('hToken Holographer', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.hTokenHolographer.address).to.not.equal(l2.hTokenHolographer.address);
      });
    });

    describe('hToken HolographERC20 Enforcer', async function () {
      it('contract addresses should match', async function () {
        expect(l1.hTokenEnforcer.address).to.equal(l2.hTokenEnforcer.address);
      });
    });

    describe('SampleERC20 Holographer', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.sampleErc20Holographer.address).to.not.equal(l2.sampleErc20Holographer.address);
      });
    });

    describe('SampleERC20 HolographERC20 Enforcer', async function () {
      it('contract addresses should match', async function () {
        expect(l1.sampleErc20Enforcer.address).to.equal(l2.sampleErc20Enforcer.address);
      });
    });

    describe('SampleERC721 Holographer', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.sampleErc721Holographer.address).to.not.equal(l2.sampleErc721Holographer.address);
      });
    });

    describe('SampleERC721 HolographERC721 Enforcer', async function () {
      it('contract addresses should match', async function () {
        expect(l1.sampleErc721Enforcer.address).to.equal(l2.sampleErc721Enforcer.address);
      });
    });

    describe('CxipERC721 Holographer', async function () {
      it('contract addresses should not match', async function () {
        expect(l1.cxipErc721Holographer.address).to.not.equal(l2.cxipErc721Holographer.address);
      });
    });

    describe('CxipERC721 HolographERC721 Enforcer', async function () {
      it('contract addresses should match', async function () {
        expect(l1.cxipErc721Enforcer.address).to.equal(l2.cxipErc721Enforcer.address);
      });
    });
  });

  describe('Deploy cross-chain contracts', async function () {
    describe('hToken', async function () {
      it('deploy l1 equivalent on l2', async function () {
        let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
          l1.network,
          l1.deployer.address,
          'hToken',
          l1.network.tokenName + ' (Holographed #' + l1.network.holographId.toString() + ')',
          'h' + l1.network.tokenSymbol,
          l1.network.tokenName + ' (Holographed #' + l1.network.holographId.toString() + ')',
          '1',
          18,
          ConfigureEvents([]),
          generateInitCode(['address', 'uint16'], [l1.deployer.address, 0]),
          l1.salt
        );

        let hTokenErc20Address = await l2.registry.getHolographedHashAddress(erc20ConfigHash);

        expect(hTokenErc20Address).to.equal(zeroAddress);

        hTokenErc20Address = await l1.registry.getHolographedHashAddress(erc20ConfigHash);

        let sig = await l1.deployer.signMessage(erc20ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l2.factory.deployHolographableContract(erc20Config, signature, l1.deployer.address))
          .to.emit(l2.factory, 'BridgeableContractDeployed')
          .withArgs(hTokenErc20Address, erc20ConfigHash);

        gasUsage['hToken deploy l1 on l2'] = gasUsage['hToken deploy l1 on l2'].add(await getGasUsage(l2.hre));
      });

      it('deploy l2 equivalent on l1', async function () {
        let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
          l2.network,
          l2.deployer.address,
          'hToken',
          l2.network.tokenName + ' (Holographed #' + l2.network.holographId.toString() + ')',
          'h' + l2.network.tokenSymbol,
          l2.network.tokenName + ' (Holographed #' + l2.network.holographId.toString() + ')',
          '1',
          18,
          ConfigureEvents([]),
          generateInitCode(['address', 'uint16'], [l2.deployer.address, 0]),
          l2.salt
        );

        let hTokenErc20Address = await l1.registry.getHolographedHashAddress(erc20ConfigHash);

        expect(hTokenErc20Address).to.equal(zeroAddress);

        hTokenErc20Address = await l2.registry.getHolographedHashAddress(erc20ConfigHash);

        let sig = await l2.deployer.signMessage(erc20ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l1.factory.deployHolographableContract(erc20Config, signature, l2.deployer.address))
          .to.emit(l1.factory, 'BridgeableContractDeployed')
          .withArgs(hTokenErc20Address, erc20ConfigHash);

        gasUsage['hToken deploy l2 on l1'] = gasUsage['hToken deploy l2 on l1'].add(await getGasUsage(l1.hre));
      });
    });

    describe('SampleERC20', async function () {
      it('deploy l1 equivalent on l2', async function () {
        let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
          l1.network,
          l1.deployer.address,
          'SampleERC20',
          'Sample ERC20 Token (' + l1.hre.networkName + ')',
          'SMPL',
          'Sample ERC20 Token',
          '1',
          18,
          ConfigureEvents([HolographERC20Event.bridgeIn, HolographERC20Event.bridgeOut]),
          generateInitCode(['address', 'uint16'], [l1.deployer.address, 0]),
          l1.salt
        );

        let sampleErc20Address = await l2.registry.getHolographedHashAddress(erc20ConfigHash);

        expect(sampleErc20Address).to.equal(zeroAddress);

        sampleErc20Address = await l1.registry.getHolographedHashAddress(erc20ConfigHash);

        let sig = await l1.deployer.signMessage(erc20ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l2.factory.deployHolographableContract(erc20Config, signature, l1.deployer.address))
          .to.emit(l2.factory, 'BridgeableContractDeployed')
          .withArgs(sampleErc20Address, erc20ConfigHash);

        gasUsage['SampleERC20 deploy l1 on l2'] = gasUsage['SampleERC20 deploy l1 on l2'].add(
          await getGasUsage(l2.hre)
        );
      });

      it('deploy l2 equivalent on l1', async function () {
        let { erc20Config, erc20ConfigHash, erc20ConfigHashBytes } = await generateErc20Config(
          l2.network,
          l2.deployer.address,
          'SampleERC20',
          'Sample ERC20 Token (' + l2.hre.networkName + ')',
          'SMPL',
          'Sample ERC20 Token',
          '1',
          18,
          ConfigureEvents([HolographERC20Event.bridgeIn, HolographERC20Event.bridgeOut]),
          generateInitCode(['address', 'uint16'], [l1.deployer.address, 0]),
          l2.salt
        );

        let sampleErc20Address = await l1.registry.getHolographedHashAddress(erc20ConfigHash);

        expect(sampleErc20Address).to.equal(zeroAddress);

        sampleErc20Address = await l2.registry.getHolographedHashAddress(erc20ConfigHash);

        let sig = await l2.deployer.signMessage(erc20ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l1.factory.deployHolographableContract(erc20Config, signature, l2.deployer.address))
          .to.emit(l1.factory, 'BridgeableContractDeployed')
          .withArgs(sampleErc20Address, erc20ConfigHash);

        gasUsage['SampleERC20 deploy l2 on l1'] = gasUsage['SampleERC20 deploy l2 on l1'].add(
          await getGasUsage(l1.hre)
        );
      });
    });

    describe('SampleERC721', async function () {
      it('deploy l1 equivalent on l2', async function () {
        let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
          l1.network,
          l1.deployer.address,
          'SampleERC721',
          'Sample ERC721 Contract (' + l1.hre.networkName + ')',
          'SMPLR',
          1000,
          ConfigureEvents([
            HolographERC721Event.bridgeIn,
            HolographERC721Event.bridgeOut,
            HolographERC721Event.afterBurn,
          ]),
          generateInitCode(['address'], [l1.deployer.address /*owner*/]),
          l1.salt
        );

        let sampleErc721Address = await l2.registry.getHolographedHashAddress(erc721ConfigHash);

        expect(sampleErc721Address).to.equal(zeroAddress);

        sampleErc721Address = await l1.registry.getHolographedHashAddress(erc721ConfigHash);

        let sig = await l1.deployer.signMessage(erc721ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l2.factory.deployHolographableContract(erc721Config, signature, l1.deployer.address))
          .to.emit(l2.factory, 'BridgeableContractDeployed')
          .withArgs(sampleErc721Address, erc721ConfigHash);

        gasUsage['SampleERC721 deploy l1 on l2'] = gasUsage['SampleERC721 deploy l1 on l2'].add(
          await getGasUsage(l2.hre)
        );
      });

      it('deploy l2 equivalent on l1', async function () {
        let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
          l2.network,
          l2.deployer.address,
          'SampleERC721',
          'Sample ERC721 Contract (' + l2.hre.networkName + ')',
          'SMPLR',
          1000,
          ConfigureEvents([
            HolographERC721Event.bridgeIn,
            HolographERC721Event.bridgeOut,
            HolographERC721Event.afterBurn,
          ]),
          generateInitCode(['address'], [l2.deployer.address /*owner*/]),
          l2.salt
        );

        let sampleErc721Address = await l1.registry.getHolographedHashAddress(erc721ConfigHash);

        expect(sampleErc721Address).to.equal(zeroAddress);

        sampleErc721Address = await l2.registry.getHolographedHashAddress(erc721ConfigHash);

        let sig = await l2.deployer.signMessage(erc721ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l1.factory.deployHolographableContract(erc721Config, signature, l2.deployer.address))
          .to.emit(l1.factory, 'BridgeableContractDeployed')
          .withArgs(sampleErc721Address, erc721ConfigHash);

        gasUsage['SampleERC721 deploy l2 on l1'] = gasUsage['SampleERC721 deploy l2 on l1'].add(
          await getGasUsage(l1.hre)
        );
      });
    });

    describe('CxipERC721', async function () {
      it('deploy l1 equivalent on l2', async function () {
        let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
          l1.network,
          l1.deployer.address,
          'CxipERC721Proxy',
          'CXIP ERC721 Collection (' + l1.hre.networkName + ')',
          'CXIP',
          1000,
          ConfigureEvents([
            HolographERC721Event.bridgeIn,
            HolographERC721Event.bridgeOut,
            HolographERC721Event.afterBurn,
          ]),
          generateInitCode(
            ['bytes32', 'address', 'bytes'],
            [
              '0x' + l1.web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0'),
              l1.registry.address,
              generateInitCode(['address'], [l1.deployer.address]),
            ]
          ),
          l1.salt
        );

        let cxipErc721Address = await l2.registry.getHolographedHashAddress(erc721ConfigHash);

        expect(cxipErc721Address).to.equal(zeroAddress);

        cxipErc721Address = await l1.registry.getHolographedHashAddress(erc721ConfigHash);

        let sig = await l1.deployer.signMessage(erc721ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l2.factory.deployHolographableContract(erc721Config, signature, l1.deployer.address))
          .to.emit(l2.factory, 'BridgeableContractDeployed')
          .withArgs(cxipErc721Address, erc721ConfigHash);

        gasUsage['CxipERC721 deploy l1 on l2'] = gasUsage['CxipERC721 deploy l1 on l2'].add(await getGasUsage(l2.hre));
      });

      it('deploy l2 equivalent on l1', async function () {
        let { erc721Config, erc721ConfigHash, erc721ConfigHashBytes } = await generateErc721Config(
          l2.network,
          l2.deployer.address,
          'CxipERC721Proxy',
          'CXIP ERC721 Collection (' + l2.hre.networkName + ')',
          'CXIP',
          1000,
          ConfigureEvents([
            HolographERC721Event.bridgeIn,
            HolographERC721Event.bridgeOut,
            HolographERC721Event.afterBurn,
          ]),
          generateInitCode(
            ['bytes32', 'address', 'bytes'],
            [
              '0x' + l2.web3.utils.asciiToHex('CxipERC721').substring(2).padStart(64, '0'),
              l2.registry.address,
              generateInitCode(['address'], [l2.deployer.address]),
            ]
          ),
          l2.salt
        );

        let cxipErc721Address = await l1.registry.getHolographedHashAddress(erc721ConfigHash);

        expect(cxipErc721Address).to.equal(zeroAddress);

        cxipErc721Address = await l2.registry.getHolographedHashAddress(erc721ConfigHash);

        let sig = await l2.deployer.signMessage(erc721ConfigHashBytes);
        let signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(l1.factory.deployHolographableContract(erc721Config, signature, l2.deployer.address))
          .to.emit(l1.factory, 'BridgeableContractDeployed')
          .withArgs(cxipErc721Address, erc721ConfigHash);

        gasUsage['CxipERC721 deploy l2 on l1'] = gasUsage['CxipERC721 deploy l2 on l1'].add(await getGasUsage(l1.hre));
      });
    });
  });

  describe('Verify chain configs', async function () {
    describe('MessagingModule endpoints', async function () {
      it('should not be empty', async function () {
        expect(await l1.operator.getMessagingModule()).to.not.equal(zeroAddress);

        expect(await l2.operator.getMessagingModule()).to.not.equal(zeroAddress);
      });
      it('should be same address on both chains', async function () {
        expect(await l1.operator.getMessagingModule()).to.equal(await l2.operator.getMessagingModule());
      });
    });

    describe('Chain IDs', async function () {
      it('l1 chain id should be correct', async function () {
        expect(await l1.holograph.getHolographChainId()).to.equal(l1.network.holographId);
      });

      it('l2 chain id should be correct', async function () {
        expect(await l2.holograph.getHolographChainId()).to.equal(l2.network.holographId);
      });
    });
  });

  describe('Get gas calculations', async function () {
    it('hToken deploy l1 on l2', async function () {
      let name: string = 'hToken deploy l1 on l2';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('hToken deploy l2 on l1', async function () {
      let name: string = 'hToken deploy l2 on l1';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('SampleERC20 deploy l1 on l2', async function () {
      let name: string = 'SampleERC20 deploy l1 on l2';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('SampleERC20 deploy l2 on l1', async function () {
      let name: string = 'SampleERC20 deploy l2 on l1';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('SampleERC721 deploy l1 on l2', async function () {
      let name: string = 'SampleERC721 deploy l1 on l2';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('SampleERC721 deploy l2 on l1', async function () {
      let name: string = 'SampleERC721 deploy l2 on l1';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('CxipERC721 deploy l1 on l2', async function () {
      let name: string = 'CxipERC721 deploy l1 on l2';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });

    it('CxipERC721 deploy l2 on l1', async function () {
      let name: string = 'CxipERC721 deploy l2 on l1';
      process.stdout.write('          ' + name + ': ' + gasUsage[name].toString() + '\n');
      assert(!gasUsage[name].isZero(), 'zero sum returned');
    });
  });
});
