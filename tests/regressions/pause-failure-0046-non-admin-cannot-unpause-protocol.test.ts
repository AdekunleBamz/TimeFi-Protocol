import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Unpause Authorization", () => {
  it("keeps the protocol paused when a non-admin tries to unpause it", () => {
    simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], deployer);

    const unpause = simnet.callPublicFn(CONTRACT_NAME, "unpause-protocol", [], wallet1);
    const paused = simnet.callReadOnlyFn(CONTRACT_NAME, "is-paused", [], wallet1);

    expect(unpause.result).toBeErr(Cl.uint(100));
    expect(paused.result).toStrictEqual(Cl.bool(true));
  });
});
