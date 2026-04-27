// @max-lines 200 — this is enforced by the lint pipeline.
import type { InfraError } from "../common/InfraError.js";
import type { Result } from "../common/Result.js";
import type { QueueMessage } from "./QueuePublisher.js";

export type MessageHandler = (message: QueueMessage) => Promise<Result<void, InfraError>>;

export interface QueueConsumer {
  subscribe(queue: string, handler: MessageHandler): Promise<Result<void, InfraError>>;
}
