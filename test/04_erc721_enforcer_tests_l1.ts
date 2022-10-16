declare var global: any;
import { expect, assert } from 'chai';
import { PreTest } from './utils';
import setup from './utils';
import { BigNumberish, BytesLike, BigNumber } from 'ethers';
import {
  zeroAddress,
  functionHash,
  XOR,
  buildDomainSeperator,
  randomHex,
  generateInitCode,
} from '../scripts/utils/helpers';
import { HolographERC721Event, ConfigureEvents } from '../scripts/utils/events';

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

describe('Testing the Holograph ERC721 Enforcer (L1)', async function () {
  let l1: PreTest;

  let ERC721: HolographERC721;
  let SAMPLEERC721: SampleERC721;

  let contractName: string = 'Sample ERC721 Contract ';
  const contractSymbol: string = 'SMPLR';
  const contractBps: number = 1000;
  const contractImage: string = '';
  const contractExternalLink: string = '';
  const tokenURIs: string[] = [
    'undefined',
    'https://holograph.xyz/sample1.json',
    'https://holograph.xyz/sample2.json',
    'https://holograph.xyz/sample3.json',
  ];
  const totalNFTs: number = 2;
  const firstNFT: number = 1;
  const secondNFT: number = 2;
  const thirdNFT: number = 3;

  before(async function () {
    l1 = await setup();
    contractName += '(' + l1.hre.networkName + ')';
    ERC721 = await l1.holographErc721.attach(l1.sampleErc721Holographer.address);
    SAMPLEERC721 = await l1.sampleErc721.attach(l1.sampleErc721Holographer.address);
  });

  after(async function () {});

  beforeEach(async function () {});

  afterEach(async function () {});

  describe('Check interfaces', async function () {
    describe('ERC165', async function () {
      it('supportsInterface supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('supportsInterface(bytes4)'))).to.be.true;
      });

      it('ERC165 interface supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('supportsInterface(bytes4)'))).to.be.true;
      });
    });

    describe('ERC721', async function () {
      it('balanceOf supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('balanceOf(address)'))).to.be.true;
      });

      it('ownerOf supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('ownerOf(uint256)'))).to.be.true;
      });

      it('safeTransferFrom supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('safeTransferFrom(address,address,uint256)'))).to.be.true;
      });

      it('safeTransferFrom (with bytes) supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('safeTransferFrom(address,address,uint256,bytes)'))).to.be
          .true;
      });

      it('transferFrom supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('transferFrom(address,address,uint256)'))).to.be.true;
      });

      it('approve supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('approve(address,uint256)'))).to.be.true;
      });

      it('setApprovalForAll supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('setApprovalForAll(address,bool)'))).to.be.true;
      });

      it('getApproved supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('getApproved(uint256)'))).to.be.true;
      });

      it('isApprovedForAll supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('isApprovedForAll(address,address)'))).to.be.true;
      });

      it('ERC721 interface supported', async function () {
        expect(
          await ERC721.supportsInterface(
            XOR([
              functionHash('balanceOf(address)'),
              functionHash('ownerOf(uint256)'),
              functionHash('safeTransferFrom(address,address,uint256)'),
              functionHash('safeTransferFrom(address,address,uint256,bytes)'),
              functionHash('transferFrom(address,address,uint256)'),
              functionHash('approve(address,uint256)'),
              functionHash('setApprovalForAll(address,bool)'),
              functionHash('getApproved(uint256)'),
              functionHash('isApprovedForAll(address,address)'),
            ])
          )
        ).to.be.true;
      });
    });

    describe('ERC721Enumerable', async function () {
      it('totalSupply supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('totalSupply()'))).to.be.true;
      });

      it('tokenByIndex supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('tokenByIndex(uint256)'))).to.be.true;
      });

      it('tokenOfOwnerByIndex supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('tokenOfOwnerByIndex(address,uint256)'))).to.be.true;
      });

      it('ERC721Enumerable interface supported', async function () {
        expect(
          await ERC721.supportsInterface(
            XOR([
              functionHash('totalSupply()'),
              functionHash('tokenByIndex(uint256)'),
              functionHash('tokenOfOwnerByIndex(address,uint256)'),
            ])
          )
        ).to.be.true;
      });
    });

    describe('ERC721Metadata', async function () {
      it('name supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('name()'))).to.be.true;
      });

      it('symbol supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('symbol()'))).to.be.true;
      });

      it('tokenURI supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('tokenURI(uint256)'))).to.be.true;
      });

      it('ERC721Metadata interface supported', async function () {
        expect(
          await ERC721.supportsInterface(
            XOR([functionHash('name()'), functionHash('symbol()'), functionHash('tokenURI(uint256)')])
          )
        ).to.be.true;
      });
    });

    describe('ERC721TokenReceiver', async function () {
      it('onERC721Received supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('onERC721Received(address,address,uint256,bytes)'))).to.be
          .true;
      });

      it('ERC721TokenReceiver interface supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('onERC721Received(address,address,uint256,bytes)'))).to.be
          .true;
      });
    });

    describe('CollectionURI', async function () {
      it('contractURI supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('contractURI()'))).to.be.true;
      });

      it('CollectionURI interface supported', async function () {
        expect(await ERC721.supportsInterface(functionHash('contractURI()'))).to.be.true;
      });
    });
  });

  describe('Test Initializer', async function () {
    it('should fail initializing already initialized Holographer', async function () {
      await expect(
        ERC721.init(generateInitCode(['bytes', 'bytes'], ['0x' + '00'.repeat(32), '0x' + '00'.repeat(32)]))
      ).to.be.revertedWith('HOLOGRAPHER: already initialized');
    });

    it('should fail initializing already initialized ERC721 Enforcer', async function () {
      await expect(
        l1.sampleErc721Enforcer.init(
          generateInitCode(
            ['string', 'string', 'uint16', 'uint256', 'bool', 'bytes'],
            ['', '', '0x' + '00'.repeat(2), '0x' + '00'.repeat(32), false, '0x' + '00'.repeat(32)]
          )
        )
      ).to.be.revertedWith('ERC721: already initialized');
    });
  });

  describe('Test ERC721Metadata', async function () {
    describe('collection name:', async function () {
      it('should return "' + contractName + '" for collection name', async function () {
        expect(await ERC721.name()).to.equal(contractName);
      });
    });

    describe('collection symbol:', async function () {
      it('should return "' + contractSymbol + '" for collection symbol', async function () {
        expect(await ERC721.symbol()).to.equal(contractSymbol);
      });
    });

    describe('contract URI:', async function () {
      it('should return correct base64 encoded JSON string for contract URI', async function () {
        let base64string: string =
          'data:application/json;base64,' +
          btoa(
            '{"name":"' +
              contractName +
              '","description":"' +
              contractName +
              '","image":"' +
              contractImage +
              '","external_link":"' +
              contractExternalLink +
              '","seller_fee_basis_points":' +
              contractBps.toString() +
              ',"fee_recipient":"' +
              ERC721.address.toLowerCase() +
              '"}'
          ).replace(/=+$/g, '');

        expect(await ERC721.contractURI()).to.equal(base64string);
      });
    });
  });

  describe('Mint ERC721 NFTs', async function () {
    describe('try to mint ' + contractSymbol + ' NFTs', async function () {
      it('should have a total supply of 0 ' + contractSymbol + ' NFTs', async function () {
        expect(await ERC721.totalSupply()).to.equal(0);
      });

      it('should not exist #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.exists(firstNFT)).to.be.false;
      });

      it('NFT index 0 should fail', async function () {
        await expect(ERC721.tokenByIndex(0)).to.be.revertedWith('ERC721: index out of bounds');
      });

      it('NFT owner index 0 should fail', async function () {
        await expect(ERC721.tokenOfOwnerByIndex(l1.deployer.address, 0)).to.be.revertedWith(
          'ERC721: index out of bounds'
        );
      });

      it('should emit Transfer event for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(SAMPLEERC721.mint(l1.deployer.address, firstNFT, tokenURIs[firstNFT]))
          .to.emit(ERC721, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, firstNFT);
      });

      it('should exist #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.exists(firstNFT)).to.be.true;
      });

      it('should not mark as burned #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.burned(firstNFT)).to.be.false;
      });

      it('should specify deployer as owner of #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.deployer.address);
      });

      it('NFT index 0 should return #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.tokenByIndex(0)).to.equal(firstNFT);
      });

      it('NFT owner index 0 should return #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.tokenOfOwnerByIndex(l1.deployer.address, 0)).to.equal(firstNFT);
      });

      it('should emit Transfer event for #' + secondNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(SAMPLEERC721.mint(l1.deployer.address, secondNFT, tokenURIs[secondNFT]))
          .to.emit(ERC721, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, secondNFT);
      });

      it('should fail minting to zero address', async function () {
        await expect(SAMPLEERC721.mint(zeroAddress, firstNFT, tokenURIs[firstNFT])).to.be.revertedWith(
          'ERC721: minting to burn address'
        );
      });

      it('should fail minting existing #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(SAMPLEERC721.mint(l1.deployer.address, firstNFT, tokenURIs[firstNFT])).to.be.revertedWith(
          'ERC721: token already exist'
        );
      });

      it('should fail minting burned #' + thirdNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(SAMPLEERC721.mint(l1.deployer.address, thirdNFT, tokenURIs[thirdNFT]))
          .to.emit(ERC721, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, thirdNFT);

        await expect(ERC721.burn(thirdNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, zeroAddress, thirdNFT);

        await expect(SAMPLEERC721.mint(l1.deployer.address, thirdNFT, tokenURIs[thirdNFT])).to.be.revertedWith(
          "ERC721: can't mint burned token"
        );
      });

      it('should mark as burned #' + thirdNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.burned(thirdNFT)).to.be.true;
      });

      it('should have a total supply of ' + totalNFTs + ' ' + contractSymbol + ' NFTs', async function () {
        expect(await ERC721.totalSupply()).to.equal(totalNFTs);
      });

      it('deployer wallet should show a balance of ' + totalNFTs + ' ' + contractSymbol + ' NFTs', async function () {
        expect(await ERC721.balanceOf(l1.deployer.address)).to.equal(totalNFTs);
      });

      it('should return an array of token ids', async function () {
        expect(JSON.stringify(await ERC721.tokens(0, 10))).to.equal(
          JSON.stringify([BigNumber.from(firstNFT), BigNumber.from(secondNFT)])
        );
      });

      it('should return an array of token ids', async function () {
        expect(JSON.stringify(await ERC721.tokens(0, 1))).to.equal(JSON.stringify([BigNumber.from(firstNFT)]));
      });

      it('should return an array of owner token ids', async function () {
        expect(JSON.stringify(await ERC721['tokensOfOwner(address)'](l1.deployer.address))).to.equal(
          JSON.stringify([BigNumber.from(firstNFT), BigNumber.from(secondNFT)])
        );
      });

      it('should return an array of owner token ids', async function () {
        expect(
          JSON.stringify(await ERC721['tokensOfOwner(address,uint256,uint256)'](l1.deployer.address, 0, 1))
        ).to.equal(JSON.stringify([BigNumber.from(firstNFT)]));
      });
    });
  });

  describe('Check NFT data', async function () {
    it('should return correct tokenURI for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
      expect(await ERC721.tokenURI(firstNFT)).to.equal(tokenURIs[firstNFT]);
    });

    it('should return correct tokenURI for #' + secondNFT + ' ' + contractSymbol + ' NFT', async function () {
      expect(await ERC721.tokenURI(secondNFT)).to.equal(tokenURIs[secondNFT]);
    });

    it('should fail returning tokenURI for #' + thirdNFT + ' ' + contractSymbol + ' NFT', async function () {
      await expect(ERC721.tokenURI(thirdNFT)).to.be.revertedWith('ERC721: token does not exist');
    });
  });

  describe('Test ERC721', async function () {
    describe('approvals', async function () {
      it('should return no approval for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.getApproved(firstNFT)).to.equal(zeroAddress);
      });

      it('should succeed when approving wallet1 for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(ERC721.approve(l1.wallet1.address, firstNFT))
          .to.emit(ERC721, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, firstNFT);
      });

      it('should return approved wallet1 for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.getApproved(firstNFT)).to.equal(l1.wallet1.address);
      });

      it(
        'should succeed when unsetting approved address for #' + firstNFT + ' ' + contractSymbol + ' NFT',
        async function () {
          await expect(ERC721.approve(zeroAddress, firstNFT))
            .to.emit(ERC721, 'Approval')
            .withArgs(l1.deployer.address, zeroAddress, firstNFT);
        }
      );

      it('should return no approval for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.getApproved(firstNFT)).to.equal(zeroAddress);
      });

      it('should clear approval on transfer for #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(ERC721.approve(l1.wallet1.address, firstNFT))
          .to.emit(ERC721, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, firstNFT);

        expect(await ERC721.getApproved(firstNFT)).to.equal(l1.wallet1.address);

        await expect(ERC721.transfer(l1.wallet2.address, firstNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, l1.wallet2.address, firstNFT);

        expect(await ERC721.getApproved(firstNFT)).to.equal(zeroAddress);

        await expect(ERC721.connect(l1.wallet2).transfer(l1.deployer.address, firstNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.wallet2.address, l1.deployer.address, firstNFT);
      });

      it('wallet1 should not be approved operator for deployer', async function () {
        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.false;
      });

      it('should succeed setting wallet1 as operator for deployer', async function () {
        await expect(ERC721.setApprovalForAll(l1.wallet1.address, true))
          .to.emit(ERC721, 'ApprovalForAll')
          .withArgs(l1.deployer.address, l1.wallet1.address, true);
      });

      it('should return wallet1 as approved operator for deployer', async function () {
        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.true;
      });

      it('should succeed unsetting wallet1 as operator for deployer', async function () {
        await expect(ERC721.setApprovalForAll(l1.wallet1.address, false))
          .to.emit(ERC721, 'ApprovalForAll')
          .withArgs(l1.deployer.address, l1.wallet1.address, false);
      });

      it('wallet1 should not be approved operator for deployer', async function () {
        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.false;
      });
    });

    describe('failed transfer', async function () {
      it("should fail if sender doesn't own #" + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(ERC721.connect(l1.wallet1).transfer(l1.wallet1.address, firstNFT)).to.be.revertedWith(
          'ERC721: not approved sender'
        );
      });

      it('should fail if transferring to zero address', async function () {
        await expect(ERC721.transfer(zeroAddress, firstNFT)).to.be.revertedWith('ERC721: use burn instead');
      });

      it('should fail if transferring from zero address', async function () {
        await expect(
          ERC721['transferFrom(address,address,uint256)'](zeroAddress, l1.wallet1.address, firstNFT)
        ).to.be.revertedWith('ERC721: token not owned');
      });

      it('should fail if transferring not owned NFT', async function () {
        await expect(
          ERC721.connect(l1.wallet1)['transferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.wallet1.address,
            firstNFT
          )
        ).to.be.revertedWith('ERC721: not approved sender');
      });

      it('should fail if transferring non-existant #' + thirdNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(ERC721.transfer(l1.wallet1.address, thirdNFT)).to.be.revertedWith('ERC721: token does not exist');
      });

      it('operator should fail if NFT is not the approved one', async function () {
        await expect(ERC721.approve(l1.wallet1.address, secondNFT))
          .to.emit(ERC721, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, secondNFT);

        await expect(
          ERC721.connect(l1.wallet1)['transferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.wallet2.address,
            firstNFT
          )
        ).to.be.revertedWith('ERC721: not approved sender');

        await expect(ERC721.approve(zeroAddress, secondNFT))
          .to.emit(ERC721, 'Approval')
          .withArgs(l1.deployer.address, zeroAddress, secondNFT);
      });

      it('should fail safe transfer for broken "ERC721TokenReceiver"', async function () {
        await l1.mockErc721Receiver.toggleWorks(false);

        await expect(
          ERC721['safeTransferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.mockErc721Receiver.address,
            firstNFT
          )
        ).to.be.revertedWith('ERC721: onERC721Received fail');

        await l1.mockErc721Receiver.toggleWorks(true);
      });

      it('should fail for non-contract onERC721Received call', async function () {
        await expect(
          ERC721.onERC721Received(l1.deployer.address, l1.deployer.address, firstNFT, '0x')
        ).to.be.revertedWith('ERC721: operator not contract');
      });

      it('should fail for non-existant NFT onERC721Received call', async function () {
        await expect(
          ERC721.onERC721Received(l1.cxipErc721.address, l1.deployer.address, firstNFT, '0x')
        ).to.be.revertedWith('ERC721: token does not exist');
      });

      it('should fail for fake onERC721Received call', async function () {
        await expect(ERC721.onERC721Received(ERC721.address, l1.deployer.address, firstNFT, '0x')).to.be.revertedWith(
          'ERC721: contract not token owner'
        );
      });
    });

    describe('successful transfer', async function () {
      it('deployer should succeed transferring #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(ERC721.transfer(l1.wallet1.address, firstNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, l1.wallet1.address, firstNFT);

        expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.wallet1.address);
      });

      it(
        'wallet1 should succeed safely transferring #' + firstNFT + ' ' + contractSymbol + ' NFT to deployer',
        async function () {
          await expect(
            ERC721.connect(l1.wallet1)['safeTransferFrom(address,address,uint256)'](
              l1.wallet1.address,
              l1.deployer.address,
              firstNFT
            )
          )
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.wallet1.address, l1.deployer.address, firstNFT);

          expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.deployer.address);
        }
      );

      it(
        'should succeed safe transfer #' + firstNFT + ' ' + contractSymbol + ' NFT to "ERC721TokenReceiver"',
        async function () {
          await expect(
            ERC721['safeTransferFrom(address,address,uint256)'](
              l1.deployer.address,
              l1.mockErc721Receiver.address,
              firstNFT
            )
          )
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.deployer.address, l1.mockErc721Receiver.address, firstNFT);

          expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.mockErc721Receiver.address);

          await expect(l1.mockErc721Receiver.transferNFT(ERC721.address, firstNFT, l1.deployer.address))
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.mockErc721Receiver.address, l1.deployer.address, firstNFT);

          expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.deployer.address);
        }
      );

      it('approved should succeed transferring #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        await expect(ERC721.approve(l1.wallet1.address, firstNFT))
          .to.emit(ERC721, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, firstNFT);

        expect(await ERC721.getApproved(firstNFT)).to.equal(l1.wallet1.address);

        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.false;

        await expect(
          ERC721.connect(l1.wallet1)['transferFrom(address,address,uint256)'](
            l1.deployer.address,
            l1.wallet2.address,
            firstNFT
          )
        )
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, l1.wallet2.address, firstNFT);

        expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.wallet2.address);

        expect(await ERC721.getApproved(firstNFT)).to.equal(zeroAddress);

        await expect(ERC721.connect(l1.wallet2).transfer(l1.deployer.address, firstNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.wallet2.address, l1.deployer.address, firstNFT);

        expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.deployer.address);
      });

      it(
        'approved operator should succeed transferring #' +
          firstNFT +
          ' and #' +
          secondNFT +
          ' ' +
          contractSymbol +
          ' NFT',
        async function () {
          await expect(ERC721.setApprovalForAll(l1.wallet1.address, true))
            .to.emit(ERC721, 'ApprovalForAll')
            .withArgs(l1.deployer.address, l1.wallet1.address, true);

          expect(await ERC721.getApproved(firstNFT)).to.equal(zeroAddress);

          expect(await ERC721.getApproved(secondNFT)).to.equal(zeroAddress);

          expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.true;

          await expect(
            ERC721.connect(l1.wallet1)['transferFrom(address,address,uint256)'](
              l1.deployer.address,
              l1.wallet2.address,
              firstNFT
            )
          )
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.deployer.address, l1.wallet2.address, firstNFT);

          await expect(
            ERC721.connect(l1.wallet1)['safeTransferFrom(address,address,uint256)'](
              l1.deployer.address,
              l1.wallet2.address,
              secondNFT
            )
          )
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.deployer.address, l1.wallet2.address, secondNFT);

          expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.wallet2.address);

          expect(await ERC721.ownerOf(secondNFT)).to.equal(l1.wallet2.address);

          expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.true;

          await expect(ERC721.setApprovalForAll(l1.wallet1.address, false))
            .to.emit(ERC721, 'ApprovalForAll')
            .withArgs(l1.deployer.address, l1.wallet1.address, false);

          expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.false;

          await expect(ERC721.connect(l1.wallet2).transfer(l1.deployer.address, firstNFT))
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.wallet2.address, l1.deployer.address, firstNFT);

          await expect(ERC721.connect(l1.wallet2).transfer(l1.deployer.address, secondNFT))
            .to.emit(ERC721, 'Transfer')
            .withArgs(l1.wallet2.address, l1.deployer.address, secondNFT);

          expect(await ERC721.ownerOf(firstNFT)).to.equal(l1.deployer.address);

          expect(await ERC721.ownerOf(secondNFT)).to.equal(l1.deployer.address);
        }
      );
    });
  });

  describe('Burn ERC721 NFTs', async function () {
    const firstNFT: number = 4;
    const secondNFT: number = 5;
    const thirdNFT: number = 6;
    const fourthNFT: number = 7;
    describe('Mint NFTs for burning', async function () {
      it('should mint sample NFTs for burn tests', async function () {
        await expect(SAMPLEERC721.mint(l1.deployer.address, 0, ''))
          .to.emit(ERC721, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, firstNFT);

        await expect(SAMPLEERC721.mint(l1.deployer.address, 0, ''))
          .to.emit(ERC721, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, secondNFT);

        await expect(SAMPLEERC721.mint(l1.deployer.address, 0, ''))
          .to.emit(ERC721, 'Transfer')
          .withArgs(zeroAddress, l1.deployer.address, thirdNFT);
      });
    });

    describe('Burn NFTs', async function () {
      it('should fail burning non-existant #' + fourthNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.exists(fourthNFT)).to.be.false;

        await expect(ERC721.burn(fourthNFT)).to.be.revertedWith('ERC721: token does not exist');
      });

      it('should fail burning not owned #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.burned(firstNFT)).to.be.false;

        await expect(ERC721.connect(l1.wallet1).burn(firstNFT)).to.be.revertedWith('ERC721: not approved sender');
      });

      it('should succeed burning owned #' + firstNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.burned(firstNFT)).to.be.false;

        await expect(ERC721.burn(firstNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, zeroAddress, firstNFT);

        expect(await ERC721.burned(firstNFT)).to.be.true;
      });

      it('should succeed burning approved #' + secondNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.burned(secondNFT)).to.be.false;

        await expect(ERC721.approve(l1.wallet1.address, secondNFT))
          .to.emit(ERC721, 'Approval')
          .withArgs(l1.deployer.address, l1.wallet1.address, secondNFT);

        expect(await ERC721.getApproved(secondNFT)).to.equal(l1.wallet1.address);

        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.false;

        await expect(ERC721.connect(l1.wallet1).burn(secondNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, zeroAddress, secondNFT);

        expect(await ERC721.burned(secondNFT)).to.be.true;
      });

      it('operator should succeed burning #' + thirdNFT + ' ' + contractSymbol + ' NFT', async function () {
        expect(await ERC721.burned(thirdNFT)).to.be.false;

        expect(await ERC721.getApproved(thirdNFT)).to.equal(zeroAddress);

        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.false;

        await expect(ERC721.setApprovalForAll(l1.wallet1.address, true))
          .to.emit(ERC721, 'ApprovalForAll')
          .withArgs(l1.deployer.address, l1.wallet1.address, true);

        expect(await ERC721.getApproved(thirdNFT)).to.equal(zeroAddress);

        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.true;

        await expect(ERC721.connect(l1.wallet1).burn(thirdNFT))
          .to.emit(ERC721, 'Transfer')
          .withArgs(l1.deployer.address, zeroAddress, thirdNFT);

        expect(await ERC721.burned(thirdNFT)).to.be.true;

        expect(await ERC721.isApprovedForAll(l1.deployer.address, l1.wallet1.address)).to.be.true;
      });
    });
  });

  describe('Ownership tests', async function () {
    describe('Owner', async function () {
      it('should return deployer address', async function () {
        expect(await ERC721.owner()).to.equal(l1.deployer.address);
      });

      it('deployer should return true for isOwner', async function () {
        expect(await SAMPLEERC721.attach(l1.sampleErc721.address)['isOwner()']()).to.be.true;
      });

      it('deployer should return true for isOwner (msgSender)', async function () {
        expect(await SAMPLEERC721.attach(ERC721.address)['isOwner()']()).to.be.true;
      });

      it('wallet1 should return false for isOwner', async function () {
        expect(await SAMPLEERC721.attach(l1.sampleErc721.address).connect(l1.wallet1)['isOwner()']()).to.be.false;
      });

      it('should return "HolographFactoryProxy" address', async function () {
        expect(await ERC721.getOwner()).to.equal(l1.holographFactoryProxy.address);
      });

      it('deployer should fail transferring ownership', async function () {
        await expect(ERC721.setOwner(l1.wallet1.address)).to.be.revertedWith('HOLOGRAPH: owner only function');
      });

      it('deployer should set owner to deployer', async function () {
        let admin: Admin = (await l1.hre.ethers.getContractAt('Admin', l1.holographFactoryProxy.address)) as Admin;
        let calldata: string = l1.web3.eth.abi.encodeFunctionCall(
          { name: 'setOwner', type: 'function', inputs: [{ type: 'address', name: 'ownerAddress' }] },
          [l1.deployer.address]
        );
        await expect(admin.adminCall(ERC721.address, calldata))
          .to.emit(ERC721, 'OwnershipTransferred')
          .withArgs(l1.holographFactoryProxy.address, l1.deployer.address);
        expect(await ERC721.getOwner()).to.equal(l1.deployer.address);
      });

      it('deployer should transfer ownership to "HolographFactoryProxy"', async function () {
        await expect(ERC721.setOwner(l1.holographFactoryProxy.address))
          .to.emit(ERC721, 'OwnershipTransferred')
          .withArgs(l1.deployer.address, l1.holographFactoryProxy.address);
      });
    });

    describe('Admin', async function () {
      it('admin() should return "HolographFactoryProxy" address', async function () {
        expect(await ERC721.admin()).to.equal(l1.holographFactoryProxy.address);
      });

      it('getAdmin() should return "HolographFactoryProxy" address', async function () {
        expect(await ERC721.getAdmin()).to.equal(l1.holographFactoryProxy.address);
      });

      it('wallet1 should fail setting admin', async function () {
        await expect(ERC721.connect(l1.wallet1).setAdmin(l1.wallet2.address)).to.be.revertedWith(
          'HOLOGRAPH: admin only function'
        );
      });

      it('deployer should succeed setting admin via "HolographFactoryProxy"', async function () {
        let admin: Admin = (await l1.hre.ethers.getContractAt('Admin', l1.holographFactoryProxy.address)) as Admin;
        let calldata: string = l1.web3.eth.abi.encodeFunctionCall(
          { name: 'setAdmin', type: 'function', inputs: [{ type: 'address', name: 'adminAddress' }] },
          [l1.deployer.address]
        );

        await admin.adminCall(ERC721.address, calldata);

        expect(await ERC721.admin()).to.equal(l1.deployer.address);

        await ERC721.setAdmin(l1.holographFactoryProxy.address);

        expect(await ERC721.admin()).to.equal(l1.holographFactoryProxy.address);
      });
    });
  });

  describe('Source tests', async function () {
    describe('Minting', async function () {
      // function sourceGetChainPrepend()
      // function sourceMint(address to, uint224 tokenId)
      // function sourceMintBatch(address to, uint224[] calldata tokenIds)
      // function sourceMintBatch(address[] calldata wallets, uint224[] calldata tokenIds)
      // function sourceMintBatchIncremental(address to, uint224 startingTokenId, uint256 length)
    });

    describe('Transferring', async function () {
      // function sourceTransfer(address to, uint256 tokenId)
    });

    describe('Burning', async function () {
      // function sourceBurn(uint256 tokenId)
    });
  });

  describe('Basic bridge tests', async function () {
    describe('Bridge OUT', async function () {
      // function holographBridgeOut(uint32 chainType, address from, address to, uint256 tokenId)
    });

    describe('Bridge IN', async function () {
      // function holographBridgeIn(uint32 chainType, address from, address to, uint256 tokenId, bytes calldata data)
    });
  });

  // SHOULD ALSO TEST RE-ENTRANCY WITH A MOCK RECEIVER THAT ATTEMPTS A RE-ENTRANT CALL MIDWAY
});
