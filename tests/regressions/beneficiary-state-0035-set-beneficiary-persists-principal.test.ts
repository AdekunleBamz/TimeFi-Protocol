import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Storage", () => {
  it("stores the selected beneficiary on the vault", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const result = simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    const beneficiary = simnet.callReadOnlyFn(CONTRACT_NAME, "get-beneficiary", [Cl.uint(1)], wallet1);

    expect(result.result).toBeOk(Cl.bool(true));
    expect(beneficiary.result).toBeOk(Cl.some(Cl.principal(wallet2)));
  });
});
