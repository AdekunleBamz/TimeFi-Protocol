import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

// @ts-ignore - simnet is provided by vitest-environment-clarinet
declare const simnet: any;

describe("Diamond Hands Protocol V3 - Contract Tests", () => {
  describe("Vault Creation", () => {
    it("should create STX vault with valid parameters", () => {
      const wallet1 = simnet.accounts.get("wallet_1")!;
      const amount = 1000000; // 1 STX
      const lockSeconds = 604800; // 7 days
      const vaultName = "test-vault";

      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii(vaultName)
        ],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should reject vault creation with amount below minimum", () => {
      const amount = 100000; // 0.1 STX (below minimum of 1 STX)
      const lockSeconds = 604800;
      const vaultName = "test-vault";

      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii(vaultName)
        ],
        getWallet1()
      );

      expect(result.result).toBeErr(Cl.uint(103)); // ERR_AMOUNT
    });

    it("should reject vault creation with lock period below minimum", () => {
      const amount = 1000000;
      const lockSeconds = 86400; // 1 day (below minimum of 7 days)
      const vaultName = "test-vault";

      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii(vaultName)
        ],
        getWallet1()
      );

      expect(result.result).toBeErr(Cl.uint(104)); // ERR_LOCK_PERIOD
    });

    it("should reject vault creation with empty name", () => {
      const amount = 1000000;
      const lockSeconds = 604800;

      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii("")
        ],
        getWallet1()
      );

      expect(result.result).toBeErr(Cl.uint(108)); // ERR_INVALID_NAME
    });
  });

  describe("Vault Information", () => {
    it("should return vault info after creation", () => {
      const amount = 1000000;
      const lockSeconds = 604800;
      const vaultName = "test-vault";

      // Create vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii(vaultName)
        ],
        wallet1
      );

      // Get vault info
      const result = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-vault-info",
        [Cl.uint(1)],
        getWallet1()
      );

      expect(result.result).toBeOk();
      const vault = result.result.value;
      expect(vault["name"]).toBeAscii(vaultName);
      expect(vault["active"]).toBeBool(true);
    });
  });

  describe("Points System", () => {
    it("should calculate points correctly for Bronze tier (7 days)", () => {
      const amount = 1000000; // 1 STX
      const lockSeconds = 604800; // 7 days

      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii("bronze-vault")
        ],
        getWallet1()
      );

      const vault = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-vault-info",
        [Cl.uint(1)],
        getWallet1()
      ).result.value;

      // Points should be > 0 for Bronze tier
      expect(vault["points-earned"]).toBeUintGreaterThan(0);
    });

    it("should calculate more points for Diamond tier (90 days)", () => {
      const amount = 1000000;

      // Create Bronze vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(604800), // 7 days
          Cl.stringAscii("bronze-vault")
        ],
        getWallet1()
      );

      // Create Diamond vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(7776000), // 90 days
          Cl.stringAscii("diamond-vault")
        ],
        getWallet1()
      );

      const bronzeVault = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-vault-info",
        [Cl.uint(1)],
        getWallet1()
      ).result.value;

      const diamondVault = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-vault-info",
        [Cl.uint(2)],
        getWallet1()
      ).result.value;

      // Diamond vault should have more points
      expect(diamondVault["points-earned"]).toBeUintGreaterThan(bronzeVault["points-earned"]);
    });
  });

  describe("Withdrawal", () => {
    it("should reject withdrawal before unlock time", () => {
      const amount = 1000000;
      const lockSeconds = 604800; // 7 days

      // Create vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii("test-vault")
        ],
        getWallet1()
      );

      // Try to withdraw immediately
      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "withdraw-stx",
        [Cl.uint(1)],
        getWallet1()
      );

      expect(result.result).toBeErr(Cl.uint(105)); // ERR_NOT_UNLOCKED
    });

    it("should allow withdrawal after unlock time", () => {
      const amount = 1000000;
      const lockSeconds = 1; // 1 second for testing

      // Create vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii("test-vault")
        ],
        getWallet1()
      );

      // Advance time by 2 blocks (simnet advances time automatically)
      simnet.mineEmptyBlocks(2);

      // Withdraw should succeed
      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "withdraw-stx",
        [Cl.uint(1)],
        getWallet1()
      );

      expect(result.result).toBeOk();
    });
  });

  describe("Early Withdrawal", () => {
    it("should allow early withdrawal with penalty", () => {
      const amount = 1000000;
      const lockSeconds = 604800; // 7 days

      // Create vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(amount),
          Cl.uint(lockSeconds),
          Cl.stringAscii("test-vault")
        ],
        getWallet1()
      );

      // Get initial points
      const vaultBefore = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-vault-info",
        [Cl.uint(1)],
        getWallet1()
      ).result.value;
      const initialPoints = vaultBefore["points-earned"];

      // Early withdraw
      const result = simnet.callPublicFn(
        "diamond-hands-v3",
        "early-withdraw-stx",
        [Cl.uint(1)],
        getWallet1()
      );

      expect(result.result).toBeOk();

      // Check user stats - points should be reduced
      const userStats = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-user-stats",
        [Cl.principal(getWallet1())],
        getWallet1()
      ).result.value;

      // User should have 50% of initial points (50% forfeited)
      expect(userStats["total-points"]).toBeUintLessThan(initialPoints);
    });
  });

  describe("User Stats", () => {
    it("should update user stats after vault creation", () => {
      // Create vault
      simnet.callPublicFn(
        "diamond-hands-v3",
        "create-stx-vault",
        [
          Cl.uint(1000000),
          Cl.uint(604800),
          Cl.stringAscii("vault-1")
        ],
        getWallet1()
      );

      // Get user stats
      const stats = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-user-stats",
        [Cl.principal(getWallet1())],
        getWallet1()
      ).result.value;

      expect(stats["total-vaults"]).toBeUint(1);
      expect(stats["active-vaults"]).toBeUint(1);
      expect(stats["total-points"]).toBeUintGreaterThan(0);
    });
  });

  describe("Protocol Stats", () => {
    it("should return protocol statistics", () => {
      const stats = simnet.callReadOnlyFn(
        "diamond-hands-v3",
        "get-protocol-stats",
        [],
        getWallet1()
      ).result.value;

      expect(stats["total-vaults"]).toBeUint();
      expect(stats["total-tvl-stx"]).toBeUint();
      expect(stats["total-points"]).toBeUint();
    });
  });
});
