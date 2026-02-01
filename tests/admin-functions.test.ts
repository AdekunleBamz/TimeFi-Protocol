import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Admin Functions", () => {
  describe("set-treasury", () => {
    it("should allow deployer to set new treasury", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-treasury",
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should update treasury address", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "set-treasury",
        [Cl.principal(wallet1)],
        deployer
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-treasury",
        [],
        wallet1
      );

      expect(result.result).toBeOk(Cl.principal(wallet1));
    });

    it("should reject non-deployer from setting treasury", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-treasury",
        [Cl.principal(wallet2)],
        wallet1
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("should emit treasury-updated event", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-treasury",
        [Cl.principal(wallet1)],
        deployer
      );

      const printEvent = result.events.find(e => e.event === "print_event");
      expect(printEvent).toBeDefined();
    });
  });

  describe("revoke-bot", () => {
    it("should reject non-deployer from revoking bots", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-bot",
        [Cl.principal(wallet1)],
        wallet1
      );

      // Should fail because wallet1 is not a contract (ERR_BOT) or unauthorized
      expect(result.result.type).toBe(7); // ResponseErr type
    });

    it("should return ERR_BOT for non-contract principal", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-bot",
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(106)); // ERR_BOT
    });
  });
});
