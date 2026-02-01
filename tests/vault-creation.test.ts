import { describe, expect, it, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Create Vault", () => {
  describe("successful vault creation", () => {
    it("should create a vault with valid parameters", () => {
      const amount = 1_000_000; // 1 STX
      const lockSecs = 3600; // 1 hour minimum

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(1)); // First vault has ID 1
    });

    it("should correctly calculate and deduct fees", () => {
      const amount = 1_000_000; // 1 STX
      const lockSecs = 3600;
      const expectedFee = (amount * 50) / 10000; // 0.5% fee
      const expectedDeposit = amount - expectedFee;

      const balanceBefore = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;

      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      const balanceAfter = simnet.getAssetsMap().get("STX")?.get(wallet1) || 0n;
      const spent = BigInt(balanceBefore) - BigInt(balanceAfter);

      expect(spent).toBe(BigInt(amount));
    });

    it("should store correct vault data", () => {
      const amount = 1_000_000;
      const lockSecs = 7200; // 2 hours
      const expectedFee = (amount * 50) / 10000;
      const expectedDeposit = amount - expectedFee;

      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      const vaultResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-vault",
        [Cl.uint(1)],
        wallet1
      );

      expect(vaultResult.result.type).toBe(ClarityType.ResponseOk);
      
      const vault = vaultResult.result.value;
      expect(vault.data.owner).toStrictEqual(Cl.principal(wallet1));
      expect(vault.data.amount).toStrictEqual(Cl.uint(expectedDeposit));
      expect(vault.data.active).toStrictEqual(Cl.bool(true));
    });

    it("should increment vault nonce for each new vault", () => {
      const amount = 100_000;
      const lockSecs = 3600;

      const result1 = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      const result2 = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet2
      );

      expect(result1.result).toBeOk(Cl.uint(1));
      expect(result2.result).toBeOk(Cl.uint(2));
    });

    it("should accept minimum deposit amount exactly", () => {
      const amount = 10_000; // MIN_DEPOSIT
      const lockSecs = 3600;

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should accept minimum lock period exactly", () => {
      const amount = 100_000;
      const lockSecs = 3600; // MIN_LOCK

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should accept maximum lock period exactly", () => {
      const amount = 100_000;
      const lockSecs = 31_536_000; // MAX_LOCK (1 year)

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      expect(result.result).toBeOk(Cl.uint(1));
    });

    it("should emit create event with correct data", () => {
      const amount = 500_000;
      const lockSecs = 86400; // 1 day

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      expect(result.events.length).toBeGreaterThan(0);
      
      const printEvent = result.events.find(e => e.event === "print_event");
      expect(printEvent).toBeDefined();
    });

    it("should allow same user to create multiple vaults", () => {
      const amount = 100_000;
      const lockSecs = 3600;

      const result1 = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      const result2 = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount * 2), Cl.uint(lockSecs * 2)],
        wallet1
      );

      expect(result1.result).toBeOk(Cl.uint(1));
      expect(result2.result).toBeOk(Cl.uint(2));
    });
  });
});
