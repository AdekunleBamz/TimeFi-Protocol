import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Pause Blocks Top Up", () => {
  it("rejects top-ups while the protocol is paused and preserves TVL", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    const before = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);

    simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], deployer);
    const topUp = simnet.callPublicFn(CONTRACT_NAME, "top-up-vault", [Cl.uint(1), Cl.uint(100_000)], wallet1);
    const after = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);

    expect(before.result).toBeOk(Cl.uint(99_500));
    expect(topUp.result).toBeErr(Cl.uint(109));
    expect(after.result).toBeOk(Cl.uint(99_500));
  });
});
