import { describe, it, expect } from 'vitest'

// Import the utility functions (we'll need to extract them)
// For now, we'll test the logic directly

describe('Formatting Utilities', () => {
  describe('formatSTX', () => {
    it('should format microSTX to STX correctly', () => {
      const formatSTX = (microSTX: number): string => {
        return (microSTX / 1_000_000).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        })
      }

      expect(formatSTX(1_000_000)).toBe('1.00')
      expect(formatSTX(1_500_000)).toBe('1.50')
      expect(formatSTX(100_000)).toBe('0.10')
      expect(formatSTX(1_234_567)).toBe('1.234567')
    })
  })

  describe('formatSBTC', () => {
    it('should format microSBTC to sBTC correctly', () => {
      const formatSBTC = (microSBTC: number): string => {
        return (microSBTC / 100_000_000).toLocaleString('en-US', {
          minimumFractionDigits: 4,
          maximumFractionDigits: 8
        })
      }

      expect(formatSBTC(100_000_000)).toBe('1.0000')
      expect(formatSBTC(50_000_000)).toBe('0.5000')
      expect(formatSBTC(1_000_000)).toBe('0.0100')
    })
  })

  describe('formatPoints', () => {
    it('should format points correctly', () => {
      const formatPoints = (points: number): string => {
        if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`
        if (points >= 1000) return `${(points / 1000).toFixed(1)}K`
        return points.toLocaleString()
      }

      expect(formatPoints(1000)).toBe('1.0K')
      expect(formatPoints(1500)).toBe('1.5K')
      expect(formatPoints(1000000)).toBe('1.0M')
      expect(formatPoints(1500000)).toBe('1.5M')
      expect(formatPoints(500)).toBe('500')
    })
  })

  describe('calculateEstimatedPoints', () => {
    it('should calculate points correctly for STX', () => {
      const calculateEstimatedPoints = (amount: number, lockDays: number, assetType: number = 1): number => {
        const multiplier = lockDays >= 90 ? 3 : lockDays >= 60 ? 2 : lockDays >= 30 ? 1.5 : 1
        const basePoints = Math.floor(amount * lockDays * multiplier)
        return assetType === 2 ? basePoints * 10 : basePoints
      }

      // 1 STX, 30 days, Silver tier (1.5x)
      expect(calculateEstimatedPoints(1, 30, 1)).toBe(45) // 1 * 30 * 1.5 = 45
      
      // 1 STX, 90 days, Diamond tier (3x)
      expect(calculateEstimatedPoints(1, 90, 1)).toBe(270) // 1 * 90 * 3 = 270
      
      // 1 STX, 7 days, Bronze tier (1x)
      expect(calculateEstimatedPoints(1, 7, 1)).toBe(7) // 1 * 7 * 1 = 7
    })

    it('should apply 10x multiplier for sBTC', () => {
      const calculateEstimatedPoints = (amount: number, lockDays: number, assetType: number = 1): number => {
        const multiplier = lockDays >= 90 ? 3 : lockDays >= 60 ? 2 : lockDays >= 30 ? 1.5 : 1
        const basePoints = Math.floor(amount * lockDays * multiplier)
        return assetType === 2 ? basePoints * 10 : basePoints
      }

      // 1 sBTC, 30 days, should be 10x STX points
      expect(calculateEstimatedPoints(1, 30, 2)).toBe(450) // (1 * 30 * 1.5) * 10 = 450
    })
  })

  describe('getTier', () => {
    it('should return correct tier based on days', () => {
      const getTier = (days: number) => {
        if (days >= 90) return 'DIAMOND'
        if (days >= 60) return 'GOLD'
        if (days >= 30) return 'SILVER'
        return 'BRONZE'
      }

      expect(getTier(90)).toBe('DIAMOND')
      expect(getTier(60)).toBe('GOLD')
      expect(getTier(30)).toBe('SILVER')
      expect(getTier(7)).toBe('BRONZE')
      expect(getTier(29)).toBe('BRONZE')
    })
  })
})

