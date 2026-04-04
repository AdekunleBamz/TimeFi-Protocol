import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Claim Validation", () => {
  it("rejects deployer-side beneficiary processing when no beneficiary is configured", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(12_966);

    const result = simnet.callPublicFn(CONTRACT_NAME, "process-beneficiary-claim", [Cl.uint(1)], deployer);

    expect(result.result).toBeErr(Cl.uint(107));
  });
});
