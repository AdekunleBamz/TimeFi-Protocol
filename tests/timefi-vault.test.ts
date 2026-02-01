import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Basic Operations", () => {
  describe("create-vault", () => {
    it("should create a vault with valid parameters", () => {
      const amount = 1_000_000;
      const lockSecs = 86400;
      const { result } = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(amount), Cl.uint(lockSecs)], wallet1);
      expect(result).toBeOk(Cl.uint(1));
    });
    it("should fail with amount below minimum", () => {
      const { result } = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(5000), Cl.uint(86400)], wallet1);
      expect(result).toBeErr(Cl.uint(103));
    });
    it("should fail with lock below minimum", () => {
      const { result } = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(1_000_000), Cl.uint(1800)], wallet1);
      expect(result).toBeErr(Cl.uint(104));
    });
    it("should fail with lock above maximum", () => {
      const { result } = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(1_000_000), Cl.uint(32_000_000)], wallet1);
      expect(result).toBeErr(Cl.uint(104));
    });
  });

  describe("get-vault", () => {
    it("should return vault details", () => {
      simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(1_000_000), Cl.uint(86400)], wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault", [Cl.uint(1)], wallet1);
      expect(result).toBeOk(expect.anything());
    });
    it("should error for non-existent vault", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault", [Cl.uint(999)], wallet1);
      expect(result).toBeErr(Cl.uint(101));
    });
  });

  describe("is-active", () => {
    it("should return true for active vault", () => {
      simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(1_000_000), Cl.uint(86400)], wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);
      expect(result).toBeOk(Cl.bool(true));
    });
    it("should error for non-existent vault", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(999)], wallet1);
      expect(result).toBeErr(Cl.uint(101));
    });
  });
});
