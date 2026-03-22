import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Floor Rounding 7199", () => {
  it("calculate-fee should return the floored fee for amount 7199", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(7199)], wallet1);
    expect(result.result).toBeOk(Cl.uint(35));
  });
});
