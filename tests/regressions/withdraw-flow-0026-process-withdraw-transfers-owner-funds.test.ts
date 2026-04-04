import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("Process Withdraw Balance Flow", () => {
  it("sends the net vault amount back to the owner", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);

    const before = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0n;

    const result = simnet.callPublicFn(CONTRACT_NAME, "process-withdraw", [Cl.uint(1)], deployer);

    const after = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0n;

    expect(result.result).toBeOk(Cl.bool(true));
    expect(after - before).toBe(99_500n);
  });
});
