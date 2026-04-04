import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: failed create must not increment vault count.

describe("Create Failure 0016", () => {
  it("should keep vault count at 0 after amount validation failure", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(9_999), Cl.uint(3_600)], wallet1);
    const count = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault-count", [], wallet1);
    expect(count.result).toBeOk(Cl.uint(0));
  });
});
