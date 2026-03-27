import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: fee floor for tiny positive amount.

describe("Fee Boundary 0002", () => {
  it("calculate-fee should floor to 0 for amount 1", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(1)], wallet1);
    expect(result.result).toBeOk(Cl.uint(0));
  });
});
