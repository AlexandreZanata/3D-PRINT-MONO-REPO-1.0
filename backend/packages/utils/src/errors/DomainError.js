// @max-lines 200 — this is enforced by the lint pipeline.
import { AppError } from "./AppError.js";
/** Represents a business-rule violation (HTTP 400). */
export class DomainError extends AppError {
    code;
    httpStatus = 400;
    constructor(message, code = "DOMAIN_ERROR") {
        super(message);
        this.code = code;
    }
}
//# sourceMappingURL=DomainError.js.map