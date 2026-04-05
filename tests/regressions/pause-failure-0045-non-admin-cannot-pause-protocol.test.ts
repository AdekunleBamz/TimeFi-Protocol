import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Pause Authorization", () => {
  it("rejects pause attempts from non-admin accounts and keeps the protocol live", () => {
    const pause = simnet.callPublicFn(CONTRACT_NAME, "pause-protocol", [], wallet1);
    const paused = simnet.callReadOnlyFn(CONTRACT_NAME, "is-paused", [], wallet1);

    expect(pause.result).toBeErr(Cl.uint(100));
    expect(paused.result).toStrictEqual(Cl.bool(false));
  });
});
