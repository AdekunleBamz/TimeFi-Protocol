import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Create Failure 0018", () => {
  it("should keep vault count at 0 after high lock validation failure", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_000), Cl.uint(31_536_001)], wallet1);
    const count = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault-count", [], wallet1);
    expect(count.result).toBeOk(Cl.uint(0));
  });
});
