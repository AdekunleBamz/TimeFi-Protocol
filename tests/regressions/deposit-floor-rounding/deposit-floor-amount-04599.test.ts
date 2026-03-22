import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Deposit Floor Rounding 4599", () => {
  it("calculate-deposit-after-fee should return net amount for 4599", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(4599)], wallet1);
    expect(result.result).toBeOk(Cl.uint(4577));
  });
});
