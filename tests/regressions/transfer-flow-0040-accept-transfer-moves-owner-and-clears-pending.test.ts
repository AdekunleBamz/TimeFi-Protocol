import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("Vault Transfer Acceptance", () => {
  it("moves ownership and clears the pending transfer once accepted", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "initiate-transfer", [Cl.uint(1), Cl.principal(wallet2)], wallet1);

    const result = simnet.callPublicFn(CONTRACT_NAME, "accept-transfer", [Cl.uint(1)], wallet2);
    const ownerCheck = simnet.callReadOnlyFn(CONTRACT_NAME, "is-vault-owner", [Cl.uint(1), Cl.principal(wallet2)], wallet2);
    const pending = simnet.callReadOnlyFn(CONTRACT_NAME, "get-pending-transfer", [Cl.uint(1)], wallet2);

    expect(result.result).toBeOk(Cl.bool(true));
    expect(ownerCheck.result).toBeOk(Cl.bool(true));
    expect(pending.result).toStrictEqual(Cl.none());
  });
});
