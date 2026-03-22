import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Create Flow 0022", () => {
  it("should assign id 1 after an earlier lock-validation failure", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_000), Cl.uint(3_599)], wallet1);
    const created = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_000), Cl.uint(3_600)], wallet1);
    expect(created.result).toBeOk(Cl.uint(1));
  });
});
