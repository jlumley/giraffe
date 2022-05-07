
export const centsToMoney = (cents) => {
    if (!cents) cents = 0
    cents /= 100;
    const absCents = Math.abs(cents)
    const value = absCents.toLocaleString("en-US", { style: "currency", currency: "USD" })
    return cents < 0 ? `(${value})` : value;
}
