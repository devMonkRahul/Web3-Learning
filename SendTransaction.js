import { Web3 } from "web3"
import dotenv from "dotenv"
dotenv.config()

const web3 = new Web3(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)

const account1 = "0x390aF025B62BB6FaFeAF3c343C5FAB85CB702361"
const account2 = "0x0c549dc11dD789A6ed360dF56903c1BA29625c20"

const acc1 = process.env.ACCOUNT1_PRIVATE_KEY
const acc2 = process.env.ACCOUNT2_PRIVATE_KEY

const getBalance = async (acc) => {
    const bal = await web3.eth.getBalance(acc)
    console.log(`Balance of ${acc}: ${web3.utils.fromWei(bal, 'ether')} ETH`);
    
}

// getBalance(account1)

const getTransactionCount = async (acc) => {
    const count = await web3.eth.getTransactionCount(acc);
    console.log(`Transaction count for ${acc}: ${count}`);
}

getTransactionCount(account1)
getTransactionCount(account2)

const sendTransaction = async (from, to, amount, privateKey) => {    
    const nonce = await web3.eth.getTransactionCount(from);
    const gasLimit = 21000;
    
    const feeData = await web3.eth.calculateFeeData();
    
    // Build the transaction
    const txObject = {
        from,
        to,
        nonce,
        value: web3.utils.toWei(amount, 'ether'),
        gas: gasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        type: 2, // EIP-1559 transaction
        chainId: 11155111, // Sepolia testnet chain ID
    }
    
    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(txObject, `0x${privateKey.toString('hex')}`);
    
    // Broadcast the transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // console.log("Transaction info:", receipt);
    
    console.log(`Transaction successful with hash: ${receipt.transactionHash}`);

    await getBalance(from);
}

// sendTransaction(account2, account1, '0.001', acc2)
// .then(() => console.log("Transaction sent successfully"))
// .catch((error) => {
//     console.error(`Error sending transaction: ${error.message}`);
// })