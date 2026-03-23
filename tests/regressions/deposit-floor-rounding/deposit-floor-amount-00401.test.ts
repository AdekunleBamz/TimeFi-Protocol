import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { VAULT_CONTRACT_NAME, wallet1 } from "../shared";

describe("Deposit Floor Rounding 401", () => {
  it("calculate-deposit-after-fee should return net amount for 401", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(401)], wallet1);
    expect(result.result).toBeOk(Cl.uint(399));
  });
});
