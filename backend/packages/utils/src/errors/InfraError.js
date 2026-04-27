// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";
/** Wraps third-party / infrastructure failures (HTTP 500). */
export class InfraError extends AppError {
    code;
    httpStatus = 500;
    /** The original error from the infrastructure layer. */
    cause;
    constructor(message, cause, code = "INFRA_ERROR") {
        super(message);
        this.code = code;
        this.cause = cause;
    }
}
//# sourceMappingURL=InfraError.js.map