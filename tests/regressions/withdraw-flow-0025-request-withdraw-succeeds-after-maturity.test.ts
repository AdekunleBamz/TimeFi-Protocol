import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("Request Withdraw Flow", () => {
  it("allows the owner to request withdrawal once the vault matures", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);

    const result = simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    expect(result.result).toBeOk(Cl.bool(true));
  });
});
