import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Accumulation", () => {
  it("accumulates fees across repeated floor-sensitive deposits", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_001), Cl.uint(3_600)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_001), Cl.uint(3_600)], wallet1);

    const fees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(fees.result).toBeOk(Cl.uint(100));
  });
});
