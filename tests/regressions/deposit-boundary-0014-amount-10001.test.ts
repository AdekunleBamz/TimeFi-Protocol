import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: amount 10,001 transitions boundary behavior correctly.

describe("Deposit Boundary 0014", () => {
  it("calculate-deposit-after-fee should return 9951 for amount 10001", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(10001)], wallet1);
    expect(result.result).toBeOk(Cl.uint(9951));
  });
});
