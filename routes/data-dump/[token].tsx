import { Handlers, PageProps } from "$fresh/server.ts";
import DateTime from "https://raw.githubusercontent.com/moment/luxon/master/src/datetime.js";
import { Record, testDB } from "../../backend/database.ts";
import * as csv from "https://deno.land/x/csv@v0.8.0/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std/streams/reader_from_stream_reader.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const tokens = testDB.get({ event: "token", data: ctx.params.token });

    if (tokens.length == 0) return ctx.renderNotFound();

    const { bucket, user } = tokens[tokens.length - 1];

    const contentType = req.headers.get("content-type")?.toLowerCase();

    const data = await parseData(req, contentType);

    testDB.put({
      bucket,
      user,
      event: "put",
      date: DateTime.now(),
      size: JSON.stringify(data).length,
      data,
    });

    return new Response("Done");
  },
  async GET(req, ctx) {
    const tokens = testDB.get({ event: "token", data: ctx.params.token });

    if (tokens.length == 0) return ctx.renderNotFound();

    const { bucket } = tokens[tokens.length - 1];

    const data = testDB.get({ bucket, event: "put" });
    return await ctx.render(data);
  },
};

async function parseData(req: Request, mimeType = "csv") {
  if (!req.body) return null;

  const [type, parameters] = mimeType.split(";");

  switch (type.toLowerCase()) {
    case "application/json":
      return req.json();
    case "text/csv":
    case "application/csv":
    case "csv":
    default:
      if (parameters && parameters.includes("header=present")) {
        const result = [];
        for await (
          const row of csv.readCSVObjects(readerFromStreamReader(req.body.getReader()), {
            // TODO: encoding from mime type
            encoding: "utf-8",
          })
        ) {
          result.push(row);
        }

        return result;
      } else {
        const result = [];
        for await (
          const row of csv.readCSVRows(readerFromStreamReader(req.body.getReader()), {
            // TODO: encoding from mime type
            encoding: "utf-8",
          })
        ) {
          result.push(row);
        }

        return result;
      }
  }
}

export default function DataList(props: PageProps<Record[]>) {
  const { data } = props;
  const { token } = props.params;
  return (
    <main>
      <h1>{token}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
