import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Unknown Withdraw Invariant", () => {
  it("keeps vault count unchanged when withdrawing unknown id", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(3_600)], wallet1);

    const before = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault-count", [], wallet1);
    expect(before.result).toBeOk(Cl.uint(1));

    simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(999)], wallet1);

    const after = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault-count", [], wallet1);
    expect(after.result).toBeOk(Cl.uint(1));
  });
});
