import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Revoking Unapproved Bot", () => {
  it("returns ok and keeps status false for an unapproved contract principal", () => {
    const revoke = simnet.callPublicFn(CONTRACT_NAME, "revoke-bot", [BOT_CONTRACT], deployer);
    expect(revoke.result).toBeOk(Cl.bool(true));

    const status = simnet.callReadOnlyFn(CONTRACT_NAME, "is-bot", [BOT_CONTRACT], deployer);
    expect(status.result).toStrictEqual(Cl.bool(false));
  });
});
