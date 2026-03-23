import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

import { VAULT_CONTRACT_NAME, wallet1 } from "../shared";

describe("Deposit Floor Rounding 801", () => {
  it("calculate-deposit-after-fee should return net amount for 801", () => {
    const result = simnet.callReadOnlyFn(VAULT_CONTRACT_NAME, "calculate-deposit-after-fee", [Cl.uint(801)], wallet1);
    expect(result.result).toBeOk(Cl.uint(797));
  });
});
