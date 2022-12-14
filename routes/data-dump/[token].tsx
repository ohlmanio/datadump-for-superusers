import { Handlers, PageProps } from "$fresh/server.ts";
import DateTime from "https://raw.githubusercontent.com/moment/luxon/master/src/datetime.js";
import { Record, testDB } from "../../backend/database.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const tokens = testDB.get({ event: "token", data: ctx.params.token });

    if (tokens.length == 0) return ctx.renderNotFound();

    const { bucket, user } = tokens[tokens.length - 1];

    const data = await req.json();

    testDB.put({ bucket, user, event: "put", date: DateTime.now(), size: JSON.stringify(data).length, data })

    return new Response("Done");
  },
  async GET(req, ctx) {
    const tokens = testDB.get({ event: "token", data: ctx.params.token });

    if (tokens.length == 0) return ctx.renderNotFound();

    const { bucket } = tokens[tokens.length - 1];

    const data = testDB.get({ bucket, event: "put" })
    return await ctx.render(data);
  },
};

export default function DataList(props: PageProps<Record[]>) {
  const { data } = props;
  const { token } = props.params;
  return (
    <main>
      <h1>{token}</h1>
      <p>Records: {data.length}</p>
    </main>
  );
}