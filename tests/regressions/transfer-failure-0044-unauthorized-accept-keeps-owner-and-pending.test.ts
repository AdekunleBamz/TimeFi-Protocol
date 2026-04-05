import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "timefi-vault";

describe("Accept Transfer Authorization", () => {
  it("keeps the current owner and pending owner when a third party tries to accept", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "initiate-transfer", [Cl.uint(1), Cl.principal(wallet2)], wallet1);

    const unauthorized = simnet.callPublicFn(CONTRACT_NAME, "accept-transfer", [Cl.uint(1)], wallet3);
    const ownerStillMatches = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-vault-owner",
      [Cl.uint(1), Cl.principal(wallet1)],
      wallet1,
    );
    const pending = simnet.callReadOnlyFn(CONTRACT_NAME, "get-pending-transfer", [Cl.uint(1)], wallet1);

    expect(unauthorized.result).toBeErr(Cl.uint(100));
    expect(ownerStillMatches.result).toBeOk(Cl.bool(true));
    expect(pending.result).toStrictEqual(Cl.some(Cl.principal(wallet2)));
  });
});
