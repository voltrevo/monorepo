import * as tb from "../index.ts";

const Response = tb.object({
  id: tb.size,
  data: tb.buffer,
});

type Response = tb.TypeOf<typeof Response>;

export default Response;
