import assertExists from "../../helpers/assertExists.ts";

export default class AsyncQueue<T> {
  open = true;
  pendingPushes: T[] = [];
  pendingPops: ((resolve: T | null) => void)[] = [];

  push(value: T | null) {
    if (value === null) {
      this.close();
      return;
    }

    if (!this.open) {
      // TODO: Logging?
      // eslint-disable-next-line no-console
      console.warn("Ignoring push to closed AsyncQueue", value);
      return;
    }

    const pendingPop = this.pendingPops.shift();

    if (pendingPop !== undefined) {
      pendingPop(value);
    } else {
      this.pendingPushes.push(value);
    }
  }

  pop(): Promise<T | null> {
    if (!this.open) {
      return Promise.resolve(null);
    }

    if (this.pendingPushes.length > 0) {
      return Promise.resolve(assertExists(this.pendingPushes.shift()));
    }

    return new Promise((resolve) => {
      this.pendingPops.push(resolve);
    });
  }

  close() {
    this.open = false;

    for (const pop of this.pendingPops) {
      pop(null);
    }

    this.pendingPushes.length = 0;
  }
}
