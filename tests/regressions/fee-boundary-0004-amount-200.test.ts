import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Boundary 0004", () => {
  it("calculate-fee should return 1 at amount 200", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(200)], wallet1);
    expect(result.result).toBeOk(Cl.uint(1));
  });
});
