import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("TimeFi Vault - Read-Only Coverage", () => {
  it("should return ERR_NOT_FOUND for get-time-remaining on unknown id", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-time-remaining",
      [Cl.uint(999)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(101));
  });
});
