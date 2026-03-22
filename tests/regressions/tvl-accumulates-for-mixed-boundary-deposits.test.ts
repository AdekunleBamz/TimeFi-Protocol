import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("TVL Accumulation", () => {
  it("accumulates net TVL for mixed boundary deposits", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_000), Cl.uint(3_600)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(10_001), Cl.uint(3_600)], wallet1);

    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    expect(tvl.result).toBeOk(Cl.uint(19_901));
  });
});
