import { AppError } from "./AppError.js";
/** Represents a business-rule violation (HTTP 400). */
export declare class DomainError extends AppError {
    readonly code: string;
    readonly httpStatus: 400;
    constructor(message: string, code?: string);
}
//# sourceMappingURL=DomainError.d.ts.map