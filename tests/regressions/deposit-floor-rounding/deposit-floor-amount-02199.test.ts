import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: floor rounding remains stable at amount 2199.

describe("Deposit Floor Rounding 2199", () => {
  it("calculate-deposit-after-fee should return net amount for 2199", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(2199)], wallet1);
    expect(result.result).toBeOk(Cl.uint(2189));
  });
});
