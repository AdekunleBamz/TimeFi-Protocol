import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Bot Approval System", () => {
  describe("is-bot function", () => {
    it("should return false for regular wallet address", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-bot",
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result.result).toStrictEqual(Cl.bool(false));
    });

    it("should return false for deployer address", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-bot",
        [Cl.principal(deployer)],
        deployer
      );

      expect(result.result).toStrictEqual(Cl.bool(false));
    });
  });

  describe("approve-bot function", () => {
    it("should only allow deployer to approve bots", () => {
      // Non-deployer should fail
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "approve-bot",
        [Cl.principal(wallet2)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("should return ERR_BOT for non-contract principals", () => {
      // Regular wallet addresses don't have contract hashes
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "approve-bot",
        [Cl.principal(wallet1)],
        deployer
      );

      // contract-hash? returns none for regular principals
      expect(result.result).toBeErr(Cl.uint(106)); // ERR_BOT
    });
  });

  describe("bot verification workflow", () => {
    it("should correctly identify unapproved principals", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-bot",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result.result).toStrictEqual(Cl.bool(false));
    });
  });
});
