import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "timefi-vault";

describe("Pause and Unpause Flow", () => {
  it("blocks vault creation while paused and allows it again after unpause", () => {
    const pause = simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], deployer);
    const paused = simnet.callReadOnlyFn(CONTRACT_NAME, "is-paused", [], wallet1);
    const blockedCreate = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const unpause = simnet.callPublicFn(CONTRACT_NAME, "unpause-protocol", [], deployer);
    const resumed = simnet.callReadOnlyFn(CONTRACT_NAME, "is-paused", [], wallet1);
    const allowedCreate = simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    expect(pause.result).toBeOk(Cl.bool(true));
    expect(paused.result).toStrictEqual(Cl.bool(true));
    expect(blockedCreate.result).toBeErr(Cl.uint(109));
    expect(unpause.result).toBeOk(Cl.bool(true));
    expect(resumed.result).toStrictEqual(Cl.bool(false));
    expect(allowedCreate.result).toBeOk(Cl.uint(1));
  });
});
