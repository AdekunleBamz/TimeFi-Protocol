import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const CONTRACT_NAME = "timefi-vault";

describe("Beneficiary Claim Payout", () => {
  it("sends the net vault amount to the beneficiary after the delay window", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "set-beneficiary", [Cl.uint(1), Cl.principal(wallet2)], wallet1);
    simnet.mineEmptyBlocks(12_966);

    const before = simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;
    const process = simnet.callPublicFn(CONTRACT_NAME, "process-beneficiary-claim", [Cl.uint(1)], deployer);
    const after = simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;

    expect(process.result).toBeOk(Cl.bool(true));
    expect(after - before).toBe(99_500n);
  });
});
