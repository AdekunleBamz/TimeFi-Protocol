import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Boundary 0005", () => {
  it("calculate-fee should return 49 for amount 9999", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(9999)], wallet1);
    expect(result.result).toBeOk(Cl.uint(49));
  });
});
