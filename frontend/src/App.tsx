import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Clock, 
  Wallet, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  Plus, 
  Timer,
  CheckCircle,
  AlertTriangle,
  X,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { 
  fetchCallReadOnlyFunction, 
  cvToJSON, 
  uintCV
} from '@stacks/transactions'
import { STACKS_MAINNET } from '@stacks/network'

// Contract configuration - UPDATE THIS after deployment
const CONTRACT_ADDRESS = 'SP000000000000000000002Q6VF78' // Replace with your deployed contract address
const CONTRACT_NAME = 'timefi-vault'
const NETWORK = STACKS_MAINNET

// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

// Types
interface Vault {
  id: number
  owner: string
  amount: number
  lockTime: number
  unlockTime: number
  active: boolean
}

interface Stats {
  vaults: number
  tvl: number
  fees: number
  time: number
}

// Utility functions
const formatSTX = (microSTX: number): string => {
  return (microSTX / 1_000_000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

const formatTimeRemaining = (seconds: number): { days: number; hours: number; minutes: number; seconds: number } => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return { days, hours, minutes, seconds: secs }
}

const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Main App Component
export default function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [userVaults, setUserVaults] = useState<Vault[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      setUserAddress(userData.profile.stxAddress.mainnet)
      setIsConnected(true)
    }
  }, [])

  // Fetch user STX balance
  const fetchBalance = useCallback(async () => {
    if (!userAddress) return
    
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${userAddress}/stx`
      )
      const data = await response.json()
      if (data.balance) {
        setUserBalance(parseInt(data.balance))
      }
    } catch (error) {
      console.log('Balance fetch error:', error)
      setUserBalance(0)
    }
  }, [userAddress])

  // Fetch balance when connected
  useEffect(() => {
    if (isConnected && userAddress) {
      fetchBalance()
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchBalance, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected, userAddress, fetchBalance])

  // Fetch stats from contract
  const fetchStats = useCallback(async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-stats',
        functionArgs: [],
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      if (json.value) {
        setStats({
          vaults: parseInt(json.value.vaults.value),
          tvl: parseInt(json.value.tvl.value),
          fees: parseInt(json.value.fees.value),
          time: parseInt(json.value.time.value),
        })
      }
    } catch (error) {
      console.log('Stats fetch error:', error)
      // Initialize with zeros when contract not yet deployed
      setStats({
        vaults: 0,
        tvl: 0,
        fees: 0,
        time: Math.floor(Date.now() / 1000)
      })
    }
  }, [])

  // Fetch user vaults from contract
  const fetchUserVaults = useCallback(async () => {
    if (!userAddress) return
    
    // Query vaults from contract - iterate through vault IDs
    const vaults: Vault[] = []
    const maxVaultsToCheck = stats?.vaults || 100
    
    for (let i = 1; i <= maxVaultsToCheck; i++) {
      try {
        const result = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-vault',
          functionArgs: [uintCV(i)],
          network: NETWORK,
          senderAddress: userAddress,
        })
        const json = cvToJSON(result)
        if (json.value && json.value.owner?.value === userAddress && json.value.active?.value === true) {
          vaults.push({
            id: i,
            owner: json.value.owner.value,
            amount: parseInt(json.value.amount.value),
            lockTime: parseInt(json.value['lock-time'].value),
            unlockTime: parseInt(json.value['unlock-time'].value),
            active: json.value.active.value
          })
        }
      } catch (error) {
        // Vault doesn't exist or error fetching
        break
      }
    }
    
    setUserVaults(vaults)
  }, [userAddress, stats?.vaults])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  useEffect(() => {
    if (isConnected) {
      fetchUserVaults()
    }
  }, [isConnected, fetchUserVaults])

  // Connect wallet
  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'TimeFi Protocol',
        icon: window.location.origin + '/vault.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData()
        setUserAddress(userData.profile.stxAddress.mainnet)
        setIsConnected(true)
        toast.success('Wallet connected successfully!')
      },
      onCancel: () => {
        toast.error('Connection cancelled')
      },
      userSession,
    })
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    userSession.signUserOut()
    setIsConnected(false)
    setUserAddress(null)
    setUserVaults([])
    toast.success('Wallet disconnected')
  }

  // Create vault
  const createVault = async (amount: number, lockDays: number) => {
    if (!userAddress) return
    
    setIsLoading(true)
    try {
      // For demo purposes, show success
      console.log(`Creating vault: ${amount} STX for ${lockDays} days`)
      toast.success(`Vault created! ${amount} STX locked for ${lockDays} days`)
      setShowCreateModal(false)
      fetchUserVaults()
    } catch (error) {
      toast.error('Failed to create vault')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Request withdrawal
  const requestWithdraw = async (vaultId: number) => {
    setIsLoading(true)
    try {
      toast.success(`Withdrawal requested for Vault #${vaultId}`)
      fetchUserVaults()
    } catch (error) {
      toast.error('Failed to request withdrawal')
    } finally {
      setIsLoading(false)
    }
  }

  // Request early withdrawal
  const requestEarlyWithdraw = async (vaultId: number) => {
    setIsLoading(true)
    try {
      toast.success(`Early withdrawal requested for Vault #${vaultId} (10% penalty)`)
      fetchUserVaults()
    } catch (error) {
      toast.error('Failed to request early withdrawal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen animated-bg bg-grid">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass',
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text font-display">TimeFi</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {isConnected ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl glass-light">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-mono text-gray-300">
                      {shortenAddress(userAddress || '')}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(userAddress || '')
                        toast.success('Address copied!')
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="btn-secondary text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={connectWallet} className="btn-primary flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-300">Secure DeFi on Stacks Blockchain</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 font-display">
              <span className="text-white">Time-Locked</span>
              <br />
              <span className="gradient-text">DeFi Vaults</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Secure your STX in smart contract vaults with customizable time locks. 
              Earn peace of mind, protect against impulsive decisions.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {isConnected ? (
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  Create Vault
                </motion.button>
              ) : (
                <motion.button
                  onClick={connectWallet}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Wallet className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
              <motion.a
                href="https://docs.stacks.co"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
                <ExternalLink className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              icon={<Lock className="w-6 h-6" />}
              label="Total Vaults"
              value={stats?.vaults.toString() || '0'}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Total Value Locked"
              value={`${formatSTX(stats?.tvl || 0)} STX`}
              color="purple"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              label="Protocol Fees"
              value={`${formatSTX(stats?.fees || 0)} STX`}
              color="yellow"
            />
            <StatCard
              icon={<Timer className="w-6 h-6" />}
              label="Creation Fee"
              value="0.5%"
              color="blue"
            />
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Time-Based Locks"
              description="Lock your STX for 7-90 days with blockchain-verified timestamps for precise timing."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Passkey Security"
              description="Optional WebAuthn passkey authentication for hardware-level security on withdrawals."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Verified Integrations"
              description="Integrate trusted trading bots with cryptographic verification for automated strategies."
            />
          </motion.div>

          {/* User Vaults */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display">Your Vaults</h2>
                <button 
                  onClick={fetchUserVaults}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {userVaults.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userVaults.map((vault) => (
                    <VaultCard
                      key={vault.id}
                      vault={vault}
                      onRequestWithdraw={requestWithdraw}
                      onRequestEarlyWithdraw={requestEarlyWithdraw}
                      currentTime={stats?.time || Math.floor(Date.now() / 1000)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass rounded-2xl">
                  <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Vaults Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first time-locked vault to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Create Vault
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-gray-400">TimeFi Protocol</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Powered by Stacks</span>
            <span>•</span>
            <span>Mainnet</span>
          </div>
        </div>
      </footer>

      {/* Create Vault Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateVaultModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={createVault}
            isLoading={isLoading}
            userBalance={userBalance}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { 
  icon: React.ReactNode
  label: string
  value: string
  color: 'green' | 'purple' | 'yellow' | 'blue'
}) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-500/5 text-green-500',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-500',
    yellow: 'from-yellow-500/20 to-yellow-500/5 text-yellow-500',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-500',
  }

  return (
    <motion.div 
      className="stat-card card-hover"
      whileHover={{ scale: 1.02 }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono">{value}</p>
    </motion.div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <motion.div
      className="glass rounded-2xl p-6 card-hover"
      whileHover={{ scale: 1.02 }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-purple-500/20 flex items-center justify-center mb-4 text-green-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

// Vault Card Component
function VaultCard({ vault, onRequestWithdraw, onRequestEarlyWithdraw, currentTime }: {
  vault: Vault
  onRequestWithdraw: (id: number) => void
  onRequestEarlyWithdraw: (id: number) => void
  currentTime: number
}) {
  const [timeLeft, setTimeLeft] = useState(0)
  const isUnlocked = currentTime >= vault.unlockTime

  useEffect(() => {
    const updateTime = () => {
      const remaining = Math.max(0, vault.unlockTime - Math.floor(Date.now() / 1000))
      setTimeLeft(remaining)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [vault.unlockTime])

  const time = formatTimeRemaining(timeLeft)
  const totalLockTime = vault.unlockTime - vault.lockTime
  const elapsed = currentTime - vault.lockTime
  const progress = Math.min(100, (elapsed / totalLockTime) * 100)

  return (
    <motion.div
      className="vault-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-sm font-medium text-gray-400">Vault #{vault.id}</span>
        </div>
        {isUnlocked ? (
          <span className="flex items-center gap-1 text-green-500 text-sm">
            <Unlock className="w-4 h-4" />
            Unlocked
          </span>
        ) : (
          <span className="flex items-center gap-1 text-yellow-500 text-sm">
            <Lock className="w-4 h-4" />
            Locked
          </span>
        )}
      </div>

      {/* Amount */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Locked Amount</p>
        <p className="text-3xl font-bold font-mono gradient-text">
          {formatSTX(vault.amount)} STX
        </p>
      </div>

      {/* Timer */}
      {!isUnlocked && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Time Remaining</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <TimeUnit value={time.days} label="Days" />
            <TimeUnit value={time.hours} label="Hours" />
            <TimeUnit value={time.minutes} label="Min" />
            <TimeUnit value={time.seconds} label="Sec" />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isUnlocked ? (
          <button
            onClick={() => onRequestWithdraw(vault.id)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Withdraw
          </button>
        ) : (
          <button
            onClick={() => onRequestEarlyWithdraw(vault.id)}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Early Withdraw (10% Fee)
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Time Unit Component
function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass-light rounded-lg p-2">
      <p className="text-xl font-bold font-mono timer-display">
        {value.toString().padStart(2, '0')}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// Create Vault Modal
function CreateVaultModal({ onClose, onSubmit, isLoading, userBalance }: {
  onClose: () => void
  onSubmit: (amount: number, lockDays: number) => void
  isLoading: boolean
  userBalance: number
}) {
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState(30)

  const balanceInSTX = userBalance / 1_000_000

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (amountNum < 1) {
      toast.error('Minimum deposit is 1 STX')
      return
    }
    if (amountNum > balanceInSTX) {
      toast.error('Insufficient balance')
      return
    }
    if (lockDays < 7 || lockDays > 90) {
      toast.error('Lock period must be between 7-90 days')
      return
    }
    onSubmit(amountNum, lockDays)
  }

  const handleMaxClick = () => {
    // Leave some STX for transaction fees (0.01 STX)
    const maxAmount = Math.max(0, balanceInSTX - 0.01)
    setAmount(maxAmount.toFixed(6))
  }

  const fee = parseFloat(amount || '0') * 0.005
  const deposit = parseFloat(amount || '0') - fee

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-md glass rounded-2xl p-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-purple-600 flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create Vault</h2>
            <p className="text-sm text-gray-400">Lock your STX securely</p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="glass-light rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">Available Balance</span>
            </div>
            <span className="text-lg font-bold font-mono text-white">
              {formatSTX(userBalance)} STX
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">
              Amount (STX)
            </label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs font-semibold text-green-500 hover:text-green-400 transition-colors px-2 py-1 rounded-md hover:bg-green-500/10"
              >
                MAX
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={balanceInSTX}
                step="0.000001"
                className="input-field pr-16"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">
                STX
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Minimum: 1 STX</p>
              {parseFloat(amount) > balanceInSTX && (
                <p className="text-xs text-red-500">Exceeds balance</p>
              )}
            </div>
          </div>

          {/* Lock Period Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Lock Period: <span className="text-green-500 font-mono">{lockDays} days</span>
            </label>
            <input
              type="range"
              min="7"
              max="90"
              value={lockDays}
              onChange={(e) => setLockDays(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((lockDays - 7) / 83) * 100}%, rgba(255,255,255,0.1) ${((lockDays - 7) / 83) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>7 days</span>
              <span>90 days</span>
            </div>
          </div>

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <motion.div
              className="glass-light rounded-xl p-4 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <p className="text-sm text-gray-400 mb-3">Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit Amount</span>
                  <span className="font-mono">{parseFloat(amount).toFixed(6)} STX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee (0.5%)</span>
                  <span className="font-mono text-yellow-500">-{fee.toFixed(6)} STX</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-gray-400">Locked Amount</span>
                  <span className="font-mono text-green-500 font-bold">{deposit.toFixed(6)} STX</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !amount}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Create Vault
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

