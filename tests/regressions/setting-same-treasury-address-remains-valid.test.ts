import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const deployer = simnet.getAccounts().get("deployer")!;
const CONTRACT_NAME = "timefi-vault";

describe("Treasury Idempotency", () => {
  it("allows setting treasury to current deployer address", () => {
    const result = simnet.callPublicFn(CONTRACT_NAME, "set-treasury", [Cl.principal(deployer)], deployer);
    expect(result.result).toBeOk(Cl.bool(true));
  });
});
