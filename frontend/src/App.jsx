import { useState } from 'react';

function App() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="app">
      <header>
        <h1>TimeFi Protocol</h1>
        <p>Time-locked vaults on Stacks</p>
      </header>

      <main>
        {!connected ? (
          <div className="connect-section">
            <h2>Connect Your Wallet</h2>
            <button onClick={() => setConnected(true)}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="vault-section">
            <h2>Create Vault</h2>
            <form>
              <label>
                Amount (STX):
                <input type="number" min="0.01" step="0.01" />
              </label>
              <label>
                Lock Period:
                <select>
                  <option value="3600">1 Hour</option>
                  <option value="86400">1 Day</option>
                  <option value="604800">1 Week</option>
                  <option value="2592000">1 Month</option>
                  <option value="31536000">1 Year</option>
                </select>
              </label>
              <button type="submit">Create Vault</button>
            </form>
          </div>
        )}
      </main>

      <footer>
        <p>Built on Stacks with Clarity 4</p>
      </footer>
    </div>
  );
}

export default App;
