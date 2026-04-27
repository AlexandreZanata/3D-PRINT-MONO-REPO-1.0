import { AppError } from "./AppError.js";
/** Resource conflict, e.g. duplicate unique key (HTTP 409). */
export declare class ConflictError extends AppError {
    readonly code: string;
    readonly httpStatus: 409;
    constructor(message: string, code?: string);
}
//# sourceMappingURL=ConflictError.d.ts.map