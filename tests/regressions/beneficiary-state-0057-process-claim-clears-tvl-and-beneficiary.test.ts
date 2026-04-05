import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Claim State Cleanup", () => {
  it("deactivates the vault, clears TVL, and removes the beneficiary after processing", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    simnet.mineEmptyBlocks(12_966);

    const process = simnet.callPublicFn(CONTRACT_NAME, "process-beneficiary-claim", [Cl.uint(1)], deployer);
    const active = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);
    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    const beneficiary = simnet.callReadOnlyFn(CONTRACT_NAME, "get-beneficiary", [Cl.uint(1)], wallet1);

    expect(process.result).toBeOk(Cl.bool(true));
    expect(active.result).toBeOk(Cl.bool(false));
    expect(tvl.result).toBeOk(Cl.uint(0));
    expect(beneficiary.result).toBeOk(Cl.none());
  });
});
