import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Floor Rounding 4399", () => {
  it("calculate-fee should return the floored fee for amount 4399", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(4399)], wallet1);
    expect(result.result).toBeOk(Cl.uint(21));
  });
});
