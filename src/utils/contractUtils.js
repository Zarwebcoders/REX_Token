import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, BSC_RPC_URL, getNetworkConfig } from './contractConfig';

/**
 * Get contract instance with provider
 * @param {object} signer - Optional signer for write operations
 * @returns {object} Contract instance
 */
export const getContract = (signer = null) => {
    try {
        if (signer) {
            return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        }

        // Use BSC RPC for read-only operations
        const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } catch (error) {
        console.error("Error creating contract instance:", error);
        throw error;
    }
};

/**
 * Get user's REX token balance from contract
 * @param {string} walletAddress - User's wallet address
 * @returns {string} Token balance
 */
export const getTokenBalance = async (walletAddress) => {
    try {
        const contract = getContract();
        const balance = await contract.balanceOf(walletAddress);
        return ethers.formatEther(balance);
    } catch (error) {
        // Silently handle errors for unregistered users
        if (error.code !== 'BAD_DATA') {
            console.error("Error fetching token balance:", error);
        }
        return "0";
    }
};

/**
 * Get current token price in INR
 * @returns {string} Current price
 */
export const getCurrentPrice = async () => {
    try {
        const contract = getContract();
        const price = await contract.getCurrentPrice();
        return ethers.formatEther(price);
    } catch (error) {
        console.error("Error fetching current price:", error);
        return "0";
    }
};

/**
 * Get current phase number
 * @returns {number} Current phase
 */
export const getCurrentPhase = async () => {
    try {
        const contract = getContract();
        const phase = await contract.currentPhase();
        return Number(phase);
    } catch (error) {
        console.error("Error fetching current phase:", error);
        return 0;
    }
};

/**
 * Get user investment information
 * @param {string} walletAddress - User's wallet address
 * @returns {object} Investment info
 */
export const getUserInvestmentInfo = async (walletAddress) => {
    try {
        const contract = getContract();
        const info = await contract.getUserInvestmentInfo(walletAddress);

        return {
            totalInvestedINR: ethers.formatEther(info[0]),
            totalTokensReceived: ethers.formatEther(info[1]),
            currentBalance: ethers.formatEther(info[2]),
            pendingROI: ethers.formatEther(info[3])
        };
    } catch (error) {
        // Silently handle errors for unregistered users
        if (error.code !== 'BAD_DATA') {
            console.error("Error fetching user investment info:", error);
        }
        return {
            totalInvestedINR: "0",
            totalTokensReceived: "0",
            currentBalance: "0",
            pendingROI: "0"
        };
    }
};

/**
 * Get user referral information
 * @param {string} walletAddress - User's wallet address
 * @returns {object} Referral info
 */
export const getUserReferralInfo = async (walletAddress) => {
    try {
        const contract = getContract();
        const info = await contract.getUserReferralInfo(walletAddress);

        return {
            referralEarnings: ethers.formatEther(info[0]),
            totalReferrals: Number(info[1]),
            upline: info[2]
        };
    } catch (error) {
        // Silently handle errors for unregistered users
        if (error.code !== 'BAD_DATA') {
            console.error("Error fetching user referral info:", error);
        }
        return {
            referralEarnings: "0",
            totalReferrals: 0,
            upline: ethers.ZeroAddress
        };
    }
};

/**
 * Get user stake information
 * @param {string} walletAddress - User's wallet address
 * @returns {object} Stake info
 */
export const getStakeInfo = async (walletAddress) => {
    try {
        const contract = getContract();
        const info = await contract.getStakeInfo(walletAddress);

        return {
            stakedAmount: ethers.formatEther(info[0]),
            stakeStartTime: Number(info[1]),
            timeUntilUnlock: Number(info[2]),
            isActive: info[3],
            pendingROI: ethers.formatEther(info[4])
        };
    } catch (error) {
        // Silently handle errors for unregistered users
        if (error.code !== 'BAD_DATA') {
            console.error("Error fetching stake info:", error);
        }
        return {
            stakedAmount: "0",
            stakeStartTime: 0,
            timeUntilUnlock: 0,
            isActive: false,
            pendingROI: "0"
        };
    }
};

/**
 * Get complete dashboard data for a user
 * @param {string} walletAddress - User's wallet address
 * @returns {object} Complete dashboard data
 */
export const getDashboardData = async (walletAddress) => {
    try {
        const [
            tokenBalance,
            currentPrice,
            currentPhase,
            investmentInfo,
            referralInfo,
            stakeInfo
        ] = await Promise.all([
            getTokenBalance(walletAddress),
            getCurrentPrice(),
            getCurrentPhase(),
            getUserInvestmentInfo(walletAddress),
            getUserReferralInfo(walletAddress),
            getStakeInfo(walletAddress)
        ]);

        return {
            tokenBalance,
            currentPrice,
            currentPhase,
            investmentInfo,
            referralInfo,
            stakeInfo
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};

/**
 * Convert INR to REX tokens based on current price
 * @param {string} amountINR - Amount in INR
 * @returns {string} Token amount
 */
export const convertINRToTokens = async (amountINR) => {
    try {
        const price = await getCurrentPrice();
        if (parseFloat(price) === 0) return "0";

        const tokens = parseFloat(amountINR) / parseFloat(price);
        return tokens.toFixed(4);
    } catch (error) {
        console.error("Error converting INR to tokens:", error);
        return "0";
    }
};

/**
 * Convert REX tokens to INR based on current price
 * @param {string} tokenAmount - Token amount
 * @returns {string} INR amount
 */
export const convertTokensToINR = async (tokenAmount) => {
    try {
        const price = await getCurrentPrice();
        const inr = parseFloat(tokenAmount) * parseFloat(price);
        return inr.toFixed(2);
    } catch (error) {
        console.error("Error converting tokens to INR:", error);
        return "0";
    }
};

/**
 * Switch wallet network to BSC
 */
export const switchNetwork = async () => {
    const networkConfig = getNetworkConfig();
    if (!window.ethereum) return;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [networkConfig],
                });
            } catch (addError) {
                console.error("Failed to add network:", addError);
                throw addError;
            }
        } else {
            console.error("Failed to switch network:", switchError);
            throw switchError;
        }
    }
};

/**
 * Get signer from MetaMask
 * @returns {object} Ethers signer
 */
const getSigner = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Force network switch to BSC
        await switchNetwork();

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        console.log("✅ Wallet connected:", await signer.getAddress());

        return signer;
    } catch (error) {
        console.error("❌ Error getting signer:", error);
        if (error.code === 4001) {
            throw new Error('User rejected wallet connection');
        }
        throw error;
    }
};

/**
 * Claim ROI from investments
 * @returns {object} Transaction receipt
 */
export const claimROI = async () => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Call claimROI function
        const tx = await contract.claimROI();

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ ROI claimed successfully:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt
        };
    } catch (error) {
        console.error("❌ Error claiming ROI:", error);

        // Parse error message
        let errorMessage = "Failed to claim ROI";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("Wait 30 days")) {
            errorMessage = "Please wait 30 days between ROI claims";
        } else if (error.message.includes("No active investment")) {
            errorMessage = "No active investment found";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Claim ROI from staked tokens
 * @returns {object} Transaction receipt
 */
export const claimStakeROI = async () => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Call claimStakeROI function
        const tx = await contract.claimStakeROI();

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Stake ROI claimed successfully:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt
        };
    } catch (error) {
        console.error("❌ Error claiming stake ROI:", error);

        // Parse error message
        let errorMessage = "Failed to claim stake ROI";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("Wait 30 days")) {
            errorMessage = "Please wait 30 days between stake ROI claims";
        } else if (error.message.includes("No active stake")) {
            errorMessage = "No active stake found";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Stake tokens
 * @param {string} tokenAmount - Amount of tokens to stake
 * @returns {object} Transaction receipt
 */
export const stakeTokens = async (tokenAmount) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Convert to wei
        const amountInWei = ethers.parseEther(tokenAmount);

        // Call stakeTokens function
        const tx = await contract.stakeTokens(amountInWei);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Tokens staked successfully:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt
        };
    } catch (error) {
        console.error("❌ Error staking tokens:", error);

        let errorMessage = "Failed to stake tokens";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("Insufficient balance")) {
            errorMessage = "Insufficient token balance";
        } else if (error.message.includes("Already have active stake")) {
            errorMessage = "You already have an active stake";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Unstake tokens
 * @returns {object} Transaction receipt
 */
export const unstakeTokens = async () => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Call unstake function
        const tx = await contract.unstake();

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Tokens unstaked successfully:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt
        };
    } catch (error) {
        console.error("❌ Error unstaking tokens:", error);

        let errorMessage = "Failed to unstake tokens";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("Stake still locked")) {
            errorMessage = "Stake is still locked. Please wait for the lock period to end.";
        } else if (error.message.includes("No active stake")) {
            errorMessage = "No active stake found";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Normal withdrawal from total income
 * @param {string} amount - Amount to withdraw in tokens
 * @returns {object} Transaction receipt
 */
export const normalWithdraw = async (amount) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Convert amount to wei
        const amountInWei = ethers.parseEther(amount.toString());

        console.log("🔄 Initiating normal withdrawal:", amount, "REX");

        // Call normalWithdraw function
        const tx = await contract.normalWithdraw(amountInWei);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Normal withdrawal successful:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            amount: amount
        };
    } catch (error) {
        console.error("❌ Error in normal withdrawal:", error);

        let errorMessage = "Failed to withdraw";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("Insufficient balance")) {
            errorMessage = "Insufficient balance for withdrawal";
        } else if (error.message.includes("Amount must be greater than 0")) {
            errorMessage = "Amount must be greater than 0";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * SOS withdrawal from investment tokens
 * @param {string} amount - Amount to withdraw in tokens
 * @returns {object} Transaction receipt
 */
export const sosWithdraw = async (amount) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Convert amount to wei
        const amountInWei = ethers.parseEther(amount.toString());

        console.log("🔄 Initiating SOS withdrawal:", amount, "REX");

        // Call sosWithdraw function
        const tx = await contract.sosWithdraw(amountInWei);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ SOS withdrawal successful:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            amount: amount
        };
    } catch (error) {
        console.error("❌ Error in SOS withdrawal:", error);

        let errorMessage = "Failed to withdraw";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("Insufficient investment tokens")) {
            errorMessage = "Insufficient investment tokens for SOS withdrawal";
        } else if (error.message.includes("Amount must be greater than 0")) {
            errorMessage = "Amount must be greater than 0";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Invest function for admin to approve investment on blockchain
 * @param {string} userWallet - User's wallet address
 * @param {string} amountINR - Investment amount in INR
 * @param {string} sponsorWallet - Sponsor's wallet address
 * @returns {object} Transaction receipt
 */
export const adminInvest = async (userWallet, amountINR, sponsorWallet) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Convert amount to wei (assuming 1 INR = some token ratio handled by contract)
        const amountInWei = ethers.parseEther(amountINR.toString());

        console.log("🔄 Admin initiating investment for user:", userWallet);
        console.log("Amount:", amountINR, "INR");
        console.log("Sponsor:", sponsorWallet);

        // Call invest function with user's wallet and sponsor
        const tx = await contract.invest(userWallet, amountInWei, sponsorWallet);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Investment approved on blockchain:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            amount: amountINR,
            userWallet: userWallet
        };
    } catch (error) {
        console.error("❌ Error in admin invest:", error);

        let errorMessage = "Failed to approve investment on blockchain";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by admin";
        } else if (error.message.includes("User already registered")) {
            errorMessage = "User already has an investment";
        } else if (error.message.includes("Invalid sponsor")) {
            errorMessage = "Invalid sponsor wallet address";
        } else if (error.message.includes("Amount must be greater than 0")) {
            errorMessage = "Investment amount must be greater than 0";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Admin: Set token price on contract
 * @param {string} newPrice - New price in INR (will be converted to wei)
 * @returns {object} Transaction receipt
 */
export const adminSetPrice = async (newPrice) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Convert price to wei (18 decimals)
        const priceInWei = ethers.parseEther(newPrice.toString());

        console.log("🔄 Admin setting price to:", newPrice, "INR");

        // Call setPrice function
        const tx = await contract.setPrice(priceInWei);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Price updated on contract:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            newPrice: newPrice
        };
    } catch (error) {
        console.error("❌ Error setting price:", error);

        let errorMessage = "Failed to set price on contract";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by admin";
        } else if (error.message.includes("Only owner")) {
            errorMessage = "Only contract owner can set price";
        } else if (error.message.includes("Price must be > 0")) {
            errorMessage = "Price must be greater than 0";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Admin: Set phase on contract
 * @param {number} newPhase - New phase number (1-21)
 * @returns {object} Transaction receipt
 */
export const adminSetPhase = async (newPhase) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        console.log("🔄 Admin setting phase to:", newPhase);

        // Call setPhase function
        const tx = await contract.setPhase(newPhase);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Phase updated on contract:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            newPhase: newPhase
        };
    } catch (error) {
        console.error("❌ Error setting phase:", error);

        let errorMessage = "Failed to set phase on contract";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by admin";
        } else if (error.message.includes("Only owner")) {
            errorMessage = "Only contract owner can set phase";
        } else if (error.message.includes("Invalid phase")) {
            errorMessage = "Phase must be between 1 and 21";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Admin: Set both phase and price on contract
 * @param {number} newPhase - New phase number (1-21)
 * @param {string} newPrice - New price in INR (will be converted to wei)
 * @returns {object} Transaction receipt
 */
export const adminSetPhaseAndPrice = async (newPhase, newPrice) => {
    try {
        console.log("🔵 Starting adminSetPhaseAndPrice...");
        console.log("📊 Input - Phase:", newPhase, "Price:", newPrice);

        const signer = await getSigner();
        console.log("✅ Signer obtained");

        const contract = getContract(signer);
        console.log("✅ Contract instance created");

        // Convert price to wei (18 decimals)
        const priceInWei = ethers.parseEther(newPrice.toString());
        console.log("💰 Price in wei:", priceInWei.toString());

        console.log("🔄 Calling contract.setPhaseAndPrice...");
        console.log("   Phase:", newPhase);
        console.log("   Price (wei):", priceInWei.toString());

        // Call setPhaseAndPrice function
        const tx = await contract.setPhaseAndPrice(newPhase, priceInWei);

        console.log("✅ Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();

        console.log("✅ Phase and price updated on contract!");
        console.log("📝 Receipt:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            newPhase: newPhase,
            newPrice: newPrice
        };
    } catch (error) {
        console.error("❌ Error in adminSetPhaseAndPrice:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            reason: error.reason,
            data: error.data
        });

        let errorMessage = "Failed to set phase and price on contract";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by admin";
        } else if (error.code === -32603) {
            errorMessage = "Internal JSON-RPC error. Check if you're connected to the correct network (BSC Mainnet)";
        } else if (error.message.includes("Only owner")) {
            errorMessage = "Only contract owner can set phase and price";
        } else if (error.message.includes("Invalid phase")) {
            errorMessage = "Phase must be between 1 and 21";
        } else if (error.message.includes("Price must be > 0")) {
            errorMessage = "Price must be greater than 0";
        } else if (error.message.includes("User rejected")) {
            errorMessage = "User rejected wallet connection";
        } else if (error.reason) {
            errorMessage = error.reason;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Admin: Revert tokens from user wallet back to admin
 * @param {string} userAddress - User's wallet address
 * @param {string} tokenAmount - Amount of tokens to revert
 * @param {boolean} adjustInvestment - Whether to adjust user's investment record
 * @returns {object} Transaction receipt
 */
export const adminRevertTokens = async (userAddress, tokenAmount, adjustInvestment = true) => {
    try {
        const signer = await getSigner();
        const contract = getContract(signer);

        // Convert amount to wei
        const amountInWei = ethers.parseEther(tokenAmount.toString());

        console.log("🔄 Admin reverting", tokenAmount, "tokens from:", userAddress);
        console.log("Adjust investment record:", adjustInvestment);

        // Call revertTokensFromUser function
        const tx = await contract.revertTokensFromUser(userAddress, amountInWei, adjustInvestment);

        console.log("🔄 Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        console.log("✅ Tokens reverted successfully:", receipt);

        return {
            success: true,
            txHash: receipt.hash,
            receipt,
            userAddress: userAddress,
            tokenAmount: tokenAmount,
            adjustedInvestment: adjustInvestment
        };
    } catch (error) {
        console.error("❌ Error reverting tokens:", error);

        let errorMessage = "Failed to revert tokens from user";

        if (error.code === 4001) {
            errorMessage = "Transaction rejected by admin";
        } else if (error.message.includes("Only owner")) {
            errorMessage = "Only contract owner can revert tokens";
        } else if (error.message.includes("Invalid user address")) {
            errorMessage = "Invalid user wallet address";
        } else if (error.message.includes("Cannot revert from owner")) {
            errorMessage = "Cannot revert tokens from owner wallet";
        } else if (error.message.includes("User has insufficient balance")) {
            errorMessage = "User has insufficient token balance";
        } else if (error.message.includes("Cannot revert staked tokens")) {
            errorMessage = "Cannot revert staked tokens. User must unstake first.";
        } else if (error.reason) {
            errorMessage = error.reason;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
};

