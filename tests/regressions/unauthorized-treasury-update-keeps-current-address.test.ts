import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Treasury Authorization", () => {
  it("keeps treasury unchanged after unauthorized set-treasury attempt", () => {
    const update = simnet.callPublicFn(CONTRACT_NAME, "set-treasury", [Cl.principal(wallet2)], wallet1);
    expect(update.result).toBeErr(Cl.uint(100));

    const treasury = simnet.callReadOnlyFn(CONTRACT_NAME, "get-treasury", [], wallet1);
    expect(treasury.result).toBeOk(Cl.principal(deployer));
  });
});
