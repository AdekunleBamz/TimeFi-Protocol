import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { VAULT_CONTRACT_NAME, wallet1 } from "../shared";

// Regression guard: floor rounding remains stable at amount 1601.

describe("Deposit Floor Rounding 1601", () => {
  it("calculate-deposit-after-fee should return net amount for 1601", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(1601)], wallet1);
    expect(result.result).toBeOk(Cl.uint(1593));
  });
});
