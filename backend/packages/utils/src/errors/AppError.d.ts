/** Base class for all application errors. */
export declare abstract class AppError extends Error {
    abstract readonly code: string;
    abstract readonly httpStatus: number;
    protected constructor(message: string);
}
//# sourceMappingURL=AppError.d.ts.map