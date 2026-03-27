import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: minimum deposit amount remains accepted.

describe("Deposit Boundary 0011", () => {
  it("calculate-deposit-after-fee should return 1 for amount 1", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(1)], wallet1);
    expect(result.result).toBeOk(Cl.uint(1));
  });
});
