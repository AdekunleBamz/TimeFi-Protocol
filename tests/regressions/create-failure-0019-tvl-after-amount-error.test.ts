import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Create Failure 0019", () => {
  it("should keep TVL at 0 after amount validation failure", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(9_999), Cl.uint(3_600)], wallet1);
    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    expect(tvl.result).toBeOk(Cl.uint(0));
  });
});
