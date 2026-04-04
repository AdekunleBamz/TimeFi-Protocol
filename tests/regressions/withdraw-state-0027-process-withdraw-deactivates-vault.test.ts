import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("Process Withdraw State", () => {
  it("marks the vault inactive after the deployer processes withdrawal", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);

    simnet.callPublicFn(CONTRACT_NAME, "process-withdraw", [Cl.uint(1)], deployer);

    const active = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);

    expect(active.result).toBeOk(Cl.bool(false));
  });
});
