import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Bot Status", () => {
  it("reports true for a contract principal after approval", () => {
    simnet.callPublicFn(CONTRACT_NAME, "approve-bot", [BOT_CONTRACT], deployer);
    const status = simnet.callReadOnlyFn(CONTRACT_NAME, "is-bot", [BOT_CONTRACT], deployer);
    expect(status.result).toStrictEqual(Cl.bool(true));
  });
});
