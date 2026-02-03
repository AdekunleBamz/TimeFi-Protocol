import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { validateVaultCreation } from '../utils/validation';
import { LOCK_PERIODS } from '../config/contracts';
import './CreateVaultForm.css';

/**
 * Form for creating new time-locked vaults
 */
export function CreateVaultForm({ onSuccess, onClose }) {
  const { balance, isConnected } = useWallet();
  const { createVault, loading } = useContract();
  
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(null);
  const [errors, setErrors] = useState({});

  const balanceInSTX = balance ? balance / 1_000_000 : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateVaultCreation({
      amount,
      lockPeriod,
      balance: balanceInSTX,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await createVault(parseFloat(amount), lockPeriod);
      onSuccess?.();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleMaxClick = () => {
    setAmount(balanceInSTX.toString());
    setErrors(prev => ({ ...prev, amount: null }));
  };

  const lockPeriodOptions = Object.entries(LOCK_PERIODS).map(([key, period]) => ({
    key,
    label: period.label,
    blocks: period.blocks,
    apy: period.apy,
  }));

  return (
    <form className="create-vault-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="form-label">
          Amount to Lock
          <span className="form-balance">
            Balance: {balanceInSTX.toLocaleString()} STX
          </span>
        </label>
        
        <div className="form-input-group">
          <input
            type="number"
            className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors(prev => ({ ...prev, amount: null }));
            }}
            disabled={loading}
          />
          <button
            type="button"
            className="form-max-button"
            onClick={handleMaxClick}
            disabled={loading}
          >
            MAX
          </button>
        </div>
        
        {errors.amount && (
          <span className="form-error">{errors.amount}</span>
        )}
      </div>

      <div className="form-section">
        <label className="form-label">Lock Period</label>
        
        <div className="lock-period-grid">
          {lockPeriodOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`lock-period-option ${lockPeriod === option.blocks ? 'lock-period-selected' : ''}`}
              onClick={() => {
                setLockPeriod(option.blocks);
                setErrors(prev => ({ ...prev, lockPeriod: null }));
              }}
              disabled={loading}
            >
              <span className="lock-period-label">{option.label}</span>
              <span className="lock-period-apy">{option.apy}% APY</span>
            </button>
          ))}
        </div>
        
        {errors.lockPeriod && (
          <span className="form-error">{errors.lockPeriod}</span>
        )}
      </div>

      {errors.submit && (
        <div className="form-error form-error-submit">{errors.submit}</div>
      )}

      <div className="form-actions">
        {onClose && (
          <button
            type="button"
            className="form-button form-button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          className="form-button form-button-primary"
          disabled={!isConnected || loading}
        >
          {loading ? 'Creating...' : 'Create Vault'}
        </button>
      </div>
    </form>
  );
}

export default CreateVaultForm;
