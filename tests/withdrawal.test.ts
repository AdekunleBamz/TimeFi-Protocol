import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

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
});
