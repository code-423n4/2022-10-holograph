declare var global: any;
import { expect, assert } from 'chai';
import { PreTest } from './utils';
import setup from './utils';

describe('Validating the Holograph Protocol deployments (L2)', async () => {
  let l2: PreTest;

  before(async () => {
    l2 = await setup(true);
  });

  after(async () => {});

  beforeEach(async () => {});

  afterEach(async () => {});

  describe('Check that contract addresses are properly deployed', async () => {
    describe('HolographInterfaces:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographInterfaces.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographInterfaces')).deployedBytecode
        );
      });
    });

    describe('CxipERC721 Holographer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.cxipErc721Holographer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('Holographer')).deployedBytecode
        );
      });
    });

    describe('CxipERC721 Enforcer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.cxipErc721Enforcer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographERC721')).deployedBytecode
        );
      });
    });

    describe('CxipERC721:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.cxipErc721.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('CxipERC721Proxy')).deployedBytecode
        );
      });
    });

    describe('CxipERC721Proxy:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.cxipErc721Proxy.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('CxipERC721Proxy')).deployedBytecode
        );
      });
    });

    describe('ERC20Mock:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.erc20Mock.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('ERC20Mock')).deployedBytecode
        );
      });
    });

    describe('Holograph:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holograph.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('Holograph')).deployedBytecode
        );
      });
    });

    describe('HolographBridge:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographBridge.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographBridge')).deployedBytecode
        );
      });
    });

    describe('HolographBridgeProxy:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographBridgeProxy.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographBridgeProxy')).deployedBytecode
        );
      });
    });

    describe('Holographer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('Holographer')).deployedBytecode
        );
      });
    });

    describe('HolographERC20:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographErc20.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographERC20')).deployedBytecode
        );
      });
    });

    describe('HolographERC721:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographErc721.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographERC721')).deployedBytecode
        );
      });
    });

    describe('HolographFactory:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographFactory.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographFactory')).deployedBytecode
        );
      });
    });

    describe('HolographFactoryProxy:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographFactoryProxy.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographFactoryProxy')).deployedBytecode
        );
      });
    });

    describe('HolographGenesis:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographGenesis.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographGenesis')).deployedBytecode
        );
      });
    });

    describe('HolographOperator:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographOperator.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographOperator')).deployedBytecode
        );
      });
    });

    describe('HolographOperatorProxy:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographOperatorProxy.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographOperatorProxy')).deployedBytecode
        );
      });
    });

    describe('HolographRegistry:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographRegistry.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographRegistry')).deployedBytecode
        );
      });
    });

    describe('HolographRegistryProxy:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographRegistryProxy.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographRegistryProxy')).deployedBytecode
        );
      });
    });

    describe('HolographTreasury:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographTreasury.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographTreasury')).deployedBytecode
        );
      });
    });

    describe('HolographTreasuryProxy:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.holographTreasuryProxy.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographTreasuryProxy')).deployedBytecode
        );
      });
    });

    describe('hToken Holographer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.hTokenHolographer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('Holographer')).deployedBytecode
        );
      });
    });

    describe('hToken Enforcer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.hTokenEnforcer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographERC20')).deployedBytecode
        );
      });
    });

    describe('hToken:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.hToken.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('hToken')).deployedBytecode
        );
      });
    });

    describe('MockERC721Receiver:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.mockErc721Receiver.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('MockERC721Receiver')).deployedBytecode
        );
      });
    });

    describe('MockLZEndpoint:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.mockLZEndpoint.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('MockLZEndpoint')).deployedBytecode
        );
      });
    });

    describe('PA1D:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.pa1d.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('PA1D')).deployedBytecode
        );
      });
    });

    describe('SampleERC20 Holographer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.sampleErc20Holographer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('Holographer')).deployedBytecode
        );
      });
    });

    describe('SampleERC20 Enforcer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.sampleErc20Enforcer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographERC20')).deployedBytecode
        );
      });
    });

    describe('SampleERC20:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.sampleErc20.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('SampleERC20')).deployedBytecode
        );
      });
    });

    describe('SampleERC721 Holographer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.sampleErc721Holographer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('Holographer')).deployedBytecode
        );
      });
    });

    describe('SampleERC721 Enforcer:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.sampleErc721Enforcer.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('HolographERC721')).deployedBytecode
        );
      });
    });

    describe('SampleERC721:', async function () {
      it('should return correct bytecode', async function () {
        expect(await l2.hre.provider.send('eth_getCode', [l2.sampleErc721.address, 'latest'])).to.equal(
          (await l2.hre.artifacts.readArtifact('SampleERC721')).deployedBytecode
        );
      });
    });
  });
});
