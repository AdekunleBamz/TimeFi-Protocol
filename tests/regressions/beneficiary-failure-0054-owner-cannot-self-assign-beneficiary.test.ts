import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Self Assignment", () => {
  it("rejects assigning the owner as beneficiary and keeps the beneficiary empty", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const setBeneficiary = simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet1)], wallet1);
    const beneficiary = simnet.callReadOnlyFn(CONTRACT_NAME, "get-beneficiary", [Cl.uint(1)], wallet1);

    expect(setBeneficiary.result).toBeErr(Cl.uint(108));
    expect(beneficiary.result).toBeOk(Cl.none());
  });
});
