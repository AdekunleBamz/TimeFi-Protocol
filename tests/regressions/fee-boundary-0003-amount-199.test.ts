import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: amount 199 should still round down to zero fee.

describe("Fee Boundary 0003", () => {
  it("calculate-fee should floor to 0 for amount 199", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(199)], wallet1);
    expect(result.result).toBeOk(Cl.uint(0));
  });
});
