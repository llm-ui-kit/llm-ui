import { throttleBasic } from "llm-ui/throttle";

export const throttle = throttleBasic({ lagBufferMs: 3000 });
