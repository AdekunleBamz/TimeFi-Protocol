import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Bot Approval Idempotency", () => {
  it("returns ok on repeated approval of the same contract principal", () => {
    const first = simnet.callPublicFn(CONTRACT_NAME, "approve-bot", [BOT_CONTRACT], deployer);
    const second = simnet.callPublicFn(CONTRACT_NAME, "approve-bot", [BOT_CONTRACT], deployer);

    expect(first.result).toBeOk(Cl.bool(true));
    expect(second.result).toBeOk(Cl.bool(true));
  });
});
