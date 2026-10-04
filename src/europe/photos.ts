/**
 * Placeholder photography (Unsplash, free licence) until Raphael's own work
 * arrives. Swap the ids — or point `photoUrl` at local files — and every card,
 * mockup and the home logo follow.
 */
export const FOOD_PHOTOS = [
  '1414235077428-338989a2e8c0', // plated dish, candlelit table
  '1467003909585-2f8a72700288', // fish, fine dining
  '1504674900247-0877df9cc836', // table from above
  '1540189549336-e6e99c3679fe', // salad, dark plate
  '1482049016688-2d3e1b311543', // eggs and avocado, dark
  '1476224203421-9ac39bcb3327', // sharing board
  '1544025162-d76694265947', // ribs on board
  '1529042410759-befb1204b468', // meatballs
  '1565299624946-b28f40a0ae38', // pizza on wood
  '1513104890138-7c749659a591', // pizza, rustic
  '1424847651672-bf20a4b0982b', // brunch table
];

export const ROOM_PHOTOS = [
  '1517248135467-4c7edcad34c4', // dark dining room
  '1555396273-367ea4eb4db5', // café interior
];

export const photoUrl = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

export const foodPhoto = (seed: number, width?: number) => photoUrl(FOOD_PHOTOS[Math.abs(seed) % FOOD_PHOTOS.length], width);
export const roomPhoto = (seed: number, width?: number) => photoUrl(ROOM_PHOTOS[Math.abs(seed) % ROOM_PHOTOS.length], width);
