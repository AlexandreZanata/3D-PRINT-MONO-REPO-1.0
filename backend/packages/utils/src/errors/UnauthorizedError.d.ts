import { AppError } from "./AppError.js";
/** Missing or invalid authentication (HTTP 401). */
export declare class UnauthorizedError extends AppError {
    readonly code: string;
    readonly httpStatus: 401;
    constructor(message: string, code?: string);
}
//# sourceMappingURL=UnauthorizedError.d.ts.map