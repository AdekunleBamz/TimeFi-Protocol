import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Unknown Top-Up TVL Invariant", () => {
  it("leaves total value locked unchanged when the vault id is missing", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const before = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    const topUp = simnet.callPublicFn(CONTRACT_NAME, "top-up-vault", [Cl.uint(999), Cl.uint(20_000)], wallet1);
    const after = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);

    expect(before.result).toBeOk(Cl.uint(99_500));
    expect(topUp.result).toBeErr(Cl.uint(101));
    expect(after.result).toBeOk(Cl.uint(99_500));
  });
});
