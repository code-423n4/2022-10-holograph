declare var global: any;
import { expect, assert } from 'chai';
import { PreTest } from './utils';
import setup from './utils';
import { BigNumberish, BytesLike, BigNumber } from 'ethers';
import {
  Signature,
  zeroAddress,
  functionHash,
  XOR,
  buildDomainSeperator,
  randomHex,
  StrictECDSA,
  generateInitCode,
} from '../scripts/utils/helpers';
import { HolographERC20Event, ConfigureEvents } from '../scripts/utils/events';

import {
  Admin,
  CxipERC721,
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

describe('Testing the Holograph ERC20 Enforcer (L1)', async function () {
  let l1: PreTest;

  let ERC20: HolographERC20;
  let SAMPLEERC20: SampleERC20;

  let tokenName: string = 'Sample ERC20 Token ';
  const tokenSymbol: string = 'SMPL';
  const tokenDecimals: number = 18;
  const totalTokens: string = '12.34';
  let tokensWei: string;
  const maxValue: BytesLike = '0x' + 'ff'.repeat(32);
  const halfValue: BytesLike = '0x' + '00'.repeat(16) + 'ff'.repeat(16);
  const halfInverseValue: BytesLike = '0x' + 'ff'.repeat(16) + '00'.repeat(16);
  let smallerAmount: string;

  before(async function () {
    l1 = await setup();
    tokenName += '(' + l1.hre.networkName + ')';
    tokensWei = l1.web3.utils.toWei(totalTokens, 'ether');
    smallerAmount = tokensWei.slice(0, -2);
    ERC20 = await l1.holographErc20.attach(l1.sampleErc20Holographer.address);
    SAMPLEERC20 = await l1.sampleErc20.attach(l1.sampleErc20Holographer.address);
  });

  after(async function () {});

  beforeEach(async function () {});

  afterEach(async function () {});

  describe('Check interfaces', async function () {
    describe('ERC165', async function () {
      it('supportsInterface supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('supportsInterface(bytes4)'))).to.be.true;
      });

      it('ERC165 interface supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('supportsInterface(bytes4)'))).to.be.true;
      });
    });

    describe('ERC20', async function () {
      it('allowance supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('allowance(address,address)'))).to.be.true;
      });

      it('approve supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('approve(address,uint256)'))).to.be.true;
      });

      it('balanceOf supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('balanceOf(address)'))).to.be.true;
      });

      it('totalSupply supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('totalSupply()'))).to.be.true;
      });

      it('transfer supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('transfer(address,uint256)'))).to.be.true;
      });

      it('transferFrom supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('transferFrom(address,address,uint256)'))).to.be.true;
      });

      it('ERC20 interface supported', async function () {
        expect(
          await ERC20.supportsInterface(
            XOR([
              functionHash('allowance(address,address)'),
              functionHash('approve(address,uint256)'),
              functionHash('balanceOf(address)'),
              functionHash('totalSupply()'),
              functionHash('transfer(address,uint256)'),
              functionHash('transferFrom(address,address,uint256)'),
            ])
          )
        ).to.be.true;
      });
    });

    describe('ERC20Metadata', async function () {
      it('name supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('name()'))).to.be.true;
      });

      it('symbol supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('symbol()'))).to.be.true;
      });

      it('decimals supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('decimals()'))).to.be.true;
      });

      it('ERC20Metadata interface supported', async function () {
        expect(
          await ERC20.supportsInterface(
            XOR([functionHash('name()'), functionHash('symbol()'), functionHash('decimals()')])
          )
        ).to.be.true;
      });
    });

    describe('ERC20Burnable', async function () {
      it('burn supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('burn(uint256)'))).to.be.true;
      });

      it('burnFrom supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('burnFrom(address,uint256)'))).to.be.true;
      });

      it('ERC20Burnable interface supported', async function () {
        expect(
          await ERC20.supportsInterface(XOR([functionHash('burn(uint256)'), functionHash('burnFrom(address,uint256)')]))
        ).to.be.true;
      });
    });

    describe('ERC20Safer', async function () {
      it('safeTransfer supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('safeTransfer(address,uint256)'))).to.be.true;
      });

      it('safeTransfer (with bytes) supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('safeTransfer(address,uint256,bytes)'))).to.be.true;
      });

      it('safeTransferFrom supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('safeTransferFrom(address,address,uint256)'))).to.be.true;
      });

      it('safeTransferFrom (with bytes) supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('safeTransferFrom(address,address,uint256,bytes)'))).to.be
          .true;
      });

      it('ERC20Safer interface supported', async function () {
        expect(
          await ERC20.supportsInterface(
            XOR([
              functionHash('safeTransfer(address,uint256)'),
              functionHash('safeTransfer(address,uint256,bytes)'),
              functionHash('safeTransferFrom(address,address,uint256)'),
              functionHash('safeTransferFrom(address,address,uint256,bytes)'),
            ])
          )
        ).to.be.true;
      });
    });

    describe('ERC20Permit', async function () {
      it('permit supported', async function () {
        expect(
          await ERC20.supportsInterface(functionHash('permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'))
        ).to.be.true;
      });

      it('nonces supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('nonces(address)'))).to.be.true;
      });

      it('DOMAIN_SEPARATOR supported', async function () {
        expect(await ERC20.supportsInterface(functionHash('DOMAIN_SEPARATOR()'))).to.be.true;
      });

      it('ERC20Permit interface supported', async function () {
        expect(
          await ERC20.supportsInterface(
            XOR([
              functionHash('permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'),
              functionHash('nonces(address)'),
              functionHash('DOMAIN_SEPARATOR()'),
            ])
          )
        ).to.be.true;
      });
    });
  });

  describe('Test Initializer', async function () {
    it('should fail initializing already initialized Holographer', async function () {
      await expect(
        ERC20.init(generateInitCode(['bytes', 'bytes'], ['0x' + '00'.repeat(32), '0x' + '00'.repeat(32)]))
      ).to.be.revertedWith('HOLOGRAPHER: already initialized');
    });

    it('should fail initializing already initialized ERC721 Enforcer', async function () {
      await expect(
        l1.sampleErc20Enforcer.init(
          generateInitCode(
            ['string', 'string', 'uint8', 'uint256', 'bool', 'bytes'],
            ['', '', '0x00', '0x' + '00'.repeat(32), false, '0x' + '00'.repeat(32)]
          )
        )
      ).to.be.revertedWith('ERC20: already initialized');
    });
  });

  describe('Test ERC20Metadata', async function () {
    describe('token name:', async function () {
      it('should return "' + tokenName + '" for token name', async function () {
        expect(await ERC20.name()).to.equal(tokenName);
      });
    });

    describe('token symbol:', async function () {
      it('should return "' + tokenSymbol + '" for token symbol', async function () {
        expect(await ERC20.symbol()).to.equal(tokenSymbol);
      });
    });

    describe('token decimals:', async function () {
      it('should return "' + tokenDecimals + '" for token decimals', async function () {
        expect(await ERC20.decimals()).to.equal(tokenDecimals);
      });
    });
  });

  describe('Mint ERC20 tokens', async function () {
    describe('try to mint ' + totalTokens + ' ' + tokenSymbol + ' tokens', async function () {
      it('should have a total supply of 0 ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.totalSupply()).to.equal(0);
      });

      it('should emit Transfer event for ' + totalTokens + ' ' + tokenSymbol + ' tokens', async function () {
        await expect(SAMPLEERC20.mint(l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, tokensWei);
      });

      it('should have a total supply of ' + totalTokens + ' ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.totalSupply()).to.equal(tokensWei);
      });

      it('deployer wallet should show a balance of ' + totalTokens + ' ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.balanceOf(l1.deployer.address)).to.equal(tokensWei);
      });
    });
  });

  describe('Test ERC20', async function () {
    describe('token approvals', async function () {
      it('should fail when approving a zero address', async function () {
        await expect(ERC20.approve(zeroAddress, maxValue)).to.be.revertedWith('ERC20: spender is zero address');
      });

      it('should succeed when approving valid address', async function () {
        await expect(ERC20.approve(l1.wallet2.address, maxValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, maxValue);
      });

      it('should succeed decreasing allowance above zero', async function () {
        await expect(ERC20.decreaseAllowance(l1.wallet2.address, halfValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, halfInverseValue);
      });

      it('should fail decreasing allowance below zero', async function () {
        await expect(ERC20.decreaseAllowance(l1.wallet2.address, maxValue)).to.be.revertedWith(
          'ERC20: decreased below zero'
        );
      });

      it('should succeed increasing allowance below max value', async function () {
        await expect(ERC20.increaseAllowance(l1.wallet2.address, halfValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, maxValue);
      });

      it('should fail increasing allowance above max value', async function () {
        await expect(ERC20.increaseAllowance(l1.wallet2.address, maxValue)).to.be.revertedWith(
          'ERC20: increased above max value'
        );
      });

      it('should succeed decreasing allowance to zero', async function () {
        await expect(ERC20.decreaseAllowance(l1.wallet2.address, maxValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, 0);
      });

      it('should succeed increasing allowance to max value', async function () {
        await expect(ERC20.increaseAllowance(l1.wallet2.address, maxValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, maxValue);
      });
    });

    describe('failed transfer', async function () {
      it("should fail if sender doesn't have enough tokens", async function () {
        await expect(
          ERC20.transfer(l1.wallet1.address, l1.web3.utils.toWei((parseInt(totalTokens) + 1.0).toString(), 'ether'))
        ).to.be.revertedWith('ERC20: amount exceeds balance');
      });

      it('should fail if sending to zero address', async function () {
        await expect(ERC20.transfer(zeroAddress, tokensWei)).to.be.revertedWith('ERC20: recipient is zero address');
      });

      it('should fail if sending from zero address', async function () {
        await expect(ERC20.transferFrom(zeroAddress, l1.wallet1.address, tokensWei)).to.be.revertedWith(
          'ERC20: amount exceeds allowance'
        );
      });

      it('should fail if sending from not approved address', async function () {
        await expect(ERC20.transferFrom(l1.wallet1.address, l1.deployer.address, tokensWei)).to.be.revertedWith(
          'ERC20: amount exceeds allowance'
        );
      });

      it('should fail if allowance is smaller than transfer amount', async function () {
        await expect(ERC20.approve(l1.wallet2.address, smallerAmount))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, smallerAmount);

        await expect(
          ERC20.connect(l1.wallet2).transferFrom(l1.deployer.address, l1.wallet1.address, tokensWei)
        ).to.be.revertedWith('ERC20: amount exceeds allowance');

        await expect(ERC20.approve(l1.wallet2.address, 0))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, 0);
      });

      it('should fail for non-contract onERC20Received call', async function () {
        await expect(
          ERC20.onERC20Received(l1.deployer.address, l1.deployer.address, tokensWei, '0x')
        ).to.be.revertedWith('ERC20: operator not contract');
      });

      it('should fail for fake onERC20Received', async function () {
        await expect(
          ERC20.onERC20Received(l1.erc20Mock.address, l1.deployer.address, tokensWei, '0x')
        ).to.be.revertedWith('ERC20: balance check failed');
      });

      it('should fail safe transfer for broken "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(false);

        await expect(ERC20['safeTransfer(address,uint256)'](l1.erc20Mock.address, tokensWei)).to.be.revertedWith(
          'ERC20: non ERC20Receiver'
        );

        await l1.erc20Mock.toggleWorks(true);
      });

      it('should fail safe transfer (with bytes) for broken "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(false);

        await expect(
          ERC20['safeTransfer(address,uint256,bytes)'](l1.erc20Mock.address, tokensWei, '0x')
        ).to.be.revertedWith('ERC20: non ERC20Receiver');

        await l1.erc20Mock.toggleWorks(true);
      });

      it('should fail safe transfer from for broken "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(false);

        await expect(ERC20.approve(l1.wallet1.address, maxValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, maxValue);

        await expect(
          ERC20.connect(l1.wallet1)['safeTransferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.erc20Mock.address,
            tokensWei
          )
        ).to.be.revertedWith('ERC20: non ERC20Receiver');

        await expect(ERC20.approve(l1.wallet1.address, 0))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, 0);

        await l1.erc20Mock.toggleWorks(true);
      });

      it('should fail safe transfer from (with bytes) for broken "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(false);

        await expect(ERC20.approve(l1.wallet1.address, maxValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, maxValue);

        await expect(
          ERC20.connect(l1.wallet1)['safeTransferFrom(address,address,uint256,bytes)'](
            l1.deployer.address,
            l1.erc20Mock.address,
            tokensWei,
            '0x'
          )
        ).to.be.revertedWith('ERC20: non ERC20Receiver');

        await expect(ERC20.approve(l1.wallet1.address, 0))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, 0);

        await l1.erc20Mock.toggleWorks(true);
      });
    });

    describe('successful transfer', async function () {
      it('should succeed when transferring available tokens', async function () {
        await expect(ERC20.transfer(l1.wallet1.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);
      });

      it('deployer should have a balance of 0 ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.balanceOf(l1.deployer.address)).to.equal(0);
      });

      it('wallet1 should have a balance of ' + totalTokens + ' ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.balanceOf(l1.wallet1.address)).to.equal(tokensWei);
      });

      it('should succeed when safely transferring available tokens', async function () {
        await expect(ERC20.connect(l1.wallet1)['safeTransfer(address,uint256)'](l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.wallet1.address, l1.deployer.address, tokensWei);
      });

      it('should succeed when safely transferring from available tokens', async function () {
        await expect(ERC20.approve(l1.wallet2.address, maxValue))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet2.address, maxValue);

        await expect(
          ERC20.connect(l1.wallet2)['safeTransferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.wallet1.address,
            tokensWei
          )
        )
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);

        await expect(ERC20.connect(l1.wallet1).transfer(l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.wallet1.address, l1.deployer.address, tokensWei);
      });

      it('wallet1 should have a balance of 0 ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.balanceOf(l1.wallet1.address)).to.equal(0);
      });

      it('deployer should have a balance of ' + totalTokens + ' ' + tokenSymbol + ' tokens', async function () {
        expect(await ERC20.balanceOf(l1.deployer.address)).to.equal(tokensWei);
      });

      it('should succeed when transferring using an approved spender', async function () {
        await expect(ERC20.approve(l1.wallet1.address, tokensWei))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);

        expect(await ERC20.allowance(l1.deployer.address, l1.wallet1.address)).to.equal(tokensWei);

        await expect(ERC20.connect(l1.wallet1).transferFrom(l1.deployer.address, l1.wallet1.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);

        expect(await ERC20.allowance(l1.deployer.address, l1.wallet1.address)).to.equal(0);

        await expect(ERC20.connect(l1.wallet1).transfer(l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.wallet1.address, l1.deployer.address, tokensWei);
      });

      it('should succeed safe transfer to "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(true);

        await expect(ERC20['safeTransfer(address,uint256)'](l1.erc20Mock.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.erc20Mock.address, tokensWei);

        await expect(l1.erc20Mock.transferTokens(ERC20.address, l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.erc20Mock.address, l1.deployer.address, tokensWei);
      });

      it('should succeed safe transfer (with bytes) to "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(true);

        await expect(ERC20['safeTransfer(address,uint256,bytes)'](l1.erc20Mock.address, tokensWei, '0x'))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.erc20Mock.address, tokensWei);

        await expect(l1.erc20Mock.transferTokens(ERC20.address, l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.erc20Mock.address, l1.deployer.address, tokensWei);
      });

      it('should succeed safe transfer from to "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(true);

        await expect(ERC20.approve(l1.wallet1.address, tokensWei))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);

        expect(await ERC20.allowance(l1.deployer.address, l1.wallet1.address)).to.equal(tokensWei);

        await expect(
          ERC20.connect(l1.wallet1)['safeTransferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.erc20Mock.address,
            tokensWei
          )
        )
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.erc20Mock.address, tokensWei);

        await expect(l1.erc20Mock.transferTokens(ERC20.address, l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.erc20Mock.address, l1.deployer.address, tokensWei);

        await expect(ERC20.approve(l1.wallet1.address, 0))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, 0);

        expect(await ERC20.allowance(l1.deployer.address, l1.wallet1.address)).to.equal(0);
      });

      it('should succeed safe transfer (with bytes) to "ERC20Receiver"', async function () {
        await l1.erc20Mock.toggleWorks(true);

        await expect(ERC20.approve(l1.wallet1.address, tokensWei))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);

        expect(await ERC20.allowance(l1.deployer.address, l1.wallet1.address)).to.equal(tokensWei);

        await expect(
          ERC20.connect(l1.wallet1)['safeTransferFrom(address,address,uint256,bytes)'](
            l1.deployer.address,
            l1.erc20Mock.address,
            tokensWei,
            '0x'
          )
        )
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.deployer.address, l1.erc20Mock.address, tokensWei);

        await expect(l1.erc20Mock.transferTokens(ERC20.address, l1.deployer.address, tokensWei))
          .to.emit(ERC20, 'Transfer')
          .withArgs(l1.erc20Mock.address, l1.deployer.address, tokensWei);

        await expect(ERC20.approve(l1.wallet1.address, 0))
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, 0);

        expect(await ERC20.allowance(l1.deployer.address, l1.wallet1.address)).to.equal(0);
      });
    });
  });

  describe('Test ERC20Burnable', async function () {
    it('should fail burning more tokens than current balance', async function () {
      await expect(ERC20.connect(l1.wallet1).burn(tokensWei)).to.be.revertedWith('ERC20: amount exceeds balance');
    });

    it('should succeed burning current balance', async function () {
      await expect(ERC20.burn(tokensWei))
        .to.emit(ERC20, 'Transfer')
        .withArgs(l1.deployer.address, zeroAddress, tokensWei);

      expect(await ERC20.totalSupply()).to.equal(0);
    });

    it('should fail burning via not approved spender', async function () {
      await expect(SAMPLEERC20.mint(l1.deployer.address, tokensWei))
        .to.emit(ERC20, 'Transfer')
        .withArgs(zeroAddress, l1.deployer.address, tokensWei);

      expect(await ERC20.totalSupply()).to.equal(tokensWei);

      await expect(ERC20.connect(l1.wallet1).burnFrom(l1.deployer.address, tokensWei)).to.be.revertedWith(
        'ERC20: amount exceeds allowance'
      );
    });

    it('should succeed burning via approved spender', async function () {
      await expect(ERC20.approve(l1.wallet1.address, tokensWei))
        .to.emit(ERC20, 'Approval')
        .withArgs(l1.deployer.address, l1.wallet1.address, tokensWei);

      await expect(ERC20.connect(l1.wallet1).burnFrom(l1.deployer.address, tokensWei))
        .to.emit(ERC20, 'Transfer')
        .withArgs(l1.deployer.address, zeroAddress, tokensWei);

      expect(await ERC20.totalSupply()).to.equal(0);
    });
  });

  describe('Test ERC20Permit', async function () {
    describe('Check domain seperator', async function () {
      it('should return correct domain seperator', async function () {
        expect(await ERC20.DOMAIN_SEPARATOR()).to.equal(
          buildDomainSeperator(l1.network.chain, 'Sample ERC20 Token', '1', ERC20.address)
        );
      });
    });

    describe('Check EIP712 permit functionality', async function () {
      const maxValue: BytesLike = '0x' + 'ff'.repeat(32);
      const badDeadline = Math.round(Date.now() / 1000) - 60 * 24;
      const goodDeadline = Math.round(Date.now() / 1000) + 60 * 24;

      it('should return 0 nonce', async function () {
        expect(await ERC20.nonces(l1.deployer.address)).to.equal(0);
      });

      it('should fail for expired deadline', async function () {
        await expect(
          ERC20.permit(
            l1.deployer.address,
            l1.wallet1.address,
            maxValue,
            badDeadline,
            '0x00',
            '0x' + '00'.repeat(32),
            '0x' + '00'.repeat(32)
          )
        ).to.be.revertedWith('ERC20: expired deadline');
      });

      it('should fail for empty signature', async function () {
        await expect(
          ERC20.permit(
            l1.deployer.address,
            l1.wallet1.address,
            maxValue,
            goodDeadline,
            '0x1b',
            '0x' + '00'.repeat(32),
            '0x' + '00'.repeat(32)
          )
        ).to.be.revertedWith('ECDSA: invalid signature');
      });

      it('should fail for zero address signature', async function () {
        await expect(
          ERC20.permit(
            l1.deployer.address,
            l1.wallet1.address,
            maxValue,
            goodDeadline,
            '0x1b',
            '0x' + '11'.repeat(32),
            '0x' + '11'.repeat(32)
          )
        ).to.be.revertedWith('ECDSA: invalid signature');
      });

      it('should fail for invalid signature v value', async function () {
        await expect(
          ERC20.permit(
            l1.deployer.address,
            l1.wallet1.address,
            maxValue,
            goodDeadline,
            '0x00',
            '0x' + '00'.repeat(32),
            '0x' + '00'.repeat(32)
          )
        ).to.be.revertedWith("ECDSA: invalid signature 'v' value");
      });

      it('should fail for invalid signature', async function () {
        await expect(
          ERC20.permit(
            l1.deployer.address,
            l1.wallet1.address,
            maxValue,
            goodDeadline,
            '0x1b',
            '0x' + '35'.repeat(32),
            '0x' + '68'.repeat(32)
          )
        ).to.be.revertedWith('ERC20: invalid signature');
      });

      it('should succeed for valid signature', async function () {
        let domain = {
          name: 'Sample ERC20 Token',
          version: '1',
          chainId: l1.network.chain,
          verifyingContract: ERC20.address,
        };
        let types = {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        };
        let nonce = await ERC20.nonces(l1.deployer.address);
        let value = {
          owner: l1.deployer.address,
          spender: l1.wallet1.address,
          value: maxValue,
          nonce: nonce,
          deadline: goodDeadline,
        };
        let sig = await l1.deployer._signTypedData(domain, types, value);
        const signature: Signature = StrictECDSA({
          r: '0x' + sig.substring(2, 66),
          s: '0x' + sig.substring(66, 130),
          v: '0x' + sig.substring(130, 132),
        } as Signature);

        await expect(
          ERC20.permit(
            l1.deployer.address,
            l1.wallet1.address,
            maxValue,
            goodDeadline,
            signature.v,
            signature.r,
            signature.s
          )
        )
          .to.emit(ERC20, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, maxValue);
      });
    });
  });

  describe('Ownership tests', async function () {
    describe('Owner', async function () {
      it('should return deployer address', async function () {
        expect(await ERC20.owner()).to.equal(l1.deployer.address);
      });

      it('deployer should return true for isOwner', async function () {
        expect(await SAMPLEERC20.attach(l1.sampleErc20.address)['isOwner()']()).to.be.true;
      });

      it('deployer should return true for isOwner (msgSender)', async function () {
        expect(await SAMPLEERC20.attach(ERC20.address)['isOwner()']()).to.be.true;
      });

      it('wallet1 should return false for isOwner', async function () {
        expect(await SAMPLEERC20.attach(l1.sampleErc20.address).connect(l1.wallet1)['isOwner()']()).to.be.false;
      });

      it('should return "HolographFactoryProxy" address', async function () {
        expect(await ERC20.getOwner()).to.equal(l1.holographFactoryProxy.address);
      });

      it('deployer should fail transferring ownership', async function () {
        await expect(ERC20.setOwner(l1.wallet1.address)).to.be.revertedWith('HOLOGRAPH: owner only function');
      });

      it('deployer should set owner to deployer', async function () {
        let admin: Admin = (await l1.hre.ethers.getContractAt('Admin', l1.holographFactoryProxy.address)) as Admin;
        let calldata: string = l1.web3.eth.abi.encodeFunctionCall(
          { name: 'setOwner', type: 'function', inputs: [{ type: 'address', name: 'ownerAddress' }] },
          [l1.deployer.address]
        );
        await expect(admin.adminCall(ERC20.address, calldata))
          .to.emit(ERC20, 'OwnershipTransferred')
          .withArgs(l1.holographFactoryProxy.address, l1.deployer.address);
        expect(await ERC20.getOwner()).to.equal(l1.deployer.address);
      });

      it('deployer should transfer ownership to "HolographFactoryProxy"', async function () {
        await expect(ERC20.setOwner(l1.holographFactoryProxy.address))
          .to.emit(ERC20, 'OwnershipTransferred')
          .withArgs(l1.deployer.address, l1.holographFactoryProxy.address);
      });
    });

    describe('Admin', async function () {
      it('admin() should return "HolographFactoryProxy" address', async function () {
        expect(await ERC20.admin()).to.equal(l1.holographFactoryProxy.address);
      });

      it('getAdmin() should return "HolographFactoryProxy" address', async function () {
        expect(await ERC20.getAdmin()).to.equal(l1.holographFactoryProxy.address);
      });

      it('wallet1 should fail setting admin', async function () {
        await expect(ERC20.connect(l1.wallet1).setAdmin(l1.wallet2.address)).to.be.revertedWith(
          'HOLOGRAPH: admin only function'
        );
      });

      it('deployer should succeed setting admin via "HolographFactoryProxy"', async function () {
        let admin: Admin = (await l1.hre.ethers.getContractAt('Admin', l1.holographFactoryProxy.address)) as Admin;
        let calldata: string = l1.web3.eth.abi.encodeFunctionCall(
          { name: 'setAdmin', type: 'function', inputs: [{ type: 'address', name: 'adminAddress' }] },
          [l1.deployer.address]
        );

        await admin.adminCall(ERC20.address, calldata);

        expect(await ERC20.admin()).to.equal(l1.deployer.address);

        await ERC20.setAdmin(l1.holographFactoryProxy.address);

        expect(await ERC20.admin()).to.equal(l1.holographFactoryProxy.address);
      });
    });
  });

  describe('Source tests', async function () {
    describe('Minting', async function () {
      // "sourceMint(address,uint256)"
      // "sourceMintBatch(address[],uint256[])"
    });

    describe('Transferring', async function () {
      // "sourceTransfer(address,address,uint256)"
    });

    describe('Burning', async function () {
      // "sourceBurn(address,uint256)"
    });
  });

  describe('Basic bridge tests', async function () {
    describe('Bridge OUT', async function () {
      // "holographBridgeOut(uint32,address,address,address,uint256)"
    });

    describe('Bridge IN', async function () {
      // "holographBridgeIn(uint32,address,address,uint256,bytes)"
    });
  });

  // SHOULD ALSO TEST RE-ENTRANCY WITH A MOCK RECEIVER THAT ATTEMPTS A RE-ENTRANT CALL MIDWAY
});
