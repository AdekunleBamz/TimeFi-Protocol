import React, { useMemo, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { useBlockHeight } from '../hooks/useBlockHeight';
import { validateVaultCreation } from '../utils/validation';
import { LOCK_PERIODS } from '../config/contracts';
import { estimateFee } from '../services/transactions';
import { useToast } from './Toast';
import './CreateVaultForm.css';

/**
 * Form for creating new time-locked vaults
 */
export function CreateVaultForm({ onSuccess, onClose }) {
  const { balance, isConnected } = useWallet();
  const { createVault, loading } = useContract();
  const { blockHeight } = useBlockHeight();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(null);
  const [errors, setErrors] = useState({});

  const balanceInSTX = balance ? balance / 1_000_000 : 0;
  const feeReserveSTX = estimateFee('create-vault') / 1_000_000;
  const spendableBalance = Math.max(balanceInSTX - feeReserveSTX, 0);
  const selectedPeriod = useMemo(
    () => Object.values(LOCK_PERIODS).find((period) => period.blocks === lockPeriod),
    [lockPeriod]
  );
  const parsedAmount = Number(amount || 0);
  const expectedRewards = selectedPeriod && parsedAmount > 0
    ? (parsedAmount * selectedPeriod.apy) / 100
    : 0;
  const unlockDays = selectedPeriod ? Math.ceil(selectedPeriod.blocks / 144) : null;
  const unlockBlock = selectedPeriod && blockHeight ? blockHeight + selectedPeriod.blocks : null;

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
      await createVault(parseFloat(amount), lockPeriod, {
        onFinish: ({ txId }) => {
          toast.success(`Vault creation submitted: ${txId.slice(0, 10)}...`);
          setAmount('');
          setLockPeriod(null);
          setErrors({});
          onSuccess?.(txId);
        },
        onCancel: () => {
          toast.info('Transaction cancelled');
        },
      });
    } catch (error) {
      setErrors({ submit: error.message });
      toast.error(error.message || 'Unable to create vault');
    }
  };

  const handleMaxClick = () => {
    setAmount(spendableBalance.toFixed(6));
    setErrors(prev => ({ ...prev, amount: null }));
  };

  const lockPeriodOptions = Object.entries(LOCK_PERIODS).map(([key, period]) => ({
    key,
    label: period.label,
    blocks: period.blocks,
    apy: period.apy,
  }));
  const maxApy = Math.max(...lockPeriodOptions.map((option) => option.apy));

  return (
    <form className="create-vault-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label className="form-label">
          Amount to Lock
          <span className="form-balance">
            Balance: {balanceInSTX.toLocaleString()} STX (reserving {feeReserveSTX.toFixed(3)} STX fee)
          </span>
        </label>
        
        <div className="form-input-group">
          <input
            type="number"
            className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
            placeholder="0.00"
            value={amount}
            min="0"
            step="0.000001"
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors(prev => ({ ...prev, amount: null }));
            }}
            aria-invalid={Boolean(errors.amount)}
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

        <div className="form-quick-amounts">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <button
              key={ratio}
              type="button"
              className="form-quick-amount"
              onClick={() => {
                setAmount((spendableBalance * ratio).toFixed(6));
                setErrors(prev => ({ ...prev, amount: null }));
              }}
              disabled={loading || spendableBalance <= 0}
            >
              {Math.round(ratio * 100)}%
            </button>
          ))}
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
              {option.apy === maxApy && (
                <span className="lock-period-badge">Best yield</span>
              )}
              <span className="lock-period-label">{option.label}</span>
              <span className="lock-period-apy">{option.apy}% APY</span>
              {lockPeriod === option.blocks && <span className="lock-period-state">Selected</span>}
            </button>
          ))}
        </div>
        
        {errors.lockPeriod && (
          <span className="form-error">{errors.lockPeriod}</span>
        )}
      </div>

      {selectedPeriod && parsedAmount > 0 && (
        <div className="vault-preview">
          <div className="vault-preview-row">
            <span>Total you are locking</span>
            <strong>{parsedAmount.toFixed(6)} STX</strong>
          </div>
          <div className="vault-preview-row">
            <span>Estimated rewards</span>
            <strong>~{expectedRewards.toFixed(6)} STX</strong>
          </div>
          <div className="vault-preview-row">
            <span>Unlock ETA</span>
            <strong>
              ~{unlockDays} days
              {unlockBlock ? ` (block #${unlockBlock.toLocaleString()})` : ''}
            </strong>
          </div>
          <div className="vault-preview-row">
            <span>Wallet left after lock + fee</span>
            <strong>{Math.max(balanceInSTX - parsedAmount - feeReserveSTX, 0).toFixed(6)} STX</strong>
          </div>
        </div>
      )}

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
          disabled={!isConnected || loading || !amount || !lockPeriod}
        >
          {loading ? 'Awaiting wallet...' : 'Create Vault'}
        </button>
      </div>
    </form>
  );
}

export default CreateVaultForm;
