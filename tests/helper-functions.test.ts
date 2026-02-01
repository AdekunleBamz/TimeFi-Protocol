import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Helper Functions", () => {
  describe("get-total-fees", () => {
    it("should return 0 initially", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-fees",
        [],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should track accumulated fees", () => {
      const amount = 1_000_000;
      const lockSecs = 3600;
      const expectedFee = (amount * 50) / 10000;

      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(amount), Cl.uint(lockSecs)],
        wallet1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-fees",
        [],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(expectedFee));
    });
  });

  describe("get-vault-count", () => {
    it("should return 0 initially", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-vault-count",
        [],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should increment with each vault", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3600)],
        wallet1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-vault-count",
        [],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(1));
    });
  });

  describe("get-treasury", () => {
    it("should return deployer address initially", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-treasury",
        [],
        wallet1
      );
      expect(result.result).toBeOk(Cl.principal(deployer));
    });
  });

  describe("protocol constants", () => {
    it("get-min-deposit should return 10000", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-min-deposit",
        [],
        wallet1
      );
      expect(result.result).toStrictEqual(Cl.uint(10000));
    });

    it("get-min-lock should return 3600", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-min-lock",
        [],
        wallet1
      );
      expect(result.result).toStrictEqual(Cl.uint(3600));
    });

    it("get-max-lock should return 31536000", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-max-lock",
        [],
        wallet1
      );
      expect(result.result).toStrictEqual(Cl.uint(31536000));
    });

    it("get-fee-bps should return 50", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-fee-bps",
        [],
        wallet1
      );
      expect(result.result).toStrictEqual(Cl.uint(50));
    });
  });

  describe("calculate-fee", () => {
    it("should calculate 0.5% fee correctly", () => {
      const amount = 1_000_000;
      const expectedFee = (amount * 50) / 10000;

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "calculate-fee",
        [Cl.uint(amount)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(expectedFee));
    });
  });

  describe("calculate-deposit-after-fee", () => {
    it("should calculate deposit amount after fee", () => {
      const amount = 1_000_000;
      const expectedFee = (amount * 50) / 10000;
      const expectedDeposit = amount - expectedFee;

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "calculate-deposit-after-fee",
        [Cl.uint(amount)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(expectedDeposit));
    });
  });

  describe("can-withdraw", () => {
    it("should return false for locked vault", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3600)],
        wallet1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "can-withdraw",
        [Cl.uint(1)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(false));
    });

    it("should return ERR_NOT_FOUND for non-existent vault", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "can-withdraw",
        [Cl.uint(999)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(101));
    });
  });

  describe("is-vault-owner", () => {
    it("should return true for correct owner", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3600)],
        wallet1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-vault-owner",
        [Cl.uint(1), Cl.principal(wallet1)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should return false for incorrect owner", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3600)],
        wallet1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-vault-owner",
        [Cl.uint(1), Cl.principal(deployer)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(false));
    });
  });
});
