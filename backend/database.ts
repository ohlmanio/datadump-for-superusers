import { DateTime } from "https://raw.githubusercontent.com/moment/luxon/master/src/luxon.js";

export type Record = {
  id: number,
  user: string,
  bucket: string,
  event: string,
  date: DateTime,
  size: number,
  data: unknown,
}

export class Database {
  constructor(private data: Record[] = []) {}
  get(query: { user?: string, bucket?: string, event?: string, before?: DateTime, after?: DateTime, data?: unknown }) {
    return this.data.filter(record => {
      if ("user" in query && record.user != query.user) return false; 
      if ("bucket" in query && record.bucket != query.bucket) return false; 
      if ("event" in query && record.event != query.event) return false; 
      if ("before" in query && ! (record.date < (query.before as DateTime))) return false; 
      if ("after" in query && ! (record.date > (query.after as DateTime))) return false; 
      if ("data" in query && record.data != query.data) return false;

      return true;
    });
  }
  put(record: Omit<Record, "id">) {
    const recordWithId = { ...record, id: this.data.length };

    this.data.push(recordWithId);

    return recordWithId.id;
  }
}

export const testDB = new Database([{
  id: 0,
  user: "foo",
  bucket: "foo",
  event: "token",
  date: DateTime.now(),
  size: 0,
  data: "dummy-token",
}, {
  id: 0,
  user: "foo",
  bucket: "foo",
  event: "put",
  date: DateTime.now(),
  size: 0,
  data: [["dummy-token","bar","biz","baz"]],
}]);