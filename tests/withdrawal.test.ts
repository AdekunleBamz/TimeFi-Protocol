import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

function createUnlockedVault(owner = wallet1) {
  simnet.callPublicFn(
    CONTRACT_NAME,
    "create-vault",
    [Cl.uint(100_000), Cl.uint(3600)],
    owner
  );
  simnet.mineEmptyBlocks(4000);
}

describe("TimeFi Vault - Withdrawal", () => {
  it("should return ERR_NOT_FOUND for unknown vault id", () => {
    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(9999)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should return ERR_LOCK_PERIOD while vault is still locked", () => {
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [Cl.uint(100_000), Cl.uint(3600)],
      wallet1
    );

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(104));
  });
});
