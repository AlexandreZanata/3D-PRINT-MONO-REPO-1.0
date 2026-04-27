import { AppError } from "./AppError.js";
/** Resource not found (HTTP 404). */
export declare class NotFoundError extends AppError {
    readonly code: string;
    readonly httpStatus: 404;
    constructor(message: string, code?: string);
}
//# sourceMappingURL=NotFoundError.d.ts.map