import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: fee accounting remains correct after create at 10,001.

describe("Create State 0023", () => {
  it("should record fee 50 after creating a vault with amount 10001", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_001), Cl.uint(3_600)], wallet1);
    const fees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(fees.result).toBeOk(Cl.uint(50));
  });
});
