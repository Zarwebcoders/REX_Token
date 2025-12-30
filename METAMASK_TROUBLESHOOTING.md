# MetaMask Connection Troubleshooting Guide

## Issue: Wallet Not Opening When Updating Price/Phase

### Step-by-Step Debugging

#### 1. **Check Browser Console**
Open your browser's Developer Tools (F12) and go to the Console tab. Look for these logs:

**Expected logs when clicking "Update Price & Phase":**
```
Calling blockchain with phase: Phase 1 price: 0.1
🔵 Starting adminSetPhaseAndPrice...
📊 Input - Phase: 1 Price: 0.1
✅ Wallet connected: 0x...
✅ Signer obtained
✅ Contract instance created
💰 Price in wei: 100000000000000000
🔄 Calling contract.setPhaseAndPrice...
   Phase: 1
   Price (wei): 100000000000000000
```

**If you see an error, note the error message!**

#### 2. **Common Issues & Solutions**

##### Issue A: "MetaMask is not installed"
**Solution:**
- Install MetaMask browser extension
- Refresh the page after installation

##### Issue B: "User rejected wallet connection"
**Solution:**
- Click the MetaMask icon in your browser
- Approve the connection request
- Try again

##### Issue C: "Wrong network" or "Network error"
**Solution:**
- Open MetaMask
- Click the network dropdown (top of MetaMask)
- Select "Binance Smart Chain" (BSC Mainnet)
- If BSC is not in the list, add it manually:
  - Network Name: Binance Smart Chain
  - RPC URL: https://bsc-dataseed.binance.org/
  - Chain ID: 56
  - Currency Symbol: BNB
  - Block Explorer: https://bscscan.com

##### Issue D: "Only owner can set phase and price"
**Solution:**
- You're connected with the wrong wallet
- Connect with the wallet that deployed the contract
- Contract owner address: Check on BSCScan

##### Issue E: Button shows "Updating..." but nothing happens
**Possible causes:**
1. JavaScript error - Check console for errors
2. MetaMask popup blocked - Check browser popup settings
3. Network issue - Check internet connection

#### 3. **Verify MetaMask Setup**

Open browser console and run:
```javascript
// Check if MetaMask is installed
console.log("MetaMask installed:", typeof window.ethereum !== 'undefined');

// Check current network
window.ethereum.request({ method: 'eth_chainId' })
  .then(chainId => console.log("Chain ID:", chainId, "(should be 0x38 for BSC)"));

// Check connected accounts
window.ethereum.request({ method: 'eth_accounts' })
  .then(accounts => console.log("Connected accounts:", accounts));
```

#### 4. **Manual Test**

Try this in the browser console to test the connection:
```javascript
// Request account access
window.ethereum.request({ method: 'eth_requestAccounts' })
  .then(accounts => {
    console.log("✅ Connected:", accounts[0]);
  })
  .catch(error => {
    console.error("❌ Error:", error);
  });
```

#### 5. **Check Contract Address**

Verify the contract address in `src/utils/contractConfig.js`:
```javascript
export const CONTRACT_ADDRESS = '0xAC95EAef93446e8a3E0d88064841aA82468b1C8f';
```

Visit BSCScan to verify:
https://bscscan.com/address/0xAC95EAef93446e8a3E0d88064841aA82468b1C8f

#### 6. **Test Sequence**

1. **Open Token Management page**
2. **Open Browser Console (F12)**
3. **Fill in the form:**
   - Token Price: `0.1`
   - Phase Name: `Phase 1`
4. **Click "Update Price & Phase"**
5. **Watch the console for logs**
6. **MetaMask should popup** - If not, check console for errors

#### 7. **Network Requirements**

✅ **Required:**
- MetaMask installed
- Connected to BSC Mainnet (Chain ID: 56)
- Admin wallet connected (contract owner)
- Sufficient BNB for gas fees (~0.001 BNB)

#### 8. **Quick Fixes**

**If MetaMask doesn't open:**
```javascript
// 1. Check popup blocker
// 2. Try manually connecting first
// 3. Refresh the page
// 4. Clear browser cache
```

**If wrong network:**
```javascript
// Add BSC network to MetaMask
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
  }]
});
```

## Expected Behavior

### Successful Flow:
1. Click "Update Price & Phase"
2. Console shows: "🔵 Starting adminSetPhaseAndPrice..."
3. MetaMask popup appears
4. You approve the transaction
5. Console shows: "✅ Transaction sent: 0x..."
6. Wait for confirmation (~3 seconds)
7. Success alert with transaction hash
8. Database updated

### If It Fails:
- Console will show: "❌ Error in adminSetPhaseAndPrice:"
- Error details will be logged
- Alert will show user-friendly error message
- Button returns to normal state

## Contact Points

If none of these solutions work, provide:
1. Screenshot of browser console errors
2. MetaMask network you're connected to
3. Wallet address you're using
4. Exact error message from console
