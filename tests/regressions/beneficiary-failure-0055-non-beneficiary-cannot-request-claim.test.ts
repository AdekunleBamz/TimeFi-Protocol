import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Claim Authorization", () => {
  it("rejects claim requests from anyone except the configured beneficiary", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    const request = simnet.callPublicFn(CONTRACT_NAME, "request-beneficiary-claim", [Cl.uint(1)], wallet3);
    const beneficiary = simnet.callReadOnlyFn(CONTRACT_NAME, "get-beneficiary", [Cl.uint(1)], wallet1);

    expect(request.result).toBeErr(Cl.uint(100));
    expect(beneficiary.result).toBeOk(Cl.some(Cl.principal(wallet2)));
  });
});
