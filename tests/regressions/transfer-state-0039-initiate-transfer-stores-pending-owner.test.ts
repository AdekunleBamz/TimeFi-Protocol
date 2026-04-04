import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("Vault Transfer Pending State", () => {
  it("stores the proposed new owner after transfer initiation", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const result = simnet.callPublicFn(CONTRACT_NAME, "initiate-transfer", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    const pending = simnet.callReadOnlyFn(CONTRACT_NAME, "get-pending-transfer", [Cl.uint(1)], wallet1);

    expect(result.result).toBeOk(Cl.bool(true));
    expect(pending.result).toStrictEqual(Cl.some(Cl.principal(wallet2)));
  });
});
