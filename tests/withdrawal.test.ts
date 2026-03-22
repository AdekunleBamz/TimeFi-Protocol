import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

function createUnlockedVault(owner = wallet1) {
  simnet.callPublicFn(
    CONTRACT_NAME,
    "create-vault",
    [Cl.uint(100_000), Cl.uint(3600)],
    owner
  );
  simnet.mineEmptyBlocks(4000);
}

describe("TimeFi Vault - Withdrawal", () => {
  it("should return ERR_NOT_FOUND for unknown vault id", () => {
    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(9999)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should return ERR_LOCK_PERIOD while vault is still locked", () => {
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [Cl.uint(100_000), Cl.uint(3600)],
      wallet1
    );

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(104));
  });

  it("should return ERR_UNAUTHORIZED for non-owner", () => {
    createUnlockedVault(wallet1);

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet2
    );

    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should return u4 when matured withdrawal hits chain-time lookup bug", () => {
    createUnlockedVault(wallet1);

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(4));
  });

  it("should keep vault active when withdrawal aborts with u4", () => {
    createUnlockedVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(1)], wallet1);

    const status = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-active",
      [Cl.uint(1)],
      wallet1
    );

    expect(status.result).toBeOk(Cl.bool(true));
  });

  it("should return false for can-withdraw after withdrawal", () => {
    createUnlockedVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(1)], wallet1);

    const canWithdraw = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "can-withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(canWithdraw.result).toBeOk(Cl.bool(false));
  });

  it("should decrease total value locked after withdrawal", () => {
    const amount = 1_000_000;
    const expectedFee = (amount * 50) / 10000;

    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [Cl.uint(amount), Cl.uint(3600)],
      wallet1
    );
    simnet.mineEmptyBlocks(4000);

    simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(1)], wallet1);

    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    expect(tvl.result).toBeOk(Cl.uint(0));

    const totalFees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(totalFees.result).toBeOk(Cl.uint(expectedFee));
  });

  it("should reject a second withdrawal attempt on same vault", () => {
    createUnlockedVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(1)], wallet1);

    const secondAttempt = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(secondAttempt.result.type).toBe("err");
  });

  it("should return true for can-withdraw once lock has matured", () => {
    createUnlockedVault(wallet1);

    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "can-withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should keep vault active when unauthorized withdrawal is attempted", () => {
    createUnlockedVault(wallet1);

    const unauthorized = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet2
    );
    expect(unauthorized.result).toBeErr(Cl.uint(100));

    const status = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-active",
      [Cl.uint(1)],
      wallet1
    );
    expect(status.result).toBeOk(Cl.bool(true));
  });

  it("should only deactivate the withdrawn vault when user owns multiple", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(3600)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(3600)], wallet1);
    simnet.mineEmptyBlocks(4000);

    simnet.callPublicFn(CONTRACT_NAME, "withdraw", [Cl.uint(1)], wallet1);

    const vault1 = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);
    const vault2 = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(2)], wallet1);

    expect(vault1.result).toBeOk(Cl.bool(false));
    expect(vault2.result).toBeOk(Cl.bool(true));
  });

  it("should emit a print event on successful withdrawal", () => {
    createUnlockedVault(wallet1);

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "withdraw",
      [Cl.uint(1)],
      wallet1
    );

    const printEvent = result.events.find((event) => event.event === "print_event");
    expect(printEvent).toBeDefined();
  });
});
