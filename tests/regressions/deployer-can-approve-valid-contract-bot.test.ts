import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Bot Approval Authorization", () => {
  it("allows deployer to approve a valid contract principal", () => {
    const result = simnet.callPublicFn(CONTRACT_NAME, "approve-bot", [BOT_CONTRACT], deployer);
    expect(result.result).toBeOk(Cl.bool(true));
  });
});
