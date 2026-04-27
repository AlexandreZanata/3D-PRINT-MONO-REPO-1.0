// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";
/** Authenticated but not authorised (HTTP 403). */
export class ForbiddenError extends AppError {
    code;
    httpStatus = 403;
    constructor(message, code = "FORBIDDEN") {
        super(message);
        this.code = code;
    }
}
//# sourceMappingURL=ForbiddenError.js.map