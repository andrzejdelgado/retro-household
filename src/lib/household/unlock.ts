// The parent app is opened once per browser session (D40). The TV app is not gated.
const KEY = "retro-household:unlocked";

export function isUnlocked(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setUnlocked(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    // Session storage can be unavailable; the gate then asks again.
  }
}
