export class Collection<G = unknown> {
  protected cache: Record<string, G> = {};
  get<D = G>(key: string): D | undefined {
    return (this.cache[key] as unknown as D) ?? undefined;
  }
  delete<D = G>(key: string): D | undefined {
    const data = (this.cache[key] as unknown as D) ?? undefined;
    delete this.cache[key];
    return data;
  }
  clear(): void {
    this.cache = {};
  }
  set<D = G>(key: string, data: D): D | undefined {
    this.cache[key] = data as unknown as G;
    return data;
  }
  get size(): number {
    return Object.keys(this.cache).length;
  }
  get values(): G[] {
    return Object.values(this.cache);
  }
  get full(): [string, G][] {
    const finalRes: [string, G][] = [];
    const keys = Object.keys(this.cache);
    const values = Object.values(this.cache);
    for (let i = 0; i < keys.length; i++) {
      finalRes.push([keys[i], values[i]]);
    }
    return finalRes;
  }
  forEach(callback: (value: G, key: string) => unknown): void {
    for (const data of this.full) {
      callback(data[1], data[0]);
    }
  }
}
