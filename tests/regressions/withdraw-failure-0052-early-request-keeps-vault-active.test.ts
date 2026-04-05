import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Early Withdraw Request State", () => {
  it("keeps the vault active after an early withdrawal request is rejected", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const request = simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);
    const active = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);

    expect(request.result).toBeErr(Cl.uint(104));
    expect(active.result).toBeOk(Cl.bool(true));
  });
});
