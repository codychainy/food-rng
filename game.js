'use strict';

// ---------- Tiers ----------
const TIERS = {
  common:    { label: 'Common',    color: '#b0b7c3' },
  uncommon:  { label: 'Uncommon',  color: '#5ad15a' },
  rare:      { label: 'Rare',      color: '#3fa9f5' },
  epic:      { label: 'Epic',      color: '#b05cff' },
  legendary: { label: 'Legendary', color: '#ffb627' },
  mythic:    { label: 'Mythic',    color: '#ff4fa3' },
  divine:    { label: 'Divine',    color: '#ffe9a3' },
  eternal:   { label: 'Eternal',   color: '#7df9ff' },
  secret:    { label: 'Secret',    color: '#00ffc8' },
  meal:      { label: 'Meal',      color: '#ff9f43' },
};
const TIER_ORDER = Object.keys(TIERS);

// ---------- Events ----------
// from/to are [month, day] with January = 0, both days included.
// Event foods only roll during the event, but anything you got stays yours. Event stuff
// never counts toward the "find every..." achievements, so missing an event doesn't lock you out.
const EVENTS = {
  halloween: { icon: '🎃', name: 'Halloween', from: [9, 24], to: [10, 2], banner: 'Halloween event until Nov 2: spooky foods are in the roll' },
};
// Opening the game from your own computer with ?event=halloween turns an event on outside its dates, for testing
const TEST_EVENT = location.protocol === 'file:' ? new URLSearchParams(location.search).get('event') : null;
function eventOn(id) {
  if (TEST_EVENT === id) return true;
  const e = EVENTS[id];
  const d = new Date();
  const today = d.getMonth() * 100 + d.getDate();
  return today >= e.from[0] * 100 + e.from[1] && today <= e.to[0] * 100 + e.to[1];
}
const notEvent = x => !x.event;

// ---------- Foods ----------
// Each row: [id, name, emoji, chance (1 in N), luck bonus, speed bonus, buff seconds]. +1 = +100%.
const rows = (tier, list) => list.map(([id, name, emoji, chance, luck, speed, time]) => ({ id, name, emoji, chance, tier, luck, speed, time }));
const spooky = (tier, list) => rows(tier, list).map(f => ({ ...f, event: 'halloween' }));

const FOODS = [
  ...rows('common', [
    ['bread', 'Bread', '🍞', 1, 0.02, 0, 30],
    ['apple', 'Apple', '🍎', 3, 0.1, 0, 60],
    ['rice', 'Rice', '🍚', 3, 0, 0.1, 45],
    ['banana', 'Banana', '🍌', 4, 0, 0.15, 60],
    ['carrot', 'Carrot', '🥕', 4, 0.15, 0, 60],
    ['egg', 'Egg', '🥚', 5, 0.08, 0.05, 60],
    ['potato', 'Potato', '🥔', 5, 0.12, 0, 60],
    ['corn', 'Corn', '🌽', 6, 0, 0.12, 60],
    ['cucumber', 'Cucumber', '🥒', 6, 0.05, 0.1, 60],
    ['tomato', 'Tomato', '🍅', 7, 0.15, 0, 60],
    ['pear', 'Pear', '🍐', 7, 0, 0.15, 60],
    ['orange', 'Orange', '🍊', 8, 0.1, 0.1, 60],
    ['grapes', 'Grapes', '🍇', 9, 0.2, 0, 60],
    ['broccoli', 'Broccoli', '🥦', 10, 0.1, 0.15, 75],
    ['onion', 'Onion', '🧅', 12, 0.25, 0, 75],
    ['greenapple', 'Green Apple', '🍏', 4, 0.1, 0.05, 60],
    ['lemon', 'Lemon', '🍋', 6, 0, 0.15, 60],
    ['peanuts', 'Peanuts', '🥜', 8, 0.12, 0, 60],
    ['lettuce', 'Lettuce', '🥬', 9, 0.05, 0.12, 60],
    ['peas', 'Peas', '🫛', 10, 0.15, 0, 75],
    ['milk', 'Milk', '🥛', 11, 0.1, 0.1, 75],
  ]),
  ...rows('uncommon', [
    ['cheese', 'Cheese', '🧀', 15, 0.25, 0, 90],
    ['pancakes', 'Pancakes', '🥞', 16, 0, 0.3, 90],
    ['taco', 'Taco', '🌮', 18, 0.2, 0.2, 90],
    ['pretzel', 'Pretzel', '🥨', 20, 0.4, 0, 90],
    ['waffle', 'Waffle', '🧇', 22, 0.15, 0.3, 90],
    ['popcorn', 'Popcorn', '🍿', 24, 0, 0.4, 90],
    ['hotdog', 'Hot Dog', '🌭', 26, 0.3, 0.1, 90],
    ['fries', 'Fries', '🍟', 28, 0, 0.35, 90],
    ['sandwich', 'Sandwich', '🥪', 30, 0.35, 0, 90],
    ['burrito', 'Burrito', '🌯', 32, 0.25, 0.25, 90],
    ['bagel', 'Bagel', '🥯', 35, 0.4, 0, 90],
    ['watermelon', 'Watermelon', '🍉', 38, 0.2, 0.3, 100],
    ['strawberry', 'Strawberry', '🍓', 40, 0.45, 0, 100],
    ['cherries', 'Cherries', '🍒', 42, 0, 0.45, 100],
    ['peach', 'Peach', '🍑', 45, 0.3, 0.2, 100],
    ['coconut', 'Coconut', '🥥', 48, 0.5, 0, 100],
    ['kiwi', 'Kiwi', '🥝', 50, 0, 0.5, 100],
    ['dumpling', 'Dumpling', '🥟', 55, 0.35, 0.25, 100],
    ['melon', 'Melon', '🍈', 17, 0.25, 0.1, 90],
    ['bellpepper', 'Bell Pepper', '🫑', 19, 0, 0.35, 90],
    ['eggplant', 'Eggplant', '🍆', 23, 0.3, 0, 90],
    ['chestnut', 'Roasted Chestnut', '🌰', 27, 0.35, 0, 90],
    ['beans', 'Beans', '🫘', 31, 0.2, 0.25, 90],
    ['cookie', 'Cookie', '🍪', 36, 0.4, 0.05, 100],
    ['coffee', 'Coffee', '☕', 44, 0, 0.5, 100],
    ['olive', 'Olives', '🫒', 52, 0.45, 0.05, 100],
  ]),
  ...rows('rare', [
    ['sushi', 'Sushi', '🍣', 64, 0.5, 0, 120],
    ['pizza', 'Pizza', '🍕', 75, 0.5, 0.5, 120],
    ['donut', 'Sprinkle Donut', '🍩', 80, 0, 1, 120],
    ['icecream', 'Ice Cream', '🍦', 90, 0.6, 0, 120],
    ['shavedice', 'Shaved Ice', '🍧', 100, 0, 0.8, 120],
    ['cupcake', 'Cupcake', '🧁', 110, 0.6, 0.3, 120],
    ['chocolate', 'Chocolate Bar', '🍫', 120, 0.7, 0, 120],
    ['lollipop', 'Lollipop', '🍭', 130, 0.3, 0.7, 120],
    ['candy', 'Candy', '🍬', 140, 0.5, 0.5, 120],
    ['curry', 'Curry', '🍛', 150, 0.8, 0, 130],
    ['spaghetti', 'Spaghetti', '🍝', 160, 0.4, 0.6, 130],
    ['bento', 'Bento Box', '🍱', 175, 0.7, 0.3, 130],
    ['oden', 'Oden Skewer', '🍢', 190, 0, 1.1, 130],
    ['mooncake', 'Mooncake', '🥮', 200, 0.9, 0, 130],
    ['fortune', 'Fortune Cookie', '🥠', 220, 1, 0, 130],
    ['tamale', 'Tamale', '🫔', 240, 0.5, 0.6, 140],
    ['falafel', 'Falafel', '🧆', 260, 0.6, 0.6, 140],
    ['paella', 'Paella', '🥘', 280, 0.8, 0.4, 140],
    ['steak', 'Steak', '🥩', 300, 0.9, 0.3, 140],
    ['drumstick', 'Drumstick', '🍗', 320, 0.5, 0.9, 140],
    ['ginger', 'Ginger Root', '🫚', 70, 0.4, 0.4, 120],
    ['meatbone', 'Meat on the Bone', '🍖', 85, 0.6, 0.2, 120],
    ['dango', 'Dango', '🍡', 95, 0.3, 0.6, 120],
    ['ricecracker', 'Rice Cracker', '🍘', 105, 0.5, 0.3, 120],
    ['shrimp', 'Shrimp', '🦐', 125, 0.7, 0.2, 130],
    ['cannedsoup', 'Canned Soup', '🥫', 145, 0.6, 0.4, 130],
    ['tea', 'Pot of Tea', '🫖', 170, 0.4, 0.7, 130],
    ['pumpkin', 'Pumpkin Pie', '🎃', 210, 0.9, 0, 140],
    ['mate', 'Yerba Mate', '🧉', 250, 0, 1.2, 140],
    ['fish', 'Grilled Fish', '🐟', 290, 0.8, 0.4, 140],
  ]),
  ...rows('epic', [
    ['croissant', 'Golden Croissant', '🥐', 400, 1, 0, 150],
    ['ramen', 'Spicy Ramen', '🍜', 500, 1, 0.5, 180],
    ['lobster', 'Royal Lobster', '🦞', 650, 1.5, 1, 180],
    ['crab', 'Crab Feast', '🦀', 800, 1.2, 0.8, 180],
    ['tempura', 'Shrimp Tempura', '🍤', 900, 1, 1.2, 180],
    ['fondue', 'Cheese Fondue', '🫕', 1000, 1.6, 0, 180],
    ['mango', 'Mango Lassi', '🥭', 1100, 0.8, 1.5, 180],
    ['blueberry', 'Blueberry Tart', '🫐', 1250, 1.8, 0, 180],
    ['squid', 'Squid Ink Pasta', '🦑', 1400, 1.4, 1, 190],
    ['oyster', 'Oyster Pearl', '🦪', 1600, 2, 0, 190],
    ['bubbletea', 'Bubble Tea', '🧋', 1800, 1, 1.6, 190],
    ['avocado', 'Avocado Toast', '🥑', 2000, 1.8, 0.6, 190],
    ['maple', 'Maple Syrup Stack', '🍁', 2200, 1.5, 1.2, 200],
    ['garlic', 'Garlic Bread', '🧄', 2400, 2.2, 0, 200],
    ['pineapple', 'Pineapple Express', '🍍', 2600, 1, 2, 200],
    ['bacon', 'Bacon Tower', '🥓', 2800, 2, 1, 200],
    ['matcha', 'Matcha Tea', '🍵', 3000, 2.5, 0.5, 200],
    ['fugu', 'Fugu', '🐡', 450, 1.4, 0, 180],
    ['honeycomb', 'Honeycomb', '🐝', 700, 1.2, 0.8, 180],
    ['sakura', 'Sakura Mochi', '🌸', 950, 1.5, 0.5, 180],
    ['cactus', 'Cactus Fruit', '🌵', 1150, 1, 1.4, 190],
    ['rosetea', 'Rose Tea', '🌹', 1500, 1.7, 0.4, 190],
    ['reef', 'Reef Platter', '🐠', 1700, 1.6, 0.8, 190],
    ['glacier', 'Glacier Ice', '🧊', 2100, 0.8, 2, 200],
    ['butterflytea', 'Butterfly Pea Tea', '🦋', 2500, 2.2, 0.5, 200],
    ['herbroast', 'Herb Roast', '🌿', 2900, 2.4, 0.6, 200],
  ]),
  ...rows('legendary', [
    ['dragonfruit', 'Dragon Fruit', '🐉', 5000, 3, 0, 180],
    ['rainbowcake', 'Rainbow Cake', '🎂', 6600, 2, 1, 240],
    ['truffle', 'Black Truffle', '🍄', 8500, 4, 0, 240],
    ['unicorn', 'Unicorn Shake', '🦄', 9700, 3, 1.5, 240],
    ['kraken', 'Kraken Calamari', '🐙', 11500, 4, 1, 240],
    ['thunder', 'Thunder Steak', '⛈️', 13100, 3, 3, 240],
    ['volcano', 'Volcano Pizza', '🌋', 14700, 5, 1, 260],
    ['frost', 'Frost Pudding', '🍮', 17400, 4, 2, 260],
    ['pharaoh', "Pharaoh's Feast", '🏺', 19900, 6, 0, 260],
    ['mermaid', 'Mermaid Sushi', '🧜', 22200, 5, 2, 280],
    ['moon', 'Moon Cheese', '🌙', 24400, 6, 1, 280],
    ['aurora', 'Aurora Sorbet', '🌠', 26400, 5, 3, 280],
    ['sunflower', 'Sunflower Bread', '🌻', 28300, 7, 0, 300],
    ['diamond', 'Diamond Candy', '💎', 30000, 7, 2, 300],
    ['starcookie', 'Star Cookie', '⭐', 5800, 3, 1, 240],
    ['snowflake', 'Snowflake Sorbet', '❄️', 7600, 3.5, 1, 240],
    ['tsunami', 'Tsunami Soup', '🌊', 10800, 4, 1.5, 250],
    ['rainbownoodles', 'Rainbow Noodles', '🌈', 14100, 4.5, 1.5, 260],
    ['lightning', 'Lightning Lemonade', '⚡', 16100, 3, 4, 260],
    ['mountain', 'Mountain Cheese', '🏔️', 21100, 6, 0.5, 280],
    ['wizardwaffle', 'Wizard Waffle', '🪄', 27400, 6.5, 2, 300],
  ]),
  // Odds pass on 2026-10-25 (4h of play gave 1 mythic): mythic 3x easier, eternal 10x easier.
  // Legendary (5k-30k) and divine (300k-9M) were squeezed so every tier keeps its own range of odds.
  ...rows('mythic', [
    ['cosmicburger', 'Cosmic Burger', '🍔', 33000, 10, 0, 300],
    ['phoenix', 'Phoenix Wing', '🔥', 50000, 8, 3, 300],
    ['galaxy', 'Galaxy Gelato', '🪐', 66000, 12, 2, 300],
    ['timetaco', "Time Traveler's Taco", '⏳', 83000, 10, 5, 300],
    ['ghostpepper', 'Ghost Pepper', '👻', 100000, 14, 3, 320],
    ['robotramen', 'Robot Ramen', '🤖', 133000, 12, 6, 320],
    ['alienjelly', 'Alien Jelly', '👽', 166000, 16, 4, 340],
    ['crystalapple', 'Crystal Apple', '🔮', 216000, 20, 2, 360],
    ['tornado', 'Tornado Noodles', '🌪️', 266000, 15, 8, 360],
    ['fireworks', 'Firework Fizz', '🎆', 40000, 9, 4, 300],
    ['potion', 'Potion Pudding', '🧪', 60000, 11, 3, 320],
    ['alchemist', "Alchemist's Stew", '⚗️', 116000, 13, 4, 330],
    ['mutantmelon', 'Mutant Melon', '🧬', 150000, 14, 2, 340],
    ['dizzy', 'Dizzy Dumplings', '💫', 233000, 12, 8, 360],
  ]),
  ...rows('divine', [
    ['ambrosia', 'Ambrosia', '🍯', 300000, 0, 0, 0],
    ['angelcake', 'Angel Cake', '😇', 550000, 25, 5, 400],
    ['sunsoup', 'Sun Soup', '☀️', 780000, 30, 8, 450],
    ['infinity', 'Infinity Pasta', '♾️', 1200000, 40, 10, 500],
    ['harvest', "Heaven's Harvest", '🌾', 1750000, 0, 0, 0],
    ['bigbang', 'Big Bang Bagel', '💥', 5000000, 60, 15, 600],
    ['lastcrumb', 'The Last Crumb', '✨', 9000000, 100, 20, 600],
    ['sunrise', 'Sunrise Souffle', '🌞', 425000, 28, 6, 420],
    ['starlight', 'Starlight Sundae', '🌟', 1000000, 35, 10, 480],
    ['celebration', 'Celebration Cake', '🎇', 3150000, 50, 12, 550],
  ]),
  ...rows('eternal', [
    ['quantum', 'Quantum Quiche', '⚛️', 10000000, 150, 20, 600],
    ['eclipse', 'Eclipse Eclair', '🌑', 20000000, 200, 10, 600],
    ['nebula', 'Nebula Noodles', '🌀', 35000000, 250, 25, 650],
    ['oracle', 'Oracle Olive', '🧿', 50000000, 350, 15, 700],
    ['comet', 'Comet Cobbler', '☄️', 75000000, 400, 40, 700],
    ['dimension', 'Dimension Donut', '🌐', 100000000, 500, 30, 750],
    ['omega', 'Omega Omelette', '🔱', 250000000, 700, 50, 800],
    ['genesis', 'Genesis Grape', '🌱', 500000000, 850, 40, 850],
    ['firstrecipe', 'The First Recipe', '📜', 1000000000, 1000, 60, 900],
    ['milkyway', 'Milky Way Milkshake', '🌌', 30000000, 280, 20, 650],
    ['eternalegg', 'The Eternal Egg', '🪺', 750000000, 900, 50, 880],
  ]),

  // Secrets: hidden from the index, unlocked by doing something special
  // Was Burnt Toast; the id stays 'burnttoast' so old saves and the Panic Pancakes recipe keep working
  { id: 'burnttoast', name: 'Burnt Melon', emoji: '🍉', img: 'watermelon', filter: 'brightness(0.35) sepia(1) contrast(1.2)', tier: 'secret', luck: 1, time: 60,
    hint: 'Some melons have a temper.' },
  { id: 'glitchcookie', name: 'Glitched Cookie', emoji: '🍪', tier: 'secret', luck: 7.77, time: 77,
    hint: 'Thirty lives, if you know the way.' },
  { id: 'midnightsoup', name: 'Midnight Soup', emoji: '🍲', chance: 500, tier: 'secret', luck: 2.5, speed: 1, time: 300,
    hint: 'Some kitchens keep odd hours.', rollable: () => new Date().getHours() === 0 },
  { id: 'clover', name: 'Lucky Clover Salad', emoji: '🍀', tier: 'secret', luck: 7.77, time: 177,
    hint: 'Keep count. Luck has a favourite number.' },
  { id: 'codepie', name: 'Code Pie', emoji: '🥧', tier: 'secret', speed: 2, time: 120,
    hint: 'The codes book answers to a job title.' },
  { id: 'crownbread', name: 'Crown Bread', emoji: '👑', tier: 'secret', perm: 0.25,
    hint: 'Even the humblest food has a king.' },
  { id: 'goldenspoon', name: 'Golden Spoon', emoji: '🥄', tier: 'secret', luck: 3, speed: 1, time: 240,
    hint: 'Good things come to those who do nothing.' },
  { id: 'upsidecake', name: 'Upside-Down Cake', emoji: '🙃', tier: 'secret', luck: 2, speed: 2, time: 180,
    hint: 'Your food has another side. Several, actually.' },
  { id: 'emptyplate', name: 'Spotless Plate', emoji: '🍽️', tier: 'secret', perm: 0.3,
    hint: 'Nothing left. Not even crumbs.' },
  { id: 'feastmedal', name: 'Feast Medal', emoji: '🏅', tier: 'secret', perm: 0.5,
    hint: 'A big appetite gets noticed.' },
  { id: 'jackpot', name: 'Jackpot Jelly', emoji: '🎰', tier: 'secret', luck: 7, time: 200,
    hint: 'Deja vu. Deja vu. Deja vu. Deja vu.' },
  { id: 'secretsauce', name: 'Secret Sauce', emoji: '🫙', tier: 'secret', luck: 4, speed: 1, time: 240,
    hint: 'Some codes hide in plain sight.' },
  // Glazed donut secrets
  { id: 'doubleglaze', name: 'Double-Glazed Donut', emoji: '🍩', img: 'donut', tier: 'secret', luck: 2, speed: 2, time: 240,
    filter: 'saturate(1.6) brightness(1.2) drop-shadow(0 0 12px #ffb86b) drop-shadow(0 0 24px #ffb86b)',
    hint: 'Sticky, if the sprinkles cooperate.' },
  { id: 'sugarrush', name: 'Sugar Rush', emoji: '🍬', img: 'donut', tier: 'secret', speed: 5, time: 90,
    filter: 'hue-rotate(290deg) saturate(2) drop-shadow(0 0 12px #ff66cc)',
    hint: 'Some sweets hit harder than others.' },
  // Treasure hunt: 4 steps, each clue appears as this secret's hint (see TREASURE_CLUES)
  { id: 'treasure', name: 'Buried Treasure', emoji: '🪙', img: 'coin', tier: 'secret', perm: 0.4, forceMut: { id: 'golden', rolls: 5 },
    hint: () => TREASURE_CLUES[Math.min(save.treasure, TREASURE_CLUES.length - 1)] },
  // Rewards for the three newer hunts (see HUNTS). Their hint is the hunt's current clue.
  { id: 'molestash', name: "Mole's Stash", emoji: '🥔', img: 'potato', tier: 'secret', perm: 0.3,
    filter: 'sepia(1) saturate(4) brightness(1.1) drop-shadow(0 0 14px #ffd700)', hint: () => huntHint('mole') },
  { id: 'chefslockbox', name: "Chef's Lockbox", emoji: '🔐', img: 'lockbox', tier: 'secret', luck: 5, time: 300,
    floor: { tier: 'legendary', rolls: 3 }, hint: () => huntHint('safe') },
  { id: 'stardust', name: 'Stardust Donut', emoji: '🍩', img: 'donut', tier: 'secret', luck: 5, mutBoost: 5, time: 300,
    hint: () => huntHint('comet') },
  // Odds and ends
  { id: 'tinytoast', name: 'Tiny Toast', emoji: '🍞', img: 'bread', tier: 'secret', luck: 2, time: 120,
    filter: 'brightness(1.15) drop-shadow(0 0 6px #ffe2a8)', hint: 'Small things matter too.' },
  { id: 'giantloaf', name: 'Giant Loaf', emoji: '🍞', img: 'bread', tier: 'secret', perm: 0.2,
    filter: 'saturate(1.4) drop-shadow(0 0 18px #ffb627)', hint: 'Some loaves do not fit in the oven.' },
  { id: 'rainbowplate', name: 'Rainbow Plate', emoji: '🌈', img: 'emptyplate', tier: 'secret', luck: 3, mutBoost: 3, time: 300,
    filter: 'hue-rotate(200deg) saturate(3) drop-shadow(0 0 14px #ff66cc)', hint: 'Seven colours on one plate, all at once.' },
  { id: 'merchantpie', name: "Merchant's Pie", emoji: '🥧', img: 'codepie', tier: 'secret', luck: 2, speed: 2, time: 300,
    filter: 'sepia(1) saturate(3) drop-shadow(0 0 12px #ffd700)', hint: 'Business is booming.' },
  { id: 'mushmonster', name: 'Mush Monster', emoji: '🥣', img: 'curry', tier: 'secret', luck: 4, time: 240,
    filter: 'hue-rotate(70deg) saturate(1.5) brightness(0.8)', hint: 'Practice makes... no. Keep practising.' },
  { id: 'smallprint', name: 'Small Print Cookie', emoji: '🥠', img: 'fortune', tier: 'secret', luck: 3, speed: 1, time: 180,
    filter: 'grayscale(0.6) contrast(1.3)', hint: 'Always read the small print.' },
  { id: 'onemelon', name: 'The One Melon', emoji: '🍉', img: 'watermelon', tier: 'secret', perm: 0.3, luck: 3, time: 300,
    filter: 'saturate(1.3) drop-shadow(0 0 14px #ff5c7a) drop-shadow(0 0 28px #7bd389)', hint: 'A melon belongs where its name is.' },
  // The hardest secrets: three melon treasure hunts (see HUNTS.cipher, HUNTS.map and the Golden Melon)
  { id: 'seedless', name: 'Seedless Melon', emoji: '🍉', img: 'watermelon', tier: 'secret', perm: 0.5,
    filter: 'hue-rotate(-40deg) saturate(1.6) drop-shadow(0 0 14px #ff5c7a)', hint: () => huntHint('cipher') },
  { id: 'seedvault', name: 'The Seed Vault', emoji: '🌱', img: 'seedling', tier: 'secret', perm: 0.75, luck: 10, time: 600,
    filter: 'drop-shadow(0 0 14px #7dff9a)', hint: () => huntHint('map') },
  // Never written in the Secrets list (unlisted) until found, but it counts in "Secrets found x / y" (see HUNTS.phantom)
  { id: 'phantommelon', name: 'Phantom Melon', emoji: '🍉', img: 'watermelon', tier: 'secret', unlisted: true, perm: 1, luck: 15, time: 600,
    filter: 'grayscale(0.7) brightness(1.3) opacity(0.75) drop-shadow(0 0 16px #c8d6ff)', hint: () => huntHint('phantom') },
  { id: 'donuttower', name: 'Donut Tower', emoji: '🗼', img: 'donut', tier: 'secret', perm: 0.3,
    filter: 'sepia(1) saturate(4) brightness(1.1) drop-shadow(0 0 16px #ffd700)',
    hint: 'Stack the sticky ones.' },
 { id: 'boxsecret', name: 'Box of Surprises', emoji: '🎁', img: 'cupcake', tier: 'secret', perm: 0.2,
    hint: 'Some prizes come wrapped twice.' },

  // Halloween event: these only roll while the event is on (see EVENTS)
  ...spooky('uncommon', [
    ['candycorn', 'Candy Corn', '🍬', 20, 0.3, 0.15, 100],
    ['toffeeapple', 'Toffee Apple', '🍎', 31, 0.45, 0.1, 100],
  ]),
  ...spooky('rare', [
    ['ghostmallow', 'Ghost Marshmallow', '👻', 131, 0.6, 0.4, 130],
    ['eyeballgum', 'Eyeball Gumballs', '👁️', 313, 0.9, 0.3, 140],
  ]),
  ...spooky('epic', [
    ['batchips', 'Bat Wing Chips', '🦇', 1031, 1.3, 0.8, 180],
    ['cobweb', 'Cobweb Candy Floss', '🕸️', 1313, 1.6, 0.5, 190],
  ]),
  ...spooky('legendary', [
    ['jackpie', "Jack-o'-Lantern Pie", '🎃', 13131, 3.5, 1, 250],
    ['sugarskull', 'Sugar Skull Cookie', '💀', 31031, 4.5, 1.5, 260],
  ]),
  ...spooky('mythic', [['witchbrew', "Witch's Brew", '🧪', 131313, 13, 4, 330]]),
  ...spooky('divine', [['greatpumpkin', 'The Great Pumpkin', '🎃', 1313131, 50, 13, 600]]),
  // The Halloween hunt's reward (see HUNTS.haunt)
  { id: 'candybucket', name: 'Haunted Candy Bucket', emoji: '🍭', img: 'lollipop', tier: 'secret', event: 'halloween', perm: 0.31,
    forceMut: { id: 'pumpkinspice', rolls: 13 }, filter: 'hue-rotate(220deg) saturate(1.4) drop-shadow(0 0 14px #b05cff)',
    hint: () => huntHint('haunt') },
];
const FOOD = Object.fromEntries(FOODS.map(f => [f.id, f]));
FOOD.ambrosia.perm = 1;
FOOD.harvest.perm = 2;
// Halloween foods that borrow another picture
Object.assign(FOOD.candycorn, { img: 'candy', filter: 'hue-rotate(-35deg) saturate(1.8)' });
Object.assign(FOOD.toffeeapple, { img: 'apple', filter: 'sepia(0.9) saturate(2.2) hue-rotate(-10deg) brightness(0.95)' });
Object.assign(FOOD.ghostmallow, { img: 'ghost' });
Object.assign(FOOD.eyeballgum, { img: 'eye' });
Object.assign(FOOD.batchips, { img: 'bat' });
Object.assign(FOOD.cobweb, { img: 'spiderweb', filter: 'drop-shadow(0 0 8px #e0d0ff)' });
Object.assign(FOOD.jackpie, { img: 'jackolantern' });
Object.assign(FOOD.sugarskull, { img: 'skull', filter: 'drop-shadow(0 0 10px #ff7ad9)' });
Object.assign(FOOD.witchbrew, { img: 'potion', filter: 'hue-rotate(80deg) saturate(1.5) drop-shadow(0 0 12px #9dff5c)' });
Object.assign(FOOD.greatpumpkin, { img: 'jackolantern', filter: 'saturate(1.5) drop-shadow(0 0 18px #ffb627) drop-shadow(0 0 36px #ff7b00)' });
// Sorted by odds so the Index reads from most common to rarest, wherever a food was added in the list above
const NORMAL_FOODS = FOODS.filter(f => f.tier !== 'secret' && !f.event).sort((a, b) => a.chance - b.chance);
const EVENT_FOODS = FOODS.filter(f => f.tier !== 'secret' && f.event).sort((a, b) => a.chance - b.chance);
const SECRETS = FOODS.filter(f => f.tier === 'secret' && !f.event);
const EVENT_SECRETS = FOODS.filter(f => f.tier === 'secret' && f.event);

// ---------- Meals (cooked in the Kitchen) ----------
// needs = ingredients (any mutation counts). Besides luck/speed, meals can have:
// mutBoost = multiplies mutation chance, double = every roll gives 2 copies,
// luckyRolls = the next N rolls are Lucky Rolls, floor = the next N rolls are at least that tier.
// clue = the riddle on the recipe scrap you can find. It never names an ingredient.
const MEALS = [
  { id: 'breadbonanza', name: 'Bread Bonanza', emoji: '🥖', needs: { bread: 20 }, luck: 0.3, time: 600,
    clue: 'The plainest thing you can roll. A score of it. Nothing else.' },
  { id: 'fruitsalad', name: 'Fruit Salad', emoji: '🥗', needs: { apple: 3, banana: 3, grapes: 2 }, luck: 0.5, speed: 0.5, time: 300,
    clue: 'Red and round, yellow and bent, purple in bunches. Fewer of the bunches.' },
  { id: 'breakfast', name: 'Breakfast Plate', emoji: '🍳', needs: { egg: 3, bread: 5, pancakes: 1 }, luckyRolls: 5,
    clue: 'Morning plate. One flat stack, a pile of toast, a few things a hen left behind.' },
  { id: 'smoothie', name: 'Mutation Smoothie', emoji: '🥤', needs: { strawberry: 2, banana: 3, coconut: 1 }, mutBoost: 3, time: 180,
    clue: 'Blend: red with seeds on the outside, yellow and bent, and one you open with a hammer.' },
  { id: 'picnic', name: 'Picnic Basket', emoji: '🧺', needs: { sandwich: 2, watermelon: 1, cheese: 2 }, double: true, time: 120,
    clue: 'On the grass: lunch between two slices, one big striped fruit, something full of holes.' },
  { id: 'sushiboat', name: 'Sushi Boat', emoji: '🛶', needs: { sushi: 3, rice: 5, cucumber: 2 }, luck: 1.5, time: 240,
    clue: 'Raw fish on grains, extra grains, and the long green one that goes in rolls.' },
  { id: 'pizzaparty', name: 'Pizza Party', emoji: '🎉', needs: { pizza: 2, cheese: 3, tomato: 3 }, luck: 1, speed: 2, time: 240,
    clue: 'Slices, plus more of what goes on them: the melty part and the red part.' },
  { id: 'banquet', name: 'Royal Banquet', emoji: '🏰', needs: { lobster: 1, steak: 2, croissant: 1 }, floor: { tier: 'epic', rolls: 5 },
    clue: 'For a king: something with claws, two thick cuts, and a golden pastry.' },
  { id: 'hotpot', name: 'Dragon Hotpot', emoji: '♨️', needs: { dragonfruit: 1, ramen: 2, onion: 5 }, luck: 5, mutBoost: 2, time: 300,
    clue: 'Something with scales, two hot bowls of noodles, and a lot of whatever makes you cry.' },
  { id: 'parfait', name: 'Rainbow Parfait', emoji: '🍨', needs: { icecream: 2, rainbowcake: 1, strawberry: 3 }, mutBoost: 10, time: 180,
    clue: 'Seven coloured layers, two cold cones, a few red berries on top.' },
  { id: 'cosmiccombo', name: 'Cosmic Combo', emoji: '🚀', needs: { cosmicburger: 1, fries: 5, bubbletea: 1 }, floor: { tier: 'legendary', rolls: 3 },
    clue: 'A meal from orbit, a big side of golden sticks, and a drink with pearls in it.' },
  { id: 'godfeast', name: 'Feast of the Gods', emoji: '🏛️', needs: { ambrosia: 1, lobster: 2, matcha: 2 }, luck: 20, double: true, time: 600,
    clue: 'What the gods eat, two things with claws, two cups of something green.' },
  { id: 'tacotuesday', name: 'Taco Night', emoji: '🥙', needs: { taco: 3, cheese: 2, tomato: 2, onion: 1 }, luck: 0.8, speed: 0.8, time: 240,
    clue: 'Fold three shells. Fill them with the melty, the red, and one thing that stings your eyes.' },
  { id: 'frenchtoast', name: 'French Toast', emoji: '🧈', needs: { bread: 5, egg: 3 }, luckyRolls: 3,
    clue: 'Soak the plain stuff in what the hen gave you.' },
  { id: 'potatohash', name: 'Potato Hash', emoji: '🍠', needs: { potato: 5, onion: 2, egg: 1 }, luck: 0.6, time: 300,
    clue: 'Dig up a handful, chop two that sting, crack one on top.' },
  { id: 'movienight', name: 'Movie Night', emoji: '🧃', needs: { popcorn: 3, candy: 2, chocolate: 1 }, speed: 1.5, time: 180,
    clue: 'A bucket of things that went pop, some wrapped sweets, one brown bar.' },
  { id: 'chowder', name: 'Corn Chowder', emoji: '🍲', needs: { corn: 4, potato: 3, cheese: 1 }, luck: 0.7, time: 360,
    clue: 'Yellow cobs, brown lumps from the ground, a little of the holey stuff.' },
  { id: 'stirfry', name: 'Stir Fry', emoji: '🥡', needs: { broccoli: 2, carrot: 3, rice: 3 }, mutBoost: 2, time: 180,
    clue: 'Tiny green trees, orange roots, white grains. One hot pan.' },
  { id: 'streetwrap', name: 'Street Wrap', emoji: '🫓', needs: { hotdog: 2, fries: 2, onion: 2 }, double: true, time: 90,
    clue: 'From a cart on the corner: two in buns, two golden sides, two that sting.' },
  { id: 'desserttray', name: 'Dessert Tray', emoji: '🍰', needs: { donut: 1, cupcake: 1, icecream: 1 }, luckyRolls: 8,
    clue: 'A ring with a hole, a small cake in a paper cup, a cold cone. One of each.' },
  { id: 'tropical', name: 'Tropical Punch', emoji: '🍹', needs: { coconut: 1, kiwi: 1, peach: 2 }, mutBoost: 4, time: 150,
    clue: 'A hairy brown shell, a hairy green fruit, and two fuzzy orange ones.' },
  { id: 'steamer', name: 'Steamer Basket', emoji: '🍥', needs: { dumpling: 4, cucumber: 2 }, luck: 1, speed: 0.5, time: 200,
    clue: 'Little folded parcels, steamed. Cool green slices on the side.' },
  { id: 'riceball', name: 'Lucky Rice Ball', emoji: '🍙', needs: { bento: 1, fortune: 1, rice: 2 }, floor: { tier: 'rare', rolls: 5 },
    clue: 'A packed lunch box, a cookie with a message inside, a little plain grain.' },
  { id: 'doubleburger', name: 'Double Cheeseburger', emoji: '🍔', needs: { bread: 2, cheese: 2, tomato: 1, lettuce: 1, steak: 1  }, luck: 1, time: 240, luckyRolls: 5,
    clue: '2 grainy slabs, a few slices of fromage, a red bulb, a bundle of green, and a meaty block.' },

  // Secret recipes: their scrap only turns up once unlock() is true. An ingredient like 'pizza:golden' needs that exact mutation.
  // forceMut = the next N rolls get that mutation, surprise = a random meal's power.
  { id: 'chefspecial', name: "Chef's Special", emoji: '👨‍🍳', secret: true, needs: { cheese: 3, taco: 2, sushi: 1, curry: 1 },
    luck: 3, speed: 2, mutBoost: 3, time: 480, unlock: () => cookedKinds() >= 5,
    clue: "The chef's own plate: something holey, something folded, something raw, something hot." },
  { id: 'glitchgumbo', name: 'Glitch Gumbo', emoji: '🧩', secret: true, needs: { glitchcookie: 1, popcorn: 5, candy: 3 },
    forceMut: { id: 'glitched', rolls: 3 }, luck: 7.77, time: 477, unlock: () => !!save.found.glitchcookie,
    clue: 'ERR: one broken biscuit, a bucket of things that went pop, a few wrapped sweets.' },
  { id: 'leftovers', name: 'Leftover Surprise', emoji: '🎁', secret: true, needs: { bread: 10, rice: 10, potato: 5, onion: 3 },
    surprise: true, unlock: () => totalCooked() >= 25,
    clue: 'Whatever is left in the cupboard. The four plainest things, lots of the first two.' },
  { id: 'mysterystew', name: 'Mystery Stew', emoji: '🥣', secret: true, needs: { mooncake: 1, fortune: 2, dumpling: 3 },
    floor: { tier: 'legendary', rolls: 2 }, luck: 2, time: 300, unlock: () => save.codes.includes('RECIPE'),
    clue: 'A cake for the moon, two cookies that talk, and a few folded parcels.' },
  { id: 'goldgourmet', name: 'Golden Gourmet', emoji: '🏆', secret: true, needs: { 'pizza:golden': 1, 'cheese:golden': 1, croissant: 2 },
    forceMut: { id: 'golden', rolls: 10 }, double: true, time: 180, unlock: () => (save.mutCount.golden || 0) >= 10,
    clue: 'Only gold will do: a gold slice, gold holey stuff, two pastries that are already golden.' },
  { id: 'panicpancakes', name: 'Panic Pancakes', emoji: '🫠', secret: true, needs: { pancakes: 3, burnttoast: 1 },
    speed: 5, time: 120, unlock: () => save.cookFails >= 10,
    clue: 'Three flat ones in a stack, and one slice someone forgot about.' },

  // Halloween recipes: their scraps only turn up during the event, but they cook any time
  { id: 'trickortreat', name: 'Trick-or-Treat Bag', emoji: '🛍️', event: 'halloween', needs: { candycorn: 5, ghostmallow: 1, chocolate: 2 }, luckyRolls: 13,
    clue: 'Door to door: a handful of three-coloured kernels, one sweet that says boo, two brown bars.' },
  { id: 'monstermash', name: 'Monster Mash', emoji: '🧟', img: 'potato', filter: 'hue-rotate(70deg) saturate(1.4) brightness(0.9)', event: 'halloween',
    needs: { batchips: 1, toffeeapple: 3, potato: 5 }, forceMut: { id: 'pumpkinspice', rolls: 5 }, luck: 3, time: 313,
    clue: 'Something that flaps at night, three sticky fruits on sticks, and a pile of lumps from the ground, mashed.' },
];
const REGULAR_MEALS = MEALS.filter(notEvent);
for (const m of MEALS) {
  m.tier = 'meal';
  FOOD[m.id] = m;
}
// What comes out of the pot when the mix matches no recipe
FOOD.mush = { id: 'mush', name: 'Pot Mush', emoji: '🥣', img: 'curry', filter: 'grayscale(0.8) brightness(0.7)', tier: 'meal', luck: 0.05, time: 30 };
// Lowest odds a "floor" meal allows, per tier
const FLOOR_CHANCE = { rare: 64, epic: 400, legendary: 5000 };

// ---------- Mutations ----------
// power multiplies luck/speed bonuses, time multiplies duration, speedMult boosts roll speed extra.
const MUTATIONS = [
  { id: 'shiny',     name: 'Shiny',     icon: '✨', chance: 10,     color: '#fff7b0', power: 1.5, anim: 'm-sparkle' },
  { id: 'frozen',    name: 'Frozen',    icon: '❄️', chance: 25,     color: '#8eeaff', power: 1.2, time: 2,
    filter: 'hue-rotate(170deg) saturate(0.7) brightness(1.3) drop-shadow(0 0 10px #8ef)' },
  { id: 'spicy',     name: 'Spicy',     icon: '🌶️', chance: 40,     color: '#ff5a3c', speedMult: 2.5, anim: 'm-wobble',
    filter: 'saturate(1.7) drop-shadow(0 0 12px #ff3b1f)' },
  { id: 'golden',    name: 'Golden',    icon: '🪙', chance: 75,     color: '#ffd700', power: 2,
    filter: 'sepia(1) saturate(4) brightness(1.15) drop-shadow(0 0 14px #ffd700)' },
  { id: 'glazed',    name: 'Glazed',    icon: '🍯', chance: 120,    color: '#ffb86b', time: 3,
    filter: 'saturate(1.3) brightness(1.15) drop-shadow(0 0 8px #ffb86b)' },
  { id: 'rainbow',   name: 'Rainbow',   icon: '🌈', chance: 250,    color: '#ff66cc', power: 3, anim: 'm-rainbow' },
  { id: 'giant',     name: 'Giant',     icon: '🗿', chance: 500,    color: '#7bd389', power: 2, time: 2, anim: 'm-giant' },
  { id: 'electric',  name: 'Electric',  icon: '⚡', chance: 1000,   color: '#ffe600', power: 2, speedMult: 3, anim: 'm-flicker',
    filter: 'brightness(1.2) drop-shadow(0 0 12px #ffe600)' },
  { id: 'cosmic',    name: 'Cosmic',    icon: '🌌', chance: 5000,   color: '#a78bfa', power: 5, anim: 'm-float',
    filter: 'hue-rotate(250deg) saturate(1.5) drop-shadow(0 0 18px #8a5cff)' },
  { id: 'void',      name: 'Void',      icon: '🕳️', chance: 25000,  color: '#c77dff', power: 10, anim: 'm-pulse',
    filter: 'invert(1) hue-rotate(180deg) brightness(0.7) drop-shadow(0 0 20px #7a00ff)' },
  { id: 'celestial', name: 'Celestial', icon: '🌟', chance: 100000, color: '#fff6c0', power: 25, anim: 'm-float',
    filter: 'brightness(1.4) drop-shadow(0 0 25px #fff6c0) drop-shadow(0 0 50px #ffd86b)' },
  // Absurd mutations. suffix = the name goes after the food ("Sushi with Wasabi"). Some are bad for you (power below 1).
  { id: 'stale',      name: 'Stale',          icon: '🕸️', chance: 50,    color: '#a39e8f', power: 0.5,
    filter: 'saturate(0.4) brightness(0.85) sepia(0.4)', desc: 'Left out too long. Half strength.' },
  { id: 'chewy',      name: 'A Bit Chewy',    icon: '😬', chance: 60,    color: '#d9a066', time: 1.5, anim: 'm-chew',
    desc: 'Takes longer to eat, so the buff lasts longer.' },
  { id: 'soggy',      name: 'Soggy',          icon: '💧', chance: 80,    color: '#6fa8dc', power: 0.75, time: 1.25,
    filter: 'saturate(0.5) brightness(0.9) blur(0.6px)', desc: 'Weaker, but lasts a bit longer.' },
  { id: 'wasabi',     name: 'with Wasabi',    icon: '🟢', chance: 100,   color: '#7ed957', power: 1.2, speedMult: 2.5, suffix: true,
    filter: 'hue-rotate(60deg) saturate(1.4) drop-shadow(0 0 10px #7ed957)', anim: 'm-wobble', desc: 'Clears your nose. Faster rolls.' },
  { id: 'microwaved', name: 'Microwaved',     icon: '⏲️', chance: 140,   color: '#ffde59', speedMult: 3, time: 0.5, anim: 'm-spin',
    filter: 'brightness(1.1) drop-shadow(0 0 8px #ffde59)', desc: 'Hot outside, cold inside. Fast but short.' },
  { id: 'floor',      name: 'Floor',          icon: '🧹', chance: 180,   color: '#b5a48b', power: 1.5, anim: 'm-wobble',
    filter: 'brightness(0.8) sepia(0.5)', desc: 'Five second rule.' },
  { id: 'licked',     name: 'Licked by a Dog', icon: '🐶', chance: 300,  color: '#9be7ff', power: 1.3, suffix: true,
    filter: 'brightness(1.1) saturate(1.2) drop-shadow(0 0 6px #9be7ff)', desc: 'The dog approved.' },
  { id: 'upsidedown', name: 'Upside-Down',    icon: '🔄', chance: 400,   color: '#ff9ecd', power: 1.8, anim: 'm-flip',
    desc: 'Same food, wrong way up.' },
  { id: 'deepfried',  name: 'Deep-Fried',     icon: '🍳', chance: 700,   color: '#e08a1e', power: 2.2,
    filter: 'sepia(1) saturate(3) hue-rotate(-15deg) brightness(0.95) drop-shadow(0 0 8px #e08a1e)', desc: 'It works on everything.' },
  { id: 'cheesy',     name: 'Extra Cheesy',   icon: '🧀', chance: 900,   color: '#ffd84d', power: 2, time: 1.5,
    filter: 'sepia(0.6) saturate(2.5) hue-rotate(5deg) drop-shadow(0 0 10px #ffd84d)', desc: 'More cheese than food.' },
  { id: 'sentient',   name: 'Sentient',       icon: '👀', chance: 2500,  color: '#ffffff', power: 4, anim: 'm-look',
    desc: 'It is watching you.' },
  { id: 'haunted',    name: 'Haunted',        icon: '👻', chance: 6000,  color: '#c8d6ff', power: 4, time: 2, anim: 'm-ghost',
    filter: 'grayscale(0.6) drop-shadow(0 0 12px #c8d6ff)', desc: 'Whispers at night.' },
  { id: 'grandmas',   name: "Grandma's",      icon: '👵', chance: 12000, color: '#ffb3c7', power: 6, time: 2, anim: 'm-float',
    filter: 'sepia(0.3) drop-shadow(0 0 14px #ffb3c7)', desc: 'Made with care.' },
  { id: 'from2009',   name: 'from 2009',      icon: '📅', chance: 20000, color: '#d6f3ff', power: 5, time: 3, suffix: true,
    filter: 'sepia(0.9) contrast(0.9) brightness(0.9)', desc: 'Found in the back of the fridge. Still fine, apparently.' },
  { id: 'blessed',    name: 'Blessed by a Chef', icon: '🙏', chance: 40000, color: '#fff4b0', power: 12, suffix: true, anim: 'm-float',
    filter: 'brightness(1.3) drop-shadow(0 0 20px #fff4b0)', desc: 'Seasoned perfectly.' },
  { id: 'cursed',     name: 'Cursed',         icon: '💀', chance: 75000, color: '#ff3b3b', power: 15, speedMult: 2, anim: 'm-pulse',
    filter: 'invert(1) hue-rotate(90deg) drop-shadow(0 0 20px #8b0000)', desc: 'Very powerful. You probably should not eat it.' },

  // Secret mutations only show up under special conditions
  { id: 'glitched',  name: 'Glitched',  icon: '👾', chance: 30, color: '#ff004c', power: 7.77, secret: true, anim: 'm-glitch',
    filter: 'hue-rotate(90deg) saturate(2)', hint: 'Broken food breaks other food.',
    cond: () => hasBuffFrom('glitchcookie') },
  { id: 'midnight',  name: 'Midnight',  icon: '🌙', chance: 15, color: '#8ecae6', power: 4, time: 2, secret: true,
    filter: 'brightness(0.75) hue-rotate(200deg) drop-shadow(0 0 16px #3a5cff)', hint: 'Ask a night owl.',
    cond: () => new Date().getHours() === 0 },

  // Event mutations only show up while their event is on
  { id: 'pumpkinspice', name: 'Pumpkin Spice', icon: '🎃', chance: 200, color: '#ff8c1a', power: 2.5, time: 1.5, event: 'halloween', anim: 'm-wobble',
    filter: 'sepia(0.7) saturate(2.5) hue-rotate(-20deg) drop-shadow(0 0 12px #ff8c1a)', desc: 'Everything tastes like autumn.',
    cond: () => eventOn('halloween') },
];
const MUT = Object.fromEntries(MUTATIONS.map(m => [m.id, m]));
const REGULAR_MUTS = MUTATIONS.filter(notEvent);

// Double mutations ("pizza:golden+spicy"). After a roll mutates, there is a 1 in DOUBLE_GATE shot
// at rolling a second, different mutation on top. A double acts like one mutation made of both:
// powers and durations multiply. Its odds are both odds times DOUBLE_GATE / 2 (the pair can land
// in either order), so the "1 in X" stays honest.
const DOUBLE_GATE = 50;
const doubleCache = {};
function getMut(id) {
  if (MUT[id]) return MUT[id];
  if (doubleCache[id]) return doubleCache[id];
  const [a, b, extra] = String(id).split('+').map(x => MUT[x]);
  if (!a || !b || extra !== undefined || a === b) return null;
  const parts = [a, b];
  return doubleCache[id] = {
    id, parts,
    name: parts.map(m => m.name.replace(/^with /, '')).join(' + '), // "Golden + Wasabi"; nameOf builds the full food name
    icon: a.icon + b.icon,
    color: a.color,
    chance: a.chance * b.chance * DOUBLE_GATE / 2,
    power: (a.power || 1) * (b.power || 1),
    time: (a.time || 1) * (b.time || 1),
    speedMult: (a.speedMult || 1) * (b.speedMult || 1),
    filter: [a.filter, b.filter].filter(Boolean).join(' '),
    anim: a.anim || b.anim,
  };
}
// The same two mutations always make the same key, whichever came first
const doubleOf = (a, b) => getMut([a, b].sort((x, y) => MUTATIONS.indexOf(x) - MUTATIONS.indexOf(y)).map(m => m.id).join('+'));
const mutParts = mut => mut ? mut.parts || [mut] : [];

// ---------- Cutscenes ----------
// Every legendary+ food, every secret and the rarest mutations get their own scene.
// fx = background effect, p = particle emojis, motion = how the particles move.
const SCENES = {
  dragonfruit: { bg: 'radial-gradient(circle at 50% 60%, #7a1010, #1a0000 70%)', color: '#ff5533', fx: 'rays', p: '🔥 🐉', motion: 'rise' },
  rainbowcake: { bg: 'linear-gradient(135deg, #ff5f6d, #ffc371, #47e891, #3fa9f5, #b05cff)', color: '#ffffff', fx: 'rays', p: '🌈 🎉 🍰', motion: 'fall' },
  truffle: { bg: 'radial-gradient(circle at 50% 100%, #3b2a1a, #0d0905 70%)', color: '#d9a35b', fx: 'none', p: '🍂 🌲 🐖', motion: 'drift' },
  unicorn: { bg: 'linear-gradient(160deg, #ff7ad9, #8a6cff, #47c6ff)', color: '#ffffff', fx: 'rings', p: '✨ 🦄 💖', motion: 'drift' },
  kraken: { bg: 'linear-gradient(#012a4a, #000814)', color: '#4cc9f0', fx: 'beams', p: '🫧 🌊 🐙', motion: 'rise' },
  thunder: { bg: 'linear-gradient(#1b1f3a, #3a3f5c)', color: '#ffe600', fx: 'lightning', p: '⚡ 🌧️', motion: 'fall' },
  volcano: { bg: 'radial-gradient(circle at 50% 100%, #ff6a00, #5a0e00 50%, #120000)', color: '#ff9a3c', fx: 'rays', p: '🔥 💥 🪨', motion: 'rise' },
  frost: { bg: 'linear-gradient(#0b3d5c, #5aa9e6)', color: '#dff7ff', fx: 'stars', p: '❄️ 🧊', motion: 'fall' },
  pharaoh: { bg: 'linear-gradient(#c28a2c, #3b2208)', color: '#ffd166', fx: 'beams', p: '🐪 🔺 🪲', motion: 'drift' },
  mermaid: { bg: 'linear-gradient(#00b4d8, #023e8a)', color: '#caf0f8', fx: 'beams', p: '🫧 🐚 🐠', motion: 'rise' },
  moon: { bg: 'radial-gradient(circle at 70% 30%, #fff8d6 0 8%, #1a1d3a 9%, #05060f 80%)', color: '#fff1a8', fx: 'stars', p: '⭐ 🌕', motion: 'twinkle' },
  aurora: { bg: 'linear-gradient(180deg, #0b1d3a, #0f5e4f, #3a1d6b)', color: '#7dffcf', fx: 'beams', p: '🌠 ✨', motion: 'drift' },
  sunflower: { bg: 'radial-gradient(circle at 50% 30%, #ffe066, #f08c00 60%, #5c3300)', color: '#fffbe6', fx: 'rays', p: '🌻 🐝', motion: 'drift' },
  diamond: { bg: 'radial-gradient(circle, #1b3b5f, #02060d 75%)', color: '#9ef0ff', fx: 'rings', p: '💎 ✨', motion: 'twinkle' },
  cosmicburger: { bg: 'radial-gradient(circle, #3a0b2e, #000 70%)', color: '#ff4fa3', fx: 'stars', p: '☄️ 🌟', motion: 'fall' },
  phoenix: { bg: 'radial-gradient(circle at 50% 100%, #ffb703, #d00000 45%, #1a0000)', color: '#ffe08a', fx: 'rays', p: '🔥 🪶', motion: 'rise' },
  galaxy: { bg: 'radial-gradient(ellipse at 30% 40%, #5b2a86, #12002b 50%, #000)', color: '#d4a5ff', fx: 'stars', p: '🪐 ⭐ 🌌', motion: 'orbit' },
  timetaco: { bg: 'repeating-radial-gradient(circle, #1d2b3a 0 30px, #0f1720 30px 60px)', color: '#7ee8fa', fx: 'rings', p: '⏰ ⏳ 🕰️', motion: 'orbit' },
  ghostpepper: { bg: 'linear-gradient(#1a1a2e, #3d1a3d)', color: '#e0e0ff', fx: 'none', p: '👻 🌶️', motion: 'drift' },
  robotramen: { bg: 'linear-gradient(#0f2027, #203a43, #2c5364)', color: '#39ff14', fx: 'scan', p: '⚙️ 🔩', motion: 'fall', glitch: true },
  alienjelly: { bg: 'radial-gradient(circle at 50% 0%, #b6ff5c, #1b3a0d 40%, #020a00)', color: '#c8ff7a', fx: 'beams', p: '🛸 👾', motion: 'drift' },
  crystalapple: { bg: 'radial-gradient(circle, #6a4c93, #1a0f2e 70%)', color: '#e0b3ff', fx: 'rings', p: '🔮 💠', motion: 'twinkle' },
  tornado: { bg: 'conic-gradient(from 0deg, #3b4a52, #8a969c, #3b4a52, #8a969c, #3b4a52)', color: '#ffffff', fx: 'none', p: '🌪️ 🍴 🥢', motion: 'orbit' },
  ambrosia: { bg: 'radial-gradient(ellipse at 50% -20%, #fff3c4, #6b5520 45%, #000 80%)', color: '#ffe9a3', fx: 'beams', p: '☁️ 🕊️', motion: 'drift' },
  angelcake: { bg: 'linear-gradient(#ffffff, #b9dcff)', color: '#9a6b00', fx: 'rays', p: '🪶 😇 ☁️', motion: 'fall' },
  sunsoup: { bg: 'radial-gradient(circle, #fff7ae, #ffb703 35%, #fb5607 70%, #3a0a00)', color: '#ffffff', fx: 'rays', p: '☀️ 🔥', motion: 'burst' },
  infinity: { bg: 'repeating-linear-gradient(45deg, #1d0f3a 0 40px, #2d1b5a 40px 80px)', color: '#a5f3ff', fx: 'rings', p: '♾️ 🍝', motion: 'orbit' },
  harvest: { bg: 'linear-gradient(#ffd166 0%, #f4a261 40%, #6b4226 100%)', color: '#fffbe6', fx: 'beams', p: '🌾 🌽 🍞', motion: 'drift' },
  bigbang: { bg: '#000', color: '#ffffff', fx: 'stars', p: '💥 ⭐ 🌟 ☄️', motion: 'burst' },
  lastcrumb: { bg: 'radial-gradient(circle, #ffffff 0 2%, #ffe9a3 5%, #3a2a00 30%, #000 70%)', color: '#fff6c9', fx: 'rays', p: '✨', motion: 'burst' },

  starcookie: { bg: 'radial-gradient(circle, #3a2f00, #000 70%)', color: '#ffe066', fx: 'stars', p: '⭐ 🍪', motion: 'twinkle' },
  snowflake: { bg: 'linear-gradient(#0f2a44, #02080f)', color: '#bfe9ff', fx: 'none', p: '❄️ 🍧', motion: 'fall' },
  tsunami: { bg: 'linear-gradient(#0077b6, #03045e)', color: '#90e0ef', fx: 'beams', p: '🌊 🐟 🫧', motion: 'drift' },
  rainbownoodles: { bg: 'linear-gradient(135deg, #ff5f6d, #ffc371, #47e891, #3fa9f5, #b05cff)', color: '#ffffff', fx: 'rays', p: '🌈 🍜', motion: 'orbit' },
  lightning: { bg: 'radial-gradient(circle, #3a3a00, #000 70%)', color: '#fff36b', fx: 'lightning', p: '⚡ 🍋', motion: 'burst' },
  mountain: { bg: 'linear-gradient(#8ecae6, #023047)', color: '#ffffff', fx: 'none', p: '🏔️ 🧀 ❄️', motion: 'fall' },
  wizardwaffle: { bg: 'radial-gradient(circle, #4c1d95, #0b0418 70%)', color: '#d8b4fe', fx: 'rings', p: '🪄 ✨ 🧇', motion: 'orbit' },
  fireworks: { bg: '#05030f', color: '#ff7ad9', fx: 'stars', p: '🎆 🎇 ✨', motion: 'burst' },
  potion: { bg: 'radial-gradient(circle, #14532d, #020a04 70%)', color: '#86efac', fx: 'none', p: '🧪 🫧', motion: 'rise' },
  alchemist: { bg: 'radial-gradient(circle, #5b3a00, #120a00 70%)', color: '#fcd34d', fx: 'rings', p: '⚗️ 🔥 🫧', motion: 'rise' },
  mutantmelon: { bg: 'radial-gradient(circle, #0f3d2e, #000 70%)', color: '#4ade80', fx: 'scan', p: '🧬 🍈', motion: 'orbit', glitch: true },
  dizzy: { bg: 'conic-gradient(from 0deg, #3a1d6e, #1e3a8a, #3a1d6e)', color: '#e9d5ff', fx: 'rings', p: '💫 🥟', motion: 'orbit' },
  sunrise: { bg: 'linear-gradient(#ff9e00, #ff006e 60%, #3a0ca3)', color: '#fff3b0', fx: 'rays', p: '🌞 ✨', motion: 'rise' },
  starlight: { bg: 'radial-gradient(circle, #fffbe0 0 2%, #1e1b4b 30%, #000 75%)', color: '#fff6c0', fx: 'beams', p: '🌟 🍨 ✨', motion: 'twinkle' },
  celebration: { bg: 'linear-gradient(#1a0533, #000)', color: '#ffd6f0', fx: 'stars', p: '🎇 🎂 🎉', motion: 'burst' },
  milkyway: { bg: 'radial-gradient(ellipse at 50% 50%, #c4b5fd 0 2%, #312e81 25%, #000 70%)', color: '#e0e7ff', fx: 'stars', p: '🌌 🥛 ⭐', motion: 'orbit' },
  eternalegg: { bg: 'radial-gradient(circle, #fff7d6 0 3%, #a16207 25%, #1c0f00 70%)', color: '#fff7d6', fx: 'rays', p: '🪺 🥚 ✨', motion: 'burst' },

  burnttoast: { bg: 'radial-gradient(circle, #3a3a3a, #0a0a0a 70%)', color: '#ff8c42', fx: 'none', p: '💨 🔥 🍉', motion: 'rise' },
  glitchcookie: { bg: '#000', color: '#00ffc8', fx: 'scan', p: '0 1 🍪', motion: 'fall', glitch: true },
  midnightsoup: { bg: 'radial-gradient(circle at 50% 30%, #1a2a6c, #000 70%)', color: '#9db4ff', fx: 'stars', p: '🌙 🦉', motion: 'twinkle' },
  clover: { bg: 'radial-gradient(circle, #2d6a4f, #081c15 70%)', color: '#95d5b2', fx: 'rays', p: '🍀 7️⃣', motion: 'fall' },
  codepie: { bg: '#0d1117', color: '#58a6ff', fx: 'scan', p: '{ } < / >', motion: 'fall', glitch: true },
  crownbread: { bg: 'linear-gradient(#5a189a, #240046)', color: '#ffd60a', fx: 'rays', p: '🍞 🎺 👑', motion: 'fall' },
  goldenspoon: { bg: 'radial-gradient(circle, #4a3b12, #0e0b03 70%)', color: '#ffd700', fx: 'rings', p: '⌛ ✨', motion: 'twinkle' },
  upsidecake: { bg: 'linear-gradient(#ff7eb6, #7ec8ff)', color: '#ffffff', fx: 'none', p: '🙃 🍰', motion: 'rise', flip: true },
  emptyplate: { bg: 'radial-gradient(circle, #d8d8d8 0 18%, #6c757d 19%, #212529 70%)', color: '#ffffff', fx: 'rings', p: '🧽 ✨', motion: 'twinkle' },
  quantum: { bg: 'radial-gradient(circle, #003b46, #000 70%)', color: '#7df9ff', fx: 'rings', p: '⚛️ ✨', motion: 'orbit' },
  eclipse: { bg: 'radial-gradient(circle, #000 0 18%, #ffcf6b 19%, #3a1f00 24%, #000 60%)', color: '#ffcf6b', fx: 'stars', p: '🌑 ✨', motion: 'twinkle' },
  nebula: { bg: 'radial-gradient(ellipse at 30% 40%, #ff4fa3, #3a0b6b 40%, #000 80%)', color: '#ffb3e6', fx: 'stars', p: '🌀 ⭐ 💫', motion: 'orbit' },
  oracle: { bg: 'radial-gradient(circle, #0a3d91, #01081a 70%)', color: '#9fd3ff', fx: 'rings', p: '🧿 👁️', motion: 'twinkle' },
  comet: { bg: 'linear-gradient(160deg, #000 40%, #1a2a6c 70%, #ff7b00)', color: '#ffd27a', fx: 'stars', p: '☄️ 🔥', motion: 'fall' },
  dimension: { bg: 'conic-gradient(from 0deg, #ff004c, #ffe600, #00ffc8, #3a5cff, #ff004c)', color: '#ffffff', fx: 'rings', p: '🌐 🍩', motion: 'burst' },
  omega: { bg: 'radial-gradient(circle, #ffffff 0 1%, #00b4d8 6%, #03045e 40%, #000 80%)', color: '#90e0ef', fx: 'lightning', p: '🔱 ⚡ 🌊', motion: 'burst' },
  genesis: { bg: 'radial-gradient(circle at 50% 70%, #70e000, #004b23 40%, #000 80%)', color: '#d9ff7a', fx: 'beams', p: '🌱 🍃 ✨', motion: 'rise' },
  firstrecipe: { bg: 'radial-gradient(ellipse at 50% 40%, #f5e6c8, #8a6d3b 40%, #1a1206 85%)', color: '#fff3d6', fx: 'rays', p: '📜 ✒️ ✨', motion: 'drift' },

  feastmedal: { bg: 'linear-gradient(#e63946, #1d3557)', color: '#ffd166', fx: 'rays', p: '🎉 🎊 🏅', motion: 'fall' },
  jackpot: { bg: 'linear-gradient(#7b2cbf, #3c096c)', color: '#ffea00', fx: 'rays', p: '🪙 🎰 💰', motion: 'fall' },
  secretsauce: { bg: 'radial-gradient(circle, #6a040f, #03071e 70%)', color: '#ffba08', fx: 'none', p: '🤫 🫙', motion: 'drift' },

  molestash: { bg: 'linear-gradient(#3b2a1a, #120a04)', color: '#ffd700', fx: 'rays', p: '🥔 🪙 🕳️', motion: 'rise' },
  chefslockbox: { bg: 'radial-gradient(circle, #44403c, #0c0a09 70%)', color: '#fcd34d', fx: 'rings', p: '🔐 🗝️ ✨', motion: 'twinkle' },
  stardust: { bg: 'radial-gradient(circle at 50% 30%, #3a1d6e, #000 70%)', color: '#c4b5fd', fx: 'stars', p: '☄️ ✨ 🍩', motion: 'fall' },
  tinytoast: { bg: 'radial-gradient(circle, #3a2f1f, #0d0905 70%)', color: '#ffe2a8', fx: 'rings', p: '🔍 ✨', motion: 'twinkle' },
  giantloaf: { bg: 'radial-gradient(circle at 50% 80%, #c47a1f, #2a1400 70%)', color: '#ffb627', fx: 'rays', p: '🍞 🍞 🏋️', motion: 'rise' },
  rainbowplate: { bg: 'conic-gradient(from 90deg, #ff5f6d, #ffc371, #47e891, #3fa9f5, #b05cff, #ff5f6d)', color: '#ffffff', fx: 'rings', p: '🌈 ✨', motion: 'orbit' },
  merchantpie: { bg: 'linear-gradient(#1f4d2b, #0a1f10)', color: '#ffd700', fx: 'rays', p: '🪙 💰 📈', motion: 'fall' },
  mushmonster: { bg: 'radial-gradient(circle, #3d4a1a, #0b0f03 70%)', color: '#b5e04a', fx: 'none', p: '🥣 🫧', motion: 'rise' },
  smallprint: { bg: '#f3ecd8', color: '#3a2a10', fx: 'scan', p: '🔍 📄', motion: 'drift' },
  treasure: { bg: 'radial-gradient(circle at 50% 70%, #f5d27a, #8a5a1c 40%, #1e1206 80%)', color: '#ffd700', fx: 'rays', p: '🪙 💰 🗺️ 🦜', motion: 'burst' },
  doubleglaze: { bg: 'radial-gradient(circle, #ffcf8a, #8a4b12 45%, #1f0f02 80%)', color: '#ffb86b', fx: 'rings', p: '🍯 🍩 ✨', motion: 'fall' },
  sugarrush: { bg: 'conic-gradient(from 0deg, #ff66cc, #ffe600, #7df9ff, #ff66cc)', color: '#ffffff', fx: 'rays', p: '🍬 🍭 🍩 ⚡', motion: 'burst' },
  donuttower: { bg: 'linear-gradient(#ffb86b, #6b2d00)', color: '#ffd700', fx: 'beams', p: '🍩 🍯', motion: 'rise' },
boxsecret: { bg: 'linear-gradient(#ff4d6d, #3a0a14)', color: '#ffd700', fx: 'rays', p: '🎁 🎉 ✨', motion: 'burst' },
  seedless: { bg: 'radial-gradient(circle, #ff5c7a 0 14%, #8a1f35 40%, #12040a 80%)', color: '#ffd1da', fx: 'scan', p: '🍉 🔤 ✨', motion: 'fall' },
  seedvault: { bg: 'radial-gradient(circle at 50% 70%, #3f7a12, #102605 45%, #020600)', color: '#b6ff8a', fx: 'beams', p: '🌱 🗺️ 🧩', motion: 'rise' },
  phantommelon: { bg: 'radial-gradient(circle, #c8d6ff22 0 10%, #1b263b 45%, #000 85%)', color: '#c8d6ff', fx: 'stars', p: '👻 🍉 🌱', motion: 'drift' },
  onemelon: { bg: 'radial-gradient(circle, #ff5c7a 0 10%, #1f6b3a 40%, #04140a 80%)', color: '#ffd1da', fx: 'rays', p: '🍉 ✨', motion: 'burst' },

  jackpie: { bg: 'radial-gradient(circle at 50% 60%, #ff7b00, #3a1500 45%, #0a0400)', color: '#ffb627', fx: 'rays', p: '🎃 🕯️ 🍂', motion: 'drift' },
  sugarskull: { bg: 'radial-gradient(circle, #5a1846, #12030e 70%)', color: '#ff7ad9', fx: 'rings', p: '💀 🌼 🍪', motion: 'twinkle' },
  witchbrew: { bg: 'radial-gradient(circle at 50% 80%, #3f7a12, #102605 45%, #020600)', color: '#9dff5c', fx: 'none', p: '🫧 🧪 🧹', motion: 'rise' },
  greatpumpkin: { bg: 'radial-gradient(circle at 50% 30%, #ffd166 0 6%, #ff7b00 20%, #3a1060 55%, #05010d)', color: '#ffb627', fx: 'rays', p: '🎃 🦇 🌕 ✨', motion: 'burst' },
  candybucket: { bg: 'linear-gradient(#2a0a3d, #0b0212)', color: '#ffb627', fx: 'stars', p: '🍬 🍭 👻 🦇', motion: 'fall' },

  'mut:electric': { bg: 'radial-gradient(circle, #3a3a00, #000 70%)', color: '#ffe600', fx: 'lightning', p: '⚡', motion: 'burst' },
  'mut:cosmic': { bg: 'radial-gradient(circle, #24005a, #000 70%)', color: '#c4b5fd', fx: 'stars', p: '🌌 ⭐', motion: 'orbit' },
  'mut:void': { bg: '#000', color: '#c77dff', fx: 'rings', p: '🕳️ ⚫', motion: 'orbit' },
  'mut:celestial': { bg: 'radial-gradient(circle, #fffbe0 0 3%, #2b2d6e 30%, #000 75%)', color: '#fff6c0', fx: 'beams', p: '🌟 ✨ 💫', motion: 'burst' },
  'mut:sentient': { bg: 'radial-gradient(circle, #2b2b2b, #000 70%)', color: '#ffffff', fx: 'none', p: '👀 👁️', motion: 'twinkle' },
  'mut:haunted': { bg: 'linear-gradient(#0d1b2a, #1b263b)', color: '#c8d6ff', fx: 'none', p: '👻 🕯️', motion: 'drift' },
  'mut:grandmas': { bg: 'radial-gradient(circle, #ffd6e0, #8a4f5f 60%, #2a1218)', color: '#fff0f5', fx: 'beams', p: '👵 💕 🧶', motion: 'drift' },
  'mut:from2009': { bg: 'linear-gradient(#26414a, #0c1a1f)', color: '#d6f3ff', fx: 'scan', p: '🧊 📅', motion: 'fall' },
  'mut:blessed': { bg: 'radial-gradient(ellipse at 50% -10%, #fffbe0, #b08d3c 45%, #1a1206)', color: '#fff4b0', fx: 'rays', p: '🙏 ✨ 🕊️', motion: 'fall' },
  'mut:cursed': { bg: 'radial-gradient(circle, #3b0000, #000 70%)', color: '#ff3b3b', fx: 'lightning', p: '💀 🕯️ 🦇', motion: 'orbit', glitch: true },
  'mut:glitched': { bg: '#000', color: '#ff004c', fx: 'scan', p: '▓ ░ ▒', motion: 'fall', glitch: true },
  'mut:midnight': { bg: 'linear-gradient(#000428, #004e92)', color: '#8ecae6', fx: 'stars', p: '🌙 ⭐', motion: 'twinkle' },
};

const CODES = {
  BREAD:  { text: '+10 Bread', give: { bread: 10 } },
  YUMMY:  { text: '+3 Golden Croissants', give: { croissant: 3 } },
  CODY:   { text: '+1 Dragon Fruit', give: { dragonfruit: 1 } },
  MUTANT: { text: '+1 Golden Pizza', give: { 'pizza:golden': 1 } },
  RECIPE: { text: 'A recipe card falls out.' },
  CHEF:   { text: 'Hidden page found.', secret: 'codepie' },
  SECRET: { text: 'Shh.', secret: 'secretsauce' },
  // Only works during the treasure hunt
  ARRR:   { text: 'The parrot nods.', only: () => save.treasure === 2, then: () => advanceTreasure(3) },
  2009:   { text: 'The lockbox clicks open.', only: () => huntStep('safe') === 2, then: () => finishHunt('safe') },
  ONEINAMELON: { text: 'A seed falls out of the book and rolls away...', only: () => huntStep('phantom') === 0, then: () => advanceHunt('phantom', 1) },
  NOLEM:  { text: 'The melon splits open. Not a single seed inside.', only: () => huntStep('cipher') === 1, then: () => finishHunt('cipher') },
};

const GAME_VERSION = '1.1'; // bump it and update "What's new" in index.html, and players see How to play once more
const AUTO_ROLL_AFTER = 15; // rolls by hand before auto roll shows up
const BACKUP_TIP_AFTER = 1800; // seconds of play before the "back up your save" tip
const EAT_TIP_AFTER = 30; // rolls without eating anything before the "eat food for luck" tip
const CUTSCENE_ODDS = 300000; // rolls this rare (food x mutation) get a cutscene: every divine, but no plain mythic
const BASE_ROLL_TIME = 1.2;
const AUTO_MIN_ROLL_TIME = 1.0; // auto roll never goes faster than this
const AUTO_PAUSE = 400;
const MAX_BUFF_TIME = 1800;
const IDLE_SECRET_MS = 120000;

// ---------- Save ----------
// Each profile has its own save (profiles.js); without one, the old single save
const SAVE_KEY = window.PROFILE ? PROFILE.saveKey : 'foodRngSave';
const save = Object.assign({
  rolls: 0, inv: {}, found: {}, mutCount: {}, buffs: [], perm: 0, codes: [], breadEaten: 0, totalEaten: 0,
  best: null, triggers: {}, streak: { id: null, count: 0 }, settings: {},
  charges: { lucky: 0, floor: null, muts: [] }, cooked: {}, recipesUnlocked: {}, cookFails: 0, picked: {}, glazedDonuts: 0, pot: {}, clues: {}, treasure: 0, coins: 0, coinsEarned: 0, scrapsBought: 0, favs: {}, sizes: {}, biggest: {}, smallest: 1, itemsSold: 0, mushMade: 0, mushStreak: 0, hunts: {}, huntRoots: 0, shopBought: {}, upgrades: {}, themes: { classic: true },
  tierRolls: {}, boxesOpened: 0,
}, load());
save.settings = Object.assign({ autoEat: 'off', sound: true, music: true, deleteBelow: 0, luckCap: 0, theme: 'classic', cutsceneOdds: CUTSCENE_ODDS }, save.settings);
// The default used to be 1 in 1,000,000. Saves still on that move to the new default once.
if (!save.settings.csOddsMoved) {
  if (save.settings.cutsceneOdds === 1000000) save.settings.cutsceneOdds = CUTSCENE_ODDS;
  save.settings.csOddsMoved = true;
}
save.upgrades = Object.assign({ eye: 0, pot: 0 }, save.upgrades);
// Guaranteed mutations used to be one slot (charges.mut), so a new one wiped out the old one. Now they are a list.
if (!save.charges.muts) save.charges.muts = save.charges.mut ? [save.charges.mut] : [];
delete save.charges.mut;
save.charges.muts = save.charges.muts.filter(c => MUT[c.id] && c.rolls > 0);

function load() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch (e) { return {}; }
}
let resetting = false;
function persist() {
  if (resetting) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage blocked */ }
}

// Older saves stored buffs as { id } and may hold foods that no longer exist
save.buffs = save.buffs.map(b => ({ key: b.key || b.id, left: b.left })).filter(b => validKey(b.key));
for (const k of Object.keys(save.inv)) if (!validKey(k) || save.inv[k] <= 0) delete save.inv[k];
for (const k of Object.keys(save.pot)) if (!validKey(k) || save.pot[k] <= 0) delete save.pot[k];
// Saves from before recipe scraps: secret recipes that were already unlocked keep their scrap
for (const m of MEALS) if (m.secret && save.recipesUnlocked[m.id]) save.clues[m.id] = true;
if (save.best && !validKey(save.best)) save.best = null;
// Best find only counts rolled food. Older saves could have a secret or meal there, so rebuild it from what was found.
if (save.best && !countsAsBest(save.best)) {
  save.best = Object.keys(save.found).filter(k => validKey(k) && countsAsBest(k)).sort((a, b) => rarity(b) - rarity(a))[0] || null;
}

// ---------- Item keys ("pizza", "pizza:golden" or "pizza:golden+spicy") ----------
function validKey(key) {
  const [f, m] = String(key).split(':');
  return !!FOOD[f] && (!m || !!getMut(m));
}
function parseKey(key) {
  const [f, m] = key.split(':');
  return { food: FOOD[f], mut: m ? getMut(m) : null };
}
const makeKey = (food, mut) => mut ? `${food.id}:${mut.id}` : food.id;

function effectOf(key) {
  const { food, mut } = parseKey(key);
  const p = (mut && mut.power) || 1;
  const sm = (mut && mut.speedMult) || 1;
  return {
    luck: (food.luck || 0) * p,
    speed: (food.speed || 0) * p * sm + (sm > 1 ? 0.2 * sm : 0),
    time: Math.round((food.time || 0) * ((mut && mut.time) || 1)),
    perm: (food.perm || 0) * p,
    mutBoost: food.mutBoost || 0,
    double: !!food.double,
    luckyRolls: food.luckyRolls || 0,
    floor: food.floor || null,
    forceMut: food.forceMut || null,
    surprise: !!food.surprise,
  };
}

function nameOf(key) {
  const { food, mut } = parseKey(key);
  // "Golden Pizza with Wasabi": suffix mutations go after the food, the rest before
  const parts = mutParts(mut);
  return [...parts.filter(m => !m.suffix).map(m => m.name), food.name, ...parts.filter(m => m.suffix).map(m => m.name)].join(' ');
}

// Bigger = rarer. Secrets and meals count as rarer than anything you can roll (so auto delete skips them).
function rarity(key) {
  const { food, mut } = parseKey(key);
  if (food.tier === 'meal') return 1e11;
  return (food.tier === 'secret' ? 1e12 : food.chance) * ((mut && mut.chance) || 1);
}

// Secrets and meals don't count for "Best find", only food you can roll
function countsAsBest(key) {
  return !['secret', 'meal'].includes(parseKey(key).food.tier);
}

function oddsText(key) {
  const { food, mut } = parseKey(key);
  if (food.tier === 'meal') return 'Cooked meal';
  if (food.tier === 'secret') return mut ? `Secret × 1 in ${fmt(mut.chance)}` : 'Secret';
  return `1 in ${fmt(food.chance * ((mut && mut.chance) || 1))}`;
}

// ---------- Elements ----------
const $ = id => document.getElementById(id);
const el = {
  card: $('card'), cardTier: $('cardTier'), cardMut: $('cardMut'), cardEmoji: $('cardEmoji'), cardName: $('cardName'),
  cardOdds: $('cardOdds'), mutPop: $('mutPop'), luckyNote: $('luckyNote'), rollBtn: $('rollBtn'),
  autoRoll: $('autoRoll'), autoEat: $('autoEat'), deleteBelow: $('deleteBelow'), luckCap: $('luckCap'), soundOn: $('soundOn'), musicOn: $('musicOn'), recent: $('recent'), stats: $('stats'), buffs: $('buffs'), charges: $('charges'), buffBox: $('buffBox'), buffSummary: $('buffSummary'),
  inv: $('invList'), invSearch: $('invSearch'), kitchen: $('tab-kitchen'), recipes: $('tab-recipes'), shop: $('tab-shop'), shopTop: $('shopTop'), sellList: $('sellList'), sellSearch: $('sellSearch'), sellWhich: $('sellWhich'), daily: $('tab-daily'), achievements: $('achList'), index: $('tab-index'), muts: $('tab-muts'), secrets: $('secretList'),
  cutscene: $('cutscene'), csStage: $('csStage'), csCounter: $('csCounter'), csShock: $('csShock'), csBlackout: $('csBlackout'), csFx: $('csFx'), csParticles: $('csParticles'), csReveal: $('csReveal'),
  csEmoji: $('csEmoji'), csName: $('csName'), csOdds: $('csOdds'),
  mutFlash: $('mutFlash'), mutFlashText: $('mutFlashText'), codeModal: $('codeModal'), codeInput: $('codeInput'), toasts: $('toasts'),
};

// ---------- Helpers ----------
const fmt = n => n.toLocaleString('en-US');
const pct = n => `+${Math.round(n * 100)}%`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function effectText(key) {
  const e = effectOf(key);
  const out = [];
  if (e.perm) out.push(`Permanently ${pct(e.perm)} luck`);
  if (e.surprise) out.push('The power of a random meal!');
  if (e.luckyRolls) out.push(`Next ${e.luckyRolls} rolls are Lucky Rolls (x2 luck)`);
  if (e.floor) out.push(`Next ${e.floor.rolls} rolls are at least ${TIERS[e.floor.tier].label}`);
  if (e.forceMut) {
    const m = MUT[e.forceMut.id];
    out.push(`Next ${e.forceMut.rolls} rolls are ${m.icon} ${m.name}`);
  }
  const parts = [];
  if (e.luck) parts.push(`${pct(e.luck)} luck`);
  if (e.speed) parts.push(`${pct(e.speed)} roll speed`);
  if (e.mutBoost) parts.push(`x${e.mutBoost} mutation chance`);
  if (e.double) parts.push('double rolls');
  if (parts.length && e.time) out.push(`${parts.join(', ')} for ${timeText(e.time)}`);
  return out.join(' · ');
}

function mutEffectText(m) {
  const parts = [];
  if (m.power) parts.push(`x${m.power} power`);
  if (m.time) parts.push(`x${m.time} duration`);
  if (m.speedMult) parts.push(`x${m.speedMult} roll speed`);
  return parts.join(', ');
}

// Food pictures are Fluent 3D images in img/ (MIT licence, see img/CREDITS.txt). Falls back to the emoji if one is missing.
// img/ has the full 256px pictures for big spots (roll card, cutscenes, pot, minigames);
// img/sm/ has 96px copies for lists, so the Index and Inventory load fast.
const imgSrc = (food, big = false) => `img/${big ? '' : 'sm/'}${food.img || food.id}.png`;
const imgTag = (food, big = false) => `<img class="fi" src="${imgSrc(food, big)}" alt="${food.name}" draggable="false" onerror="this.replaceWith('${food.emoji}')">`;

function emojiHtml(key, big = false) {
  const { food, mut } = parseKey(key);
  const filter = [food.filter, mut && mut.filter].filter(Boolean).join(' ');
  return `<span class="emo ${(mut && mut.anim) || ''}"${filter ? ` style="filter:${filter}"` : ''}>${imgTag(food, big)}</span>`;
}

const tagHtml = m => `<span class="tag" style="--m:${m.color}">${m.icon} ${m.name}</span>`;
const nameClass = food => ({ divine: 't-divine', eternal: 't-eternal' })[food.tier] || '';

function timeText(s) {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function toast(msg, color) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  if (color) t.style.setProperty('--c', color);
  el.toasts.appendChild(t);
  while (el.toasts.children.length > 3) el.toasts.firstChild.remove();
  setTimeout(() => t.remove(), 2500);
}

const hasBuffFrom = foodId => save.buffs.some(b => b.key.split(':')[0] === foodId);

// ---------- Sound (made with Web Audio, no files needed) ----------
let audioCtx = null;
let drone = null;

function getCtx() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { return null; }
  return audioCtx;
}

// Sound effects only play when the Sound box is ticked
const audio = () => save.settings.sound ? getCtx() : null;

function tone(freq, dur, type = 'sine', vol = 0.2, slideTo = null) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

function noise(dur, vol) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = buf;
  f.type = 'lowpass';
  f.frequency.value = 900;
  g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

const sfx = {
  tick: () => tone(1400, 0.03, 'square', 0.04),
  pop: () => tone(500, 0.15, 'triangle', 0.15, 1000),
  heartbeat() {
    tone(70, 0.25, 'sine', 0.6, 40);
    setTimeout(() => tone(60, 0.2, 'sine', 0.4, 35), 170);
  },
  chime() {
    [880, 1320, 1760, 2640].forEach((f, i) => setTimeout(() => tone(f, 0.8, 'triangle', 0.12), i * 90));
  },
  // The reveal hit. Stronger cutscenes get a deeper drop, and the strongest a second hit.
  boom(power = 1) {
    noise(1.5, 0.8);
    tone(140, 1.4, 'sine', 0.8, 25);
    if (power >= 2) tone(70, 2.2, 'sine', 0.7, 18);
    if (power >= 3) setTimeout(() => { noise(1.2, 0.6); tone(110, 1.6, 'sine', 0.6, 20); }, 260);
  },
  // Each new digit in the count-up, a little higher every time
  thump: digits => tone(70 + digits * 9, 0.14, 'sine', 0.45, 40),
  // Screams upward right before the blackout
  riser(dur) {
    const a = audio();
    if (!a) return;
    const t = a.currentTime;
    for (const [f0, f1, type, vol] of [[180, 1800, 'sawtooth', 0.09], [270, 2700, 'square', 0.035]]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.95);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    }
  },
  // A low growl that keeps rising until the reveal
  droneStart() {
    const a = audio();
    if (!a || drone) return;
    const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(40, t);
    o.frequency.exponentialRampToValueAtTime(160, t + 9);
    f.type = 'lowpass';
    f.frequency.setValueAtTime(150, t);
    f.frequency.exponentialRampToValueAtTime(1200, t + 9);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 1.5);
    o.connect(f).connect(g).connect(a.destination);
    o.start(t);
    drone = { o, g };
  },
  // Slow motion: the growl sinks and fades instead of cutting off
  droneFade(sec) {
    if (!drone || !audioCtx) return;
    const t = audioCtx.currentTime;
    for (const [param, to] of [[drone.g.gain, 0.005], [drone.o.frequency, 30]]) {
      param.cancelScheduledValues(t);
      param.setValueAtTime(param.value, t);
      param.exponentialRampToValueAtTime(to, t + sec);
    }
  },
  // One deep, slow heartbeat for slow motion
  slowBeat() {
    tone(48, 0.6, 'sine', 0.75, 24);
    setTimeout(() => tone(40, 0.5, 'sine', 0.5, 20), 320);
  },
  droneStop() {
    if (!drone || !audioCtx) return;
    const t = audioCtx.currentTime;
    drone.g.gain.cancelScheduledValues(t);
    drone.g.gain.setValueAtTime(drone.g.gain.value, t);
    drone.g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    drone.o.stop(t + 0.15);
    drone = null;
  },
};

// ---------- Background music: a calm lo-fi loop played live, no files needed ----------
const MUSIC_VOL = 0.5;
const STEP = 60 / 84 / 2; // eighth notes at 84 BPM
// One chord per bar: [bass note, pad notes] as MIDI numbers (Cmaj7, Am7, Fmaj7, G7)
const CHORDS = [
  [36, [60, 64, 67, 71]],
  [33, [57, 60, 64, 67]],
  [29, [53, 57, 60, 64]],
  [31, [55, 59, 62, 65]],
];
const MELODY = [72, 74, 76, 79, 81, 84]; // C major pentatonic
const music = { bus: null, out: null, timer: null, nextTime: 0, step: 0, mel: 2, hat: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function musicGraph(a) {
  if (music.bus) return;
  music.out = a.createGain();
  music.out.gain.value = 0;
  const warm = a.createBiquadFilter();
  warm.type = 'lowpass';
  warm.frequency.value = 2400;
  music.bus = a.createGain();
  music.bus.gain.value = 0.3;
  music.bus.connect(warm).connect(music.out).connect(a.destination);
  // A short burst of noise, reused for every hi-hat
  const len = Math.floor(a.sampleRate * 0.04);
  music.hat = a.createBuffer(1, len, a.sampleRate);
  const d = music.hat.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
}

function mNote(t, midi, dur, type, vol, attack = 0.01) {
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = mtof(midi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(music.bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function mHat(t, vol) {
  const src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), g = audioCtx.createGain();
  src.buffer = music.hat;
  f.type = 'highpass';
  f.frequency.value = 7000;
  g.gain.value = vol;
  src.connect(f).connect(g).connect(music.bus);
  src.start(t);
}

function scheduleStep(step, t) {
  const inBar = step % 8;
  const [bass, pad] = CHORDS[Math.floor(step / 8) % CHORDS.length];
  const bar = STEP * 8;
  if (inBar === 0) pad.forEach(n => mNote(t, n, bar * 1.05, 'triangle', 0.05, 0.4));
  if (inBar === 0 || inBar === 3 || inBar === 4) mNote(t, bass, STEP * 1.8, 'sine', 0.35);
  if (inBar === 0 || inBar === 4) mNote(t, 28, 0.25, 'sine', 0.4); // soft kick
  mHat(t, inBar % 2 ? 0.05 : 0.09);
  // Melody wanders up and down the scale, playing on about a third of the steps
  if (Math.random() < 0.35) {
    music.mel = Math.max(0, Math.min(MELODY.length - 1, music.mel + Math.floor(Math.random() * 3) - 1));
    mNote(t, MELODY[music.mel], STEP * 1.6, 'sine', 0.08);
  }
}

function musicTick() {
  while (music.nextTime < audioCtx.currentTime + 0.3) {
    scheduleStep(music.step, music.nextTime);
    music.nextTime += STEP;
    music.step++;
  }
}

function startMusic() {
  if (!save.settings.music || music.timer) return;
  const a = getCtx();
  if (!a) return;
  musicGraph(a);
  music.nextTime = a.currentTime + 0.1;
  music.out.gain.setTargetAtTime(cutscenePlaying ? MUSIC_VOL * 0.15 : MUSIC_VOL, a.currentTime, 0.5);
  music.timer = setInterval(musicTick, 50);
}

function stopMusic() {
  if (!music.timer) return;
  clearInterval(music.timer);
  music.timer = null;
  music.out.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
}

// Turn the music down during cutscenes so the build-up can be heard
function duckMusic(on) {
  if (!music.out) return;
  music.out.gain.setTargetAtTime(on ? MUSIC_VOL * 0.15 : MUSIC_VOL, audioCtx.currentTime, 0.4);
}

// ---------- Stats ----------
// Every buff counts, but less and less: your strongest luck buff counts in full, the 2nd half, the 3rd a third,
// and so on (same for speed). If they all counted in full, auto eat keeps 100+ buffs running and luck passes
// x600 within 15 minutes; with this it stays around x20-45 (found by simulating 8 hours of auto play).
function rankedBuffs(stat) {
  return save.buffs.map(b => ({ key: b.key, value: effectOf(b.key)[stat] }))
    .filter(x => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((x, i) => ({ ...x, counted: x.value / (i + 1) }));
}
const buffTotal = stat => rankedBuffs(stat).reduce((s, x) => s + x.counted, 0);

function luckNow() {
  return 1 + save.perm + buffTotal('luck');
}

// The luck a roll actually uses: lucky rolls double it, then the player's luck limit caps it
function rollLuck(lucky) {
  const full = luckNow() * (lucky ? 2 : 1);
  return save.settings.luckCap ? Math.min(save.settings.luckCap, full) : full;
}

function rollTime() {
  return Math.max(0.15, BASE_ROLL_TIME / (1 + buffTotal('speed')));
}

function mutBoostNow() {
  let boost = 1;
  for (const b of save.buffs) {
    const m = effectOf(b.key).mutBoost;
    if (m) boost += m - 1;
  }
  return boost;
}

const doubleNow = () => save.buffs.some(b => effectOf(b.key).double);

// ---------- Rolling ----------
// Checks the rarest first; each has a luck / chance shot of being picked.
// minChance (from floor meals) leaves out anything more common than that.
// Bread gets its own share first (10% at x1 luck, less as luck goes up), or with so many foods it would almost never show up.
const BREAD_SHARE = 0.1;
function pickFood(luck, minChance = 0) {
  if (!minChance && Math.random() < BREAD_SHARE / Math.max(1, luck)) return FOOD.bread;
  const pool = FOODS
    .filter(f => f.chance > 1 && f.chance >= minChance && (f.tier !== 'secret' || (f.rollable && f.rollable())) && (!f.event || eventOn(f.event)))
    .sort((a, b) => b.chance - a.chance);
  for (const f of pool) {
    if (Math.random() < luck / f.chance) return f;
  }
  return minChance ? pool[pool.length - 1] : FOOD.bread;
}

// Luck helps mutations only a little: every 10x luck adds +0.5x (x10 luck = x1.5, x100 = x2, x1000 = x2.5).
// Mutation meals (Smoothie, Parfait...) multiply on top of that.
function mutLuckFor(luck) {
  return (1 + Math.log10(Math.max(1, luck)) * 0.5) * mutBoostNow();
}

function pickMutation(luck) {
  const mutLuck = mutLuckFor(luck);
  const pool = MUTATIONS.filter(m => !m.cond || m.cond()).sort((a, b) => b.chance - a.chance);
  for (const m of pool) {
    if (Math.random() < mutLuck / m.chance) return m;
  }
  return null;
}

// A guaranteed mutation (Mutation Spray). Picks like a normal mutation would, so common ones stay common.
function randomMutation() {
  const pool = MUTATIONS.filter(m => !m.secret && (!m.event || eventOn(m.event)));
  let r = Math.random() * pool.reduce((s, m) => s + 1 / m.chance, 0);
  for (const m of pool) if ((r -= 1 / m.chance) <= 0) return m;
  return pool[0];
}

// Foods flashed while a roll spins, preloaded so the pictures don't pop in
const SPIN_POOL = NORMAL_FOODS.filter(f => f.chance <= 320);
for (const f of SPIN_POOL) new Image().src = imgSrc(f, true);

let rolling = false;
let cutscenePlaying = false;
let cutsceneQueue = Promise.resolve();
let nextAutoRoll = 0;

async function roll(auto = false) {
  if (rolling || cutscenePlaying) return;
  rolling = true;
  el.rollBtn.disabled = true;

  save.rolls++;
  let lucky = save.rolls % 10 === 0;
  if (!lucky && save.charges.lucky > 0) {
    save.charges.lucky--;
    lucky = true;
  }
  let minChance = 0;
  const floor = save.charges.floor;
  if (floor) {
    minChance = FLOOR_CHANCE[floor.tier];
    if (--floor.rolls <= 0) save.charges.floor = null;
  }
  // Guaranteed mutations: with two different ones waiting, every roll gets both (a double mutation).
  // A third one waits its turn.
  let forcedMut = null;
  const mutCharges = save.charges.muts.slice(0, 2);
  if (mutCharges.length) {
    const [a, b] = mutCharges.map(c => MUT[c.id]);
    forcedMut = b ? doubleOf(a, b) : a;
    for (const c of mutCharges) c.rolls--;
    save.charges.muts = save.charges.muts.filter(c => c.rolls > 0);
  }
  if (!forcedMut && save.charges.anyMut > 0) {
    save.charges.anyMut--;
    forcedMut = randomMutation();
  }
  const copies = doubleNow() ? 2 : 1;
  const luck = rollLuck(lucky);
  const food = save.rolls === 777 ? FOOD.clover : pickFood(luck, minChance);
  let mut = forcedMut || pickMutation(luck);
  // Rarely a second mutation lands on top (see DOUBLE_GATE). Forced mutations don't get a random extra one.
  if (mut && !forcedMut && Math.random() < 1 / DOUBLE_GATE) {
    const second = pickMutation(luck);
    if (second && second !== mut) mut = doubleOf(mut, second);
  }
  const key = makeKey(food, mut);

  await spin(auto ? Math.max(AUTO_MIN_ROLL_TIME, rollTime() * 1.5) * 1000 : rollTime() * 1000);

  const csOdds = save.settings.cutsceneOdds; // 0 = never
  if (csOdds && rarity(key) >= csOdds) {
    await queueCutscene(SCENES[food.id] || (mut && SCENES['mut:' + mut.id]) || genericScene(key), key);
  } else if (TIER_ORDER.indexOf(food.tier) >= 4 || (mut && mut.chance >= 250)) {
    bigFlash(key);
  }

  const size = rollSize();
  give(key, copies, size);
  save.tierRolls[food.tier] = (save.tierRolls[food.tier] || 0) + copies; // for the Stats page
  const tierNum = TIER_ORDER.indexOf(food.tier);
  dailyAdd('roll');
  dailyAdd('variety', food.id);
  if (mut) dailyAdd('mut', copies);
  if (tierNum >= TIER_ORDER.indexOf('epic')) dailyAdd('epic', copies);
  if (tierNum >= TIER_ORDER.indexOf('legendary')) dailyAdd('leg', copies);
  if (size >= 2) dailyAdd('big', copies);
  if (size > (save.biggest[food.id] || 0)) save.biggest[food.id] = size;
  save.smallest = Math.min(save.smallest, size);
  if (size <= 0.6) unlockSecret('tinytoast');
  if (countsAsBest(key) && rarity(key) >= 1000000 && huntStep('comet') === 0) advanceHunt('comet', 1);
  if (food.id === 'bread' && size >= 3) unlockSecret('giantloaf');
  if (key === 'donut:glazed') {
    unlockSecret('doubleglaze');
    if ((save.glazedDonuts += copies) >= 3) unlockSecret('donuttower');
  }
  if (Math.random() < SCRAP_CHANCE * (1 + 0.5 * save.upgrades.eye)) findScrap(); // Sharper Eye: +50% per level
  purgeBelow();
  showResult(key, lucky, copies, size);
  trackStreak(food);
  checkAutoRollUnlock();
  checkEatTip();
  rolling = false;
  el.rollBtn.disabled = false;
  nextAutoRoll = performance.now() + AUTO_PAUSE;
  renderAll();
}

// Flicker through random foods while the roll "spins"
async function spin(ms) {
  cardKey = null;
  el.cardEmoji.classList.remove('melon-grab');
  el.card.classList.add('spinning');
  el.card.classList.remove('mutated');
  el.luckyNote.innerHTML = '&nbsp;';
  const end = performance.now() + ms;
  while (performance.now() < end) {
    el.cardEmoji.innerHTML = imgTag(SPIN_POOL[Math.floor(Math.random() * SPIN_POOL.length)], true);
    await sleep(Math.min(70, ms));
  }
  el.card.classList.remove('spinning');
}

// Most food comes out close to normal size; about 3 in 100 come out huge (up to ~5x)
function rollSize() {
  const bell = (Math.random() + Math.random() + Math.random() - 1.5) * 2; // -3..3, mostly near 0
  let size = Math.exp(bell * 0.2);
  if (Math.random() < 0.03) size *= 1.5 + Math.random() * 1.5;
  return Math.round(size * 100) / 100;
}

// A stack remembers the average size of what's in it. Food that wasn't rolled (crates, codes, meals) counts as 1x.
const sizeOf = key => save.sizes[key] || 1;

function give(key, amount = 1, size = 1) {
  const { food, mut } = parseKey(key);
  const had = save.inv[key] || 0;
  save.sizes[key] = (sizeOf(key) * had + size * amount) / (had + amount);
  save.inv[key] = had + amount;
  if (!save.found[food.id]) {
    save.found[food.id] = true;
    if (food.tier === 'meal') { /* cooking shows its own message */ }
    else if (food.tier === 'secret') toast(`Secret found: ${food.name}!`, TIERS.secret.color);
    else toast(`New food: ${food.name}!`, TIERS[food.tier].color);
  }
  if (mut) {
    save.found[key] = true;
    // A double counts for both of its mutations
    for (const m of mutParts(mut)) {
      if (!save.mutCount[m.id]) toast(`New mutation: ${m.icon} ${m.name}!`, m.color);
      save.mutCount[m.id] = (save.mutCount[m.id] || 0) + amount;
    }
    if (mut.parts) save.doubles = (save.doubles || 0) + amount;
  }
  if (countsAsBest(key) && (!save.best || rarity(key) > rarity(save.best))) save.best = key;
  persist();
}

function showResult(key, lucky, copies = 1, size = 0) {
  const { food, mut } = parseKey(key);
  const tier = TIERS[food.tier];
  cardKey = key;
  el.cardEmoji.classList.toggle('melon-grab', food.id === 'watermelon');
  el.card.style.setProperty('--card-color', mut ? mut.color : tier.color);
  el.card.style.setProperty('--tier-color', tier.color);
  el.card.classList.toggle('mutated', !!mut);
  el.cardTier.textContent = tier.label;
  el.cardMut.textContent = mut ? `${mut.icon} ${mut.name} ${mut.parts ? 'double ' : ''}mutation ${mut.icon}` : '';
  el.cardEmoji.innerHTML = emojiHtml(key, true);
  el.cardName.textContent = nameOf(key);
  el.cardName.className = `card-name ${nameClass(food)}`;
  el.cardOdds.textContent = oddsText(key) + (size ? ` · ${size.toFixed(2)}x size` : '');
  const notes = [];
  if (size >= 2) notes.push(`HUGE! ${size.toFixed(2)}x size`);
  if (lucky) notes.push('Lucky roll! x2 luck');
  if (copies > 1) notes.push(`Double roll! You got ${copies}`);
  el.luckyNote.innerHTML = notes.join(' · ') || '&nbsp;';

  if (mut) {
    el.mutPop.classList.remove('show');
    void el.mutPop.offsetWidth;
    el.mutPop.classList.add('show');
  } else if (TIER_ORDER.indexOf(food.tier) >= 2) {
    el.card.classList.remove('pop');
    void el.card.offsetWidth;
    el.card.classList.add('pop');
  }

  const chip = document.createElement('span');
  chip.className = 'chip';
  chip.innerHTML = emojiHtml(key) + (mut ? `<span class="chip-mut">${mut.icon}</span>` : '');
  chip.title = nameOf(key);
  chip.style.setProperty('--c', mut ? mut.color : tier.color);
  el.recent.prepend(chip);
  while (el.recent.children.length > 10) el.recent.lastChild.remove();
}

// Quick full-screen flash that doesn't stop the game
function flash(title, sub, color) {
  el.mutFlash.style.setProperty('--m', color);
  el.mutFlash.style.background = `radial-gradient(circle, ${color}55, transparent 65%)`;
  el.mutFlashText.innerHTML = `${title}<div class="mf-sub">${sub}</div>`;
  el.mutFlash.classList.remove('show');
  void el.mutFlash.offsetWidth;
  el.mutFlash.classList.add('show');
  sfx.pop();
}

// For rare rolls that aren't rare enough for a cutscene
function bigFlash(key) {
  const { food, mut } = parseKey(key);
  const color = mut ? mut.color : TIERS[food.tier].color;
  const title = mut ? `${mut.icon} ${mut.name.toUpperCase()} ${mut.parts ? 'DOUBLE ' : ''}MUTATION! ${mut.icon}` : `${TIERS[food.tier].label.toUpperCase()}!`;
  flash(title, `${nameOf(key)} · ${oddsText(key)}`, color);
}

// For super rare combos where neither the food nor the mutation has its own scene
function genericScene(key) {
  const { food, mut } = parseKey(key);
  const c = mut ? mut.color : TIERS[food.tier].color;
  return {
    bg: `radial-gradient(circle, ${c}66, #000 70%)`, color: c, fx: 'rays', p: [...mutParts(mut).map(m => m.icon), `img:${food.id}`].join(' '), motion: 'rise',
  };
}

function trackStreak(food) {
  if (save.streak.id === food.id) save.streak.count++;
  else save.streak = { id: food.id, count: 1 };
  if (food.id !== 'bread' && save.streak.count >= 4) unlockSecret('jackpot');
}

// ---------- Eating ----------
function eat(key, silent = false) {
  if (!save.inv[key]) return false;
  const { food } = parseKey(key);
  save.inv[key]--;
  if (!save.inv[key]) delete save.inv[key];
  save.totalEaten++;
  dailyAdd('eat');
  applyEffect(key, silent);

  if (food.id === 'bread' && ++save.breadEaten >= 10) unlockSecret('crownbread');
  if (key === 'donut:glazed') unlockSecret('sugarrush');
  if (food.id === 'fortune' && Math.random() < FORTUNE_SCRAP_CHANCE) findScrap(); // sometimes the message inside is a recipe
  if (food.id === 'oyster' && save.treasure === 0) advanceTreasure(1);
  if (ROOTS.includes(food.id) && huntStep('mole') === 0 && ++save.huntRoots >= 10) advanceHunt('mole', 1);
  if (food.id === 'ghostmallow' && huntStep('haunt') === 0) advanceHunt('haunt', 1);
  if (food.id === 'milk' && huntStep('phantom') === 2) advanceHunt('phantom', 3);
  if (food.id === 'watermelon' && huntStep('map') === 0 && (save.melonsEaten = (save.melonsEaten || 0) + 1) >= 10) advanceHunt('map', 1);
  if (save.totalEaten >= 100) unlockSecret('feastmedal');
  if (save.rolls >= 50 && Object.keys(save.inv).length === 0) unlockSecret('emptyplate');
  return true;
}

// The next N rolls get this mutation. The same mutation again adds more rolls; a different one joins the list.
function addMutCharge(id, rolls) {
  const c = save.charges.muts.find(x => x.id === id);
  if (c) c.rolls += rolls;
  else save.charges.muts.push({ id, rolls });
}

// Gives the power of a food or meal. A meal can have several kinds of power at once.
function applyEffect(key, silent = false) {
  const { food } = parseKey(key);
  const e = effectOf(key);
  const color = TIERS[food.tier].color;

  if (e.surprise) {
    const pool = MEALS.filter(m => !m.secret);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!silent) toast(`Surprise: it tastes like ${pick.name}`, color);
    applyEffect(pick.id, true);
  }
  if (e.perm) {
    save.perm += e.perm;
    if (!silent) toast(`${nameOf(key)}: luck permanently ${pct(e.perm)}!`, color);
  }
  if (e.luckyRolls) {
    save.charges.lucky += e.luckyRolls;
    if (!silent) toast(`${food.name}: +${e.luckyRolls} Lucky Rolls!`, color);
  }
  if (e.floor) {
    const f = save.charges.floor;
    if (f && f.tier === e.floor.tier) f.rolls += e.floor.rolls;
    else save.charges.floor = { ...e.floor };
    if (!silent) toast(`${food.name}: next rolls are at least ${TIERS[e.floor.tier].label}!`, color);
  }
  if (e.forceMut) {
    addMutCharge(e.forceMut.id, e.forceMut.rolls);
    if (!silent) toast(`${food.name}: next rolls are ${MUT[e.forceMut.id].name}!`, MUT[e.forceMut.id].color);
  }
  if (e.time && (e.luck || e.speed || e.mutBoost || e.double)) {
    const b = save.buffs.find(x => x.key === key);
    if (b) b.left = Math.min(MAX_BUFF_TIME, b.left + e.time);
    else save.buffs.push({ key, left: e.time });
    if (!silent && !e.luckyRolls && !e.floor && !e.forceMut) toast(`Ate ${nameOf(key)}`, color);
  }
}

// Deletes every stack more common than the "Auto delete below 1 in N" setting. Returns how many items went.
function purgeBelow() {
  const limit = save.settings.deleteBelow;
  if (!limit) return 0;
  let removed = 0;
  for (const key of Object.keys(save.inv)) {
    if (rarity(key) < limit && !save.favs[key]) {
      removed += save.inv[key];
      delete save.inv[key];
    }
  }
  return removed;
}

// Eats every copy of a food with one toast instead of one per copy. Returns how many were eaten.
// Quiet (used by auto eat) only toasts when permanent luck went up.
function eatStack(key, quiet = false) {
  const n = save.inv[key] || 0;
  if (!n) return 0;
  const perm = save.perm;
  for (let i = 0; i < n; i++) eat(key, true);
  const gained = save.perm - perm;
  if (!quiet || gained) toast(`Ate ${fmt(n)}x ${nameOf(key)}` + (gained ? ` · luck permanently ${pct(gained)}!` : ''), TIERS[parseKey(key).food.tier].color);
  return n;
}

// Picked foods get eaten as soon as you have them. In the tier and "by odds" modes, a whole stack
// gets eaten once its buff runs out. "By odds" eats rolled food at 1 in X or more common (like the Eat all bar).
function autoEat() {
  const mode = save.settings.autoEat;
  const limit = Number(save.settings.autoEatOdds) || 0;
  if (mode === 'off' || cutscenePlaying || (mode === 'odds' && !limit)) return;
  let ate = 0;
  for (const key of Object.keys(save.inv)) {
    if (save.favs[key]) continue; // favorites are never eaten automatically
    if (mode === 'picked') {
      if (save.picked[key]) ate += eatStack(key, true);
      continue;
    }
    const { food } = parseKey(key);
    if (mode === 'odds') {
      if (food.tier === 'secret' || food.tier === 'meal' || rarity(key) > limit) continue;
    } else {
      const maxTier = { rare: 2, epic: 3, all: TIER_ORDER.length }[mode];
      if (food.tier === 'meal' || TIER_ORDER.indexOf(food.tier) > maxTier) continue;
      if (food.perm && mode !== 'all') continue;
    }
    if (save.buffs.some(b => b.key === key)) continue;
    ate += eatStack(key, true);
  }
  if (ate) {
    persist();
    renderAll();
  }
}

// ---------- Secrets ----------
// One-time secrets that come from actions instead of rolls
function unlockSecret(id) {
  if (save.triggers[id]) return;
  save.triggers[id] = true;
  persist();
  queueCutscene(SCENES[id], id).then(() => { give(id); renderAll(); });
}

// Treasure hunt. Steps: 0 = eat an Oyster Pearl, 1 = cook one Coconut alone, 2 = code ARRR, 3 = press X ten times.
// The clue for the current step is the treasure secret's hint.
const TREASURE_CLUES = [
  'Treasure hunts start at the bottom of the sea, in a shell that keeps something shiny.',
  'The map is soggy, but you can read it: "Castaways have one thing to eat. Cook one. Only one."',
  'Next line on the map: "The parrot will only tell the codes book. Pirates say it with three R\'s."',
  'Last line on the map: "X marks the spot. Dig ten times."',
];
let treasureDigs = 0;

function advanceTreasure(step) {
  save.treasure = step;
  updateHuntUI();
  showClue('🗺️ Treasure map', TREASURE_CLUES[step].replace(/^.*?: "|"$/g, ''), 'Saved in your Clue journal (Achievements tab).');
  persist();
  renderSecrets();
}

// Clues stay on screen until closed, so there is time to read them
function showClue(title, text, note) {
  $('clueTitle').textContent = title;
  $('clueText').textContent = `"${text}"`;
  $('clueNote').textContent = note;
  $('clueModal').classList.add('show');
  sfx.chime();
}
$('clueClose').addEventListener('click', () => $('clueModal').classList.remove('show'));

// ---------- More treasure hunts ----------
// Each hunt is a few steps. The clue for the step you are on is the reward secret's hint.
// mole:  eat 10 root vegetables -> scroll to the bottom of a tunnel under the page -> Whack-a-Mole
// safe:  cook a Breakfast Plate -> open the safe under the pot (memory game) -> code 2009
// comet: roll something 1 in 1,000,000+ -> scroll right past the recent rolls and click the comet
// haunt (Halloween): eat a Ghost Marshmallow -> knock 3 times on the door by the title -> light every candle
// The three hardest hunts (all melon themed):
// cipher: find Burnt Melon and The One Melon -> a note in the Codes book, shifted 7 letters -> code NOLEM
// map:    eat 10 Watermelons -> 4 torn map pieces hidden in the Mutations tab (past the end), the Index
//         (behind the Watermelon), Settings (the word "Melon") and How to play (after the last rule)
//         -> put the map together (rotate the tiles)
// phantom (unlisted, only a note in the Secrets list says it exists): code ONEINAMELON -> click the seed
//         next to Reset save -> eat a Milk -> turn the music off and on 3 times -> hold the logo for 3 seconds
const HUNTS = {
  phantom: { secret: 'phantommelon', clues: [
    'One secret was never written down. Some say it starts with the name of this game.',
    'A melon seed rolls out of the Codes book and away. It stops where you would go to start over.',
    'The seed needs water. Give it the plainest drink you have.',
    'It sprouted! Plants like music. Turn yours off and on again. Three times.',
    'Something is growing inside the logo. Hold on to it.',
  ] },
  cipher: { secret: 'seedless', clues: [
    'Melons keep secrets of their own. Find the burnt one and the chosen one.',
    'A scrambled note is stuck inside the Codes book. Count to seven.',
  ] },
  map: { secret: 'seedvault', clues: [
    'Someone tore a melon map into four pieces. Big melon eaters find the first one.',
    'The first piece fell past the strangest changes, below the very last one.',
    'The second piece is tucked behind a melon in the book of every food.',
    'The third piece is in the small print, where the game signs its name.',
    'The last piece is with the rules, right at the end.',
    'All four pieces! The torn map is waiting under the Roll button. Put it back together.',
  ] },
  haunt: { secret: 'candybucket', clues: [
    'Something sweet is haunted this year. Take a bite and see who answers.',
    'A door has appeared where there was none, right at the top. Ghosts are polite: knock first.',
  ] },
  mole: { secret: 'molestash', clues: [
    'Something is digging under the kitchen. It is hungry for things that grow underground.',
    'The ground gave way. A tunnel goes down, further than the page does.',
  ] },
  safe: { secret: 'chefslockbox', clues: [
    'The old chef locked something away. The first clue is served with the most important meal of the day.',
    'A note under the plate: "The safe is hidden under the pot."',
    'Inside the safe, a note: "The lockbox opens with the year written on the oldest thing in the fridge."',
  ] },
  comet: { secret: 'stardust', clues: [
    'Roll something rare enough and the sky will notice.',
    'Something landed just past the end of your recent rolls. Keep going right.',
  ] },
};
const ROOTS = ['potato', 'carrot', 'onion'];
const huntStep = id => save.hunts[id] || 0;
const huntHint = id => HUNTS[id].clues[Math.min(huntStep(id), HUNTS[id].clues.length - 1)];

function advanceHunt(id, step) {
  save.hunts[id] = step;
  showClue('🗺️ A new clue', HUNTS[id].clues[step], FOOD[HUNTS[id].secret].unlisted
    ? 'This secret is not in the book, but your Clue journal (Achievements tab) remembers.'
    : 'Saved in your Clue journal (Achievements tab).');
  persist();
  updateHuntUI();
}

function finishHunt(id) {
  save.hunts[id] = HUNTS[id].clues.length;
  unlockSecret(HUNTS[id].secret);
  persist();
  updateHuntUI();
}

// Shows or hides the hiding places for the hunt steps you are on
function updateHuntUI() {
  $('tunnel').hidden = huntStep('mole') !== 1;
  $('cometTrail').hidden = huntStep('comet') !== 1;
  $('xSpot').hidden = save.treasure !== 3;
  $('hauntDoor').hidden = huntStep('haunt') !== 1;
  $('helpPiece').hidden = huntStep('map') !== 4;
  $('mapSpot').hidden = huntStep('map') !== 5;
  $('phantomSeed').hidden = huntStep('phantom') !== 1;
}

// Phantom hunt: the seed by Reset save, then holding the logo for 3 seconds at the end
$('phantomSeed').addEventListener('click', () => { if (huntStep('phantom') === 1) advanceHunt('phantom', 2); });
let logoHold = null;
$('logo').addEventListener('pointerdown', () => {
  if (huntStep('phantom') !== 4) return;
  $('logo').classList.add('growing');
  logoHold = setTimeout(() => { logoHold = null; $('logo').classList.remove('growing'); finishHunt('phantom'); }, 3000);
});
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
  $('logo').addEventListener(ev, () => { clearTimeout(logoHold); logoHold = null; $('logo').classList.remove('growing'); });
}

// Map hunt: every torn piece is a .map-piece button with its step number; the word "Melon" in Settings is piece 3
function takeMapPiece(step) {
  if (huntStep('map') !== step) return;
  sfx.chime();
  advanceHunt('map', step + 1);
  renderAll();
}
document.addEventListener('click', e => {
  const piece = e.target.closest('.map-piece');
  if (piece) takeMapPiece(Number(piece.dataset.piece));
});
$('melonWord').addEventListener('click', () => takeMapPiece(3));
$('mapSpot').addEventListener('click', async () => {
  if (await mapPuzzle()) finishHunt('map');
  else toast('The pieces slip apart. Try again.', '#ff8080');
});

// Put the torn map back together: 3x3 tiles of one picture, each turned the wrong way. Tap a tile to turn it.
function mapPuzzle() {
  return openMinigame('The Torn Map', (area, info, finish) => {
    area.className = 'mg-area mg-map';
    const turns = Array.from({ length: 9 }, () => 1 + Math.floor(Math.random() * 3)); // quarter turns, never upright at the start
    area.innerHTML = turns.map((t, i) => `<button class="mg-tile" data-i="${i}" style="background-position:${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%"></button>`).join('');
    const tiles = [...area.children];
    const show = () => {
      tiles.forEach((b, i) => { b.style.rotate = `${turns[i] * 90}deg`; });
      info(`Turn every piece the right way up. ${turns.filter(t => t % 4).length} to go.`);
    };
    area.onpointerdown = e => {
      const b = e.target.closest('.mg-tile');
      if (!b) return;
      const i = Number(b.dataset.i);
      turns[i] = (turns[i] + 1) % 4;
      sfx.tick();
      show();
      if (turns.every(t => t % 4 === 0)) {
        info('The map is whole. An X marks a tiny vault full of seeds.');
        finish(true);
      }
    };
    show();
  });
}

// Scatter some rocks and bones down the tunnel
for (let i = 0; i < 40; i++) {
  const d = document.createElement('span');
  d.className = 'dirt';
  d.textContent = ['🪨', '🦴', '🪱', '🍂', '🐌'][i % 5];
  d.style.cssText = `left:${Math.random() * 92}%;top:${2 + Math.random() * 90}%`;
  $('tunnel').appendChild(d);
}

$('tunnelEnd').addEventListener('click', async () => {
  if (await whackAMole()) finishHunt('mole');
  else toast('The moles got away. Try again.', '#ff8080');
});
$('cometEnd').addEventListener('click', () => finishHunt('comet'));

// Halloween hunt: knock three times, then the candle puzzle
let knocks = 0;
$('hauntDoor').addEventListener('click', async () => {
  sfx.tick();
  if (++knocks < 3) return toast('Knock' + '... knock'.repeat(knocks - 1), '#c8d6ff');
  knocks = 0;
  if (await candlePuzzle()) finishHunt('haunt');
  else toast('The candles blow out. The door creaks shut.', '#ff8080');
});

async function openSafe() {
  if (await memoryGame()) advanceHunt('safe', 2);
  else toast('The safe stays shut. Try again.', '#ff8080');
}

// ---------- Minigames ----------
// setup(area, info, finish, every) builds the game. finish(true/false) ends it.
// every(fn, ms) is a repeating timer that waits while a cutscene covers the screen, so the game
// pauses and carries on after. setup can return { pause, resume } for anything else that must stop.
let endMinigame = null;
function openMinigame(title, setup) {
  return new Promise(resolve => {
    const area = $('mgArea');
    const timers = [];
    let done = false;
    let paused = false;
    let hooks = null;
    const info = text => { $('mgInfo').textContent = text; };
    const every = (fn, ms) => timers.push(setInterval(() => { if (!paused) fn(); }, ms));
    timers.push(setInterval(() => {
      if (paused === cutscenePlaying) return;
      paused = cutscenePlaying;
      area.classList.toggle('paused', paused);
      if (hooks) (paused ? hooks.pause : hooks.resume)();
    }, 100));
    const finish = win => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout); // also clears intervals
      if (hooks) hooks.pause(); // the game's own timers too (Give up)
      area.onpointerdown = null;
      setTimeout(() => $('mgModal').classList.remove('show'), win ? 600 : 0);
      if (win) sfx.chime();
      resolve(win);
    };
    endMinigame = () => finish(false);
    $('mgTitle').textContent = title;
    area.innerHTML = '';
    area.classList.remove('paused');
    $('mgModal').classList.add('show');
    hooks = setup(area, info, finish, every) || null;
  });
}
$('mgClose').addEventListener('click', () => endMinigame && endMinigame());

function whackAMole() {
  return openMinigame('Whack-a-Mole', (area, info, finish, every) => {
    const GOAL = 12;
    area.className = 'mg-area mg-grid';
    area.innerHTML = Array.from({ length: 9 }, (_, i) => `<button class="mg-hole" data-i="${i}"></button>`).join('');
    const holes = [...area.children];
    let hits = 0, left = 20, up = -1;
    const status = () => info(`Hit ${GOAL} moles · ${hits}/${GOAL} · ${left}s left`);
    const pop = () => {
      holes.forEach(h => { h.textContent = ''; });
      up = Math.floor(Math.random() * 9);
      holes[up].textContent = '🐹';
    };
    area.onpointerdown = e => {
      const h = e.target.closest('.mg-hole');
      if (!h || Number(h.dataset.i) !== up) return;
      up = -1;
      h.textContent = '💥';
      sfx.pop();
      if (++hits >= GOAL) finish(true);
      status();
    };
    every(pop, 750);
    every(() => { left--; status(); if (left <= 0) finish(false); }, 1000);
    pop();
    status();
  });
}

function memoryGame() {
  return openMinigame('The Safe', (area, info, end) => {
    const LENGTHS = [4, 5, 6];
    area.className = 'mg-area mg-simon';
    area.innerHTML = ['pizza', 'donut', 'sushi', 'apple'].map((id, i) => `<button class="mg-pad" data-i="${i}">${imgTag(FOOD[id], true)}</button>`).join('');
    const pads = [...area.children];
    const seq = [];
    let round = 0, pos = 0, listening = false;
    let timers = [];
    const stopTimers = () => { timers.forEach(clearTimeout); timers = []; pads.forEach(p => p.classList.remove('lit')); };
    const finish = win => { stopTimers(); end(win); };
    const flashPad = (p, at, ms) => {
      timers.push(setTimeout(() => { pads[p].classList.add('lit'); sfx.tick(); }, at));
      timers.push(setTimeout(() => pads[p].classList.remove('lit'), at + ms));
    };
    const play = () => {
      listening = false;
      pos = 0;
      while (seq.length < LENGTHS[round]) seq.push(Math.floor(Math.random() * 4));
      info(`Lock ${round + 1}/3: watch the order...`);
      seq.forEach((p, k) => flashPad(p, 600 + k * 650, 400));
      timers.push(setTimeout(() => { listening = true; info(`Lock ${round + 1}/3: now you`); }, 600 + seq.length * 650));
    };
    area.onpointerdown = e => {
      const pad = e.target.closest('.mg-pad');
      if (!pad || !listening) return;
      const i = Number(pad.dataset.i);
      flashPad(i, 0, 200);
      if (i !== seq[pos]) {
        listening = false;
        info('Wrong order.');
        timers.push(setTimeout(() => finish(false), 900));
      } else if (++pos === seq.length) {
        listening = false;
        if (++round === LENGTHS.length) {
          info('Click. The safe swings open.');
          finish(true);
        } else timers.push(setTimeout(play, 800));
      }
    };
    play();
    // A cutscene in the middle: stop, then show this lock's order again from the start
    return { pause: stopTimers, resume: play };
  });
}

// Lights Out with candles: touching one flips it and the ones next to it. Light them all.
// It starts from all lit with a few random touches, so it can always be solved.
function candlePuzzle() {
  return openMinigame('The Haunted House', (area, info, finish) => {
    area.className = 'mg-area mg-grid';
    area.innerHTML = Array.from({ length: 9 }, (_, i) => `<button class="mg-candle" data-i="${i}">${imgTag({ id: 'candle', name: 'Candle', emoji: '🕯️' }, true)}</button>`).join('');
    const candles = [...area.children];
    const lit = Array(9).fill(true);
    let moves = 0;
    const touch = i => {
      const r = Math.floor(i / 3), c = i % 3;
      for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < 3 && cc >= 0 && cc < 3) lit[rr * 3 + cc] = !lit[rr * 3 + cc];
      }
    };
    const show = () => {
      candles.forEach((b, i) => b.classList.toggle('lit', lit[i]));
      info(`Light every candle. Touching one flips the ones next to it too. Moves: ${moves}`);
    };
    while (lit.every(Boolean)) {
      for (let i = 0; i < 9; i++) if (Math.random() < 0.45) touch(i);
    }
    area.onpointerdown = e => {
      const b = e.target.closest('.mg-candle');
      if (!b) return;
      touch(Number(b.dataset.i));
      moves++;
      sfx.tick();
      show();
      if (lit.every(Boolean)) {
        info('Every candle is lit. Something laughs upstairs.');
        finish(true);
      }
    };
    show();
  });
}

// The One Melon: drag a rolled watermelon off the card onto the logo. Nothing else on the card drags.
// Pointer events, so it works with a finger too.
let cardKey = null; // what the roll card shows right now
let melonDrag = null;
const overLogo = e => {
  const r = $('logo').getBoundingClientRect();
  return e.clientX >= r.left - 10 && e.clientX <= r.right + 10 && e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10;
};
function endMelonDrag(e, dropped) {
  if (!melonDrag) return;
  if (melonDrag.ghost) {
    melonDrag.ghost.remove();
    if (dropped && overLogo(e)) unlockSecret('onemelon');
  }
  $('logo').classList.remove('melon-target');
  melonDrag = null;
}
el.cardEmoji.addEventListener('pointerdown', e => {
  if (!cardKey || rolling || parseKey(cardKey).food.id !== 'watermelon') return;
  melonDrag = { x: e.clientX, y: e.clientY, ghost: null };
  try { el.cardEmoji.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
});
el.cardEmoji.addEventListener('pointermove', e => {
  if (!melonDrag) return;
  if (!melonDrag.ghost) {
    if (Math.hypot(e.clientX - melonDrag.x, e.clientY - melonDrag.y) < 8) return; // a tap, not a drag yet
    melonDrag.ghost = document.createElement('div');
    melonDrag.ghost.className = 'melon-ghost';
    melonDrag.ghost.innerHTML = emojiHtml(cardKey, true);
    document.body.appendChild(melonDrag.ghost);
  }
  melonDrag.ghost.style.left = e.clientX + 'px';
  melonDrag.ghost.style.top = e.clientY + 'px';
  $('logo').classList.toggle('melon-target', overLogo(e));
});
el.cardEmoji.addEventListener('pointerup', e => endMelonDrag(e, true));
el.cardEmoji.addEventListener('pointercancel', e => endMelonDrag(e, false));

let logoClicks = [];
$('logo').addEventListener('click', () => {
  const now = Date.now();
  logoClicks = logoClicks.filter(t => now - t < 3000);
  logoClicks.push(now);
  if (logoClicks.length >= 10) {
    logoClicks = [];
    unlockSecret('burnttoast');
  }
});

let hintClicks = 0;
$('rollHint').addEventListener('click', () => {
  if (++hintClicks >= 5) unlockSecret('smallprint');
});

let flips = 0;
el.card.addEventListener('dblclick', () => {
  el.card.classList.toggle('flipped');
  if (++flips >= 3) unlockSecret('upsidecake');
});

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPos = 0;
let lastInput = Date.now();

// ---------- Cutscenes ----------
let skipCutscene = null;
let csSkipped = false;
let csRevealing = false;

function queueCutscene(scene, key) {
  cutsceneQueue = cutsceneQueue.then(() => playCutscene(scene, key));
  return cutsceneQueue;
}

// A sleep that a click on the cutscene can cut short
function csWait(ms) {
  if (csSkipped) return Promise.resolve();
  return new Promise(resolve => {
    const t = setTimeout(done, ms);
    function done() { clearTimeout(t); skipCutscene = null; resolve(); }
    skipCutscene = done;
  });
}

function addParticles(emojiList, motion, count) {
  const emojis = emojiList.split(' ');
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    const a = Math.random() * Math.PI * 2;
    s.className = `pt pt-${motion}`;
    const token = emojis[i % emojis.length];
    // "img:pizza" means the food's picture, anything else is shown as text
    if (token.startsWith('img:')) s.innerHTML = imgTag(FOOD[token.slice(4)], true);
    else s.textContent = token;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
      `font-size:${16 + Math.random() * 34}px;animation-duration:${2.5 + Math.random() * 4}s;` +
      `animation-delay:${-Math.random() * 6}s;--dx:${Math.cos(a) * 60}vw;--dy:${Math.sin(a) * 60}vh;` +
      `--r:${15 + Math.random() * 35}vmin`;
    el.csParticles.appendChild(s);
  }
}

function restartClass(node, cls) {
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
}

// How hard a cutscene hits: 1 for the most common divines, up to 4 for 1 in 10 billion and rarer
function csPower(key) {
  if (parseKey(key).food.tier === 'secret') return 2;
  return Math.max(1, Math.min(4, Math.floor((Math.log10(rarity(key)) - 5) / 1.5) + 1));
}

// Counts the odds up from 1 so you can feel how rare it is. The counter grows as it climbs,
// and every new digit thumps the screen.
async function countUp(target, ms) {
  const steps = 45;
  let digits = 1;
  for (let i = 1; i <= steps && !csSkipped; i++) {
    const n = Math.round(Math.pow(target, i / steps));
    el.csCounter.textContent = `1 in ${fmt(n)}`;
    el.csCounter.style.setProperty('--grow', 1 + 0.6 * i / steps);
    if (String(n).length > digits) {
      digits = String(n).length;
      restartClass(el.csCounter, 'thump');
      sfx.thump(digits);
    } else if (i % 3 === 0) sfx.tick();
    await sleep(ms / steps);
  }
  el.csCounter.textContent = `1 in ${fmt(Math.round(target))}`;
  el.csCounter.style.setProperty('--grow', 1.6);
}

async function playCutscene(sc, key) {
  cutscenePlaying = true;
  duckMusic(true);
  csSkipped = false;
  csRevealing = false;
  const { food, mut } = parseKey(key);
  const cs = el.cutscene;
  const power = csPower(key);

  cs.className = 'cutscene show' + (sc.glitch ? ' glitch' : '') + (sc.flip ? ' flip' : '');
  cs.style.background = sc.bg;
  cs.style.setProperty('--c', sc.color);
  cs.style.setProperty('--shake', '1px');
  cs.style.setProperty('--level', 1);
  cs.style.setProperty('--beat', '1.1s');
  cs.style.setProperty('--pw', 1 + 0.35 * (power - 1)); // scales the reveal shake
  el.csFx.className = `cs-fx fx-${sc.fx}`;
  el.csParticles.innerHTML = '';
  addParticles(sc.p, sc.motion, 10);
  el.csReveal.classList.remove('show');
  el.csCounter.textContent = '';
  el.csCounter.style.setProperty('--grow', 1);
  el.csStage.classList.add('rumble');
  sfx.droneStart();

  // 1. The odds tick up (rarer rolls take a bit longer)
  if (food.tier === 'secret') {
    el.csCounter.textContent = '1 in ???';
    await csWait(900);
  } else {
    await countUp(rarity(key), 1800 + 400 * (power - 1));
  }

  // 2. Heartbeats, each one shakier, louder and faster than the last. Rarer rolls get more of them.
  for (let i = 0; i < 1 + power && !csSkipped; i++) {
    const level = i + 2;
    cs.style.setProperty('--shake', `${Math.min(18, level * 3)}px`);
    cs.style.setProperty('--level', level);
    cs.style.setProperty('--beat', `${Math.max(0.3, 1.1 - level * 0.18)}s`);
    addParticles(sc.p, sc.motion, 6 + power * 2);
    restartClass(cs, 'punch');
    sfx.heartbeat();
    await csWait(Math.max(700, 1500 - i * 200));
  }

  // 3. Slow motion: everything crawls, the camera creeps in, the dark closes in and the sound drains away
  const slowAll = rate => cs.getAnimations({ subtree: true }).forEach(a => { a.playbackRate = rate; });
  if (!csSkipped) {
    slowAll(0.2); // before adding slowmo, so its own camera-creep transition runs at full speed
    cs.classList.add('slowmo');
    sfx.droneFade(1.6);
    sfx.slowBeat();
    setTimeout(() => cutscenePlaying && !csRevealing && sfx.slowBeat(), 850);
    await csWait(1600);
  }

  // 4. A point of light in the middle grows, slowly and then all at once, until the screen is white
  if (!csSkipped) {
    cs.classList.add('charge');
    sfx.riser(1.4);
    await csWait(1400);
  }
  sfx.droneStop();
  el.csStage.classList.remove('rumble');
  el.csCounter.textContent = '';
  if (csSkipped) await sleep(150);

  // 5. The reveal: the white becomes the flash, then shockwave rings, explosion of particles, heavy shake
  csRevealing = true;
  cs.classList.remove('flip', 'slowmo', 'charge');
  slowAll(1);
  restartClass(cs, 'flash');
  restartClass(cs, 'shake');
  restartClass(el.csShock, 'go');
  for (let i = 1; i <= power; i++) {
    const ring = document.createElement('div');
    ring.className = 'cs-shock go';
    ring.style.animationDelay = `${i * 0.18}s`;
    el.csStage.appendChild(ring);
    setTimeout(() => ring.remove(), 1200 + i * 180);
  }
  el.csParticles.innerHTML = '';
  addParticles(`img:${food.id} ${sc.p}`, 'burst', 45 + 20 * power);
  sfx.boom(power);
  setTimeout(sfx.chime, 350);
  if (navigator.vibrate) navigator.vibrate([80, 40, 120 * power]);

  el.csEmoji.innerHTML = emojiHtml(key, true);
  el.csName.textContent = nameOf(key);
  el.csOdds.textContent = oddsText(key);
  el.csReveal.classList.add('show');

  await sleep(1000); // so a skip-click doesn't close the reveal straight away
  await new Promise(resolve => cs.addEventListener('click', resolve, { once: true }));
  cs.className = 'cutscene';
  el.csShock.classList.remove('go');
  cutscenePlaying = false;
  duckMusic(false);
}

el.cutscene.addEventListener('click', () => {
  if (csRevealing) return;
  csSkipped = true;
  if (skipCutscene) skipCutscene();
});

// ---------- Rendering ----------
function renderStats() {
  const next = 10 - (save.rolls % 10);
  const rows = [
    ['Rolls', fmt(save.rolls)],
    ['Coins', `🪙 ${fmt(save.coins)}`],
    ['Luck', save.settings.luckCap && save.settings.luckCap < luckNow()
      ? `x${save.settings.luckCap} (limited, full x${luckNow().toFixed(2)})`
      : `x${luckNow().toFixed(2)}`],
    ['Mutation luck', `x${mutLuckFor(rollLuck(false)).toFixed(2)}`],
    ['Roll time', `${rollTime().toFixed(2)}s`],
    ['Lucky roll in', next === 1 ? 'next roll!' : `${next} rolls`],
    ['Foods found', `${NORMAL_FOODS.filter(f => save.found[f.id]).length} / ${NORMAL_FOODS.length}`],
    ['Mutations found', `${REGULAR_MUTS.filter(m => save.mutCount[m.id]).length} / ${REGULAR_MUTS.length}`],
    ['Recipes cooked', `${REGULAR_MEALS.filter(m => save.cooked[m.id]).length} / ${REGULAR_MEALS.length}`],
    ['Best find', save.best ? `${emojiHtml(save.best)} ${nameOf(save.best)}<div class="best-odds">${oddsText(save.best)}</div>` : '-'],
  ];
  if (save.perm) rows.splice(2, 0, ['Permanent luck', pct(save.perm)]);
  el.stats.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  renderRollLuck();
}

// Luck under the Roll button, with a little pop when it goes up
let lastRollLuck = null;
function renderRollLuck() {
  const luck = rollLuck(false);
  const box = $('rollLuck');
  if (lastRollLuck !== null && luck > lastRollLuck + 0.005) {
    box.classList.remove('up');
    void box.offsetWidth; // restart the animation
    box.classList.add('up');
  }
  lastRollLuck = luck;
  box.textContent = `🍀 Luck x${luck.toFixed(2)}`;
  box.title = luck < 1.005 ? 'Eat food to raise your luck' : 'Your luck from eating food';
}

function renderBuffs() {
  const items = [];
  // Roll-count power-ups from meals
  if (save.charges.lucky > 0) {
    items.push(`<li style="--c:${TIERS.meal.color}"><span class="b-emoji">🍀</span>
      <span class="b-info">Lucky Rolls<div class="b-effect">x2 luck</div></span>
      <span class="b-time">${save.charges.lucky} left</span></li>`);
  }
  const floor = save.charges.floor;
  if (floor) {
    items.push(`<li style="--c:${TIERS[floor.tier].color}"><span class="b-emoji">⬆️</span>
      <span class="b-info">At least ${TIERS[floor.tier].label}<div class="b-effect">guaranteed tier</div></span>
      <span class="b-time">${floor.rolls} left</span></li>`);
  }
  if (save.charges.anyMut > 0) {
    items.push(`<li style="--c:#7ed957"><span class="b-emoji">🧪</span>
      <span class="b-info">Mutation Spray<div class="b-effect">random mutation</div></span>
      <span class="b-time">${save.charges.anyMut} left</span></li>`);
  }
  save.charges.muts.forEach((mc, i) => {
    const m = MUT[mc.id];
    items.push(`<li style="--c:${m.color}"><span class="b-emoji">${m.icon}</span>
      <span class="b-info">${m.name} rolls<div class="b-effect">${i < 2 ? 'guaranteed mutation' : 'waiting for a free spot'}</div></span>
      <span class="b-time">${mc.rolls} left</span></li>`);
  });
  el.charges.innerHTML = items.join('') || (save.buffs.length ? '' : '<li class="empty">Eat food to get buffs!</li>');

  // Food buffs live in a dropdown with a one-line summary, rarest tier first (secrets, then meals, then Eternal
  // down to Common), and inside a tier the rarest 1 in X first.
  // Each shows what it actually adds right now (the 2nd strongest counts half, and so on).
  el.buffBox.hidden = !save.buffs.length;
  if (!save.buffs.length) return;
  const luck = new Map(rankedBuffs('luck').map(x => [x.key, x.counted]));
  const speed = new Map(rankedBuffs('speed').map(x => [x.key, x.counted]));
  const shown = (full, counted) => counted < full - 0.005 ? `${pct(full)} (counts ${pct(counted)})` : pct(full);
  el.buffSummary.innerHTML = `${save.buffs.length} buff${save.buffs.length > 1 ? 's' : ''} · <b>${pct(buffTotal('luck'))}</b> luck · <b>${pct(buffTotal('speed'))}</b> speed`;
  const tierRank = key => ({ secret: 99, meal: 98 })[parseKey(key).food.tier] ?? TIER_ORDER.indexOf(parseKey(key).food.tier);
  const sorted = [...save.buffs].sort((a, b) => tierRank(b.key) - tierRank(a.key) || rarity(b.key) - rarity(a.key));
  el.buffs.innerHTML = sorted.map(b => {
    const { food, mut } = parseKey(b.key);
    const e = effectOf(b.key);
    const parts = [];
    if (e.luck) parts.push(`${shown(e.luck, luck.get(b.key))} luck`);
    if (e.speed) parts.push(`${shown(e.speed, speed.get(b.key))} speed`);
    if (e.mutBoost) parts.push(`x${e.mutBoost} mutations`);
    if (e.double) parts.push('double rolls');
    return `<li style="--c:${mut ? mut.color : TIERS[food.tier].color}"><span class="b-emoji">${emojiHtml(b.key)}</span>
      <span class="b-info">${nameOf(b.key)}<div class="b-effect">${parts.join(', ')}</div></span>
      <span class="b-time">${timeText(b.left)}</span></li>`;
  }).join('') + '<li class="buff-note">Your strongest buff counts in full, the 2nd counts half, the 3rd a third, and so on.</li>';
}

// ---------- Kitchen (the pot) ----------
// You put food from your inventory into the pot and cook it. If the pot holds exactly the kinds of food
// a recipe needs (and enough of each), out comes that meal, as many as the pot has room for, and the
// leftovers go back. The right kinds but too few gives a hint and nothing is lost. Anything else is Pot Mush.
// An ingredient is a food id (any mutation counts) or an exact key like 'pizza:golden'.
const ingredientKeys = id => id.includes(':') ? (save.inv[id] ? [id] : []) : Object.keys(save.inv).filter(k => k.split(':')[0] === id);
const countOf = id => ingredientKeys(id).reduce((n, k) => n + save.inv[k], 0);
const canCook = meal => Object.entries(meal.needs).every(([id, n]) => countOf(id) >= n);
const cookedKinds = () => MEALS.filter(m => save.cooked[m.id]).length;
const totalCooked = () => Object.values(save.cooked).reduce((a, b) => a + b, 0);
const potCount = () => Object.values(save.pot).reduce((a, b) => a + b, 0);
// Inventory plus whatever is sitting in the pot
const ownedOf = id => countOf(id) + Object.keys(save.pot).filter(k => id.includes(':') ? k === id : k.split(':')[0] === id).reduce((n, k) => n + save.pot[k], 0);
let potMsg = '';

// Recipe scraps: the only way to learn a recipe besides guessing. They turn up while rolling,
// inside Fortune Cookies and sometimes in Pot Mush. Secret recipes' scraps only come from their unlock.
// Tuned with an 8-hour auto play simulation: at 1 in 100 per roll and a scrap in every Fortune Cookie,
// every scrap was found in the first 15 minutes.
const SCRAP_CHANCE = 1 / 800; // per roll
const FORTUNE_SCRAP_CHANCE = 1 / 40; // per Fortune Cookie eaten
const MUSH_SCRAP_CHANCE = 1 / 3;

function showScrap(meal) {
  save.clues[meal.id] = true;
  const color = meal.secret ? TIERS.secret.color : TIERS.meal.color;
  flash(meal.secret ? '📜 A strange recipe scrap' : '📜 Recipe scrap', `"${meal.clue}"`, color);
  toast('Recipe scrap saved to your Recipes tab', color);
  persist();
}

const scrapPool = () => MEALS.filter(m => !m.secret && (!m.event || eventOn(m.event)) && !save.cooked[m.id] && !save.clues[m.id]);

function findScrap() {
  const pool = scrapPool();
  if (!pool.length) return false;
  showScrap(pool[Math.floor(Math.random() * pool.length)]);
  return true;
}

function checkRecipeUnlocks() {
  for (const m of MEALS) {
    if (!m.secret || save.recipesUnlocked[m.id] || !m.unlock()) continue;
    save.recipesUnlocked[m.id] = true;
    if (!save.cooked[m.id]) showScrap(m);
    persist();
  }
}

function moveToPot(key, n) {
  n = Math.min(n, save.inv[key] || 0);
  if (!n) return;
  save.inv[key] -= n;
  if (!save.inv[key]) delete save.inv[key];
  save.pot[key] = (save.pot[key] || 0) + n;
}

function emptyPot() {
  for (const [key, n] of Object.entries(save.pot)) save.inv[key] = (save.inv[key] || 0) + n;
  save.pot = {};
}

// Does the pot hold exactly this recipe's kinds of food? Returns how many meals it makes (0 = not enough), or null.
function matchMeal(meal) {
  const needs = Object.entries(meal.needs);
  const owner = {}; // pot key -> the ingredient it counts as
  for (const [id] of needs) if (id.includes(':') && save.pot[id]) owner[id] = id;
  for (const [id] of needs) {
    if (id.includes(':')) continue;
    for (const k of Object.keys(save.pot)) if (!owner[k] && k.split(':')[0] === id) owner[k] = id;
  }
  if (Object.keys(save.pot).some(k => !owner[k])) return null;
  let times = Infinity;
  for (const [id, n] of needs) {
    const have = Object.keys(owner).filter(k => owner[k] === id).reduce((s, k) => s + save.pot[k], 0);
    if (!have) return null;
    times = Math.min(times, Math.floor(have / n));
  }
  return { times, owner };
}

// Plain food is used before mutated food
function cookPot() {
  if (!potCount()) {
    save.cookFails++; // pressing Cook on an empty pot counts towards a secret recipe
    potMsg = 'The pot is empty.';
    checkRecipeUnlocks();
    persist();
    renderKitchen();
    return;
  }
  // Treasure hunt step: one Coconut, alone
  const potKeys = Object.keys(save.pot);
  if (save.treasure === 1 && potKeys.length === 1 && potKeys[0].split(':')[0] === 'coconut' && save.pot[potKeys[0]] === 1) {
    save.pot = {};
    potMsg = 'You eat like a castaway. Something new shows up on the map.';
    advanceTreasure(2);
    renderAll();
    return;
  }

  let meal = null, match = null;
  for (const m of MEALS) {
    match = matchMeal(m);
    if (match) { meal = m; break; }
  }

  if (meal) save.mushStreak = 0;
  if (meal && !match.times) {
    potMsg = 'Almost! The mix is right, but there is not enough of something.';
    sfx.tick();
  } else if (meal) {
    for (const [id, n] of Object.entries(meal.needs)) {
      let left = n * match.times;
      const keys = Object.keys(match.owner).filter(k => match.owner[k] === id).sort((a, b) => rarity(a) - rarity(b));
      for (const k of keys) {
        const take = Math.min(left, save.pot[k]);
        save.pot[k] -= take;
        if (!save.pot[k]) delete save.pot[k];
        left -= take;
      }
    }
    emptyPot(); // leftovers go back
    const first = !save.cooked[meal.id];
    const made = match.times + save.upgrades.pot; // Bigger Pot: +1 meal per cook per level
    save.cooked[meal.id] = (save.cooked[meal.id] || 0) + made;
    give(meal.id, made);
    dailyAdd('cook', made);
    potMsg = `${first ? 'New recipe! ' : ''}Out came ${made > 1 ? made + 'x ' : ''}${meal.name}.` +
      (save.upgrades.pot ? ` (${save.upgrades.pot} extra from your Bigger Pot)` : '');
    toast(`${first ? 'New recipe: ' : 'Cooked '}${made > 1 ? made + 'x ' : ''}${meal.name}`, TIERS.meal.color);
    if (meal.id === 'breakfast' && huntStep('safe') === 0) advanceHunt('safe', 1);
    sfx.chime();
  } else {
    save.pot = {};
    give('mush');
    save.mushMade++;
    if (++save.mushStreak >= 5) unlockSecret('mushmonster');
    potMsg = 'That did not work. You got Pot Mush.';
    sfx.pop();
    if (Math.random() < MUSH_SCRAP_CHANCE && findScrap()) potMsg += ' Something was stuck to the bottom of the pot...';
  }
  persist();
  renderAll();
}

function renderKitchen() {
  const potKeys = Object.keys(save.pot).sort((a, b) => rarity(b) - rarity(a));
  const pot = potKeys.map(k => `<button class="ing pot-ing" data-unpot="${k}" title="Take one out: ${nameOf(k)}">${emojiHtml(k)} ${save.pot[k]}</button>`).join('');
  $('kitchenTop').innerHTML = `<div class="pot" style="--c:${TIERS.meal.color}">
      <div class="pot-pic">${imgTag(FOOD.fondue, true)}</div>
      <div class="pot-items">${pot || '<span class="tab-note">The pot is empty. Add food from below.</span>'}</div>
      <div class="pot-buttons">
        <button data-potcook>Cook</button>
        <button data-potempty class="${potCount() ? '' : 'off'}">Take all out</button>
      </div>
      <div class="pot-msg">${potMsg || '&nbsp;'}</div>
    </div>` +
    // Safe hunt: the safe is under the pot
    (huntStep('safe') === 1 ? `<div class="row" style="--c:#fcd34d">
      <span class="r-emoji">🔒</span>
      <span class="r-info"><div class="r-name">A safe under the pot</div><div class="r-sub">Three locks.</div></span>
      <button data-safe>Open</button>
    </div>` : '') + `
    <p class="tab-note">Mix foods to find recipes. Found recipes go in the Recipes tab. Careful: auto delete can throw away ingredients!</p>`;
  renderKitchenList();
}

// The ingredient list has its own search (name, mutation or tier, like the inventory search)
function renderKitchenList() {
  const all = Object.keys(save.inv).filter(k => parseKey(k).food.tier !== 'meal').sort((a, b) => rarity(b) - rarity(a));
  const q = $('kitchenSearch').value.trim().toLowerCase();
  const keys = q ? all.filter(k => `${nameOf(k)} ${TIERS[parseKey(k).food.tier].label}`.toLowerCase().includes(q)) : all;
  if (all.length && !keys.length) {
    $('kitchenList').innerHTML = `<p class="empty">No food matches "${q.replace(/[<>&"]/g, '')}".</p>`;
    return;
  }
  $('kitchenList').innerHTML = (keys.length ? keys.map(key => {
      const { food, mut } = parseKey(key);
      return `<div class="row" style="--c:${TIERS[food.tier].color}">
        <span class="r-emoji">${emojiHtml(key)}</span>
        <span class="r-info">
          <div class="r-name ${nameClass(food)}">${mut ? tagHtml(mut) + ' ' : ''}${food.name} <span class="r-count">x${save.inv[key]}</span></div>
        </span>
        <button data-add="${key}" data-n="1">+1</button>
        <button data-add="${key}" data-n="${save.inv[key]}">+All</button>
      </div>`;
    }).join('') : '<p class="empty">No food to cook with. Roll some!</p>');
}

// ---------- Achievements ----------
// prog() returns [current, goal]. Each one pays out coins once.
const foundCount = list => list.filter(f => save.found[f.id]).length;
const bestOdds = () => save.best ? rarity(save.best) : 0;
const ACHIEVEMENTS = [
  { id: 'roll100',    icon: '🎲', name: 'Warming Up',        desc: 'Roll 100 times',                 prog: () => [save.rolls, 100],       coins: 50 },
  { id: 'roll1k',     icon: '🎲', name: 'Regular',           desc: 'Roll 1,000 times',               prog: () => [save.rolls, 1000],      coins: 300 },
  { id: 'roll10k',    icon: '🎲', name: 'Dedicated',         desc: 'Roll 10,000 times',              prog: () => [save.rolls, 10000],     coins: 2000 },
  { id: 'roll100k',   icon: '🎲', name: 'Touch Grass',       desc: 'Roll 100,000 times',             prog: () => [save.rolls, 100000],    coins: 20000 },
  { id: 'find10',     icon: '📖', name: 'Taster',            desc: 'Discover 10 foods',              prog: () => [foundCount(NORMAL_FOODS), 10],  coins: 50 },
  { id: 'find50',     icon: '📖', name: 'Food Critic',       desc: 'Discover 50 foods',              prog: () => [foundCount(NORMAL_FOODS), 50],  coins: 1000 },
  { id: 'findall',    icon: '📖', name: 'Encyclopedia',      desc: 'Discover every food',            prog: () => [foundCount(NORMAL_FOODS), NORMAL_FOODS.length], coins: 50000 },
  { id: 'odds1k',     icon: '💎', name: 'Lucky',             desc: 'Roll something 1 in 1,000 or rarer',         prog: () => [Math.min(bestOdds(), 1e3), 1e3],   coins: 100 },
  { id: 'odds100k',   icon: '💎', name: 'Very Lucky',        desc: 'Roll something 1 in 100,000 or rarer',       prog: () => [Math.min(bestOdds(), 1e5), 1e5],   coins: 1000 },
  { id: 'odds10m',    icon: '💎', name: 'Suspiciously Lucky', desc: 'Roll something 1 in 10,000,000 or rarer',   prog: () => [Math.min(bestOdds(), 1e7), 1e7],   coins: 10000 },
  { id: 'odds1b',     icon: '💎', name: 'Statistically Impossible', desc: 'Roll something 1 in 1,000,000,000 or rarer', prog: () => [Math.min(bestOdds(), 1e9), 1e9], coins: 100000 },
  { id: 'mut1',       icon: '🧬', name: 'Something Changed', desc: 'Find a mutation',                prog: () => [Object.keys(save.mutCount).length, 1],  coins: 25 },
  { id: 'mut15',      icon: '🧬', name: 'Lab Rat',           desc: 'Find 15 mutations',              prog: () => [Object.keys(save.mutCount).length, 15], coins: 1500 },
  { id: 'double1',    icon: '✌️', name: 'Double Trouble',    desc: 'Roll a double mutation',         prog: () => [save.doubles || 0, 1], coins: 1000 },
  { id: 'mutall',     icon: '🧬', name: 'Mad Scientist',     desc: 'Find every mutation',            prog: () => [REGULAR_MUTS.filter(m => save.mutCount[m.id]).length, REGULAR_MUTS.length], coins: 30000 },
  { id: 'eat50',      icon: '🍽️', name: 'Snacker',           desc: 'Eat 50 times',                   prog: () => [save.totalEaten, 50],   coins: 50 },
  { id: 'eat1k',      icon: '🍽️', name: 'Bottomless',        desc: 'Eat 1,000 times',                prog: () => [save.totalEaten, 1000], coins: 1000 },
  { id: 'cook1',      icon: '🍲', name: 'First Dish',        desc: 'Cook a recipe',                  prog: () => [cookedKinds(), 1],      coins: 50 },
  { id: 'cook10',     icon: '🍲', name: 'Line Cook',         desc: 'Know 10 recipes',                prog: () => [cookedKinds(), 10],     coins: 1500 },
  { id: 'cookall',    icon: '🍲', name: 'Head Chef',         desc: 'Know every recipe',              prog: () => [REGULAR_MEALS.filter(m => save.cooked[m.id]).length, REGULAR_MEALS.length], coins: 50000 },
  { id: 'mush',       icon: '🥣', name: 'It Was Supposed To Be Soup', desc: 'Make Pot Mush',         prog: () => [save.found.mush ? 1 : 0, 1], coins: 10 },
  { id: 'cooked100',  icon: '🍲', name: 'Meal Prep',         desc: 'Cook 100 meals in total',        prog: () => [totalCooked(), 100],    coins: 3000 },
  { id: 'secret1',    icon: '🤫', name: 'Curious',           desc: 'Find a secret',                  prog: () => [foundCount(SECRETS), 1],  coins: 100 },
  { id: 'secret8',    icon: '🤫', name: 'Snoop',             desc: 'Find 8 secrets',                 prog: () => [foundCount(SECRETS), 8],  coins: 3000 },
  { id: 'secretall',  icon: '🤫', name: 'Nothing Left Hidden', desc: 'Find every secret',            prog: () => [foundCount(SECRETS), SECRETS.length], coins: 50000 },
  { id: 'earn1k',     icon: '🪙', name: 'Small Business',    desc: 'Earn 1,000 coins from selling',  prog: () => [save.coinsEarned, 1000],   coins: 100 },
  { id: 'earn1m',     icon: '🪙', name: 'Food Tycoon',       desc: 'Earn 1,000,000 coins from selling', prog: () => [save.coinsEarned, 1e6], coins: 25000 },
  { id: 'scrap1',     icon: '📜', name: 'Paper Trail',       desc: 'Buy a recipe scrap',             prog: () => [save.scrapsBought, 1],  coins: 25 },
  { id: 'luck10',     icon: '🍀', name: 'Charmed',           desc: 'Reach x10 luck',                 prog: () => [Math.min(luckNow(), 10), 10],   coins: 500 },
  { id: 'luck100',    icon: '🍀', name: 'Blessed',           desc: 'Reach x100 luck',                prog: () => [Math.min(luckNow(), 100), 100], coins: 10000 },
  { id: 'fav',        icon: '⭐', name: 'Keeper',            desc: 'Favorite a food',                prog: () => [Object.keys(save.favs).length ? 1 : 0, 1], coins: 10 },
  { id: 'fav10',      icon: '⭐', name: 'Picky Eater',       desc: 'Favorite 10 foods',              prog: () => [Object.keys(save.favs).length, 10], coins: 200 },
  { id: 'huge',       icon: '📏', name: 'Supersize',         desc: 'Roll something 3x size or bigger', prog: () => [Math.min(Math.max(0, ...Object.values(save.biggest)), 3), 3], coins: 500 },
  { id: 'tiny',       icon: '🔬', name: 'Fun Size',          desc: 'Roll something 0.6x size or smaller', prog: () => [save.smallest <= 0.6 ? 1 : 0, 1], coins: 300 },
  { id: 'hoard',      icon: '📦', name: 'Hoarder',           desc: 'Have 1,000 of one food at once',  prog: () => [Math.max(0, ...Object.values(save.inv)), 1000], coins: 500 },
  { id: 'rich',       icon: '🏦', name: 'Saving Up',         desc: 'Have 100,000 coins at once',     prog: () => [save.coins, 100000], coins: 2000 },
  { id: 'crates',     icon: '📦', name: 'Crate Expectations', desc: 'Open 10 Ingredient Crates',     prog: () => [save.shopBought.crate || 0, 10], coins: 300 },
  { id: 'themes',     icon: '🎨', name: 'Interior Designer', desc: 'Own every card theme',           prog: () => [THEMES.filter(t => !t.event && save.themes[t.id]).length, THEMES.filter(notEvent).length], coins: 5000 },
  { id: 'scraps10',   icon: '📜', name: 'Archivist',         desc: 'Find 10 recipe scraps',          prog: () => [Object.keys(save.clues).length, 10], coins: 1000 },
  { id: 'mush10',     icon: '🥣', name: 'Acquired Taste',    desc: 'Make Pot Mush 10 times',         prog: () => [save.mushMade, 10], coins: 100 },
  { id: 'fast',       icon: '⚡', name: 'Speedrunner',       desc: 'Get your roll time down to 0.3s', prog: () => [rollTime() <= 0.3 ? 1 : 0, 1], coins: 1000 },
];

// Saves from before achievements get theirs quietly, so loading doesn't fire 20 pop-ups
let achievementsQuiet = !save.achievements;
save.achievements = save.achievements || {};

function checkAchievements() {
  // Rainbow Plate secret: 7 different mutations in your inventory at the same time
  if (new Set(Object.keys(save.inv).flatMap(k => mutParts(parseKey(k).mut).map(m => m.id))).size >= 7) unlockSecret('rainbowplate');
  // Cipher hunt starts once both melon secrets are found
  if (huntStep('cipher') === 0 && save.found.burnttoast && save.found.onemelon) advanceHunt('cipher', 1);
  for (const a of ACHIEVEMENTS) {
    if (save.achievements[a.id]) continue;
    const [cur, goal] = a.prog();
    if (cur < goal) continue;
    save.achievements[a.id] = true;
    save.coins += a.coins;
    if (!achievementsQuiet) {
      toast(`🏆 ${a.name} (+${fmt(a.coins)} coins)`, '#ffd700');
      sfx.chime();
    }
  }
  achievementsQuiet = false;
  persist();
}

function renderAchievements() {
  const done = ACHIEVEMENTS.filter(a => save.achievements[a.id]).length;
  el.achievements.innerHTML = `<p class="tab-note">Unlocked ${done} / ${ACHIEVEMENTS.length}</p>` + ACHIEVEMENTS.map(a => {
    const got = save.achievements[a.id];
    const [cur, goal] = a.prog();
    const p = got ? 1 : Math.min(1, cur / goal);
    return `<div class="row ach ${got ? 'got' : 'locked'}" style="--c:${got ? '#ffd700' : '#666'}">
      <span class="r-emoji">${a.icon}</span>
      <span class="r-info">
        <div class="r-name">${a.name}</div>
        <div class="r-sub">${a.desc} · 🪙 ${fmt(a.coins)}</div>
        ${got ? '' : `<div class="ach-bar"><span style="width:${(p * 100).toFixed(1)}%"></span></div>`}
      </span>
      ${got ? '<span class="ach-check">✓</span>' : ''}
    </div>`;
  }).join('');
}

// ---------- Daily challenges ----------
// Three a day (easy, medium, hard), picked from the date so they're the same all day, new at midnight.
// Finishing all three pays a bonus that grows with your streak of days in a row, plus a recipe scrap if any are left.
// The goals are tuned for luck x5 to x20 (auto roll does about 2,500 rolls an hour).
const DAILY_TASKS = [
  { id: 'roll',    icon: '🎲', n: [150, 500, 1500], text: n => `Roll ${fmt(n)} times` },
  { id: 'eat',     icon: '🍽️', n: [40, 150, 500],   text: n => `Eat ${fmt(n)} foods` },
  { id: 'mut',     icon: '🧬', n: [30, 120, 400],   text: n => `Roll ${fmt(n)} mutated foods` },
  { id: 'epic',    icon: '💜', n: [5, 30, 120],     text: n => `Roll ${fmt(n)} Epic or rarer foods` },
  { id: 'leg',     icon: '🧡', n: [1, 3, 10],       text: n => n === 1 ? 'Roll a Legendary or rarer food' : `Roll ${n} Legendary or rarer foods` },
  { id: 'big',     icon: '📏', n: [2, 8, 25],       text: n => `Roll ${n} foods at 2x size or bigger` },
  { id: 'variety', icon: '🌈', n: [25, 50, 75],     text: n => `Roll ${n} different foods` },
  { id: 'sell',    icon: '🪙', n: [150, 750, 3000], text: n => `Earn ${fmt(n)} coins selling food` },
  // Only for players who know at least one recipe
  { id: 'cook',    icon: '🍲', n: [1, 3, 8],        text: n => n === 1 ? 'Cook a meal' : `Cook ${n} meals`, ok: () => REGULAR_MEALS.some(m => save.cooked[m.id]) },
];
const DAILY_LEVELS = ['Easy', 'Medium', 'Hard'];
const DAILY_COINS = [150, 500, 1500];
const dailyBonus = streak => 500 + 100 * Math.min(streak, 10); // streak = days in a row, counting today

const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };

// Same date, same challenges: a small random number generator seeded from the date
function dateRng(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function ensureDaily() {
  const today = dayStr();
  if (save.daily && save.daily.day === today) return;
  const rng = dateRng(today);
  const pool = DAILY_TASKS.filter(t => !t.ok || t.ok());
  const tasks = [];
  for (let level = 0; level < 3; level++) {
    const t = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    tasks.push({ id: t.id, n: t.n[level], have: 0, done: false });
  }
  save.daily = { day: today, tasks, seen: {}, bonus: false };
  if (save.dailyLast !== today && save.dailyLast !== yesterdayStr()) save.dailyStreak = 0; // missed a day
  persist();
}

// Progress from rolling, eating, cooking and selling. For 'variety', pass the food id.
function dailyAdd(id, amount = 1) {
  ensureDaily();
  const d = save.daily;
  for (const [level, t] of d.tasks.entries()) {
    if (t.id !== id || t.done) continue;
    if (id === 'variety') {
      if (d.seen[amount]) continue;
      d.seen[amount] = true;
      t.have++;
    } else t.have += amount;
    if (t.have < t.n) continue;
    t.done = true;
    save.coins += DAILY_COINS[level];
    save.dailiesDone = (save.dailiesDone || 0) + 1;
    toast(`📅 Daily done: ${DAILY_TASKS.find(x => x.id === id).text(t.n)} (+${fmt(DAILY_COINS[level])} coins)`, '#7dff9a');
    sfx.chime();
  }
  if (!d.bonus && d.tasks.every(t => t.done)) {
    d.bonus = true;
    save.dailyStreak = save.dailyLast === yesterdayStr() ? (save.dailyStreak || 0) + 1 : 1;
    save.dailyLast = d.day;
    const coins = dailyBonus(save.dailyStreak);
    save.coins += coins;
    toast(`🔥 All dailies done! Day ${save.dailyStreak} streak: +${fmt(coins)} coins`, '#ffd700');
    setTimeout(() => findScrap(), 600);
    persist();
  }
}

function renderDaily() {
  ensureDaily();
  const d = save.daily;
  const doneCount = d.tasks.filter(t => t.done).length;
  $('dailyTab').textContent = `Daily ${doneCount}/3`;
  // The streak counts today once it's finished, and yesterday's until then
  const streak = save.dailyLast === d.day || save.dailyLast === yesterdayStr() ? save.dailyStreak || 0 : 0;
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  const mins = Math.ceil((midnight - Date.now()) / 60000);
  const rows = d.tasks.map((t, level) => {
    const task = DAILY_TASKS.find(x => x.id === t.id);
    const p = Math.min(1, t.have / t.n);
    return `<div class="row ach ${t.done ? 'got' : 'locked'}" style="--c:${t.done ? '#7dff9a' : '#666'}">
      <span class="r-emoji">${task.icon}</span>
      <span class="r-info">
        <div class="r-name">${task.text(t.n)}</div>
        <div class="r-sub">${DAILY_LEVELS[level]} · 🪙 ${fmt(DAILY_COINS[level])}${t.done ? '' : ` · ${fmt(Math.min(t.have, t.n))} / ${fmt(t.n)}`}</div>
        ${t.done ? '' : `<div class="ach-bar"><span style="width:${(p * 100).toFixed(1)}%"></span></div>`}
      </span>
      ${t.done ? '<span class="ach-check">✓</span>' : ''}
    </div>`;
  }).join('');
  const nextStreak = d.bonus ? streak : streak + 1;
  el.daily.innerHTML = `<p class="tab-note">New challenges in ${Math.floor(mins / 60)}h ${mins % 60}m · 🔥 Streak: ${streak} day${streak === 1 ? '' : 's'}</p>` + rows +
    `<div class="row ach ${d.bonus ? 'got' : 'locked'}" style="--c:${d.bonus ? '#ffd700' : '#666'}">
      <span class="r-emoji">🎁</span>
      <span class="r-info">
        <div class="r-name">Finish all three</div>
        <div class="r-sub">${d.bonus ? `Done! Come back tomorrow to keep your streak.` : `🪙 ${fmt(dailyBonus(nextStreak))} (day ${nextStreak} streak)${scrapPool().length ? ' and a recipe scrap' : ''}`}</div>
      </span>
      ${d.bonus ? '<span class="ach-check">✓</span>' : ''}
    </div>`;
}

// ---------- Shop ----------
// Sell food for coins, buy recipe scraps. Rarer food is worth more, but not in a straight line
// (1 in 100 sells for 16, 1 in 10,000 for 251). Secrets and meals can't be sold.
// Each scrap costs 3.5x the last one (+250% per purchase), but never more than SCRAP_MAX_PRICE.
// Bigger food sells for more: the price is multiplied by the stack's average size.
const sellPrice = key => ['secret', 'meal'].includes(parseKey(key).food.tier) ? 0 : Math.max(1, Math.round(rarity(key) ** 0.6 * sizeOf(key)));
const SCRAP_MAX_PRICE = 500000;
const scrapPrice = () => Math.min(SCRAP_MAX_PRICE, Math.round(100 * 3.5 ** save.scrapsBought));

function sell(key, n) {
  n = Math.min(n, save.inv[key] || 0);
  const price = sellPrice(key);
  if (!n || !price) return;
  save.inv[key] -= n;
  if (!save.inv[key]) delete save.inv[key];
  save.coins += price * n;
  save.coinsEarned += price * n;
  dailyAdd('sell', price * n);
  if ((save.itemsSold += n) >= 1000) unlockSecret('merchantpie');
  sfx.tick();
}

function buyScrap() {
  const price = scrapPrice();
  if (!scrapPool().length) return toast('No scraps left to buy. You know every recipe the shop has heard of.', '#ff8080');
  if (save.coins < price) return toast(`You need ${fmt(price - save.coins)} more coins.`, '#ff8080');
  save.coins -= price;
  save.scrapsBought++;
  findScrap();
}

// Power-ups: each one costs 2x more every time you buy it. buy() returns false to cancel (no coins taken).
const POWERUPS = [
  { id: 'luckypack', icon: '🍀', name: 'Lucky Roll Pack', desc: 'Next 10 rolls are Lucky Rolls (x2 luck)', base: 200,
    buy: () => { save.charges.lucky += 10; } },
  { id: 'rareticket', icon: '🎟️', name: 'Rare Ticket', desc: 'Next 3 rolls are at least Rare', base: 300, buy: () => addFloor('rare') },
  { id: 'epicticket', icon: '🎫', name: 'Epic Ticket', desc: 'Next 3 rolls are at least Epic', base: 2500, buy: () => addFloor('epic') },
  { id: 'mutspray', icon: '🧪', name: 'Mutation Spray', desc: 'Your next roll gets a random mutation', base: 400,
    buy: () => { save.charges.anyMut = (save.charges.anyMut || 0) + 1; } },
  { id: 'goldseason', icon: '🧂', name: 'Golden Seasoning', desc: 'Next 5 rolls are Golden', base: 1500, buy: () => addMutCharge('golden', 5) },
  { id: 'crate', icon: '📦', name: 'Ingredient Crate', desc: '12 random common and uncommon foods', base: 150, flat: true, quiet: true, buy: openCrate },
  { id: 'mysterybox', icon: '🎁', name: 'Mystery Box', desc: 'A random prize: coins, food, power-ups... or something big', base: 750, flat: true, quiet: true, buy: openMysteryBox },
];
const powerupPrice = p => p.flat ? p.base : Math.round(p.base * 2 ** (save.shopBought[p.id] || 0));

function addFloor(tier) {
  const f = save.charges.floor;
  if (f && f.tier !== tier) return toast(`Wait until your ${TIERS[f.tier].label} rolls run out.`, '#ff8080'), false;
  if (f) f.rolls += 3;
  else save.charges.floor = { tier, rolls: 3 };
}

function openCrate() {
  const pool = NORMAL_FOODS.filter(f => f.tier === 'common' || f.tier === 'uncommon');
  const got = {};
  for (let i = 0; i < 12; i++) {
    const f = pool[Math.floor(Math.random() * pool.length)];
    got[f.id] = (got[f.id] || 0) + 1;
  }
  for (const [id, n] of Object.entries(got)) give(id, n);
  toast('Crate: ' + Object.entries(got).map(([id, n]) => `${n}x ${FOOD[id].name}`).join(', '), TIERS.uncommon.color);
}

// Mystery Box prizes. weight = how often a prize comes up: a prize with weight 20 shows up
// twice as often as one with weight 10. To add a prize, copy a line and change it.
const MYSTERY_PRIZES = [
  { icon: '🪙', name: '500 coins', weight: 30, give: () => { save.coins += 500; } },
  { icon: '🍀', name: '10 Lucky Rolls', weight: 15, give: () => { save.charges.lucky += 10; } },
  { icon: '🔷', name: '3 random Rare foods', weight: 20, give: () => giveRandomFood('rare', 3) },
  { icon: '🎁', name: 'Box of Surprises', weight: 0.5, give: () => save.triggers.boxsecret ? (save.coins += 750) : unlockSecret('boxsecret') },
  { icon: '📜', name: 'A recipe scrap', weight: 12, give: () => findScrap() || (save.coins += 750) }, // all scraps found: coins back
  { icon: '🧂', name: '5 Golden rolls', weight: 10, give: () => addMutCharge('golden', 5) },
  { icon: '🟣', name: 'A random Epic food', weight: 8, give: () => giveRandomFood('epic', 1) },
  { icon: '💰', name: '2,000 coins', weight: 4, give: () => { save.coins += 2000; } },
  { icon: '🌟', name: 'A random Legendary food!', weight: 1.5, give: () => giveRandomFood('legendary', 1) },
  { icon: '🎰', name: 'JACKPOT! 10,000 coins!', weight: 1, give: () => { save.coins += 10000; } },
];

// Gives n random foods of one tier (never event foods)
function giveRandomFood(tier, n) {
  const pool = NORMAL_FOODS.filter(f => f.tier === tier);
  for (let i = 0; i < n; i++) give(pool[Math.floor(Math.random() * pool.length)].id);
}

function openMysteryBox() {
  let r = Math.random() * MYSTERY_PRIZES.reduce((sum, p) => sum + p.weight, 0);
  const prize = MYSTERY_PRIZES.find(p => (r -= p.weight) <= 0) || MYSTERY_PRIZES[0];
  prize.give();
  save.boxesOpened++;
  $('boxPrize').textContent = `${prize.icon} ${prize.name}`;
  $('boxModal').classList.add('show');
  renderAll();
}
$('boxClose').addEventListener('click', () => $('boxModal').classList.remove('show'));

// Upgrades are permanent and have levels
const UPGRADES = [
  { id: 'eye', icon: '🔍', name: 'Sharper Eye', max: 5, base: 500, grow: 4,
    desc: lvl => `Recipe scraps turn up while rolling ${lvl ? `+${lvl * 50}% more often now, ` : ''}+50% per level` },
  { id: 'pot', icon: '🍲', name: 'Bigger Pot', max: 3, base: 3000, grow: 5,
    desc: lvl => `${lvl ? `${lvl} extra meal${lvl > 1 ? 's' : ''} every cook now, ` : ''}+1 extra meal every cook per level` },
];
const upgradePrice = u => Math.round(u.base * u.grow ** save.upgrades[u.id]);

// Card themes are bought once, then switched between for free
const THEMES = [
  { id: 'classic', name: 'Classic', price: 0 },
  { id: 'wood', name: 'Wood', price: 1000 },
  { id: 'neon', name: 'Neon', price: 2500 },
  { id: 'galaxy', name: 'Galaxy', price: 5000 },
  { id: 'gold', name: 'Gold', price: 20000 },
  // Free while its event is on, and yours to keep after
  { id: 'halloween', name: 'Halloween', price: 0, event: 'halloween' },
];
for (const t of THEMES) if (t.event && eventOn(t.event)) save.themes[t.id] = true;
function applyTheme() {
  for (const t of THEMES) el.card.classList.toggle('theme-' + t.id, save.settings.theme === t.id);
}

function spend(price) {
  if (save.coins < price) return toast(`You need ${fmt(price - save.coins)} more coins.`, '#ff8080'), false;
  save.coins -= price;
  return true;
}

function shopRow(icon, name, desc, button, color = TIERS.meal.color) {
  return `<div class="row" style="--c:${color}">
    <span class="r-emoji">${icon}</span>
    <span class="r-info"><div class="r-name">${name}</div><div class="r-sub">${desc}</div></span>
    ${button}
  </div>`;
}
const priceBtn = (attr, price, ok = true) => `<button ${attr} class="${ok && save.coins >= price ? '' : 'off'}">🪙 ${fmt(price)}</button>`;

function renderShop() {
  const price = scrapPrice();
  const left = scrapPool().length;
  el.shopTop.innerHTML = `<div class="shop-coins">🪙 ${fmt(save.coins)} coins</div>
    <h3 class="r-head">Power-ups</h3>` +
    shopRow('📜', 'Recipe Scrap', left ? 'A clue to a recipe you have not found. Goes in your Recipes tab.' : 'Sold out.', priceBtn('data-buyscrap', price, left)) +
    POWERUPS.map(p => shopRow(p.icon, p.name, p.desc, priceBtn(`data-buy="${p.id}"`, powerupPrice(p)))).join('') +
    '<h3 class="r-head">Upgrades</h3>' +
    UPGRADES.map(u => {
      const lvl = save.upgrades[u.id];
      const maxed = lvl >= u.max;
      return shopRow(u.icon, `${u.name} <span class="r-count">Lv ${lvl}/${u.max}</span>`, u.desc(lvl),
        maxed ? '<button class="off">Max</button>' : priceBtn(`data-upgrade="${u.id}"`, upgradePrice(u)));
    }).join('') +
    '<h3 class="r-head">Card themes</h3>' +
    THEMES.filter(t => !t.event || save.themes[t.id]).map(t => {
      const owned = save.themes[t.id];
      const using = save.settings.theme === t.id;
      const btn = using ? '<button class="off">In use</button>' : owned ? `<button data-theme="${t.id}">Use</button>` : priceBtn(`data-theme="${t.id}"`, t.price);
      return shopRow(`<span class="theme-swatch theme-${t.id}"></span>`, t.name, owned ? 'Owned' : 'Changes how your roll card looks', btn);
    }).join('');
  renderSellList();
}

// Why a food can't be sold, or '' if it can
function noSellReason(key) {
  const { tier } = parseKey(key).food;
  if (tier === 'secret') return 'Secrets can\'t be sold';
  if (tier === 'meal') return 'Meals can\'t be sold';
  if (save.favs[key]) return 'Favorite: unfavorite it in your Inventory to sell';
  return '';
}

// The sell list has its own search and a "can / can't sell" filter. Like the inventory search,
// it matches the name (mutation included) or the tier.
function renderSellList() {
  const which = el.sellWhich.value;
  const q = el.sellSearch.value.trim().toLowerCase();
  const keys = Object.keys(save.inv)
    .filter(k => which === 'all' || (which === 'can') === !noSellReason(k))
    .filter(k => !q || `${nameOf(k)} ${TIERS[parseKey(k).food.tier].label}`.toLowerCase().includes(q))
    .sort((a, b) => sellPrice(b) - sellPrice(a) || rarity(b) - rarity(a));
  if (!keys.length) {
    el.sellList.innerHTML = `<p class="empty">${q ? `No food matches "${q.replace(/[<>&"]/g, '')}" here.`
      : which === 'cant' ? 'Everything you have can be sold.' : 'Nothing to sell. Secrets, meals and favorites can\'t be sold.'}</p>`;
    return;
  }
  el.sellList.innerHTML = keys.map(key => {
    const { food, mut } = parseKey(key);
    const reason = noSellReason(key);
    return `<div class="row ${reason ? 'no-sell' : ''}" style="--c:${TIERS[food.tier].color}">
        <span class="r-emoji">${emojiHtml(key)}</span>
        <span class="r-info">
          <div class="r-name ${nameClass(food)}">${mut ? tagHtml(mut) + ' ' : ''}${food.name} <span class="r-count">x${save.inv[key]}</span></div>
          <div class="r-sub">${reason ? `🚫 ${reason}` : `🪙 ${fmt(sellPrice(key))} each · ${sizeOf(key).toFixed(2)}x size`}</div>
        </span>
        ${reason ? '' : `<button data-sell="${key}" data-n="1">Sell 1</button>
        <button data-sell="${key}" data-n="${save.inv[key]}">All</button>`}
      </div>`;
  }).join('');
}

function renderRecipes() {
  const known = MEALS.filter(m => save.cooked[m.id]);
  const scraps = MEALS.filter(m => !save.cooked[m.id] && save.clues[m.id]);
  const knownRows = known.map(m => {
    const ings = Object.entries(m.needs).map(([id, n]) => {
      const have = ownedOf(id);
      return `<span class="ing ${have >= n ? 'ok' : ''}" title="${nameOf(id)}">${emojiHtml(id)} ${Math.min(have, n)}/${n}</span>`;
    }).join('');
    const color = m.secret ? TIERS.secret.color : TIERS.meal.color;
    return `<div class="row recipe" style="--c:${color}">
      <span class="r-emoji">${emojiHtml(m.id)}</span>
      <span class="r-info">
        <div class="r-name">${m.secret ? `<span class="tag" style="--m:${color}">Secret</span> ` : ''}${m.name} <span class="r-count">cooked ${save.cooked[m.id]}x</span></div>
        <div class="r-sub">${effectText(m.id)}</div>
        <div class="ings">${ings}</div>
      </span>
      <button data-fill="${m.id}" class="${Object.entries(m.needs).every(([id, n]) => ownedOf(id) >= n) ? '' : 'off'}" title="Put this recipe in the pot">To pot</button>
    </div>`;
  }).join('');
  // Only scraps you have found show up here, never the recipes you have not
  const scrapRows = scraps.map(m => `<div class="row scrap" style="--c:${m.secret ? TIERS.secret.color : TIERS.meal.color}">
      <span class="r-emoji">📜</span>
      <span class="r-info"><div class="r-sub">"${m.clue}"</div></span>
    </div>`).join('');
  el.recipes.innerHTML = `
    <h3 class="r-head">Known recipes</h3>${knownRows || '<p class="empty">None yet. Try mixing foods in the Kitchen!</p>'}
    <h3 class="r-head">Recipe scraps</h3>${scrapRows || '<p class="empty">No scraps right now. Keep rolling, they turn up.</p>'}`;
}

function renderInventory() {
  // Favorites first, then rarest first
  const all = Object.keys(save.inv).sort((a, b) => (!!save.favs[b] - !!save.favs[a]) || rarity(b) - rarity(a));
  if (!all.length) {
    el.inv.innerHTML = '<p class="empty">Nothing yet. Roll some food!</p>';
    return;
  }
  // The search matches the name (mutation included) or the tier, so "golden" or "legendary" work too
  const q = el.invSearch.value.trim().toLowerCase();
  const keys = q ? all.filter(k => `${nameOf(k)} ${TIERS[parseKey(k).food.tier].label}`.toLowerCase().includes(q)) : all;
  if (!keys.length) {
    el.inv.innerHTML = `<p class="empty">No food matches "${q.replace(/[<>&"]/g, '')}".</p>`;
    return;
  }
  el.inv.innerHTML = keys.map(key => {
    const { food, mut } = parseKey(key);
    const active = save.buffs.some(b => b.key === key);
    const picked = save.picked[key];
    return `<div class="row" style="--c:${TIERS[food.tier].color}">
      <span class="r-emoji">${emojiHtml(key)}</span>
      <span class="r-info">
        <div class="r-name ${nameClass(food)}">${mut ? tagHtml(mut) + ' ' : ''}${food.name} <span class="r-count">x${save.inv[key]}</span></div>
        <div class="r-sub">${oddsText(key)} · ${effectText(key)}${sizeOf(key) !== 1 ? ` · ${sizeOf(key).toFixed(2)}x size` : ''} ${active ? '<span class="active-tag">· active</span>' : ''}</div>
      </span>
      <button data-fav="${key}" class="pick fav ${save.favs[key] ? 'on' : ''}" title="${save.favs[key] ? 'Unfavorite' : 'Favorite: never sold, auto eaten or auto deleted'}">⭐</button>
      <button data-pick="${key}" class="pick ${picked ? 'on' : ''}" title="${picked ? 'Unpick' : 'Pick for auto eat (Picked foods mode)'}">🍴</button>
      <button data-eat="${key}">Eat</button>
    </div>`;
  }).join('');
}

// Which mutations each food has been found with, doubles included: { pizza: Set{'golden', 'spicy'} }
let foundMuts = {};
const indexRow = f => {
  const seen = save.found[f.id];
  const muts = MUTATIONS.filter(m => foundMuts[f.id] && foundMuts[f.id].has(m.id)).map(m => m.icon).join('');
  const ev = f.event ? EVENTS[f.event] : null;
  // Map hunt, piece 2: hidden behind the Watermelon's picture
  const piece = f.id === 'watermelon' && huntStep('map') === 2;
  return `<div class="row ${seen ? '' : 'locked'}" style="--c:${TIERS[f.tier].color}">
      <span class="r-emoji${piece ? ' map-piece' : ''}"${piece ? ' data-piece="2"' : ''}>${seen ? emojiHtml(f.id) : '❓'}</span>
      <span class="r-info">
        <div class="r-name ${seen ? nameClass(f) : ''}">${seen ? f.name : '???'} <span class="r-muts">${muts}</span></div>
        <div class="r-sub">${ev ? `${ev.icon} ${ev.name} only · ` : ''}${TIERS[f.tier].label} · ${oddsText(f.id)}${save.biggest[f.id] ? ` · biggest ${save.biggest[f.id].toFixed(2)}x` : ''}${seen ? ' · ' + effectText(f.id) : ''}</div>
      </span>
    </div>`;
};

function renderIndex() {
  foundMuts = {};
  for (const k of Object.keys(save.found)) {
    const [f, m] = k.split(':');
    if (m) for (const id of m.split('+')) (foundMuts[f] = foundMuts[f] || new Set()).add(id);
  }
  const found = NORMAL_FOODS.filter(f => save.found[f.id]).length;
  // Event foods get their own section, shown while the event is on or once you have found one
  const events = Object.keys(EVENTS).map(id => {
    const list = EVENT_FOODS.filter(f => f.event === id);
    if (!eventOn(id) && !list.some(f => save.found[f.id])) return '';
    const e = EVENTS[id];
    return `<h3 class="r-head">${e.icon} ${e.name} event · ${list.filter(f => save.found[f.id]).length} / ${list.length}</h3>` + list.map(indexRow).join('');
  }).join('');
  el.index.innerHTML = `<p class="tab-note">Discovered ${found} / ${NORMAL_FOODS.length}</p>` + events +
    (events ? '<h3 class="r-head">All foods</h3>' : '') + NORMAL_FOODS.map(indexRow).join('');
}

function renderMutations() {
  const found = REGULAR_MUTS.filter(m => save.mutCount[m.id]).length;
  const shown = MUTATIONS.filter(m => !m.event || eventOn(m.event) || save.mutCount[m.id]);
  el.muts.innerHTML = `<p class="tab-note">Mutations found ${found} / ${REGULAR_MUTS.length}. Any food can mutate, and once in a while it mutates twice!${save.doubles ? ` Double mutations rolled: ${fmt(save.doubles)}` : ''}</p>` + shown.map(m => {
    const n = save.mutCount[m.id];
    const ev = m.event ? EVENTS[m.event] : null;
    const odds = m.secret && !n ? 'Secret' : `${ev ? `${ev.icon} ${ev.name} only · ` : ''}1 in ${fmt(m.chance)}`;
    const sub = n
      ? `${odds} · ${mutEffectText(m)} · found ${fmt(n)}x${m.desc ? `<br><i>${m.desc}</i>` : ''}`
      : (m.secret ? `Hint: ${m.hint}` : odds);
    return `<div class="row ${n ? '' : 'locked'}" style="--c:${m.color}">
      <span class="r-emoji">${n ? m.icon : '❓'}</span>
      <span class="r-info">
        <div class="r-name">${n ? m.name : '???'}</div>
        <div class="r-sub">${sub}</div>
      </span>
    </div>`;
  }).join('') + (huntStep('map') === 1 ? '<button class="map-piece" data-piece="1" title="Something torn">🧩</button>' : ''); // map hunt, piece 1
}

// How each secret is found. Only shown once you have found it, so it never spoils one you haven't.
const SECRET_HOW = {
  burnttoast: 'Click the logo 10 times within 3 seconds.',
  glitchcookie: 'Type the Konami code: ↑ ↑ ↓ ↓ ← → ← → B A (or swipe ↑ ↑ ↓ ↓ ← → ← → on a phone).',
  midnightsoup: 'Roll it between midnight and 1 AM. It shows up 1 in 500 during that hour.',
  clover: 'Your 777th roll is always this.',
  codepie: 'Redeem the code CHEF.',
  crownbread: 'Eat 10 Bread.',	
	
  goldenspoon: "Don't touch anything for 2 minutes.",
  upsidecake: 'Double-click the roll card 3 times to flip it.',
  emptyplate: 'Empty your whole inventory after at least 50 rolls.',
  feastmedal: 'Eat 100 times.',
  jackpot: 'Roll the same food 4 times in a row (Bread does not count).',
  secretsauce: 'Redeem the code SECRET.',
  doubleglaze: 'Roll a Glazed Donut.',
  sugarrush: 'Eat a Glazed Donut.',
  donuttower: 'Roll 3 Glazed Donuts in total.',
  boxsecret: 'Get lucky with a Mystery Box.',
  treasure: 'Eat an Oyster Pearl → cook one Coconut on its own → redeem ARRR → press X (or tap ✖️) 10 times.',
  molestash: 'Eat 10 Potatoes, Carrots or Onions → scroll down the tunnel below the page → win Whack-a-Mole.',
  chefslockbox: 'Cook a Breakfast Plate → open the safe under the pot (memory game) → redeem 2009.',
  stardust: 'Roll something 1 in 1,000,000 or rarer → scroll right past your recent rolls and click the comet.',
  tinytoast: 'Roll any food at 0.6x size or smaller.',
  giantloaf: 'Roll Bread at 3x size or bigger.',
  rainbowplate: 'Have 7 different mutations in your inventory at the same time.',
  merchantpie: 'Sell 1,000 items in the Shop.',
  mushmonster: 'Make Pot Mush 5 times in a row.',
  smallprint: 'Click "Press R to roll" 5 times.',
  onemelon: 'Roll a Watermelon, then drag it off the roll card onto the 🍉 logo.',
  seedless: 'Find the Burnt Melon and The One Melon → a scrambled note appears in the Codes book (every letter moved 7 places: "THE CODE IS THE MELON BACKWARDS") → redeem NOLEM.',
  seedvault: 'Eat 10 Watermelons → 🧩 below the last mutation in the Mutations tab → click the Watermelon picture in the Index → click "Melon" in the Settings credit line → 🧩 at the end of How to play → click 🗺️ under Roll and turn every map piece upright.',
  phantommelon: 'Redeem ONEINAMELON → click the tiny seed next to Reset save → eat a Milk → turn the music off and on 3 times → hold the 🍉 logo for 3 seconds.',
  candybucket: 'During Halloween: eat a Ghost Marshmallow → knock 3 times on the 🚪 by the title → light every candle.',
};

// Clue journal: every clue you have been given, hunt by hunt (worked out from how far each hunt got).
// The phantom hunt is in here too (Cody found leaving it out too harsh), it just stays out of the Secrets list.
function renderClueJournal() {
  const hunts = [{ clues: TREASURE_CLUES, step: save.treasure, secret: 'treasure' },
    ...Object.entries(HUNTS).map(([id, h]) => ({ clues: h.clues, step: huntStep(id), secret: h.secret }))]
    .filter(h => h.step >= 1)
    .sort((a, b) => (a.step >= a.clues.length) - (b.step >= b.clues.length)); // unfinished first
  $('clueJournal').innerHTML = hunts.length ? hunts.map(h => {
    const done = h.step >= h.clues.length;
    const seen = h.clues.slice(0, Math.min(h.step + 1, h.clues.length));
    return `<div class="row journal ${done ? 'got' : ''}" style="--c:${done ? TIERS.secret.color : '#e0b05c'}">
      <span class="r-emoji">${done ? '✅' : '🗺️'}</span>
      <span class="r-info">
        <div class="r-name">${done ? FOOD[h.secret].name : 'A hunt in progress'}</div>
        <ol class="journal-clues">${seen.map((c, i) => `<li class="${i === seen.length - 1 && !done ? 'now' : ''}">${c}</li>`).join('')}</ol>
      </span>
    </div>`;
  }).join('') : '<p class="empty">No clues yet. They turn up when a hunt begins.</p>';
}

function renderSecrets() {
  renderClueJournal();
  const found = SECRETS.filter(f => save.found[f.id]).length;
  const row = f => {
    const seen = save.found[f.id];
    const ev = f.event ? EVENTS[f.event] : null;
    return `<div class="row ${seen ? '' : 'locked'}" style="--c:${TIERS.secret.color}">
      <span class="r-emoji">${seen ? emojiHtml(f.id) : '🔒'}</span>
      <span class="r-info">
        <div class="r-name">${ev ? `<span class="tag" style="--m:#ff8c1a">${ev.icon} ${ev.name}</span> ` : ''}${seen ? f.name : '???'}</div>
        <div class="r-sub">${seen ? effectText(f.id) : 'Hint: ' + (typeof f.hint === 'function' ? f.hint() : f.hint)}</div>
        ${seen && SECRET_HOW[f.id] ? `<div class="r-sub secret-how">🔓 How: ${SECRET_HOW[f.id]}</div>` : ''}
      </span>
    </div>`;
  };
  // Event secrets sit on top while their event is on, and stay once found
  const events = EVENT_SECRETS.filter(f => eventOn(f.event) || save.found[f.id]);
  // Unlisted secrets count toward the total but only get a row once found. Until then, just this note.
  const listed = SECRETS.filter(f => !f.unlisted || save.found[f.id]);
  const unwritten = SECRETS.length - listed.length;
  el.secrets.innerHTML = `<p class="tab-note">Secrets found ${found} / ${SECRETS.length}</p>` + events.map(row).join('') + listed.map(row).join('') +
    (unwritten ? '<p class="secret-note">📜 Scribbled in the margin: "There is one more secret that was never written in this book. Some say it starts with this game\'s name."</p>' : '');
}

function renderAll() {
  checkRecipeUnlocks();
  checkAchievements();
  renderStats();
  renderBuffs();
  renderInventory();
  renderKitchen();
  renderRecipes();
  renderShop();
  renderDaily();
  renderAchievements();
  renderIndex();
  renderMutations();
  renderSecrets();
}

// ---------- Events ----------
el.rollBtn.addEventListener('click', () => roll());

el.invSearch.addEventListener('input', renderInventory);
el.sellSearch.addEventListener('input', renderSellList);
$('kitchenSearch').addEventListener('input', renderKitchenList);
el.sellWhich.addEventListener('change', renderSellList);

// Eat all: every food of one tier, or everything at "1 in X" or more common. Favorites are skipped.
// Your choice is remembered.
const eatWhich = $('eatWhich'), eatOdds = $('eatOdds');
eatWhich.value = save.settings.eatWhich || 'common';
eatOdds.value = save.settings.eatOdds || '';
eatOdds.hidden = eatWhich.value !== 'odds';
eatWhich.addEventListener('change', () => {
  save.settings.eatWhich = eatWhich.value;
  eatOdds.hidden = eatWhich.value !== 'odds';
  if (!eatOdds.hidden) eatOdds.focus();
  persist();
});
eatOdds.addEventListener('change', () => {
  save.settings.eatOdds = Math.max(1, Math.floor(Number(eatOdds.value) || 0)) || '';
  eatOdds.value = save.settings.eatOdds;
  persist();
});
$('eatAllBtn').addEventListener('click', () => {
  const mode = eatWhich.value;
  const limit = Number(eatOdds.value);
  if (mode === 'odds' && !(limit >= 1)) return toast('Type a number for X first', '#ff8080');
  const matches = key => {
    const { food } = parseKey(key);
    if (mode === 'odds') return food.tier !== 'secret' && food.tier !== 'meal' && rarity(key) <= limit;
    return food.tier === mode;
  };
  const keys = Object.keys(save.inv).filter(k => !save.favs[k] && matches(k));
  const label = mode === 'odds' ? `everything at 1 in ${fmt(limit)} or more common` : `all ${eatWhich.selectedOptions[0].text}`;
  if (!keys.length) return toast(`Nothing to eat: no ${label.replace(/^all /, '')} food (favorites are skipped)`, '#ff8080');
  const count = keys.reduce((n, k) => n + save.inv[k], 0);
  // Ask first for the rare stuff, so a misclick can't eat a Legendary collection
  const rareish = keys.some(k => ['legendary', 'mythic', 'divine', 'eternal'].includes(parseKey(k).food.tier));
  if (rareish && !confirm(`Eat ${fmt(count)} foods (${label})?`)) return;
  const perm = save.perm;
  for (const k of keys) eatStack(k, true);
  const gained = save.perm - perm;
  toast(`Ate ${fmt(count)} foods (${label})` + (gained ? ` · luck permanently ${pct(gained)}!` : ''), '#7dff9a');
  persist();
  renderAll();
});

// pointerdown instead of click: the list re-renders often, and a click can get lost in between
el.inv.addEventListener('pointerdown', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    e.preventDefault();
    const key = fav.dataset.fav;
    if (save.favs[key]) delete save.favs[key];
    else save.favs[key] = true;
    persist();
    renderAll();
    return;
  }
  const pick = e.target.closest('[data-pick]');
  if (pick) {
    e.preventDefault();
    const key = pick.dataset.pick;
    if (save.picked[key]) delete save.picked[key];
    else save.picked[key] = true;
    persist();
    renderInventory();
    if (save.settings.autoEat === 'picked') autoEat();
    return;
  }
  const btn = e.target.closest('[data-eat]');
  if (!btn) return;
  e.preventDefault();
  if (eat(btn.dataset.eat)) {
    persist();
    renderAll();
  }
});

el.kitchen.addEventListener('pointerdown', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  e.preventDefault();
  if ('potcook' in btn.dataset) return cookPot();
  if ('safe' in btn.dataset) return openSafe();
  if ('add' in btn.dataset) moveToPot(btn.dataset.add, Number(btn.dataset.n));
  else if ('unpot' in btn.dataset) {
    const key = btn.dataset.unpot;
    if (!--save.pot[key]) delete save.pot[key];
    save.inv[key] = (save.inv[key] || 0) + 1;
  } else if ('potempty' in btn.dataset) emptyPot();
  else return;
  potMsg = '';
  persist();
  renderAll();
});

el.shop.addEventListener('pointerdown', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  e.preventDefault();
  if ('buyscrap' in btn.dataset) buyScrap();
  else if ('sell' in btn.dataset) sell(btn.dataset.sell, Number(btn.dataset.n));
  else if ('buy' in btn.dataset) {
    const p = POWERUPS.find(x => x.id === btn.dataset.buy);
    const price = powerupPrice(p);
    if (save.coins < price) return toast(`You need ${fmt(price - save.coins)} more coins.`, '#ff8080');
    if (p.buy() === false) return;
    save.coins -= price;
    save.shopBought[p.id] = (save.shopBought[p.id] || 0) + 1;
    if (!p.quiet) toast(`Bought ${p.name}`, '#7dff9a');
    sfx.chime();
  } else if ('upgrade' in btn.dataset) {
    const u = UPGRADES.find(x => x.id === btn.dataset.upgrade);
    if (save.upgrades[u.id] >= u.max || !spend(upgradePrice(u))) return;
    save.upgrades[u.id]++;
    toast(`${u.name} is now level ${save.upgrades[u.id]}`, '#7dff9a');
    sfx.chime();
  } else if ('theme' in btn.dataset) {
    const t = THEMES.find(x => x.id === btn.dataset.theme);
    if (!save.themes[t.id]) {
      if (!spend(t.price)) return;
      save.themes[t.id] = true;
    }
    save.settings.theme = t.id;
    applyTheme();
  } else return;
  persist();
  renderAll();
});

el.recipes.addEventListener('pointerdown', e => {
  const btn = e.target.closest('[data-fill]');
  if (!btn) return;
  e.preventDefault();
  const meal = FOOD[btn.dataset.fill];
  emptyPot();
  if (!canCook(meal)) return toast('Not enough ingredients for that one.', '#ff8080');
  // Same order as cooking: plain food first
  for (const [id, n] of Object.entries(meal.needs)) {
    let left = n;
    for (const k of ingredientKeys(id).sort((a, b) => rarity(a) - rarity(b))) {
      const take = Math.min(left, save.inv[k]);
      moveToPot(k, take);
      left -= take;
    }
  }
  potMsg = `${meal.name} is in the pot. Press Cook!`;
  persist();
  renderAll();
  document.querySelector('.tabs [data-tab="kitchen"]').click();
});

document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button, .tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.add('active');
  });
});

applyTheme();
updateHuntUI();

// Browsers only allow audio after the player clicks or presses a key, so music starts on the first one
el.musicOn.checked = save.settings.music;
el.musicOn.addEventListener('change', () => {
  save.settings.music = el.musicOn.checked;
  if (save.settings.music) startMusic();
  else stopMusic();
  // Phantom hunt: the sprout likes music turned off and on 3 times (6 flips)
  if (huntStep('phantom') === 3 && (save.musicFlips = (save.musicFlips || 0) + 1) >= 6) advanceHunt('phantom', 4);
  persist();
});
addEventListener('pointerdown', startMusic);
addEventListener('keydown', startMusic);

el.soundOn.checked = save.settings.sound;
el.soundOn.addEventListener('change', () => {
  save.settings.sound = el.soundOn.checked;
  if (!save.settings.sound) sfx.droneStop();
  persist();
});

el.luckCap.value = save.settings.luckCap || '';
el.luckCap.addEventListener('change', () => {
  const v = Number(el.luckCap.value) || 0;
  save.settings.luckCap = v > 0 ? Math.max(1, Math.round(v * 100) / 100) : 0;
  el.luckCap.value = save.settings.luckCap || '';
  toast(save.settings.luckCap ? `Luck limited to x${save.settings.luckCap}` : 'Luck limit off: using full luck');
  persist();
  renderStats();
});

el.deleteBelow.value = save.settings.deleteBelow || '';
el.deleteBelow.addEventListener('change', () => {
  save.settings.deleteBelow = Math.max(0, Math.floor(Number(el.deleteBelow.value) || 0));
  el.deleteBelow.value = save.settings.deleteBelow || '';
  const removed = purgeBelow();
  if (save.settings.deleteBelow) {
    toast(`Auto delete on: anything more common than 1 in ${fmt(save.settings.deleteBelow)}` + (removed ? ` (deleted ${fmt(removed)} items)` : ''));
  } else {
    toast('Auto delete off');
  }
  persist();
  renderAll();
});

// "By odds" auto eat: everything at 1 in X or more common, with X typed next to it
const autoEatOdds = $('autoEatOdds');
el.autoEat.value = save.settings.autoEat;
autoEatOdds.value = save.settings.autoEatOdds || '';
autoEatOdds.hidden = el.autoEat.value !== 'odds';
el.autoEat.addEventListener('change', () => {
  save.settings.autoEat = el.autoEat.value;
  autoEatOdds.hidden = el.autoEat.value !== 'odds';
  if (!autoEatOdds.hidden && !autoEatOdds.value) autoEatOdds.focus();
  persist();
  autoEat();
});
autoEatOdds.addEventListener('change', () => {
  save.settings.autoEatOdds = Math.max(1, Math.floor(Number(autoEatOdds.value) || 0)) || '';
  autoEatOdds.value = save.settings.autoEatOdds;
  persist();
  autoEat();
});

addEventListener('pointerdown', () => { lastInput = Date.now(); });
addEventListener('keydown', e => {
  lastInput = Date.now();
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return; // typing in a box shouldn't roll
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  konamiStep(key, false);
  if (key === 'r' && !e.repeat) roll();
  if (key === 'x' && !e.repeat) treasureDig();
});

function konamiStep(key, touch) {
  konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : (key === KONAMI[0] ? 1 : 0);
  // Phones have no B or A key, so the 8 swipes are enough there
  if (konamiPos === KONAMI.length || (touch && konamiPos === 8)) {
    konamiPos = 0;
    unlockSecret('glitchcookie');
  }
}

// Swipes count as arrow keys for the Konami code
let touchStart = null;
addEventListener('touchstart', e => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });
addEventListener('touchend', e => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;
  konamiStep(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'), true);
}, { passive: true });

// Last step of the pirate hunt: press X ten times, or tap the X that shows up under the Roll button
function treasureDig() {
  if (save.treasure !== 3 || ++treasureDigs < 10) return;
  save.treasure = 4;
  updateHuntUI();
  unlockSecret('treasure');
}
$('xSpot').addEventListener('click', treasureDig);

// Cipher hunt: "THE CODE IS THE MELON BACKWARDS", every letter moved 7 places on
const MELON_NOTE = 'AOL JVKL PZ AOL TLSVU IHJRDHYKZ';
$('codesBtn').addEventListener('click', () => {
  $('codeNote').hidden = huntStep('cipher') !== 1;
  $('codeNote').textContent = `A scrambled note is stuck to the page: "${MELON_NOTE}"`;
  el.codeModal.classList.add('show');
  el.codeInput.value = '';
  el.codeInput.focus();
});
$('codeClose').addEventListener('click', () => el.codeModal.classList.remove('show'));

// How to play: opens by itself the first time someone plays, and once after each update (for "What's new")
$('helpBtn').addEventListener('click', () => $('helpModal').classList.add('show'));
$('helpClose').addEventListener('click', () => {
  $('helpModal').classList.remove('show');
  save.seenHelp = true;
  save.seenVersion = GAME_VERSION;
  persist();
});
if ((!save.seenHelp && !save.rolls) || (save.rolls && save.seenVersion !== GAME_VERSION)) $('helpModal').classList.add('show');
$('gameVersion').textContent = 'v' + GAME_VERSION;

// Auto roll is hidden until you have rolled AUTO_ROLL_AFTER times by hand, then a pop-up shows it off.
// Saves that were already past that just get it, without the pop-up.
function checkAutoRollUnlock(quiet = false) {
  if (save.rolls < AUTO_ROLL_AFTER) return;
  $('autoRollLabel').hidden = false;
  if (save.autoRollUnlocked) return;
  save.autoRollUnlocked = true;
  persist();
  if (!quiet) $('unlockModal').classList.add('show'), sfx.chime();
}
checkAutoRollUnlock(true);

// Opening the game from your own computer with ?cutscene=infinity (or infinity:golden) plays that cutscene
// once you click the page, for testing. It gives you nothing.
const TEST_CUTSCENE = location.protocol === 'file:' ? new URLSearchParams(location.search).get('cutscene') : null;
if (TEST_CUTSCENE && FOOD[TEST_CUTSCENE.split(':')[0]]) {
  toast(`Click anywhere to play the ${TEST_CUTSCENE} cutscene`, '#7dff9a');
  document.addEventListener('click', () => {
    const { food, mut } = parseKey(TEST_CUTSCENE);
    queueCutscene(SCENES[food.id] || (mut && SCENES['mut:' + mut.id]) || genericScene(TEST_CUTSCENE), TEST_CUTSCENE);
  }, { once: true });
}
$('unlockTry').addEventListener('click', () => {
  el.autoRoll.checked = true;
  $('unlockModal').classList.remove('show');
});
$('unlockClose').addEventListener('click', () => $('unlockModal').classList.remove('show'));

// Eat tip: once, for players who have rolled a while without eating (luck only comes from eating)
function checkEatTip() {
  if (save.eatTip || save.totalEaten || save.rolls < EAT_TIP_AFTER || cutscenePlaying) return;
  save.eatTip = true;
  persist();
  $('eatTipModal').classList.add('show');
  sfx.chime();
}
$('eatTipTry').addEventListener('click', () => {
  el.autoEat.value = 'rare';
  el.autoEat.dispatchEvent(new Event('change'));
  $('eatTipModal').classList.remove('show');
});
$('eatTipClose').addEventListener('click', () => $('eatTipModal').classList.remove('show'));

// Backup tip: once, after half an hour of play, unless they already exported
$('backupGo').addEventListener('click', () => {
  $('backupModal').classList.remove('show');
  $('settingsModal').classList.add('show');
  $('saveCode').scrollIntoView({ block: 'center' });
});
$('backupLater').addEventListener('click', () => $('backupModal').classList.remove('show'));
function checkBackupTip() {
  if (save.backupTip || save.playTime < BACKUP_TIP_AFTER || cutscenePlaying) return;
  save.backupTip = true;
  persist();
  $('backupModal').classList.add('show');
}

// Settings: open to everyone from the start
// ---------- Stats page ----------
function playTimeText(s) {
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  return h ? `${fmt(h)}h ${m}m` : `${m}m`;
}

function renderStatsPage() {
  const biggest = Object.entries(save.biggest).sort((a, b) => b[1] - a[1])[0];
  const sections = [
    ['🎲 Playing', [
      ['Time played', playTimeText(save.playTime || 0)],
      ['Rolls', fmt(save.rolls)],
      ['Food eaten', fmt(save.totalEaten)],
      ['Meals cooked', fmt(totalCooked())],
      ['Pot Mush made', fmt(save.mushMade)],
      ['Daily challenges done', fmt(save.dailiesDone || 0)],
      ['Daily streak', `${fmt(save.dailyStreak || 0)} days`],
    ]],
    ['🔍 Finds', [
      ['Best find', save.best ? `${emojiHtml(save.best)} ${nameOf(save.best)}<div class="best-odds">${oddsText(save.best)}</div>` : '-'],
      ['Foods found', `${NORMAL_FOODS.filter(f => save.found[f.id]).length} / ${NORMAL_FOODS.length}`],
      ['Mutations found', `${REGULAR_MUTS.filter(m => save.mutCount[m.id]).length} / ${REGULAR_MUTS.length}`],
      ['Double mutations rolled', fmt(save.doubles || 0)],
      ['Secrets found', `${SECRETS.filter(f => save.found[f.id]).length} / ${SECRETS.length}`],
      ['Biggest food', biggest ? `${emojiHtml(biggest[0])} ${FOOD[biggest[0]].name} ${biggest[1].toFixed(2)}x` : '-'],
      ['Smallest size', save.smallest < 1 ? `${save.smallest.toFixed(2)}x` : '-'],
    ]],
    ['🪙 Coins', [
      ['Coins now', fmt(save.coins)],
      ['Coins from selling', fmt(save.coinsEarned)],
      ['Food sold', fmt(save.itemsSold)],
      ['Recipe scraps bought', fmt(save.scrapsBought)],
      ['Mystery Boxes opened', fmt(save.boxesOpened)],
    ]],
  ];
  // Rolls per tier as bars. Only counted since this page was added, so older saves start at 0.
  const tiers = TIER_ORDER.filter(t => !['secret', 'meal'].includes(t));
  const most = Math.max(1, ...tiers.map(t => save.tierRolls[t] || 0));
  const bars = tiers.map(t => {
    const n = save.tierRolls[t] || 0;
    return `<div class="tier-bar" style="--c:${TIERS[t].color}">
      <span class="tb-name">${TIERS[t].label}</span>
      <span class="tb-track"><span class="tb-fill" style="width:${n ? Math.max(1, n / most * 100) : 0}%"></span></span>
      <span class="tb-count">${fmt(n)}</span>
    </div>`;
  }).join('');
  $('statsPage').innerHTML = sections.map(([title, rows]) =>
    `<h3 class="r-head">${title}</h3><dl class="stats">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`).join('') +
    `<h3 class="r-head">📊 Rolls by tier</h3>${bars}<p class="setting-note">Counted since v1.1, so rolls from before then aren't in the bars.</p>`;
}
$('statsBtn').addEventListener('click', () => { renderStatsPage(); $('statsModal').classList.add('show'); });
$('statsClose').addEventListener('click', () => $('statsModal').classList.remove('show'));

$('settingsBtn').addEventListener('click', () => $('settingsModal').classList.add('show'));
$('settingsClose').addEventListener('click', () => $('settingsModal').classList.remove('show'));
$('cutsceneOdds').value = String(save.settings.cutsceneOdds);
// Save backup: the save as base64 text with a prefix, so a wrong paste can be spotted
const SAVE_CODE_PREFIX = 'FRNG1:';
$('exportSave').addEventListener('click', () => {
  persist();
  $('saveCode').value = SAVE_CODE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(save))));
  $('saveCode').select();
  save.backupTip = true; // they know about backups, no need for the tip
  toast('Backup code ready. Copy it somewhere safe.', '#7dff9a');
});
$('copySave').addEventListener('click', async () => {
  if (!$('saveCode').value) $('exportSave').click();
  try {
    await navigator.clipboard.writeText($('saveCode').value);
  } catch (e) {
    $('saveCode').select();
    document.execCommand('copy'); // older fallback when the clipboard API is blocked
  }
  toast('Copied', '#7dff9a');
});
$('importSave').addEventListener('click', () => {
  const text = $('saveCode').value.trim();
  let data = null;
  try {
    if (text.startsWith(SAVE_CODE_PREFIX)) data = JSON.parse(decodeURIComponent(escape(atob(text.slice(SAVE_CODE_PREFIX.length)))));
  } catch (e) { /* bad code */ }
  if (!data || typeof data !== 'object' || !data.inv) return toast("That doesn't look like a One in a Melon backup code.", '#ff8080');
  if (!confirm('Load this backup? Your current progress will be replaced.')) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { return toast('Could not save. Storage is blocked.', '#ff8080'); }
  resetting = true; // stops the save-on-close from writing the current progress back over the backup
  location.reload();
});

$('cutsceneOdds').addEventListener('change', e => {
  save.settings.cutsceneOdds = Number(e.target.value);
  toast(save.settings.cutsceneOdds ? `Cutscenes for 1 in ${fmt(save.settings.cutsceneOdds)} or rarer` : 'Roll cutscenes off', '#7dff9a');
  persist();
});
$('codeForm').addEventListener('submit', e => {
  e.preventDefault();
  const code = el.codeInput.value.replace(/\s+/g, '').toUpperCase(); // "one in a melon" works too
  const c = CODES[code];
  el.codeInput.value = '';
  if (!c || (c.only && !c.only())) return toast("That code doesn't exist... yet.", '#ff8080');
  if (save.codes.includes(code)) return toast('You already used that code.', '#ff8080');
  save.codes.push(code);
  if (c.give) for (const [key, n] of Object.entries(c.give)) give(key, n);
  toast(c.text, '#7dff9a');
  el.codeModal.classList.remove('show');
  if (c.secret) unlockSecret(c.secret);
  if (c.then) c.then();
  persist();
  renderAll();
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Start over? This wipes all food, the index, mutations, secrets, buffs and luck.')) return;
  resetting = true; // stops the save-on-close from writing the old progress back
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage blocked */ }
  location.reload();
});

// ---------- Main tick: buff timers, auto roll, auto eat ----------
let lastTick = performance.now();
let autoEatTimer = 0;
setInterval(() => {
  const now = performance.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  if (save.buffs.length) {
    for (const b of save.buffs) b.left -= dt;
    if (save.buffs.some(b => b.left <= 0)) {
      save.buffs = save.buffs.filter(b => b.left > 0);
      persist();
      renderInventory();
    }
    renderBuffs();
    renderStats();
  }

  if ((autoEatTimer += dt) >= 1) {
    save.playTime = (save.playTime || 0) + autoEatTimer;
    checkBackupTip();
    autoEatTimer = 0;
    autoEat();
  }

  if (el.autoRoll.checked && save.autoRollUnlocked && !rolling && !cutscenePlaying && now >= nextAutoRoll) roll(true);

  if (Date.now() - lastInput > IDLE_SECRET_MS && !cutscenePlaying) unlockSecret('goldenspoon');
}, 100);

// ---------- Event decorations ----------
for (const [id, e] of Object.entries(EVENTS)) {
  if (!eventOn(id)) continue;
  document.body.classList.add('ev-' + id);
  $('eventBanner').hidden = false;
  $('eventBanner').textContent = `${e.icon} ${e.banner}`;
}
// A few bats drift across the page during Halloween
if (eventOn('halloween')) {
  for (let i = 0; i < 5; i++) {
    const bat = document.createElement('span');
    bat.className = 'bat';
    bat.textContent = '🦇';
    bat.style.cssText = `top:${5 + Math.random() * 70}%;animation-duration:${16 + Math.random() * 12}s;animation-delay:${-Math.random() * 28}s`;
    document.body.appendChild(bat);
  }
}

// Save buff timers now and then, and when the page closes
setInterval(persist, 5000);
addEventListener('beforeunload', persist);

renderAll();
