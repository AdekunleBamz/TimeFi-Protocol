import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: failed create must not collect protocol fees.

describe("Create Failure 0020", () => {
  it("should keep total fees at 0 after amount validation failure", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(9_999), Cl.uint(3_600)], wallet1);
    const fees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(fees.result).toBeOk(Cl.uint(0));
  });
});
