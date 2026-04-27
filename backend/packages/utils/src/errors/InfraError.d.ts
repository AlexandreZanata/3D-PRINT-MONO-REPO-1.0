import { AppError } from "./AppError.js";
/** Wraps third-party / infrastructure failures (HTTP 500). */
export declare class InfraError extends AppError {
    readonly code: string;
    readonly httpStatus: 500;
    /** The original error from the infrastructure layer. */
    readonly cause: Error;
    constructor(message: string, cause: Error, code?: string);
}
//# sourceMappingURL=InfraError.d.ts.map