import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Top Up Authorization", () => {
  it("rejects top-ups from non-owners and keeps the vault amount unchanged", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const topUp = simnet.callPublicFn(CONTRACT_NAME, "top-up-vault", [Cl.uint(1), Cl.uint(100_000)], wallet2);
    const vault = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault", [Cl.uint(1)], wallet1);

    expect(topUp.result).toBeErr(Cl.uint(100));
    expect(vault.result).toBeOk(
      Cl.tuple({
        owner: Cl.principal(wallet1),
        amount: Cl.uint(99_500),
        "lock-time": Cl.uint(2),
        "unlock-time": Cl.uint(8),
        active: Cl.bool(true),
        beneficiary: Cl.none(),
      }),
    );
  });
});
