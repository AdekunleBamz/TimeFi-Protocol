import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Can Withdraw Maturity", () => {
  it("turns true once the vault reaches its unlock height", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);

    const canWithdraw = simnet.callReadOnlyFn(CONTRACT_NAME, "can-withdraw", [Cl.uint(1)], wallet1);

    expect(canWithdraw.result).toBeOk(Cl.bool(true));
  });
});
