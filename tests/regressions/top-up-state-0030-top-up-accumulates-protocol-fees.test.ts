import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const wallet1 = simnet.getAccounts().get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";

describe("Top-Up Fee Accounting", () => {
  it("adds the top-up fee to the running protocol fee total", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);

    simnet.callPublicFn(CONTRACT_NAME, "top-up-vault", [Cl.uint(1), Cl.uint(20_000)], wallet1);

    const fees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);

    expect(fees.result).toBeOk(Cl.uint(600));
  });
});
