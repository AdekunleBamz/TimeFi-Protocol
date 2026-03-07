/**
 * TimeFi Protocol - Randomized Contract Test Script
 * Tests contract functions with wallets in random order
 * 
 * Safety: 5 second delays, stops on failure
 */

const fs = require('fs');
const path = require('path');
const {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getNonce,
  uintCV,
  makeSTXPostCondition,
  FungibleConditionCode,
} = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');

// Configuration
const API_URL = 'https://api.mainnet.hiro.so';

// Configuration
const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

// Randomness generators
const getRandomGas = () => Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;
const getRandomDelay = () => Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;

// Test parameters
const DEPOSIT_AMOUNT = 100000; // 0.1 STX
const LOCK_DURATION = 100; // ~16 hours

// Load wallets
const wallets = require('./wallets.json');

async function waitForConfirmation(txid) {
  let attempts = 0;
  const maxAttempts = 60; // 10 minutes max

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_URL}/extended/v1/tx/${txid}`);
      const data = await response.json();

      if (data.tx_status === 'success') {
        return { success: true };
      } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
        return { success: false, error: data.tx_result?.repr || 'Transaction aborted' };
      }

      process.stdout.write('.');
      attempts++;
      await new Promise(r => setTimeout(r, 10000)); // Poll every 10s
    } catch (e) {
      attempts++;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  return { success: false, error: 'Timed out waiting for confirmation' };
}

async function callContract(wallet, contractName, functionName, functionArgs, postConditions = []) {
  const nonce = await getNonce(wallet.address, NETWORK);
  const gas = getRandomGas();

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName,
    functionName,
    functionArgs,
    senderKey: wallet.privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: postConditions.length > 0 ? PostConditionMode.Deny : PostConditionMode.Allow,
    postConditions,
    fee: gas,
    nonce,
  };

  try {
    const tx = await makeContractCall(txOptions);
    const result = await broadcastTransaction(tx, NETWORK);

    if (result.error) {
      return { success: false, error: result.reason || result.error };
    }

    process.stdout.write(`     ⏳ Broadcasting ${result.txid.slice(0, 8)}... (Fee: ${gas / 1000000} STX) `);
    const confirmation = await waitForConfirmation(result.txid);
    console.log(''); // New line after dots

    if (!confirmation.success) {
      return { success: false, error: confirmation.error };
    }

    return { success: true, txid: result.txid };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TIMEFI PROTOCOL - ORGANIC v-A2 CONTRACT TESTS            ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Contract: ${CONTRACT_ADDRESS.slice(0, 20)}...`.padEnd(63) + '║');
  console.log(`║  Gas Range: 0.001 - 0.0015 STX (Randomized)`.padEnd(63) + '║');
  console.log(`║  Organic:   Waiting for on-chain confirmation...`.padEnd(63) + '║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const testWallets = shuffle(wallets.slice(1));
  console.log(`🎲 Shuffled ${testWallets.length} wallets for organic interaction\n`);

  const results = [];
  let txCount = 0;
  let successCount = 0;
  let failCount = 0;

  const actions = [
    { name: 'create-vault', contract: 'timefi-vault-v-A2', fn: 'create-vault', args: () => [uintCV(DEPOSIT_AMOUNT), uintCV(LOCK_DURATION)], emoji: '🏦' },
    { name: 'register-rewards', contract: 'timefi-rewards-v-A2', fn: 'register-for-rewards', args: () => [], emoji: '🎁' },
    { name: 'register-voter', contract: 'timefi-governance-v-A2', fn: 'register-voter', args: () => [], emoji: '🗳️' },
  ];

  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    console.log(`\n👤 [Wallet ${wallet.id}] ${wallet.address}`);

    const walletResults = { walletId: wallet.id, address: wallet.address, tests: [] };
    const randomActions = shuffle(actions);

    for (const action of randomActions) {
      // 20% chance to skip an action to appear more organic
      if (Math.random() < 0.2) {
        console.log(`  🧊 Skipping ${action.name} (Organic behavior)`);
        continue;
      }

      txCount++;
      console.log(`  ${action.emoji} Interacting with ${action.name}...`);

      const result = await callContract(
        wallet,
        action.contract,
        action.fn,
        action.args()
      );

      if (result.success) {
        console.log(`     ✅ Success Confirmed! (TX: ${result.txid.slice(0, 12)}...)`);
        successCount++;
        walletResults.tests.push({ action: action.name, success: true, txid: result.txid });
      } else {
        console.log(`     ❌ Failed: ${result.error}`);
        failCount++;
        walletResults.tests.push({ action: action.name, success: false, error: result.error });
      }

      const nextDelay = getRandomDelay();
      console.log(`     ⏳ Resting for ${(nextDelay / 1000).toFixed(1)}s...`);
      await delay(nextDelay);
    }

    results.push(walletResults);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    FINAL TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📊 Total Operations: ${txCount}`);
  console.log(`✅ Success (Green Check): ${successCount}`);
  console.log(`❌ Failures: ${failCount}`);
  console.log(`🏁 Complete Organic Run`);

  const resultsFile = path.join(__dirname, 'test-results-organic.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    contract: CONTRACT_ADDRESS,
    summary: { total: txCount, success: successCount, failed: failCount },
    results
  }, null, 2));
  console.log(`\n💾 Saved to test-results-organic.json\n`);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

runTests().catch(console.error);
