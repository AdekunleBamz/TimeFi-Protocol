import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Pause Blocks Withdraw Requests", () => {
  it("rejects owner withdrawal requests while paused even after maturity", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(6);
    simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], deployer);

    const request = simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    expect(request.result).toBeErr(Cl.uint(109));
  });
});
