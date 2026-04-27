import { AppError } from "./AppError.js";
/** Authenticated but not authorised (HTTP 403). */
export declare class ForbiddenError extends AppError {
    readonly code: string;
    readonly httpStatus: 403;
    constructor(message: string, code?: string);
}
//# sourceMappingURL=ForbiddenError.d.ts.map