import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { VAULT_CONTRACT_NAME, wallet1 } from "../shared";

describe("Deposit Floor Rounding 1799", () => {
  it("calculate-deposit-after-fee should return net amount for 1799", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(1799)], wallet1);
    expect(result.result).toBeOk(Cl.uint(1791));
  });
});
