import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
// Regression guard: failed amount check must not consume next vault id.

describe("Create Flow 0021", () => {
  it("should assign id 1 after an earlier amount-validation failure", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(9_999), Cl.uint(3_600)], wallet1);
    const created = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_000), Cl.uint(3_600)], wallet1);
    expect(created.result).toBeOk(Cl.uint(1));
  });
});
