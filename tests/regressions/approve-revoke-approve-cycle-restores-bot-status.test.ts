import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Bot Toggle Cycle", () => {
  it("restores true bot status after approve-revoke-approve cycle", () => {
    simnet.callPublicFn(CONTRACT_NAME, "approve-bot", [BOT_CONTRACT], deployer);
    simnet.callPublicFn(CONTRACT_NAME, "revoke-bot", [BOT_CONTRACT], deployer);
    simnet.callPublicFn(CONTRACT_NAME, "approve-bot", [BOT_CONTRACT], deployer);

    const status = simnet.callReadOnlyFn(CONTRACT_NAME, "is-bot", [BOT_CONTRACT], deployer);
    expect(status.result).toStrictEqual(Cl.bool(true));
  });
});
