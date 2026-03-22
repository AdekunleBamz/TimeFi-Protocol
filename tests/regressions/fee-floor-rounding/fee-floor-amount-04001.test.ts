import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Floor Rounding 4001", () => {
  it("calculate-fee should return the floored fee for amount 4001", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(4001)], wallet1);
    expect(result.result).toBeOk(Cl.uint(20));
  });
});
