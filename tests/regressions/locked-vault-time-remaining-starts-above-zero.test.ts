import { describe, expect, it } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Time Remaining", () => {
  it("returns a positive value for a newly locked vault", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(3_600)], wallet1);

    const remaining = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);
    expect(remaining.result.type).toBe(ClarityType.ResponseOk);

    if (remaining.result.type !== ClarityType.ResponseOk) {
      throw new Error("expected ok response");
    }

    expect(remaining.result.value.type).toBe(ClarityType.UInt);
    if (remaining.result.value.type !== ClarityType.UInt) {
      throw new Error("expected uint response value");
    }

    expect(remaining.result.value.value).toBeGreaterThan(0n);
  });
});
