-- Specials banner: one short line shown at the top of every public page while it is switched on
-- (and, if a date is set, until the end of that day in the restaurant's time zone).
alter table trattoria_demo.settings
  add column banner_text text check (banner_text is null or char_length(banner_text) <= 140),
  add column banner_on boolean not null default false,
  add column banner_until date;
