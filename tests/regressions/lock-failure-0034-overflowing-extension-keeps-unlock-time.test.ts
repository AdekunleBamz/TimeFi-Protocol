import { describe, expect, it } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

function unwrapOkUint(result: ReturnType<typeof simnet.callReadOnlyFn>) {
  if (result.result.type !== ClarityType.ResponseOk) {
    throw new Error("expected ok response");
  }

  if (result.result.value.type !== ClarityType.UInt) {
    throw new Error("expected uint response value");
  }

  return result.result.value.value;
}

describe("Extend Lock Failure Safety", () => {
  it("keeps the unlock schedule unchanged when an extension exceeds max lock", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(52_560)], wallet1);

    const before = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);
    const result = simnet.callPublicFn(CONTRACT_NAME, "extend-lock", [Cl.uint(1), Cl.uint(1)], wallet1);
    const after = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);

    expect(result.result).toBeErr(Cl.uint(104));
    expect(unwrapOkUint(after)).toBe(unwrapOkUint(before));
  });
});
