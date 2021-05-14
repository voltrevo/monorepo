import { MethodBase } from "./method.ts";

export type ProtocolBase = {
  type: "protocol";
  methods: Record<string, MethodBase>;
};

export default function Protocol<Methods extends ProtocolBase["methods"]>(
  methods: Methods,
) {
  return {
    type: "protocol" as const,
    methods,
  };
}
