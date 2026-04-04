import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Top-Up TVL Accounting", () => {
  it("adds only the post-fee amount to total value locked", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const result = simnet.callPublicFn(CONTRACT_NAME, "top-up-vault", [Cl.uint(1), Cl.uint(20_000)], wallet1);
    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);

    expect(result.result).toBeOk(Cl.bool(true));
    expect(tvl.result).toBeOk(Cl.uint(119_400));
  });
});
