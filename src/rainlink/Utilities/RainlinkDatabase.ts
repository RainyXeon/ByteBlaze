export class RainlinkDatabase<G = unknown> {
  protected cache: Record<string, G> = {};

  /**
   * Get data from database
   * @param key key of that data
   * @returns D
   */
  get<D = G>(key: string): D | undefined {
    return (this.cache[key] as unknown as D) ?? undefined;
  }

  /**
   * detete data from database and returns the deleted data
   * @param key key of that data
   * @returns D
   */
  delete<D = G>(key: string): D | undefined {
    const data = (this.cache[key] as unknown as D) ?? undefined;
    delete this.cache[key];
    return data;
  }

  /**
   * detete all data from database
   */
  clear(): void {
    this.cache = {};
  }

  /**
   * Set data from database
   * @param key the key you want to set
   * @param data data of that key
   * @returns D
   */
  set<D = G>(key: string, data: D): D | undefined {
    this.cache[key] = data as unknown as G;
    return data;
  }

  /**
   * Get how many elements of current database
   * @returns number
   */
  get size(): number {
    return Object.keys(this.cache).length;
  }

  /**
   * Get all current values of current database
   * @returns unknown[]
   */
  get values(): G[] {
    return Object.values(this.cache);
  }

  /**
   * Get all current values of current database
   * @returns unknown[]
   */
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
