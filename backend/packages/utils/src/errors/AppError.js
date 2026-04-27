// @max-lines 200 — this is enforced by the lint pipeline.
/** Base class for all application errors. */
export class AppError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        // Maintains proper prototype chain in transpiled ES5 targets.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=AppError.js.map