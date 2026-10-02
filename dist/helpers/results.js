/** The failure reasons as values, so no module spells one as a bare string. */
export const FAILURE = {
    disabled: 'disabled',
    invalid: 'invalid',
    noBoard: 'noBoard',
    io: 'io',
    noRoute: 'noRoute',
};
export function succeed(data) {
    return { status: 'success', data };
}
export function fail(reason, detail) {
    return detail === undefined
        ? { status: 'error', reason }
        : { status: 'error', reason, detail };
}
