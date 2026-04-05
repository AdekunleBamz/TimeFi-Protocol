import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Pause Blocks Beneficiary Claim Requests", () => {
  it("rejects beneficiary claim requests while paused", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], deployer);

    const request = simnet.callPublicFn(CONTRACT_NAME, "request-beneficiary-claim", [Cl.uint(1)], wallet2);

    expect(request.result).toBeErr(Cl.uint(109));
  });
});
