import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

describe('AIBridgeAgent', () => {
    let aiBridgeAgent: Contract;
    let owner: SignerWithAddress;
    let aiAgent: SignerWithAddress;
    let user: SignerWithAddress;
    let mockToken: Contract;
    let mockBridgeInterface: SignerWithAddress;

    beforeEach(async () => {
        // Get signers
        [owner, aiAgent, user, mockBridgeInterface] = await ethers.getSigners();

        // Deploy mock ERC20 token
        const MockToken = await ethers.getContractFactory('MockERC20');
        mockToken = await MockToken.deploy('Mock Token', 'MTK');
        await mockToken.deployed();

        // Deploy AI Bridge Agent
        const AIBridgeAgent = await ethers.getContractFactory('AIBridgeAgent');
        aiBridgeAgent = await AIBridgeAgent.deploy(mockBridgeInterface.address);
        await aiBridgeAgent.deployed();

        // Authorize AI agent
        await aiBridgeAgent.setAIAgentAuthorization(aiAgent.address, true);

        // Mint tokens to user
        await mockToken.mint(user.address, ethers.utils.parseEther('1000'));
        await mockToken.connect(user).approve(aiBridgeAgent.address, ethers.utils.parseEther('1000'));
    });

    describe('Deployment', () => {
        it('Should set the right owner', async () => {
            expect(await aiBridgeAgent.owner()).to.equal(owner.address);
        });

        it('Should set the correct bridge interface', async () => {
            expect(await aiBridgeAgent.bridgeInterface()).to.equal(mockBridgeInterface.address);
        });
    });

    describe('AI Agent Authorization', () => {
        it('Should authorize AI agent correctly', async () => {
            expect(await aiBridgeAgent.authorizedAIAgents(aiAgent.address)).to.be.true;
        });

        it('Should allow owner to revoke AI agent authorization', async () => {
            await aiBridgeAgent.setAIAgentAuthorization(aiAgent.address, false);
            expect(await aiBridgeAgent.authorizedAIAgents(aiAgent.address)).to.be.false;
        });

        it('Should not allow non-owner to authorize AI agent', async () => {
            await expect(
                aiBridgeAgent.connect(user).setAIAgentAuthorization(aiAgent.address, true)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe('Bridge Transactions', () => {
        it('Should process bridge transaction correctly', async () => {
            const amount = ethers.utils.parseEther('100');
            const targetChainId = 137;
            const data = '0x';

            await expect(
                aiBridgeAgent.connect(aiAgent).initiateBridgeTransaction(
                    mockToken.address,
                    amount,
                    targetChainId,
                    data
                )
            )
                .to.emit(aiBridgeAgent, 'BridgeRequestInitiated')
                .withArgs(
                    ethers.utils.keccak256(
                        ethers.utils.defaultAbiCoder.encode(
                            ['address', 'uint256', 'uint256', 'bytes', 'uint256'],
                            [mockToken.address, amount, targetChainId, data, await ethers.provider.getBlock('latest').then(b => b.timestamp)]
                        )
                    ),
                    aiAgent.address,
                    amount,
                    targetChainId
                );
        });

        it('Should not allow unauthorized agents to initiate bridge transaction', async () => {
            const amount = ethers.utils.parseEther('100');
            const targetChainId = 137;
            const data = '0x';

            await expect(
                aiBridgeAgent.connect(user).initiateBridgeTransaction(
                    mockToken.address,
                    amount,
                    targetChainId,
                    data
                )
            ).to.be.revertedWith('Not authorized AI agent');
        });

        it('Should prevent duplicate transactions', async () => {
            const amount = ethers.utils.parseEther('100');
            const targetChainId = 137;
            const data = '0x';

            // First transaction should succeed
            await aiBridgeAgent.connect(aiAgent).initiateBridgeTransaction(
                mockToken.address,
                amount,
                targetChainId,
                data
            );

            // Second identical transaction should fail
            await expect(
                aiBridgeAgent.connect(aiAgent).initiateBridgeTransaction(
                    mockToken.address,
                    amount,
                    targetChainId,
                    data
                )
            ).to.be.revertedWith('Transaction already processed');
        });
    });

    describe('Bridge Interface Updates', () => {
        it('Should allow owner to update bridge interface', async () => {
            const newInterface = user.address;
            await aiBridgeAgent.updateBridgeInterface(newInterface);
            expect(await aiBridgeAgent.bridgeInterface()).to.equal(newInterface);
        });

        it('Should not allow non-owner to update bridge interface', async () => {
            const newInterface = user.address;
            await expect(
                aiBridgeAgent.connect(user).updateBridgeInterface(newInterface)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should not allow setting invalid bridge interface address', async () => {
            await expect(
                aiBridgeAgent.updateBridgeInterface(ethers.constants.AddressZero)
            ).to.be.revertedWith('Invalid interface address');
        });
    });
}); 