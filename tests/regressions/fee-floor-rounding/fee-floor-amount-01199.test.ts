import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { VAULT_CONTRACT_NAME, wallet1 } from "../shared";

describe("Fee Floor Rounding 1199", () => {
  it("calculate-fee should return the floored fee for amount 1199", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT_NAME, "calculate-fee", [Cl.uint(1199)], wallet1);
    expect(result.result).toBeOk(Cl.uint(5));
  });
});
