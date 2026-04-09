import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Withdraw Lock Invariant", () => {
  it("keeps can-withdraw false after an early withdrawal attempt", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(3_600)], wallet1);

    const early = simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);
    expect(early.result).toBeErr(Cl.uint(104));

    const canWithdraw = simnet.callReadOnlyFn(CONTRACT_NAME, "can-withdraw", [Cl.uint(1)], wallet1);
    expect(canWithdraw.result).toBeOk(Cl.bool(false));
  });
});
