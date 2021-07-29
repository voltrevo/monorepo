import * as tb from "../base.ts";

const Response = tb.Object({
  id: tb.size,
  data: tb.buffer,
});

type Response = tb.TypeOf<typeof Response>;

export default Response;
