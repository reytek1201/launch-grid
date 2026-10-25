-- Optional links to the restaurant's online ordering and booking pages (Toast, OpenTable, Resy, DoorDash, their own...).
-- Both are https only. When set, the site shows "Order online" buttons and a "Book online" card.
alter table trattoria_demo.settings
  add column order_url text check (order_url is null or (char_length(order_url) <= 300 and order_url ~ '^https://[^[:space:]]+$')),
  add column reserve_url text check (reserve_url is null or (char_length(reserve_url) <= 300 and reserve_url ~ '^https://[^[:space:]]+$'));
