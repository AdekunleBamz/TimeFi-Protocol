import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const CONTRACT_NAME = "timefi-vault";
const BOT_CONTRACT = Cl.contractPrincipal(deployer, CONTRACT_NAME);

describe("Bot Revocation Permissions", () => {
  it("rejects non-deployer revocation of a valid contract principal", () => {
    const result = simnet.callPublicFn(CONTRACT_NAME, "revoke-bot", [BOT_CONTRACT], wallet1);
    expect(result.result).toBeErr(Cl.uint(100));
  });
});
