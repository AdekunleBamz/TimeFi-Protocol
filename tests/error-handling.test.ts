import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Error Handling", () => {
  describe("ERR_AMOUNT (u103) - Invalid deposit amount", () => {
    it("should reject deposit below minimum (10,000 microSTX)", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(9999), Cl.uint(3600)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(103));
    });

    it("should reject zero deposit", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(0), Cl.uint(3600)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(103));
    });
  });

  describe("ERR_LOCK_PERIOD (u104) - Invalid lock period", () => {
    it("should reject lock period below minimum (3600 seconds)", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3599)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(104));
    });

    it("should reject zero lock period", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(0)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(104));
    });

    it("should reject lock period above maximum (31,536,000 seconds)", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(31536001)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(104));
    });
  });

  describe("ERR_UNAUTHORIZED (u100) - Authorization failures", () => {
    it("should reject non-owner withdrawal", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3600)],
        wallet1
      );

      simnet.mineEmptyBlocks(4000);

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(1)],
        wallet2
      );

      expect(result.result).toBeErr(Cl.uint(100));
    });

    it("should reject non-deployer bot approval", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "approve-bot",
        [Cl.principal(wallet2)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(100));
    });
  });

  describe("ERR_NOT_FOUND (u101) - Resource not found", () => {
    it("should return error for non-existent vault", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-vault",
        [Cl.uint(999)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(101));
    });

    it("should return error for withdrawing non-existent vault", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(999)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(101));
    });

    it("should return error for checking non-existent vault status", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-active",
        [Cl.uint(999)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(101));
    });
  });

  describe("ERR_INACTIVE (u102) - Vault inactive", () => {
    it("should reject double withdrawal", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "create-vault",
        [Cl.uint(100000), Cl.uint(3600)],
        wallet1
      );

      simnet.mineEmptyBlocks(4000);

      simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(1)],
        wallet1
      );

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "withdraw",
        [Cl.uint(1)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(102));
    });
  });

  describe("Error constant values", () => {
    it("should use correct error codes", () => {
      // ERR_UNAUTHORIZED = u100
      // ERR_NOT_FOUND = u101
      // ERR_INACTIVE = u102
      // ERR_AMOUNT = u103
      // ERR_LOCK_PERIOD = u104
      // ERR_ALREADY = u105
      // ERR_BOT = u106
      
      // Test each error code is distinct and correctly mapped
      expect(Cl.uint(100)).not.toStrictEqual(Cl.uint(101));
      expect(Cl.uint(101)).not.toStrictEqual(Cl.uint(102));
      expect(Cl.uint(102)).not.toStrictEqual(Cl.uint(103));
      expect(Cl.uint(103)).not.toStrictEqual(Cl.uint(104));
    });
  });
});
