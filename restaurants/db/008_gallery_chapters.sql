-- Gallery photos get a chapter (the sign they hang under on the public Gallery), and the demo's sample photos
-- become rows, so the admin can reorder, caption, hide or delete them like any upload.
-- path "sample:<key>" points at a photo shipped with the site (clients/demo/images.json) instead of a stored file.

alter table trattoria_demo.gallery_photos
  add column chapter text not null default 'nuove' check (chapter in ('sala','cucina','cantina','tavola','nuove'));

insert into trattoria_demo.gallery_photos (id, path, chapter, caption, alt, width, height, sort) values
('sample-sp-01', 'sample:sp-01', 'sala', 'Look for the lemon trees.', 'Brick corner trattoria at dusk with amber arched windows, an olive-green door, lemon trees in terracotta pots and a blank hanging wooden sign', 1376, 768, 0),
('sample-sp-03', 'sample:sp-03', 'sala', 'The long table, set for Sunday.', 'Long communal oak table set for dinner in a candlelit brick trattoria, five paper lanterns hanging in a row, wood-fired oven glowing at the back', 1376, 768, 1),
('sample-sp-03b', 'sample:sp-03b', 'sala', 'Same table, after dark.', 'The same dining room at dusk, candles, sconces and oven fire lighting the table, deep blue sky in the windows', 1376, 768, 2),
('sample-sp-08', 'sample:sp-08', 'sala', 'The window booth. Ask for it.', 'A window booth at golden hour with a red-and-cream checkered tablecloth, a candle in a wine bottle and a glass of red wine', 896, 1200, 3),
('sample-sp-11', 'sample:sp-11', 'sala', 'Five lanterns, five moons.', 'Five round glowing paper lanterns hanging in a row from a dark oak beam against a limewash wall', 1376, 768, 4),
('sample-sp-04', 'sample:sp-04', 'cucina', 'The oven never really goes out.', 'Arched brick wood-fired oven with a roaring fire, copper pots on shelves and a flour-dusted peel in a candlelit trattoria', 896, 1200, 5),
('sample-sp-06', 'sample:sp-06', 'cucina', 'Rolled every morning.', 'Floured hands rolling out fresh pasta dough with a wooden rolling pin on a worn oak board, with eggs, a bowl of semolina and candles behind', 896, 1200, 6),
('sample-sp-09', 'sample:sp-09', 'cucina', 'Tomatoes, flour, patience.', 'Pantry shelves with jars of whole tomatoes, bundles of dried pasta, plain olive-oil tins, a bowl of lemons, strings of garlic and chilies beside a lit brass sconce', 1200, 896, 7),
('sample-sp-07', 'sample:sp-07', 'cantina', 'The bar, before service.', 'Corner of the bar with a worn oak counter, wine glasses, bottles on wooden shelves, a lit brass sconce and a blank chalkboard on an ochre wall', 1200, 896, 8),
('sample-sp-13', 'sample:sp-13', 'cantina', 'Down the stairs.', 'A low barrel-vaulted brick wine cellar seen down its length, with dark oak racks of unlabelled bottles on both walls, small candles, two oak barrels and a glowing arched doorway at the far end', 1376, 768, 9),
('sample-sp-14', 'sample:sp-14', 'cantina', 'A first pour.', 'A hand and linen sleeve pouring red wine from a plain dark green bottle into a glass on a dark oak table, with paper lanterns glowing out of focus behind', 1376, 768, 10),
('sample-sp-05', 'sample:sp-05', 'tavola', 'Set and waiting.', 'Overhead view of a cream plate with a terracotta rim, brass cutlery and a linen napkin on a dark oak table', 1024, 1024, 11),
('sample-sp-12', 'sample:sp-12', 'tavola', 'Coffee, and one more bite.', 'Two steaming espresso cups and a brass coffee pot on a tray beside a half-eaten slice of tiramisu on a cream plate with a terracotta rim', 896, 1200, 12),
('sample-sp-10', 'sample:sp-10', 'tavola', 'Last candle of the night.', 'A single candle with wax drips burning in an unlabelled wine bottle on a dark oak table, with softly blurred glowing paper lanterns behind', 1200, 896, 13)
on conflict (id) do nothing;
