import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Fee Routing", () => {
  it("routes fee transfer to updated treasury address", () => {
    simnet.callPublicFn(CONTRACT_NAME, "set-treasury", [Cl.principal(wallet2)], deployer);

    const beforeBalances = simnet.getAssetsMap().get("STX");
    const treasuryBefore = beforeBalances?.get(wallet2) ?? 0n;

    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(1_000_000), Cl.uint(3_600)], wallet1);

    const afterBalances = simnet.getAssetsMap().get("STX");
    const treasuryAfter = afterBalances?.get(wallet2) ?? 0n;

    expect(treasuryAfter - treasuryBefore).toBe(5_000n);
  });
});
