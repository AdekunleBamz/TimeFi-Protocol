import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Treasury Updates", () => {
  it("reflects updated treasury principal in read-only getter", () => {
    simnet.callPublicFn(CONTRACT_NAME, "set-treasury", [Cl.principal(wallet2)], deployer);
    const treasury = simnet.callReadOnlyFn(CONTRACT_NAME, "get-treasury", [], wallet2);
    expect(treasury.result).toBeOk(Cl.principal(wallet2));
  });
});
