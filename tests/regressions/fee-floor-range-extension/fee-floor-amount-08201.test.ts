import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Floor Extension 8201", () => {
  it("calculate-fee should keep floor behavior at amount 8201", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "calculate-fee", [Cl.uint(8201)], wallet1);
    expect(result.result).toBeOk(Cl.uint(41));
  });
});
