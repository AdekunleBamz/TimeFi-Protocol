import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Pause Blocks Lock Extension", () => {
  it("rejects lock extensions while paused and preserves time remaining", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    const before = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);

    simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], deployer);
    const extend = simnet.callPublicFn(CONTRACT_NAME, "extend-lock", [Cl.uint(1), Cl.uint(6)], wallet1);
    const after = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);

    expect(before.result).toBeOk(Cl.uint(6));
    expect(extend.result).toBeErr(Cl.uint(109));
    expect(after.result).toBeOk(Cl.uint(6));
  });
});
