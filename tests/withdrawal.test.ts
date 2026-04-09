import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

function createMatureVault(owner = wallet1) {
  simnet.callPublicFn(
    CONTRACT_NAME,
    "create-vault",
    [Cl.uint(100_000), Cl.uint(6)],
    owner
  );
  simnet.mineEmptyBlocks(10);
}

describe("TimeFi Vault - Withdrawal", () => {
  it("should return ERR_NOT_FOUND for unknown vault id", () => {
    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "request-withdraw",
      [Cl.uint(9999)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should return ERR_LOCK_PERIOD while vault is still locked", () => {
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [Cl.uint(100_000), Cl.uint(6)],
      wallet1
    );

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "request-withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(104));
  });

  it("should return ERR_UNAUTHORIZED for non-owner", () => {
    createMatureVault(wallet1);

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "request-withdraw",
      [Cl.uint(1)],
      wallet2
    );

    expect(result.result).toBeErr(Cl.uint(100));
  });

  it("should allow the owner to request withdrawal after maturity", () => {
    createMatureVault(wallet1);

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "request-withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should keep vault active after a withdrawal request", () => {
    createMatureVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    const status = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-active",
      [Cl.uint(1)],
      wallet1
    );

    expect(status.result).toBeOk(Cl.bool(true));
  });

  it("should keep can-withdraw true after a withdrawal request", () => {
    createMatureVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    const canWithdraw = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "can-withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(canWithdraw.result).toBeOk(Cl.bool(true));
  });

  it("should keep total value locked unchanged after a withdrawal request", () => {
    const amount = 1_000_000;
    const expectedFee = (amount * 50) / 10000;

    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-vault",
      [Cl.uint(amount), Cl.uint(6)],
      wallet1
    );
    simnet.mineEmptyBlocks(10);

    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    expect(tvl.result).toBeOk(Cl.uint(amount - expectedFee));

    const totalFees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(totalFees.result).toBeOk(Cl.uint(expectedFee));
  });

  it("should allow deployer to process a requested withdrawal", () => {
    createMatureVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    const processed = simnet.callPublicFn(
      CONTRACT_NAME,
      "process-withdraw",
      [Cl.uint(1)],
      deployer
    );

    expect(processed.result).toBeOk(Cl.bool(true));
  });

  it("should return true for can-withdraw once lock has matured", () => {
    createMatureVault(wallet1);

    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "can-withdraw",
      [Cl.uint(1)],
      wallet1
    );

    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should reject non-deployer process-withdraw", () => {
    createMatureVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    const unauthorized = simnet.callPublicFn(
      CONTRACT_NAME,
      "process-withdraw",
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

  it("should mark the processed vault inactive and keep the second vault active", () => {
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "create-vault", [Cl.uint(100_000), Cl.uint(6)], wallet1);
    simnet.mineEmptyBlocks(10);
    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    simnet.callPublicFn(CONTRACT_NAME, "process-withdraw", [Cl.uint(1)], deployer);

    const vault1 = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);
    const vault2 = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(2)], wallet1);

    expect(vault1.result).toBeOk(Cl.bool(false));
    expect(vault2.result).toBeOk(Cl.bool(true));
  });

  it("should emit a withdraw print event when processing succeeds", () => {
    createMatureVault(wallet1);
    simnet.callPublicFn(CONTRACT_NAME, "request-withdraw", [Cl.uint(1)], wallet1);

    const result = simnet.callPublicFn(
      CONTRACT_NAME,
      "process-withdraw",
      [Cl.uint(1)],
      deployer
    );

    const printEvent = result.events.find((event) => event.event === "print_event");
    expect(printEvent).toBeDefined();
  });
});
