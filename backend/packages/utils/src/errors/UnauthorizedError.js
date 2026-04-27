// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";
/** Missing or invalid authentication (HTTP 401). */
export class UnauthorizedError extends AppError {
    code;
    httpStatus = 401;
    constructor(message, code = "UNAUTHORIZED") {
        super(message);
        this.code = code;
    }
}
//# sourceMappingURL=UnauthorizedError.js.map