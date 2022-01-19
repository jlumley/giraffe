
export const centsToMoney = (cents) => {
    cents /= 100;
    return cents.toLocaleString("en-US", {style:"currency", currency:"USD"})
}
