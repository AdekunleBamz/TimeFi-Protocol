import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT_NAME = "timefi-vault";

function createVault(amount = 100_000, lockSecs = 3600) {
  return simnet.callPublicFn(
    CONTRACT_NAME,
    "create-vault",
    [Cl.uint(amount), Cl.uint(lockSecs)],
    wallet1
  );
}

describe("TimeFi Vault - Read-Only Coverage", () => {
  it("should return ERR_NOT_FOUND for get-time-remaining on unknown id", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-time-remaining",
      [Cl.uint(999)],
      wallet1
    );

    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should increase get-vault-count after creation", () => {
    createVault();

    const count = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault-count", [], wallet1);
    expect(count.result).toBeOk(Cl.uint(1));
  });

  it("should increase total fees after creation", () => {
    createVault(1_000_000, 3600);

    const fees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(fees.result).toBeOk(Cl.uint(5000));
  });

  it("should return zero fee for zero amount", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "calculate-fee",
      [Cl.uint(0)],
      wallet1
    );

    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("should floor fee calculations for non-even amounts", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "calculate-fee",
      [Cl.uint(12_345)],
      wallet1
    );

    expect(result.result).toBeOk(Cl.uint(61));
  });

  it("should return amount minus rounded fee in deposit-after-fee", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "calculate-deposit-after-fee",
      [Cl.uint(12_345)],
      wallet1
    );

    expect(result.result).toBeOk(Cl.uint(12_284));
  });

  it("should expose min deposit constant", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-min-deposit", [], wallet1);
    expect(result.result).toStrictEqual(Cl.uint(10_000));
  });

  it("should expose min lock constant", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-min-lock", [], wallet1);
    expect(result.result).toStrictEqual(Cl.uint(3_600));
  });

  it("should expose max lock constant", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-max-lock", [], wallet1);
    expect(result.result).toStrictEqual(Cl.uint(31_536_000));
  });

  it("should expose fee basis points constant", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-fee-bps", [], wallet1);
    expect(result.result).toStrictEqual(Cl.uint(50));
  });

  it("should return a valid principal for treasury", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-treasury", [], wallet1);
    expect(result.result.type).toBe("ok");
  });

  it("should return ok for get-vault after creation", () => {
    createVault();
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault", [Cl.uint(1)], wallet1);
    expect(result.result.type).toBe("ok");
  });

  it("should return true from is-active after creation", () => {
    createVault();
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(1)], wallet1);
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should return false from can-withdraw before unlock", () => {
    createVault();
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "can-withdraw", [Cl.uint(1)], wallet1);
    expect(result.result).toBeOk(Cl.bool(false));
  });

  it("should return ok from get-time-remaining for existing vault", () => {
    createVault();
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);
    expect(result.result.type).toBe("ok");
  });

  it("should return ERR_NOT_FOUND from is-active on unknown vault", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "is-active", [Cl.uint(999)], wallet1);
    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should return ERR_NOT_FOUND from can-withdraw on unknown vault", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "can-withdraw", [Cl.uint(999)], wallet1);
    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should return ERR_NOT_FOUND from is-vault-owner on unknown vault", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-vault-owner",
      [Cl.uint(999), Cl.principal(wallet1)],
      wallet1
    );
    expect(result.result).toBeErr(Cl.uint(101));
  });

  it("should return true from is-vault-owner for owner principal", () => {
    createVault();
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-vault-owner",
      [Cl.uint(1), Cl.principal(wallet1)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should return false from is-vault-owner for non-owner principal", () => {
    createVault();
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "is-vault-owner",
      [Cl.uint(1), Cl.principal(wallet2)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(false));
  });

  it("should report vault-count as two after two creates", () => {
    createVault();
    createVault();
    const count = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault-count", [], wallet1);
    expect(count.result).toBeOk(Cl.uint(2));
  });

  it("should accumulate total fees across multiple vault creations", () => {
    createVault();
    createVault();
    const fees = simnet.callReadOnlyFn(CONTRACT_NAME, "get-total-fees", [], wallet1);
    expect(fees.result).toBeOk(Cl.uint(1000));
  });

  it("should accumulate tvl across multiple vault creations", () => {
    createVault();
    createVault();
    const tvl = simnet.callReadOnlyFn(CONTRACT_NAME, "get-tvl", [], wallet1);
    expect(tvl.result).toBeOk(Cl.uint(199_000));
  });

  it("should return true from can-withdraw after lock duration passes", () => {
    createVault();
    simnet.mineEmptyBlocks(4000);
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "can-withdraw", [Cl.uint(1)], wallet1);
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should return zero remaining time after maturity", () => {
    createVault();
    simnet.mineEmptyBlocks(4000);
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-time-remaining", [Cl.uint(1)], wallet1);
    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("should return zero deposit-after-fee for zero amount", () => {
    const result = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "calculate-deposit-after-fee",
      [Cl.uint(0)],
      wallet1
    );
    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("should return ERR_NOT_FOUND from get-vault on unknown id", () => {
    const result = simnet.callReadOnlyFn(CONTRACT_NAME, "get-vault", [Cl.uint(999)], wallet1);
    expect(result.result).toBeErr(Cl.uint(101));
  });
});
