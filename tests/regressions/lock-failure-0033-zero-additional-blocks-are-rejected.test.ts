import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Extend Lock Validation", () => {
  it("rejects zero additional blocks", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    const result = simnet.callPublicFn(CONTRACT_NAME, "extend-lock", [Cl.uint(1), Cl.uint(0)], wallet1);

    expect(result.result).toBeErr(Cl.uint(104));
  });
});
