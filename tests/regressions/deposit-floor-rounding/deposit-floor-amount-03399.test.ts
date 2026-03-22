import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Deposit Floor Rounding 3399", () => {
  it("calculate-deposit-after-fee should return net amount for 3399", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(3399)], wallet1);
    expect(result.result).toBeOk(Cl.uint(3383));
  });
});
