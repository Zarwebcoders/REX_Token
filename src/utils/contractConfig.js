// REX Token Smart Contract Configuration

// BSC Network Configuration
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'; // BSC Mainnet
// export const BSC_RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/'; // BSC Testnet

export const BSC_CHAIN_ID = 56; // BSC Mainnet
// export const BSC_CHAIN_ID = 97; // BSC Testnet

// Contract Address - REX Token Contract on BSC Mainnet
export const CONTRACT_ADDRESS = '0xAC95EAef93446e8a3E0d88064841aA82468b1C8f';

// Contract ABI - UPDATE THIS WITH YOUR ACTUAL CONTRACT ABI
export const CONTRACT_ABI = [
    // Constructor
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },

    // Events
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amountINR", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "tokensReceived", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "Investment",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "ROIClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "TokensStaked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "TokensUnstaked",
        "type": "event"
    },

    // Read Functions
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCurrentPrice",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentPhase",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "getUserInvestmentInfo",
        "outputs": [
            { "internalType": "uint256", "name": "totalInvestedINR", "type": "uint256" },
            { "internalType": "uint256", "name": "totalTokensReceived", "type": "uint256" },
            { "internalType": "uint256", "name": "currentBalance", "type": "uint256" },
            { "internalType": "uint256", "name": "pendingROI", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "getUserReferralInfo",
        "outputs": [
            { "internalType": "uint256", "name": "referralEarnings", "type": "uint256" },
            { "internalType": "uint256", "name": "totalReferrals", "type": "uint256" },
            { "internalType": "address", "name": "upline", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "getStakeInfo",
        "outputs": [
            { "internalType": "uint256", "name": "stakedAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "stakeStartTime", "type": "uint256" },
            { "internalType": "uint256", "name": "timeUntilUnlock", "type": "uint256" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "uint256", "name": "pendingROI", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    // Write Functions
    {
        "inputs": [
            { "internalType": "address", "name": "userWallet", "type": "address" },
            { "internalType": "uint256", "name": "amountINR", "type": "uint256" },
            { "internalType": "address", "name": "referrer", "type": "address" }
        ],
        "name": "invest",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimROI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimStakeROI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
        "name": "stakeTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // ERC20 Standard Functions
    {
        "inputs": [],
        "name": "name",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "from", "type": "address" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    // Admin Functions
    {
        "inputs": [{ "internalType": "uint256", "name": "newPrice", "type": "uint256" }],
        "name": "setPrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "newPhase", "type": "uint256" }],
        "name": "setPhase",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "newPhase", "type": "uint256" },
            { "internalType": "uint256", "name": "newPrice", "type": "uint256" }
        ],
        "name": "setPhaseAndPrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "userAddress", "type": "address" },
            { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
            { "internalType": "bool", "name": "adjustInvestment", "type": "bool" }
        ],
        "name": "revertTokensFromUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
];

// Network Configuration Helper
export const getNetworkConfig = () => {
    return {
        chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
        chainName: BSC_CHAIN_ID === 56 ? 'Binance Smart Chain' : 'BSC Testnet',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: [BSC_RPC_URL],
        blockExplorerUrls: [
            BSC_CHAIN_ID === 56
                ? 'https://bscscan.com'
                : 'https://testnet.bscscan.com'
        ]
    };
};
