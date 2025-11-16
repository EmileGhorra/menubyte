-- Demo seed for restaurant 3a6ceaf4-83e9-46ef-b727-c254a38bed1a (owner ec433e74-aca3-454c-9e8d-067396136825).
-- Run this on Supabase to populate a fully functional showcase menu (≈30 items).

begin;

insert into restaurants (id, owner_id, name, slug, description, hero_image, address, phone, plan_tier, qr_slug)
values (
  '3a6ceaf4-83e9-46ef-b727-c254a38bed1a',
  'ec433e74-aca3-454c-9e8d-067396136825',
  'Atlas Kitchen & Bar',
  'atlas-demo',
  'Seasonal Mediterranean-inspired dishes, handcrafted cocktails, and brunch favorites.',
  '/assets/demo/dish9.png',
  '123 Cedar Lane, Beirut Waterfront',
  '+961 81 605 898',
  'pro',
  'atlas-demo'
)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    hero_image = excluded.hero_image,
    address = excluded.address,
    phone = excluded.phone,
    plan_tier = excluded.plan_tier,
    qr_slug = excluded.qr_slug;

delete from menu_item_options
where item_id in (
  select id from menu_items where category_id in (
    select id from menu_categories where restaurant_id = '3a6ceaf4-83e9-46ef-b727-c254a38bed1a'
  )
);

delete from menu_items
where category_id in (
  select id from menu_categories where restaurant_id = '3a6ceaf4-83e9-46ef-b727-c254a38bed1a'
);

delete from menu_categories where restaurant_id = '3a6ceaf4-83e9-46ef-b727-c254a38bed1a';

insert into menu_categories (id, restaurant_id, title, position) values
  ('6b39c08e-8d82-4ee2-a939-1981a32da4ef', '3a6ceaf4-83e9-46ef-b727-c254a38bed1a', 'Small Plates', 0),
  ('e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', '3a6ceaf4-83e9-46ef-b727-c254a38bed1a', 'Chef Signatures', 1),
  ('116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', '3a6ceaf4-83e9-46ef-b727-c254a38bed1a', 'Sweets & Brunch', 2),
  ('3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', '3a6ceaf4-83e9-46ef-b727-c254a38bed1a', 'Bar Program', 3);

insert into menu_items (id, category_id, name, description, base_price, price_mode, unit_label, image_url, is_available, position) values
  ('cf8ec96f-8b26-4750-8ae8-4f9cd8fa1f73', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Charred Halloumi Skewers', 'Wild thyme honey, burnt lemon, pickled grapes.', 14, 'fixed', null, '/assets/demo/dish6.png', true, 0),
  ('817a5313-f7a1-4c03-aaa7-2e47df1e59b1', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Smoked Beet Carpaccio', 'Labneh mousse, hazelnut crumble, micro herbs.', 12, 'fixed', null, '/assets/demo/dish4.png', true, 1),
  ('b4e33f08-e3a8-4b98-9681-7d0a7257c7b7', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Shawarma Spiced Fries', 'Harissa aioli, preserved lemon dust.', 10, 'fixed', null, '/assets/demo/dish6.png', true, 2),
  ('b8cd4748-f3bb-4c65-8680-ef2184141f24', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Tandoori Cauliflower Bites', 'Coconut yogurt, pistachio dukkah.', 13, 'fixed', null, '/assets/demo/dish3.png', true, 3),
  ('5a43aaa0-e17b-4b7b-acc5-5c3d6030c40c', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Harbor Ceviche', 'Sea bass, citrus leche de tigre, fennel pollen.', 17, 'fixed', null, '/assets/demo/dish4.png', true, 4),
  ('fd5ce323-1f49-4bcb-ab24-cdea1b27db0e', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Fire-Roasted Bone Marrow', 'Sourdough, salsa verde, sumac salt.', 19, 'fixed', null, '/assets/demo/dish9.png', true, 5),
  ('a06f2bcb-dc1f-4177-a3c3-64f6c4b6c5d2', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Lemon Blossom Burrata', 'Vin santo cherries, basil oil.', 16, 'fixed', null, '/assets/demo/dish8.png', true, 6),
  ('1170aa89-02ba-4c9f-bf7d-36e73282155e', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Truffle Mushroom Flatbread', 'Crème fraîche, baby kale, pecorino.', 18, 'fixed', null, '/assets/demo/dish6.png', true, 7),
  ('f62b1e4c-7f5f-4c31-86c4-061acf65f7cb', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Green Tahini Falafel', 'Pickled cucumber, pomegranate molasses.', 11, 'fixed', null, '/assets/demo/dish7.png', true, 8),
  ('9af83c36-ede0-4224-925b-51fac36805d4', '6b39c08e-8d82-4ee2-a939-1981a32da4ef', 'Spiced Lamb Cigars', 'Smoked pepper jam, crispy mint.', 15, 'fixed', null, '/assets/demo/dish7.png', true, 9),

  ('731d3dfe-8a31-4e6b-82d2-3121f26bfb8a', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Fire-Grilled Ribeye Cap', 'Black garlic butter, roasted marrow jus.', 42, 'fixed', null, '/assets/demo/dish8.png', true, 0),
  ('aa20246d-a0bc-4d24-b7f4-12214659e6b8', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Saffron Seafood Paella', 'Lobster tail, mussels, charred lemon.', 38, 'per_weight', 'per 400g', '/assets/demo/dish6.png', true, 1),
  ('1601d3a3-b1f4-42b3-b787-74c943d7dc32', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', '48h Short Rib Tagliatelle', 'Bone-marrow gremolata, pecorino snow.', 34, 'fixed', null, '/assets/demo/dish9.png', true, 2),
  ('a87726d4-9a51-4fb5-a2cc-01519f2e696e', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Misoyaki Salmon Collar', 'Charred scallions, yuzu kosho butter.', 30, 'fixed', null, '/assets/demo/dish6.png', true, 3),
  ('6de6ae75-1391-4b8b-abc9-20534cb43d0d', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Wood-Fired Sea Bass', 'Fennel confit, saffron beurre blanc.', 36, 'per_weight', 'per fillet', '/assets/demo/dish4.png', true, 4),
  ('1da97c4e-167f-4ed7-9a97-3647e6a81518', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Chermoula Chicken Supreme', 'Smoked eggplant purée, crispy shallots.', 27, 'fixed', null, '/assets/demo/dish9.png', true, 5),
  ('7a3fefef-31cd-4d44-975b-73a3ef98726a', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Wild Mushroom Risotto', 'Parmesan espuma, truffle ash.', 24, 'fixed', null, '/assets/demo/dish4.png', true, 6),
  ('7e17a603-e2ee-4232-9316-afe2d9df6a00', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Korean BBQ Lamb Chops', 'Fermented chili glaze, sesame crumble.', 35, 'fixed', null, '/assets/demo/dish8.png', true, 7),
  ('c1d6be3b-852b-4a16-b7bb-0f11fecad396', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Gnocchi Verde', 'Basil pesto velouté, blistered tomatoes.', 22, 'fixed', null, '/assets/demo/dish4.png', true, 8),
  ('4c97c0da-d41d-4bdd-8f8c-5c3fcae73bd2', 'e98d8f93-b74c-45f5-9e7a-0d2be8323b7b', 'Ember-Roasted Octopus', 'Smoked paprika glaze, charred romaine.', 29, 'fixed', null, '/assets/demo/dish9.png', true, 9),

  ('3ad3de98-6fd1-471f-b51a-ecf4b2c9f1bf', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Pistachio Honey Baklava', 'Orange blossom chantilly, gold leaf.', 12, 'fixed', null, '/assets/demo/dish6.png', true, 0),
  ('49cbbaf8-29bf-4a34-a940-0936617c772a', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Dark Chocolate Tahini Torte', 'Sesame praline, raspberry sorbet.', 13, 'fixed', null, '/assets/demo/dish4.png', true, 1),
  ('4970799c-7fe5-43b1-9492-5d086769a7a1', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Cardamom Crème Brûlée', 'Burnt sugar, rose petals.', 11, 'fixed', null, '/assets/demo/dish6.png', true, 2),
  ('67c2f463-c10c-4ebd-a672-d6eff6edc5fa', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Brûléed French Toast', 'Brioche, maple mascarpone, berry compote.', 18, 'per_quantity', 'per portion', '/assets/demo/dish5.png', true, 3),
  ('c5a4f40f-0db9-4c23-9a6f-3e7e0f7e2b0d', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Golden Croissant Stack', 'Vanilla chantilly, roasted figs, mint.', 16, 'per_quantity', 'per stack', '/assets/demo/dish6.png', true, 4),
  ('fd1e0b3c-6d34-4731-abe1-3efb5c2a0558', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Phyllo-Wrapped Cheesecake', 'Apricot jam, toasted almonds.', 15, 'fixed', null, '/assets/demo/dish6.png', true, 5),
  ('c58b82e6-4e2c-4a79-b75f-1a4acb0c0bde', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Citrus Olive Oil Cake', 'Lemon curd, candied pistachio.', 12, 'fixed', null, '/assets/demo/dish1.png', true, 6),
  ('1f3dbed9-99d1-4ecb-9cc0-0c2f327ce4ec', '116aca98-3f3e-4a1e-8c42-c2e7f1c11cc9', 'Greek Yogurt Parfait', 'Seasonal fruit, honeycomb, granola.', 10, 'per_quantity', 'per jar', '/assets/demo/dish1.png', true, 7),

  ('1ec1a50b-d005-4518-b7b4-9b3b6f581ece', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Sunset Spritz', 'Aperol, blood orange, sparkling rosé.', 14, 'fixed', null, '/assets/demo/dish6.png', true, 0),
  ('6f04de09-0858-4025-843f-9a3d55bf9310', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Atlas Old Fashioned', 'Cedar-smoked bourbon, date syrup, bitters.', 16, 'fixed', null, '/assets/demo/dish2.png', true, 1),
  ('d0b6c33f-a1a3-4b0e-b61a-eebae4fb803a', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Garden Gin & Tonic', 'Cucumber tonic, rosemary, pink peppercorn.', 13, 'fixed', null, '/assets/demo/dish2.png', true, 2),
  ('a6e9a559-86b4-4d09-9c8d-0cd7f736d919', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Smoked Hibiscus Margarita', 'Oaxaca mezcal, hibiscus cordial, citrus.', 15, 'fixed', null, '/assets/demo/dish2.png', true, 3),
  ('3c928cef-b5b8-4339-8ce9-2ad85ca1acdc', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'House Cold Brew', 'Single-origin beans, vanilla cream.', 8, 'per_quantity', 'per glass', '/assets/demo/dish2.png', true, 4),
  ('fb0a01d8-cc8e-4dff-acfa-29a080b47b50', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Nitro Espresso Martini', 'Vodka, coffee liqueur, cold brew foam.', 16, 'fixed', null, '/assets/demo/dish2.png', true, 5),
  ('5d3f79d2-cc90-4eb6-bba5-88645a04dd0d', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Cedar-Smoked Negroni', 'Gin, Campari, house vermouth blend.', 15, 'fixed', null, '/assets/demo/dish2.png', true, 6),
  ('b4bd13cb-1e62-4ea6-9b6d-6032bc5fcb4f', '3fc49c0b-7168-462b-9e2a-357d2b3a1c1e', 'Seasonal Mocktail Flight', 'Three zero-proof pours with seasonal botanicals.', 18, 'per_quantity', 'per flight', '/assets/demo/dish2.png', true, 7);

insert into menu_item_options (id, item_id, label, price, unit_label, position) values
  ('6d3b0e4c-5aa2-4ae5-bf83-9b57a8d59f8f', 'aa20246d-a0bc-4d24-b7f4-12214659e6b8', '1-2 guests', 38, 'per 400g', 0),
  ('5cb82d32-1a3d-47b1-af1c-758671c6981d', 'aa20246d-a0bc-4d24-b7f4-12214659e6b8', '3-4 guests', 64, 'per 700g', 1),
  ('a51e3997-4fd1-48f0-8d25-9fd7a18d59df', '6de6ae75-1391-4b8b-abc9-20534cb43d0d', 'Whole fillet', 36, 'per fillet', 0),
  ('4a2d1bcf-9d3d-4f91-96ca-f749664df995', '6de6ae75-1391-4b8b-abc9-20534cb43d0d', 'Shareable platter', 58, 'serves 2', 1),
  ('b508b860-5f8e-4c6f-8c3a-d5177104df85', '67c2f463-c10c-4ebd-a672-d6eff6edc5fa', 'Classic maple', 18, 'per portion', 0),
  ('e7b09821-9de9-4d63-9c3b-ffac4bb0b55d', '67c2f463-c10c-4ebd-a672-d6eff6edc5fa', 'Berry compote', 20, 'per portion', 1),
  ('ccf4d19e-76e5-4c1f-a5a0-639c82f7bf17', 'c5a4f40f-0db9-4c23-9a6f-3e7e0f7e2b0d', 'Single stack', 16, 'per stack', 0),
  ('6bd2f4c0-5b6d-4b7d-9f5c-50d12c1f0c85', 'c5a4f40f-0db9-4c23-9a6f-3e7e0f7e2b0d', 'Family stack', 28, 'serves 3', 1),
  ('2f2adf4e-5088-4a5b-8dbb-28d167a49b30', '1f3dbed9-99d1-4ecb-9cc0-0c2f327ce4ec', 'Granola crunch', 10, 'per jar', 0),
  ('e981f4cb-efcb-44a1-a5b3-9e0d7b0d40df', '1f3dbed9-99d1-4ecb-9cc0-0c2f327ce4ec', 'Tropical fruit', 12, 'per jar', 1),
  ('8f7e87ec-a9ae-4a86-8468-94b3dc4ae065', '3c928cef-b5b8-4339-8ce9-2ad85ca1acdc', 'Classic cold brew', 8, 'per glass', 0),
  ('77e8e7b4-8a13-43e9-bbbb-1fe288d9ca0f', '3c928cef-b5b8-4339-8ce9-2ad85ca1acdc', 'Oat milk vanilla', 9, 'per glass', 1),
  ('43b2cb3d-0f11-46d9-aef2-9a06bba53616', 'b4bd13cb-1e62-4ea6-9b6d-6032bc5fcb4f', 'Botanical trio', 18, 'per flight', 0),
  ('21c4c7a7-769d-4c51-a9b2-55f9ebd9c53e', 'b4bd13cb-1e62-4ea6-9b6d-6032bc5fcb4f', 'Tropical trio', 18, 'per flight', 1);

commit;
