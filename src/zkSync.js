const zksync = require('zksync');
const ethers = require('ethers');
require('dotenv').config();

const MNEMONIC = process.env.MNEMONIC;


const main = async () => {
    try {

        // Connecting to zkSync network
        const syncProvider = await zksync.getDefaultProvider('ropsten');
        const ethersProvider = ethers.getDefaultProvider('ropsten');
        // const bal = await ethersProvider.getBalance('0xb5bE4d2510294d0BA77214F26F704d2956a99072');

        // Create instance of ethereum wallet using ethers.js
        const ethWallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(ethersProvider);

        // Derive zksync.Signer from ethereum wallet.
        const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

        /*
        //Depositing assets from Ethereum into zkSync
        const deposit = await syncWallet.depositToSyncFromEthereum({
            depositTo: syncWallet.address(),
            token: 'ETH',
            amount: ethers.utils.parseEther('0.2')
        });
        console.log('deposit:', deposit);
        */

        /*
        // Await confirmation from the zkSync operator
        // Completes when a promise is issued to process the tx
        const depositReceipt = await deposit.awaitReceipt();

        // Await verification
        // Completes when the tx reaches finality on Ethereum
        const depositReceipt = await deposit.awaitVerifyReceipt();
        */

        
        // Unlocking zkSync account
        if (!(await syncWallet.isSigningKeySet())) {
            if ((await syncWallet.getAccountId()) == undefined) {
                throw new Error('Unknown account');
            };
            console.log('ok')

            // As any other kind of transaction, `ChangePubKey` transaction requires fee.
            // User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
            // the lowest possible amount.
            const changePubkey = await syncWallet.setSigningKey({ feeToken: 'ETH' });

            // Wait until the tx is committed
            await changePubkey.awaitReceipt();
        };
        

        // Checking zkSync account balance
        // Committed state is not final yet
        const committedETHBalance = await syncWallet.getBalance('ETH');
        console.log('committedETHBalance:', ethers.utils.formatEther(committedETHBalance));

        // Verified state is final
        const verifiedETHBalance = await syncWallet.getBalance('ETH', 'verified');
        console.log('verifiedETHBalance:', ethers.utils.formatEther(verifiedETHBalance));


    } catch (err) {
        console.log('Error: ', err);
    };
};

main();
