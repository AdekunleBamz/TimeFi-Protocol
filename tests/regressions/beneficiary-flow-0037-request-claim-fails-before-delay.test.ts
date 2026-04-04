import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Claim Delay", () => {
  it("rejects beneficiary claim requests before the post-unlock delay has elapsed", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    simnet.mineEmptyBlocks(6);

    const result = simnet.callPublicFn(CONTRACT_NAME, "request-beneficiary-claim", [Cl.uint(1)], wallet2);

    expect(result.result).toBeErr(Cl.uint(104));
  });
});
