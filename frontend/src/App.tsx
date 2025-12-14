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
  RefreshCw,
  Award,
  Star,
  Gem,
  Trophy
} from 'lucide-react'
import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect'
import { 
  fetchCallReadOnlyFunction, 
  cvToJSON, 
  uintCV,
  stringAsciiCV,
  PostConditionMode
} from '@stacks/transactions'
import { STACKS_MAINNET } from '@stacks/network'

// Contract configuration - Diamond Hands V3 on mainnet
const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N'
const CONTRACT_NAME = 'diamond-hands-v3'
const NETWORK = STACKS_MAINNET

// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

// Types
interface Vault {
  id: number
  owner: string
  name: string
  assetType: number
  amount: number
  lockTime: number
  unlockTime: number
  pointsEarned: number
  active: boolean
}

interface Stats {
  vaults: number
  tvlStx: number
  tvlSbtc: number
  totalPoints: number
  feesStx: number
  time: number
}

interface UserStats {
  totalVaults: number
  activeVaults: number
  totalPoints: number
  totalStxLocked: number
  totalSbtcLocked: number
}

// Tier configuration
const TIERS = {
  BRONZE: { name: 'BRONZE', minDays: 7, maxDays: 29, multiplier: '1x', color: 'text-amber-600', icon: Award },
  SILVER: { name: 'SILVER', minDays: 30, maxDays: 59, multiplier: '1.5x', color: 'text-gray-300', icon: Star },
  GOLD: { name: 'GOLD', minDays: 60, maxDays: 89, multiplier: '2x', color: 'text-yellow-400', icon: Trophy },
  DIAMOND: { name: 'DIAMOND', minDays: 90, maxDays: 90, multiplier: '3x', color: 'text-cyan-400', icon: Gem }
}

const getTier = (days: number) => {
  if (days >= 90) return TIERS.DIAMOND
  if (days >= 60) return TIERS.GOLD
  if (days >= 30) return TIERS.SILVER
  return TIERS.BRONZE
}

// Utility functions
const formatSTX = (microSTX: number): string => {
  return (microSTX / 1_000_000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`
  return points.toLocaleString()
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

// Calculate estimated points
const calculateEstimatedPoints = (amount: number, lockDays: number): number => {
  const multiplier = lockDays >= 90 ? 3 : lockDays >= 60 ? 2 : lockDays >= 30 ? 1.5 : 1
  return Math.floor(amount * lockDays * multiplier)
}

// Main App Component
export default function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
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
      const interval = setInterval(fetchBalance, 60000)
      return () => clearInterval(interval)
    }
  }, [isConnected, userAddress, fetchBalance])

  // Fetch stats from contract
  const fetchStats = useCallback(async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-protocol-stats',
        functionArgs: [],
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      if (json.value) {
        setStats({
          vaults: parseInt(json.value['total-vaults']?.value || '0'),
          tvlStx: parseInt(json.value['total-tvl-stx']?.value || '0'),
          tvlSbtc: parseInt(json.value['total-tvl-sbtc']?.value || '0'),
          totalPoints: parseInt(json.value['total-points']?.value || '0'),
          feesStx: parseInt(json.value['total-fees-stx']?.value || '0'),
          time: parseInt(json.value['current-time']?.value || '0'),
        })
      }
    } catch (error) {
      console.log('Stats fetch error:', error)
      setStats({
        vaults: 0,
        tvlStx: 0,
        tvlSbtc: 0,
        totalPoints: 0,
        feesStx: 0,
        time: Math.floor(Date.now() / 1000)
      })
    }
  }, [])

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    if (!userAddress) return
    
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-stats',
        functionArgs: [stringAsciiCV(userAddress)],
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      })
      const json = cvToJSON(result)
      if (json.value) {
        setUserStats({
          totalVaults: parseInt(json.value['total-vaults']?.value || '0'),
          activeVaults: parseInt(json.value['active-vaults']?.value || '0'),
          totalPoints: parseInt(json.value['total-points']?.value || '0'),
          totalStxLocked: parseInt(json.value['total-stx-locked']?.value || '0'),
          totalSbtcLocked: parseInt(json.value['total-sbtc-locked']?.value || '0'),
        })
      }
    } catch (error) {
      console.log('User stats fetch error:', error)
    }
  }, [userAddress])

  // Fetch user vaults
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [allVaults, setAllVaults] = useState<Vault[]>([])
  
  const fetchAllVaults = useCallback(async () => {
    setIsRefreshing(true)
    console.log('Fetching all vaults...')
    
    try {
      const vaults: Vault[] = []
      const totalVaultCount = stats?.vaults || 10
      
      for (let i = 1; i <= Math.min(totalVaultCount + 5, 50); i++) {
        try {
          if (i > 1) await new Promise(r => setTimeout(r, 250))
          
          const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-vault',
            functionArgs: [uintCV(i)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
          })
          const json = cvToJSON(result)
          
          const vaultData = json.value?.value
          if (vaultData && vaultData.owner) {
            const vault: Vault = {
              id: i,
              owner: vaultData.owner.value,
              name: vaultData.name?.value || `Vault #${i}`,
              assetType: parseInt(vaultData['asset-type']?.value || '1'),
              amount: parseInt(vaultData.amount?.value || '0'),
              lockTime: parseInt(vaultData['lock-time']?.value || '0'),
              unlockTime: parseInt(vaultData['unlock-time']?.value || '0'),
              pointsEarned: parseInt(vaultData['points-earned']?.value || '0'),
              active: vaultData.active?.value === true
            }
            vaults.push(vault)
          }
        } catch (error) {
          continue
        }
      }
      
      setAllVaults(vaults)
      
      if (userAddress) {
        const myVaults = vaults.filter(v => 
          v.owner.toLowerCase() === userAddress.toLowerCase() && v.active
        )
        setUserVaults(myVaults)
        
        if (myVaults.length > 0) {
          toast.success(`Found ${myVaults.length} vault(s)!`)
        }
      }
    } catch (error) {
      console.error('Vault fetch error:', error)
      toast.error('Failed to load vaults')
    } finally {
      setIsRefreshing(false)
    }
  }, [stats?.vaults, userAddress])

  useEffect(() => {
    if (userAddress && allVaults.length > 0) {
      const myVaults = allVaults.filter(v => 
        v.owner.toLowerCase() === userAddress.toLowerCase() && v.active
      )
      setUserVaults(myVaults)
    }
  }, [userAddress, allVaults])
  
  const fetchUserVaults = fetchAllVaults

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [fetchStats])

  useEffect(() => {
    if (isConnected) {
      fetchUserVaults()
      fetchUserStats()
    }
  }, [isConnected, fetchUserVaults, fetchUserStats])

  // Connect wallet
  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Diamond Hands Protocol',
        icon: window.location.origin + '/vault.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData()
        setUserAddress(userData.profile.stxAddress.mainnet)
        setIsConnected(true)
        toast.success('💎 Wallet connected!')
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
    setUserStats(null)
    toast.success('Wallet disconnected')
  }

  // Create vault
  const createVault = async (amount: number, lockDays: number, vaultName: string) => {
    if (!userAddress) {
      toast.error('Please connect wallet first')
      return
    }
    
    setIsLoading(true)
    
    const amountInMicroSTX = Math.floor(amount * 1_000_000)
      const lockSeconds = lockDays * 86400

    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-stx-vault',
        functionArgs: [
          uintCV(amountInMicroSTX),
          uintCV(lockSeconds),
          stringAsciiCV(vaultName.substring(0, 50))
        ],
        postConditionMode: PostConditionMode.Allow,
        network: NETWORK,
        userSession,
        onFinish: (data) => {
          const tier = getTier(lockDays)
          toast.success(
            <div>
              <p>💎 {tier.name} Vault Created!</p>
              <p className="text-xs text-gray-400">Earning {tier.multiplier} points</p>
              <a 
                href={`https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline text-sm"
              >
                View on Explorer
              </a>
            </div>
          )
      setShowCreateModal(false)
          setIsLoading(false)
          setTimeout(() => {
            fetchBalance()
      fetchUserVaults()
            fetchStats()
            fetchUserStats()
          }, 10000)
        },
        onCancel: () => {
          toast.error('Transaction cancelled')
          setIsLoading(false)
        }
      })
    } catch (error: any) {
      console.error('Create vault error:', error)
      toast.error(`Failed: ${error?.message || 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  // Withdraw
  const withdraw = async (vaultId: number) => {
    if (!userAddress) {
      toast.error('Please connect wallet first')
      return
    }
    
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'withdraw-stx',
        functionArgs: [uintCV(vaultId)],
        postConditionMode: PostConditionMode.Allow,
        network: NETWORK,
        userSession,
        onFinish: (data) => {
          toast.success(
            <div>
              <p>💎 Diamond Hands! Vault #{vaultId} withdrawn!</p>
              <p className="text-green-400 text-xs">Points retained forever!</p>
              <a 
                href={`https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline text-sm"
              >
                View on Explorer
              </a>
            </div>
          )
          setIsLoading(false)
          setTimeout(() => {
            fetchBalance()
            fetchUserVaults()
            fetchUserStats()
          }, 10000)
        },
        onCancel: () => {
          toast.error('Transaction cancelled')
          setIsLoading(false)
        }
      })
    } catch (error: any) {
      toast.error(`Failed: ${error?.message || 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  // Early withdraw
  const earlyWithdraw = async (vaultId: number) => {
    if (!userAddress) {
      toast.error('Please connect wallet first')
      return
    }
    
    setIsLoading(true)
    try {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'early-withdraw-stx',
        functionArgs: [uintCV(vaultId)],
        postConditionMode: PostConditionMode.Allow,
        network: NETWORK,
        userSession,
        onFinish: (data) => {
          toast.success(
            <div>
              <p>Paper Hands! Vault #{vaultId} withdrawn early</p>
              <p className="text-yellow-400 text-xs">10% penalty + 50% points lost</p>
              <a 
                href={`https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline text-sm"
              >
                View on Explorer
              </a>
            </div>
          )
          setIsLoading(false)
          setTimeout(() => {
            fetchBalance()
            fetchUserVaults()
            fetchUserStats()
          }, 10000)
        },
        onCancel: () => {
          toast.error('Transaction cancelled')
          setIsLoading(false)
        }
      })
    } catch (error: any) {
      toast.error(`Failed: ${error?.message || 'Unknown error'}`)
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold gradient-text font-display">Diamond Hands</span>
                <span className="text-xs text-gray-500 block">V3</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {isConnected ? (
                <div className="flex items-center gap-4">
                  {userStats && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-mono text-purple-300">
                        {formatPoints(userStats.totalPoints)} pts
                      </span>
                    </div>
                  )}
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
              <Gem className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Lock. Earn. Prove Your Commitment.</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 font-display">
              <span className="text-white">Diamond Hands</span>
              <br />
              <span className="gradient-text">Protocol</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Lock your STX, earn points, prove you're a true HODLer.
              The longer you lock, the more points you earn.
            </p>

            {/* Tier Preview */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {Object.values(TIERS).map((tier) => {
                const Icon = tier.icon
                return (
                  <div key={tier.name} className="flex items-center gap-2 px-3 py-2 rounded-lg glass-light">
                    <Icon className={`w-4 h-4 ${tier.color}`} />
                    <span className={`text-sm font-semibold ${tier.color}`}>{tier.name}</span>
                    <span className="text-xs text-gray-500">{tier.multiplier}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {isConnected ? (
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gem className="w-5 h-5" />
                  Create Diamond Vault
                </motion.button>
              ) : (
                <motion.button
                  onClick={connectWallet}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Wallet className="w-5 h-5" />
                  Start Earning Points
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
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
              value={`${formatSTX(stats?.tvlStx || 0)} STX`}
              color="purple"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              label="Total Points"
              value={formatPoints(stats?.totalPoints || 0)}
              color="yellow"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              label="Creation Fee"
              value="0.25%"
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
              icon={<Gem className="w-8 h-8" />}
              title="Diamond Tiers"
              description="Bronze to Diamond: Lock 7-90 days for 1x-3x point multipliers."
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Earn Points"
              description="Points = Amount × Days × Multiplier. Redeem for future airdrops!"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Non-Custodial"
              description="Your STX stays in the smart contract. Withdraw directly, no admin needed."
            />
          </motion.div>

          {/* User Stats & Vaults */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* User Points Summary */}
              {userStats && userStats.totalPoints > 0 && (
                <div className="mb-8 p-6 glass rounded-2xl">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
                        <Star className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Your Total Points</p>
                        <p className="text-3xl font-bold gradient-text">{formatPoints(userStats.totalPoints)}</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Active Vaults</p>
                        <p className="text-xl font-bold text-green-400">{userStats.activeVaults}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Total Locked</p>
                        <p className="text-xl font-bold text-purple-400">{formatSTX(userStats.totalStxLocked)} STX</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display">Your Diamond Vaults</h2>
                <button 
                  onClick={fetchUserVaults}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {isRefreshing ? (
                <div className="text-center py-16 glass rounded-2xl">
                  <RefreshCw className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Loading Vaults...</h3>
                  <p className="text-gray-500">Fetching your diamond vaults</p>
                </div>
              ) : userVaults.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userVaults.map((vault) => (
                    <VaultCard
                      key={vault.id}
                      vault={vault}
                      onWithdraw={withdraw}
                      onEarlyWithdraw={earlyWithdraw}
                      currentTime={stats?.time || Math.floor(Date.now() / 1000)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass rounded-2xl">
                  <Gem className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Diamond Vaults Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Create your first vault to start earning points!
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Create Diamond Vault
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
            <Gem className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">Diamond Hands Protocol V3</span>
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
    blue: 'from-cyan-500/20 to-cyan-500/5 text-cyan-500',
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
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 text-cyan-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  )
}

// Vault Card Component
function VaultCard({ vault, onWithdraw, onEarlyWithdraw, currentTime }: {
  vault: Vault
  onWithdraw: (id: number) => void
  onEarlyWithdraw: (id: number) => void
  currentTime: number
}) {
  const [timeLeft, setTimeLeft] = useState(0)
  const isUnlocked = currentTime >= vault.unlockTime
  const lockDays = Math.ceil((vault.unlockTime - vault.lockTime) / 86400)
  const tier = getTier(lockDays)
  const TierIcon = tier.icon

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
          <TierIcon className={`w-5 h-5 ${tier.color}`} />
          <span className={`text-sm font-semibold ${tier.color}`}>{tier.name}</span>
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

      {/* Vault Name */}
      <h3 className="text-lg font-bold mb-2 truncate">{vault.name}</h3>

      {/* Points Badge */}
      <div className="mb-4 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-400">Points Earned</span>
          <span className="text-sm font-bold text-purple-300">{formatPoints(vault.pointsEarned)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Locked Amount</p>
        <p className="text-2xl font-bold font-mono gradient-text">
          {formatSTX(vault.amount)} STX
        </p>
      </div>

      {/* Timer */}
      {!isUnlocked && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Time Remaining</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <TimeUnit value={time.days} label="Days" />
            <TimeUnit value={time.hours} label="Hours" />
            <TimeUnit value={time.minutes} label="Min" />
            <TimeUnit value={time.seconds} label="Sec" />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mb-4">
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
      <div className="flex flex-col gap-2">
        {isUnlocked ? (
          <button
            onClick={() => onWithdraw(vault.id)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Claim (Keep Points!)
          </button>
        ) : (
          <button
            onClick={() => onEarlyWithdraw(vault.id)}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Paper Hands (10% + 50% points)
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
      <p className="text-lg font-bold font-mono timer-display">
        {value.toString().padStart(2, '0')}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// Create Vault Modal
function CreateVaultModal({ onClose, onSubmit, isLoading, userBalance }: {
  onClose: () => void
  onSubmit: (amount: number, lockDays: number, vaultName: string) => void
  isLoading: boolean
  userBalance: number
}) {
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState(30)
  const [vaultName, setVaultName] = useState('')

  const balanceInSTX = userBalance / 1_000_000
  const tier = getTier(lockDays)
  const TierIcon = tier.icon

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
    if (!vaultName.trim()) {
      toast.error('Please name your vault')
      return
    }
    onSubmit(amountNum, lockDays, vaultName.trim())
  }

  const handleMaxClick = () => {
    const maxAmount = Math.max(0, balanceInSTX - 0.01)
    setAmount(maxAmount.toFixed(6))
  }

  const fee = parseFloat(amount || '0') * 0.0025
  const deposit = parseFloat(amount || '0') - fee
  const estimatedPoints = calculateEstimatedPoints(deposit, lockDays)

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
        className="relative w-full max-w-md glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
            <Gem className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create Diamond Vault</h2>
            <p className="text-sm text-gray-400">Lock STX & earn points</p>
          </div>
        </div>

        {/* Tier Preview */}
        <div className="glass-light rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TierIcon className={`w-6 h-6 ${tier.color}`} />
              <div>
                <span className={`font-bold ${tier.color}`}>{tier.name} TIER</span>
                <p className="text-xs text-gray-500">{lockDays} days lock</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-purple-400">{tier.multiplier}</span>
              <p className="text-xs text-gray-500">multiplier</p>
            </div>
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
          {/* Vault Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Vault Name
            </label>
            <input
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="e.g., Moon Bag, Retirement Fund"
              maxLength={50}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{vaultName.length}/50 characters</p>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">Amount (STX)</label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs font-semibold text-green-500 hover:text-green-400 transition-colors px-2 py-1 rounded-md hover:bg-green-500/10"
              >
                MAX
              </button>
            </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.000001"
              className="input-field"
                required
              />
          </div>

          {/* Lock Period Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Lock Period: <span className={`font-mono ${tier.color}`}>{lockDays} days</span>
            </label>
            <input
              type="range"
              min="7"
              max="90"
              value={lockDays}
              onChange={(e) => setLockDays(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${((lockDays - 7) / 83) * 100}%, rgba(255,255,255,0.1) ${((lockDays - 7) / 83) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>7d (Bronze)</span>
              <span>30d (Silver)</span>
              <span>60d (Gold)</span>
              <span>90d (Diamond)</span>
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
                  <span className="text-gray-500">Fee (0.25%)</span>
                  <span className="font-mono text-yellow-500">-{fee.toFixed(6)} STX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Locked Amount</span>
                  <span className="font-mono text-green-500">{deposit.toFixed(6)} STX</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Star className="w-4 h-4 text-purple-400" />
                    Estimated Points
                  </span>
                  <span className="font-mono text-purple-400 font-bold">+{formatPoints(estimatedPoints)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !amount || !vaultName.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Gem className="w-5 h-5" />
                Create {tier.name} Vault
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}
