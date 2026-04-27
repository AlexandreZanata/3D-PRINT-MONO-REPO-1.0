// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";
/** Resource conflict, e.g. duplicate unique key (HTTP 409). */
export class ConflictError extends AppError {
    code;
    httpStatus = 409;
    constructor(message, code = "CONFLICT") {
        super(message);
        this.code = code;
    }
}
//# sourceMappingURL=ConflictError.js.map