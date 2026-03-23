import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { VAULT_CONTRACT_NAME, wallet1 } from "../shared";

describe("Fee Floor Rounding 5401", () => {
  it("calculate-fee should return the floored fee for amount 5401", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT_NAME, "calculate-fee", [Cl.uint(5401)], wallet1);
    expect(result.result).toBeOk(Cl.uint(27));
  });
});
