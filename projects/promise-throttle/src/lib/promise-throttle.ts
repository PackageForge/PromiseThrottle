export class PromiseThrottle {
  private waiting: (() => void)[] = []
  private working: (() => void)[] = []
  private _count: number = -1;
  public get count(): number {
    return this._count;
  }
  public set count(count: number) {
    this._count = count;
    this.digest();
  }
  constructor(count?: number) {
    if (typeof (count) === "number")
      this.count = count;
  }
  public add<T>(fnc: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const trigger = () => {
        fnc(...args).then(result => {
          this.digest(trigger);
          resolve(result);
        }, message => {
          this.digest(trigger);
          reject(message);
        });
      };
      this.waiting.push(trigger);
      this.digest();
    })
  }
  public flush() {
    this.digest(undefined, true);
  }
  private digest(trigger?: () => void, flush?: boolean) {
    if (trigger)
      this.working.splice(this.working.indexOf(trigger), 1);
    while (this.waiting.length > 0 && (flush || this._count < 0 || this.working.length < this._count)) {
      this.working.push(trigger = this.waiting.shift()!);
      trigger();
    }
  }
}
