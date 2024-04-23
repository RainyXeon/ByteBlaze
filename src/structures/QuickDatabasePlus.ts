import { IQuickDBOptions, QuickDB } from "dreamvast.quick.db";
import { Collection } from "./Collection.js";

export class QuickDatabasePlus<D = any> extends QuickDB {
  public cache: Collection<unknown>;
  constructor(public newOptions?: IQuickDBOptions) {
    super(newOptions);
    this.cache = new Collection<string>();
  }

  async get<T = D>(key: string): Promise<T | null> {
    const getCache = this.cache.get(key);
    if (getCache) return getCache as T;
    const fetchData = await super.get(key);
    if (!fetchData) return null;
    this.cache.set(key, fetchData);
    return fetchData;
  }

  async set<T = D>(key: string, value: T): Promise<T> {
    const res = await super.set(key, value);
    this.cache.set(key, res);
    return res;
  }

  async update<T = D>(key: string, object: object): Promise<T> {
    const res = await super.update(key, object);
    this.cache.set(key, res);
    return res;
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) != null;
  }

  async delete(key: string): Promise<number> {
    const res = await super.delete(key);
    this.cache.delete(key);
    return res;
  }

  async deleteAll(): Promise<number> {
    this.cache.clear();
    return await super.deleteAll();
  }

  async add(key: string, value: number): Promise<number> {
    const res = await super.add(key, value);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async sub(key: string, value: number): Promise<number> {
    const res = await super.sub(key, value);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async push<T = D>(key: string, ...values: T[]): Promise<T[]> {
    const res = await super.push(key, ...values);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async unshift<T = D>(key: string, value: T | T[]): Promise<T[]> {
    const res = await super.unshift(key, value);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async pop<T = D>(key: string): Promise<T | undefined> {
    const res = await super.pop(key);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async shift<T = D>(key: string): Promise<T | undefined> {
    const res = await super.shift(key);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async pull<T = D>(key: string, value: T | T[] | ((data: T, index: string) => boolean), once = false): Promise<T[]> {
    const res = await super.pull(key, value, once);
    const find = await super.get(key);
    this.cache.set(key, find);
    return res;
  }

  async table<T = D>(table: string): Promise<QuickDatabasePlus<T>> {
    if (typeof table != "string") {
      throw new Error(`First argument (table) needs to be a string received "${typeof table}"`);
    }
    const options = { ...this.newOptions };
    options.table = table;
    options.driver = this.driver;
    const instance = new QuickDatabasePlus(options);
    await instance.driver.prepare(options.table);
    return instance;
  }
}
