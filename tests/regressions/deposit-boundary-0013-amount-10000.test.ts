import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Deposit Boundary 0013", () => {
  it("calculate-deposit-after-fee should return 9950 for amount 10000", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(10000)], wallet1);
    expect(result.result).toBeOk(Cl.uint(9950));
  });
});
