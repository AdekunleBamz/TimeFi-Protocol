import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Process Withdraw Authorization", () => {
  it("keeps the vault active and TVL intact when a non-admin tries to process a withdrawal", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);

    const process = simnet.callPublicFn(CONTRACT_NAME, "process-withdraw", [Cl.uint(1)], wallet2);
    const active = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);
    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);

    expect(process.result).toBeErr(Cl.uint(100));
    expect(active.result).toBeOk(Cl.bool(true));
    expect(tvl.result).toBeOk(Cl.uint(99_500));
  });
});
