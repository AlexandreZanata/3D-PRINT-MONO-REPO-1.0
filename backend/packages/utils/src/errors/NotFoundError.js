// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";
/** Resource not found (HTTP 404). */
export class NotFoundError extends AppError {
    code;
    httpStatus = 404;
    constructor(message, code = "NOT_FOUND") {
        super(message);
        this.code = code;
    }
}
//# sourceMappingURL=NotFoundError.js.map