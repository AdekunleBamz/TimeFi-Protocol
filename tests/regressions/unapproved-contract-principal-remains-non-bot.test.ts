import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const deployer = simnet.getAccounts().get("deployer")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Default Bot Status", () => {
  it("returns false for valid but unapproved contract principal", () => {
    const status = simnet.callReadOnlyFn(CONTRACT_NAME, "is-bot", [BOT_CONTRACT], deployer);
    expect(status.result).toStrictEqual(Cl.bool(false));
  });
});
