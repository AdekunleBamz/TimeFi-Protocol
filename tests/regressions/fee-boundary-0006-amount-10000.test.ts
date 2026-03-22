import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Boundary 0006", () => {
  it("calculate-fee should return 50 for amount 10000", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(10000)], wallet1);
    expect(result.result).toBeOk(Cl.uint(50));
  });
});
