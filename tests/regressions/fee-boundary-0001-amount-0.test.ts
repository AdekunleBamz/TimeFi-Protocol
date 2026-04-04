import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: amount 0 should never charge a fee.

describe("Fee Boundary 0001", () => {
  it("calculate-fee should return 0 for amount 0", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(0)], wallet1);
    expect(result.result).toBeOk(Cl.uint(0));
  });
});
