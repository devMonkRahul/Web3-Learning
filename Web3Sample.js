import { Web3 } from 'web3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Web3 with Sepolia testnet RPC
const web3 = new Web3('https://sepolia.infura.io/v3/fb32936239ab4ff18b5913a844748a18');
// Alternative RPC endpoints (latest):
// const web3 = new Web3('https://rpc.sepolia.org');
// const web3 = new Web3('https://ethereum-sepolia-rpc.publicnode.com');
// const web3 = new Web3('https://sepolia.gateway.tenderly.co');

// Account addresses
const account1 = "0x390aF025B62BB6FaFeAF3c343C5FAB85CB702361";
const account2 = "0x0c549dc11dD789A6ed360dF56903c1BA29625c20";

// Private keys from environment variables
const account1PrivateKey = `0x${process.env.ACCOUNT1_PRIVATE_KEY}`;
const account2PrivateKey = `0x${process.env.ACCOUNT2_PRIVATE_KEY}`;

/**
 * Send ETH transaction on Sepolia testnet
 * @param {string} fromAddress - Sender address
 * @param {string} toAddress - Recipient address
 * @param {string} privateKey - Private key with 0x prefix
 * @param {number} amountInEth - Amount in ETH
 * @returns {Promise<object>} Transaction receipt
 */
async function sendEthTransaction(fromAddress, toAddress, privateKey, amountInEth) {
    try {
        console.log(`\n=== Sending ${amountInEth} ETH from ${fromAddress} to ${toAddress} ===`);
        
        // Convert ETH to Wei using the latest Web3 utility
        const amountInWei = web3.utils.toWei(amountInEth.toString(), 'ether');
        console.log(`Amount in Wei: ${amountInWei}`);
        
        // Get current nonce
        const nonce = await web3.eth.getTransactionCount(fromAddress, 'pending');
        console.log(`Current nonce: ${nonce}`);
        
        // Get current gas price and priority fee (EIP-1559)
        const feeData = await web3.eth.calculateFeeData();
        console.log(`Base fee: ${web3.utils.fromWei(feeData.baseFeePerGas, 'gwei')} gwei`);
        console.log(`Max fee per gas: ${web3.utils.fromWei(feeData.maxFeePerGas, 'gwei')} gwei`);
        console.log(`Max priority fee: ${web3.utils.fromWei(feeData.maxPriorityFeePerGas, 'gwei')} gwei`);
        
        // Check balance before transaction
        const balance = await web3.eth.getBalance(fromAddress);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        console.log(`Current balance: ${balanceInEth} ETH`);
        
        if (parseFloat(balanceInEth) < parseFloat(amountInEth)) {
            throw new Error(`Insufficient balance. Current: ${balanceInEth} ETH, Required: ${amountInEth} ETH`);
        }
        
        // Create EIP-1559 transaction object (Type 2)
        const txObject = {
            from: fromAddress,
            to: toAddress,
            value: amountInWei,
            gas: 21000n, // Using BigInt for gas limit
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            nonce: nonce,
            type: 2, // EIP-1559 transaction type
            chainId: 11155111 // Sepolia testnet chain ID
        };
        
        console.log('Transaction object:', {
            ...txObject,
            gas: txObject.gas.toString(),
            maxFeePerGas: txObject.maxFeePerGas.toString(),
            maxPriorityFeePerGas: txObject.maxPriorityFeePerGas.toString()
        });
        
        // Sign the transaction using the latest Web3 method
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
        console.log('Transaction signed successfully');
        
        // Send the transaction
        console.log('Broadcasting transaction...');
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        console.log('\n=== Transaction Successful! ===');
        console.log(`Transaction Hash: ${receipt.transactionHash}`);
        console.log(`Block Number: ${receipt.blockNumber}`);
        console.log(`Block Hash: ${receipt.blockHash}`);
        console.log(`Gas Used: ${receipt.gasUsed}`);
        console.log(`Effective Gas Price: ${web3.utils.fromWei(receipt.effectiveGasPrice, 'gwei')} gwei`);
        console.log(`Status: ${receipt.status ? 'Success' : 'Failed'}`);
        console.log(`Sepolia Etherscan: https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
        
        return receipt;
        
    } catch (error) {
        console.error('\n=== Transaction Failed ===');
        console.error('Error:', error.message);
        
        // Handle specific error types with modern error handling
        if (error.message.includes('insufficient funds')) {
            console.error('💡 Solution: Add more ETH to your account or reduce the transaction amount');
        } else if (error.message.includes('nonce')) {
            console.error('💡 Solution: Wait for pending transactions to complete or adjust nonce');
        } else if (error.message.includes('gas')) {
            console.error('💡 Solution: Increase gas limit or gas price');
        } else if (error.message.includes('replacement transaction underpriced')) {
            console.error('💡 Solution: Increase gas price or wait for current transaction to complete');
        }
        
        throw error;
    }
}

/**
 * Get account balance
 * @param {string} address - Ethereum address
 * @returns {Promise<string>} Balance in ETH
 */
async function getAccountBalance(address) {
    try {
        const balance = await web3.eth.getBalance(address);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        console.log(`💰 Balance of ${address}: ${balanceInEth} ETH`);
        return balanceInEth;
    } catch (error) {
        console.error(`❌ Error getting balance for ${address}:`, error.message);
        throw error;
    }
}

/**
 * Get network information
 * @returns {Promise<object>} Network details
 */
async function getNetworkInfo() {
    try {
        const [chainId, blockNumber, gasPrice, feeData] = await Promise.all([
            web3.eth.getChainId(),
            web3.eth.getBlockNumber(),
            web3.eth.getGasPrice(),
            web3.eth.calculateFeeData()
        ]);
        
        const networkInfo = {
            chainId: Number(chainId),
            blockNumber: Number(blockNumber),
            gasPrice: web3.utils.fromWei(gasPrice, 'gwei'),
            baseFee: web3.utils.fromWei(feeData.baseFeePerGas, 'gwei'),
            maxFeePerGas: web3.utils.fromWei(feeData.maxFeePerGas, 'gwei'),
            maxPriorityFeePerGas: web3.utils.fromWei(feeData.maxPriorityFeePerGas, 'gwei')
        };
        
        console.log('🌐 Network Info:', networkInfo);
        return networkInfo;
    } catch (error) {
        console.error('❌ Error getting network info:', error.message);
        throw error;
    }
}

/**
 * Estimate gas for transaction
 * @param {object} txObject - Transaction object
 * @returns {Promise<bigint>} Gas estimate
 */
async function estimateGas(txObject) {
    try {
        const gasEstimate = await web3.eth.estimateGas(txObject);
        console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
        return gasEstimate;
    } catch (error) {
        console.error('❌ Gas estimation failed:', error.message);
        return 21000n; // Fallback to standard gas limit as BigInt
    }
}

/**
 * Send ETH transaction with custom gas settings
 * @param {string} fromAddress - Sender address
 * @param {string} toAddress - Recipient address  
 * @param {string} privateKey - Private key with 0x prefix
 * @param {number} amountInEth - Amount in ETH
 * @param {bigint} customGasLimit - Custom gas limit
 * @param {bigint} customMaxFeePerGas - Custom max fee per gas
 * @param {bigint} customMaxPriorityFeePerGas - Custom max priority fee per gas
 * @returns {Promise<object>} Transaction receipt
 */
async function sendEthTransactionWithCustomGas(
    fromAddress, 
    toAddress, 
    privateKey, 
    amountInEth, 
    customGasLimit = null, 
    customMaxFeePerGas = null, 
    customMaxPriorityFeePerGas = null
) {
    try {
        const amountInWei = web3.utils.toWei(amountInEth.toString(), 'ether');
        const nonce = await web3.eth.getTransactionCount(fromAddress, 'pending');
        const feeData = await web3.eth.calculateFeeData();
        
        const txObject = {
            from: fromAddress,
            to: toAddress,
            value: amountInWei,
            gas: customGasLimit || 21000n,
            maxFeePerGas: customMaxFeePerGas || feeData.maxFeePerGas,
            maxPriorityFeePerGas: customMaxPriorityFeePerGas || feeData.maxPriorityFeePerGas,
            nonce: nonce,
            type: 2,
            chainId: 11155111
        };
        
        const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        return receipt;
    } catch (error) {
        console.error('❌ Custom gas transaction failed:', error.message);
        throw error;
    }
}

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<object>} Transaction receipt
 */
async function waitForConfirmation(txHash, confirmations = 1) {
    console.log(`⏳ Waiting for ${confirmations} confirmation(s) for tx: ${txHash}`);
    
    let receipt = null;
    let currentConfirmations = 0;
    
    while (currentConfirmations < confirmations) {
        try {
            receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt && receipt.blockNumber) {
                const currentBlock = await web3.eth.getBlockNumber();
                currentConfirmations = Number(currentBlock) - Number(receipt.blockNumber) + 1;
                console.log(`📋 Confirmations: ${currentConfirmations}/${confirmations}`);
                
                if (currentConfirmations < confirmations) {
                    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            }
        } catch (error) {
            console.error('Error checking confirmations:', error.message);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log(`✅ Transaction confirmed with ${confirmations} confirmation(s)`);
    return receipt;
}

/**
 * Main execution function
 */
(async function main() {
    try {
        console.log('🚀 === Sepolia ETH Transaction Script (Latest Web3.js) ===');
        
        // Get network information
        const networkInfo = await getNetworkInfo();
        
        if (networkInfo.chainId !== 11155111) {
            console.warn('⚠️  Warning: Not connected to Sepolia testnet (Chain ID: 11155111)');
            console.warn(`Current Chain ID: ${networkInfo.chainId}`);
        } else {
            console.log('✅ Connected to Sepolia testnet');
        }
        
        // Display initial balances
        console.log('\n💰 === Initial Balances ===');
        const [balance1, balance2] = await Promise.all([
            getAccountBalance(account1),
            getAccountBalance(account2)
        ]);
        
        // Send transaction from account1 to account2
        const amountToSend = 0.001; // 0.001 ETH (adjust as needed)
        
        console.log(`\n🔄 Preparing to send ${amountToSend} ETH...`);
        
        const receipt = await sendEthTransaction(
            account1,
            account2,
            account1PrivateKey,
            amountToSend
        );
        
        // Wait for additional confirmations
        await waitForConfirmation(receipt.transactionHash, 2);
        
        // Display final balances
        console.log('\n💰 === Final Balances ===');
        await Promise.all([
            getAccountBalance(account1),
            getAccountBalance(account2)
        ]);
        
        console.log('\n🎉 Transaction completed successfully!');
        
    } catch (error) {
        console.error('❌ Script execution failed:', error.message);
        process.exit(1);
    }
})();

// Export functions for use in other modules
export {
    sendEthTransaction,
    getAccountBalance,
    getNetworkInfo,
    estimateGas,
    sendEthTransactionWithCustomGas,
    waitForConfirmation,
    web3
};
