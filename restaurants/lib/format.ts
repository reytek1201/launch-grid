export const price = (cents: number | null) => (cents === null ? "MP" : `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`);
export const address = (a: { street: string; city: string; state: string; zip: string }) => `${a.street}, ${a.city}, ${a.state} ${a.zip}`;
