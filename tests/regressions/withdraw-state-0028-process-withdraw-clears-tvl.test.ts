import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("Process Withdraw TVL Accounting", () => {
  it("removes the vault amount from TVL after a processed withdrawal", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);

    simnet.callPublicFn(CONTRACT_NAME, "process-withdraw", [Cl.uint(1)], deployer);

    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);

    expect(tvl.result).toBeOk(Cl.uint(0));
  });
});
