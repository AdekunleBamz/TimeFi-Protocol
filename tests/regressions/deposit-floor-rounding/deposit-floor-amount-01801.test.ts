import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: floor rounding remains stable at amount 1801.

describe("Deposit Floor Rounding 1801", () => {
  it("calculate-deposit-after-fee should return net amount for 1801", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(1801)], wallet1);
    expect(result.result).toBeOk(Cl.uint(1792));
  });
});
