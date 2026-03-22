import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Floor Rounding 2199", () => {
  it("calculate-fee should return the floored fee for amount 2199", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(2199)], wallet1);
    expect(result.result).toBeOk(Cl.uint(10));
  });
});
