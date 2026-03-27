import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Floor Extension 14399", () => {
  it("calculate-fee should keep floor behavior at amount 14399", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(14399)], wallet1);
    expect(result.result).toBeOk(Cl.uint(71));
  });
});
