import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: amount 10,001 remains in expected fee bracket.

describe("Fee Boundary 0007", () => {
  it("calculate-fee should keep floor output at 50 for amount 10001", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(10001)], wallet1);
    expect(result.result).toBeOk(Cl.uint(50));
  });
});
