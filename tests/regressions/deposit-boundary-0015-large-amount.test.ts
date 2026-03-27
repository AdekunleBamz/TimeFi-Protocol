import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: large deposit path keeps accounting and checks stable.

describe("Deposit Boundary 0015", () => {
  it("calculate-deposit-after-fee should handle large amount deterministically", () => {
    const amount = 123_456_789;
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(amount)], wallet1);
    expect(result.result).toBeOk(Cl.uint(122_839_506));
  });
});
