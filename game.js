// === Vampire Crawlers Proto v4 — VC Wiki Accurate ===
// Cards, enemies, evolution recipes sourced from vampire.survivors.wiki/w/Crawlers:*
// Adapted to 1v1 turn-based model (single enemy per encounter, scaled HP/dmg).

const GRID_W = 14;
const GRID_H = 11;
const CELL = 56;
const WILD_TAG_CHANCE = 0.15;
const PENTAGRAM_EXECUTE_THRESHOLD = 0.33;
const BASE_MAX_MANA = 6;     // mana per turn (refilled at turn start)
const BASE_HAND_SIZE = 5;
const BASE_HP = 30;

// ========================================================================
// CARDS — VC weapons + accessories (33 cards)
// VC numbers scaled down ~×0.1 to fit our HP scale
// ========================================================================
const CARDS = {
  // ── Mana 0 ── chain starters & basic accessories
  bone:         { name: 'Bone',         mana: 0, type: 'attack', dmg: 2,                       desc: '2 ダメ',                       icon: '🦴' },
  knife:        { name: 'Knife',        mana: 0, type: 'attack', dmg: 2, crit: 0.3,            desc: '2 ダメ (30%でクリ×2)',          icon: '🔪' },
  whip:         { name: 'Whip',         mana: 0, type: 'attack', dmg: 1, target: 'aoe',        desc: '1 ダメ × 全前列',                icon: '〰️' },
  magic_wand:   { name: 'Magic Wand',   mana: 0, type: 'attack', dmg: 2,                       desc: '2 ダメ',                       icon: '🪄' },
  armor:        { name: 'Armor',        mana: 0, type: 'block',  amt: 2,                       desc: 'ブロック +2',                   icon: '🦺' },
  bracer:       { name: 'Bracer',       mana: 0, type: 'draw',   amt: 1,                       desc: 'カード1枚ドロー',                icon: '🤚' },
  empty_tome:   { name: 'Empty Tome',   mana: 0, type: 'managen',amt: 1,                       desc: 'マナ +1 (このターン)',            icon: '📕' },

  // ── Mana 1 ── cheap
  garlic:       { name: 'Garlic',       mana: 1, type: 'debuff', dmg: 1, debuff: 1, target: 'aoe', desc: '1 ダメ +ATK-1 × 全前列',         icon: '🧄' },
  fire_wand:    { name: 'Fire Wand',    mana: 1, type: 'attack', dmg: 3,                       desc: '3 ダメ',                       icon: '🪄' },
  king_bible:   { name: 'King Bible',   mana: 1, type: 'attack', dmg: 3,                       desc: '3 ダメ',                       icon: '📖' },
  cherry_bomb:  { name: 'Cherry Bomb',  mana: 1, type: 'attack', dmg: 2, target: 'aoe', bonusChance: 0.3, bonusDmg: 3, desc: '2 ダメ +30%で爆発3 × 全前列', icon: '🍒' },
  runetracer:   { name: 'Runetracer',   mana: 1, type: 'attack', dmg: 1, target: 'aoe',        desc: '1 ダメ × 全前列 (跳ねる)',       icon: '🪨' },
  gatti_amari:  { name: 'Gatti Amari',  mana: 1, type: 'attack', dmg: 2, target: 'aoe', retrigChance: 0.3, desc: '2 ダメ +30%で再攻撃 × 全前列',  icon: '🐈' },
  golden_armor: { name: 'Golden Armor', mana: 1, type: 'block',  amt: 4,                       desc: 'ブロック +4',                   icon: '🥇' },
  pummarola:    { name: 'Pummarola',    mana: 1, type: 'heal',   amt: 3,                       desc: 'HP +3',                       icon: '🍅' },
  hollow_heart: { name: 'Hollow Heart', mana: 1, type: 'maxhp',  amt: 3,                       desc: '最大HP +3 (永続)',              icon: '🫀' },
  spinach:      { name: 'Spinach',      mana: 1, type: 'buff',   buffMul: 1.20,                desc: '次の攻撃 +20% ダメ',             icon: '🌱' },
  candle:       { name: 'Candle',       mana: 1, type: 'support',                              desc: '(チェーン用) 効果なし',          icon: '🕯️' },
  light_tome:   { name: 'Light Tome',   mana: 1, type: 'managen',amt: 2,                       desc: 'マナ +2',                       icon: '📘' },

  // ── Mana 2 ── mid
  cross:        { name: 'Cross',        mana: 2, type: 'attack', dmg: 5,                       desc: '5 ダメ',                       icon: '✝️' },
  axe:          { name: 'Axe',          mana: 2, type: 'attack', dmg: 3, target: 'aoe',        desc: '3 ダメ × 全前列',                icon: '🪓' },
  lightning_ring:{name: 'Lightning Ring',mana: 2, type: 'attack', dmg: 8,                      desc: '8 ダメ (単体)',                  icon: '⚡' },
  bloody_tear:  { name: 'Bloody Tear',  mana: 2, type: 'attack', dmg: 3, target: 'aoe', crit: 0.3, critHeal: 3, desc: '3 ダメ × 全前列 (クリ:×2+HP+3)', icon: '💧' },
  pummadora:    { name: 'Pummadora',    mana: 2, type: 'heal',   amt: 5,                       desc: 'HP +5',                       icon: '🍅' },
  rainbow_armor:{ name: 'Rainbow Armor',mana: 2, type: 'block',  amt: 7,                       desc: 'ブロック +7',                   icon: '🌈' },
  forever_heart:{ name: 'Forever Heart',mana: 2, type: 'maxhp',  amt: 5,                       desc: '最大HP +5 (永続)',              icon: '❤️' },
  candelabrador:{ name: 'Candelabrador',mana: 2, type: 'buff',   buffMul: 1.40,                desc: '次の攻撃 +40% ダメ',             icon: '🕯️' },
  clover:       { name: 'Clover',       mana: 2, type: 'luck',                                 desc: '次の攻撃を確定クリ (×2)',         icon: '🍀' },
  attractorb:   { name: 'Attractorb',   mana: 2, type: 'draw',   amt: 1,                       desc: 'カード1枚ドロー',                icon: '🧲' },
  duplicator:   { name: 'Duplicator',   mana: 2, type: 'duplicate', amt: 1,                    desc: '次の攻撃 +1弾 (60%ダメ)',         icon: '✌️' },
  multi_shot:   { name: 'Multi Shot',   mana: 1, type: 'duplicate', amt: 1,                    desc: '次の攻撃 +1弾 (60%ダメ)',         icon: '🔫' },
  tri_bullet:   { name: 'Tri Bullet',   mana: 3, type: 'duplicate', amt: 2,                    desc: '次の攻撃 +2弾 (60%+36%)',         icon: '☘️' },
  bullet_storm: { name: 'Bullet Storm', mana: 4, type: 'duplicate', amt: 3,                    desc: '次の攻撃 +3弾 (60+36+22%)',       icon: '🌪️' },
  spellbinder:  { name: 'Spellbinder',  mana: 2, type: 'support',                              desc: '(チェーン用) 効果なし',          icon: '🔗' },
  weighty_tome: { name: 'Weighty Tome', mana: 2, type: 'managen',amt: 3,                       desc: 'マナ +3',                       icon: '📗' },

  // ── Mana 3 ── heavy
  hellfire:     { name: 'Hellfire',     mana: 3, type: 'attack', dmg: 13,                      desc: '13 ダメ',                      icon: '🔥' },
  heaven_sword: { name: 'Heaven Sword', mana: 3, type: 'attack', dmg: 7, crit: 0.3,            desc: '7 ダメ (30%クリ×2)',            icon: '⚔️' },
  thousand_edge:{ name: 'Thousand Edge',mana: 3, type: 'attack', dmg: 11,                      desc: '11 ダメ',                      icon: '🗡️' },
  phiera:       { name: 'Phiera',       mana: 3, type: 'attack', dmg: 5,                       desc: '5 ダメ',                       icon: '🔫' },
  shadow_pinion:{ name: 'Shadow Pinion',mana: 3, type: 'attack', dmg: 3, target: 'aoe',        desc: '3 ダメ × 全前列',                icon: '🪶' },
  soul_eater:   { name: 'Soul Eater',   mana: 3, type: 'drain',  dmg: 6, heal: 3, debuff: 1,   desc: '6 ダメ +HP+3 +ATK-1 (単体)',    icon: '👻' },
  santa_water:  { name: 'Santa Water',  mana: 3, type: 'burn',   dmg: 4, target: 'aoe', burn: { dmg: 2, turns: 2 }, desc: '4 ダメ +🔥2/T×2 × 全前列',  icon: '💦' },
  death_spiral: { name: 'Death Spiral', mana: 3, type: 'attack', dmg: 11, target: 'aoe',       desc: '11 ダメ × 全前列',              icon: '🌀' },
  peachone:     { name: 'Peachone',     mana: 3, type: 'attack', dmg: 4, target: 'aoe',        desc: '4 ダメ × 全前列',                icon: '🦅' },
  clock_lancet: { name: 'Clock Lancet', mana: 3, type: 'freeze',                               desc: '敵の次ターンスキップ',           icon: '⏰' },
  hero_armor:   { name: 'Hero Armor',   mana: 3, type: 'block',  amt: 10,                      desc: 'ブロック +10',                  icon: '🛡️' },
  ancient_tome: { name: 'Ancient Tome', mana: 3, type: 'managen',amt: 4,                       desc: 'マナ +4',                       icon: '📚' },

  // ── Mana 4
  la_borra:     { name: 'La Borra',     mana: 4, type: 'burn',   dmg: 10, target: 'aoe', burn: { dmg: 3, turns: 2 }, desc: '10 ダメ +🔥3/T×2 × 全前列', icon: '🟫' },
  ebony_wings:  { name: 'Ebony Wings',  mana: 4, type: 'attack', dmg: 5, target: 'aoe',        desc: '5 ダメ × 全前列',               icon: '🦅' },
  thunder_loop: { name: 'Thunder Loop', mana: 4, type: 'attack', dmg: 10, retrigChance: 1.0,   desc: '10 ダメ +ターン終了時に再攻撃 (単体)', icon: '⚡' },
  phieraggi:    { name: 'Phieraggi',    mana: 4, type: 'attack', dmg: 22,                      desc: '22 ダメ (単体)',                icon: '💥' },
  unholy_vespers:{name:'Unholy Vespers',mana: 4, type: 'attack', dmg: 17, target: 'aoe',       desc: '17 ダメ × 全前列',              icon: '🕯️' },

  // ── Mana 5 — peak
  pentagram:    { name: 'Pentagram',    mana: 5, type: 'erase',  dmg: 18, target: 'aoe',       desc: 'HP≤33%で即死 (全体) / 通常18ダメ', icon: '⛧' },
  vandalier:    { name: 'Vandalier',    mana: 5, type: 'attack', dmg: 34, target: 'aoe',       desc: '34 ダメ × 全体',                icon: '🦅' },
  mannajja:     { name: 'Mannajja',     mana: 5, type: 'attack', dmg: 6, target: 'aoe',        desc: '6 ダメ × 全前列',               icon: '🪒' },

  // ── EVOLVED CARDS (from VC Wiki recipes)
  bloody_tear_evo:{name:'Bloody Tear+', mana: 2, type: 'attack', dmg: 5, target: 'aoe', crit: 0.4, critHeal: 5, desc: '5 ダメ × 全前列 (40%クリ+HP+5)', icon: '💧', evolved: true },
  death_spiral_evo:{name:'Death Spiral+',mana: 2, type: 'attack', dmg: 7, target: 'aoe',       desc: '7 ダメ × 全前列 (進化)',         icon: '🌀', evolved: true },
  gorgeous_moon:{ name: 'Gorgeous Moon',mana: 5, type: 'erase',  dmg: 25, target: 'aoe',       desc: 'HP≤50%で即死 (全体) / 通常25ダメ', icon: '🌕', evolved: true },
  heaven_sword_evo:{name:'Heaven Sword+',mana: 3, type: 'attack', dmg: 11, crit: 0.5,          desc: '11 ダメ (50%クリ×2)',           icon: '🗡️', evolved: true },
  hellfire_evo: { name: 'Hellfire+',    mana: 3, type: 'attack', dmg: 19,                      desc: '19 ダメ',                      icon: '🔥', evolved: true },
  holy_wand:    { name: 'Holy Wand',    mana: 2, type: 'attack', dmg: 11,                      desc: '11 ダメ',                      icon: '🪄', evolved: true },
  la_borra_evo: { name: 'La Borra+',    mana: 4, type: 'burn',   dmg: 15, target: 'aoe', burn: { dmg: 4, turns: 3 }, desc: '15 ダメ +🔥4/T×3 × 全体', icon: '🟫', evolved: true },
  mannajja_evo: { name: 'Mannajja+',    mana: 5, type: 'attack', dmg: 8, target: 'aoe',        desc: '8 ダメ × 全体',                 icon: '🪒', evolved: true },
  no_future:    { name: 'NO FUTURE',    mana: 3, type: 'attack', dmg: 3, target: 'aoe',        desc: '3 ダメ × 全前列 (跳ねる)',       icon: '💢', evolved: true },
  phieraggi_evo:{ name: 'Phieraggi+',   mana: 4, type: 'attack', dmg: 32, target: 'aoe',       desc: '32 ダメ × 全体',                icon: '💥', evolved: true },
  soul_eater_evo:{name:'Soul Eater+',   mana: 3, type: 'drain',  dmg: 10, heal: 5, debuff: 2,  desc: '10 ダメ +HP+5 +ATK-2',          icon: '👻', evolved: true },
  thousand_edge_evo:{name:'Thousand Edge+',mana: 3, type: 'attack', dmg: 17,                   desc: '17 ダメ',                      icon: '🗡️', evolved: true },
  thunder_loop_evo:{name:'Thunder Loop+',mana: 4, type: 'attack', dmg: 15, retrigChance: 1.0,  desc: '15 ダメ +ターン終了時に再攻撃',  icon: '⚡', evolved: true },
  unholy_vespers_evo:{name:'Unholy Vespers+',mana: 4, type: 'attack', dmg: 24,                 desc: '24 ダメ',                      icon: '🕯️', evolved: true },
  valkyrie_turner:{name:'Valkyrie Turner',mana: 3, type: 'attack', dmg: 4, target: 'aoe',     desc: '4 ダメ × 全前列',                icon: '⚜️', evolved: true },
  vandalier_evo:{ name: 'Vandalier+',   mana: 5, type: 'attack', dmg: 55, target: 'aoe',       desc: '55 ダメ × 全体',                icon: '🦅', evolved: true },
  vicious_hunger:{name:'Vicious Hunger',mana: 2, type: 'attack', dmg: 7, bonusXp: 5,           desc: '7 ダメ +5 XP',                  icon: '🦷', evolved: true },

  // ── Wild Cards (multiple types, all act as wild for combo)
  wild:         { name: 'Wild',         mana: 0, type: 'wild',                                 desc: '🌀 効果なし (純Wild)',           icon: '🌀' },
  little_heart: { name: 'Little Heart', mana: 0, type: 'wild',   wildEffect: 'heal',  amt: 2,  desc: '🌀 HP +2',                     icon: '💗' },
  vacuum:       { name: 'Vacuum',       mana: 0, type: 'wild',   wildEffect: 'draw',  amt: 1,  desc: '🌀 カード1枚ドロー',            icon: '🧹' },
  raw_mana:     { name: 'Raw Mana',     mana: 0, type: 'wild',   wildEffect: 'comboBoost', mul: 2.0, desc: '🌀 倍率×2.0',              icon: '🔮' },
  rosary:       { name: 'Rosary',       mana: 0, type: 'wild',   wildEffect: 'damage', dmg: 8, target: 'aoe', desc: '🌀 8 ダメ × 全前列',     icon: '📿' },
  orologion:    { name: 'Orologion',    mana: 0, type: 'wild',   wildEffect: 'freeze',         desc: '🌀 敵の次ターンスキップ',       icon: '⌛' },
  little_clover:{ name: 'Little Clover',mana: 0, type: 'wild',   wildEffect: 'luck',           desc: '🌀 次の攻撃を確定クリ',          icon: '🍀' },
};

// ── Decks
const STARTING_DECK = ['bone','bone','whip','knife','garlic','fire_wand','golden_armor','pummarola','cross','lightning_ring'];

// what shows up in levelup picks (base cards + evolution secondaries + wilds)
const POOL_FOR_LEVELUP = [
  // Base cards
  'knife','whip','magic_wand','armor','bracer',
  'garlic','fire_wand','king_bible','cherry_bomb','runetracer','gatti_amari','golden_armor','pummarola','multi_shot',
  'cross','axe','lightning_ring','bloody_tear','pummadora','rainbow_armor','tri_bullet',
  'bullet_storm',
  'hellfire','heaven_sword','thousand_edge','phiera','shadow_pinion','soul_eater','santa_water','death_spiral','peachone','clock_lancet','hero_armor',
  'la_borra','ebony_wings','thunder_loop','phieraggi','unholy_vespers',
  'pentagram','vandalier','mannajja',
  // Evolution secondaries (give passive effects + enable evolution)
  'hollow_heart','spinach','candle','forever_heart','candelabrador','clover','attractorb','duplicator','spellbinder',
  // Wilds (extra weight)
  'wild','little_heart','vacuum','raw_mana','rosary','orologion','little_clover',
];

// ========================================================================
// EVOLUTIONS (from VC Wiki) — primary + secondary + 💎 gem → evolved card
// secondary can be ANY of the listed alternatives
// ========================================================================
const EVOLUTIONS = [
  { primary: 'whip',           secondaries: ['hollow_heart','forever_heart'],                       result: 'bloody_tear_evo' },
  { primary: 'axe',            secondaries: ['candle','candelabrador'],                              result: 'death_spiral_evo' },
  { primary: 'pentagram',      secondaries: ['forever_heart','hollow_heart'],                        result: 'gorgeous_moon' },
  { primary: 'cross',          secondaries: ['clover'],                                              result: 'heaven_sword_evo' },
  { primary: 'fire_wand',      secondaries: ['spinach'],                                             result: 'hellfire_evo' },
  { primary: 'magic_wand',     secondaries: ['candle','candelabrador'],                              result: 'holy_wand' },
  { primary: 'santa_water',    secondaries: ['attractorb'],                                          result: 'la_borra_evo' },
  { primary: 'mannajja',       secondaries: ['spellbinder'],                                         result: 'mannajja_evo' },
  { primary: 'runetracer',     secondaries: ['armor','golden_armor','rainbow_armor','hero_armor'],   result: 'no_future' },
  { primary: 'phieraggi',      secondaries: ['attractorb'],                                          result: 'phieraggi_evo' },
  { primary: 'garlic',         secondaries: ['pummarola','pummadora'],                               result: 'soul_eater_evo' },
  { primary: 'knife',          secondaries: ['bracer'],                                              result: 'thousand_edge_evo' },
  { primary: 'lightning_ring', secondaries: ['duplicator'],                                          result: 'thunder_loop_evo' },
  { primary: 'king_bible',     secondaries: ['spellbinder'],                                         result: 'unholy_vespers_evo' },
  { primary: 'shadow_pinion',  secondaries: ['spellbinder'],                                         result: 'valkyrie_turner' },
  { primary: 'vandalier',      secondaries: ['hollow_heart','forever_heart'],                        result: 'vandalier_evo' },
  { primary: 'gatti_amari',    secondaries: ['attractorb','bracer'],                                 result: 'vicious_hunger' },
];

// ========================================================================
// TRAITS — pick 2 before game start (replaces fixed characters)
// ========================================================================
const TRAITS = {
  iron_skin:    { name: 'Iron Skin',    icon: '🛡️', desc: 'ブロックが完全リセットせず半減', passive: 'blockPersist' },
  combo_master: { name: 'Combo Master', icon: '🗡️', desc: 'コンボ倍率 ×1.5 → ×1.75',  passive: 'comboBoost' },
  pyromancer:   { name: 'Pyromancer',   icon: '🔥', desc: 'Burn ダメージ +2/T',         passive: 'burnBoost' },
  lifesteal:    { name: 'Lifesteal',    icon: '🧛', desc: '撃破時 HP +4',                passive: 'lifeleech' },
  tough:        { name: 'Tough',        icon: '❤️', desc: '最大HP +15',                  passive: 'tough' },
  mana_pool:    { name: 'Mana Pool',    icon: '🔮', desc: 'ターン毎マナ +2 (6→8)',        passive: 'manaPool' },
  lucky:        { name: 'Lucky',        icon: '🍀', desc: '開始時 💎ジェム +2',           passive: 'lucky' },
  sage:         { name: 'Sage',         icon: '✨', desc: '手札サイズ +1 (5→6)',          passive: 'sage' },
};

const STARTING_TRAIT_COUNT = 2;
const STARTING_DECK_PLAYER = ['bone','bone','whip','knife','garlic','fire_wand','golden_armor','pummarola','cross','lightning_ring'];

// ========================================================================
// ENEMIES — VC Wiki dungeons (Mad Forest → ... → Cappella Magna)
// ========================================================================
const ENEMIES = {
  // ── Tier 1 (Mad Forest, F1-4)
  bat:         { sprite: '🦇', hp: 5,  dmg: 2, xp: 3,  name: 'Bat',          tier: 1 },
  skeleton:    { sprite: '💀', hp: 8,  dmg: 2, xp: 4,  name: 'Skeleton',     tier: 1 },
  zombie:      { sprite: '🧟', hp: 10, dmg: 2, xp: 4,  name: 'Zombie',       tier: 1 },
  plant:       { sprite: '🌿', hp: 7,  dmg: 2, xp: 4,  name: 'Plant',        tier: 1 },
  mummy:       { sprite: '🧻', hp: 13, dmg: 3, xp: 6,  name: 'Mummy',        tier: 1 },

  // ── Tier 2 (Inlaid Library, F5-9)
  ghost:       { sprite: '👻', hp: 9,  dmg: 3, xp: 6,  name: 'Ghost',        tier: 2 },
  red_bat:     { sprite: '🦇', hp: 14, dmg: 4, xp: 8,  name: 'Red Bat',      tier: 2 },
  hag:         { sprite: '🧙', hp: 11, dmg: 3, xp: 7,  name: 'Hag',          tier: 2, healPerTurn: 2 },
  pumpkin:     { sprite: '🎃', hp: 16, dmg: 4, xp: 9,  name: 'Pumpkin',      tier: 2 },
  mimic:       { sprite: '👹', hp: 18, dmg: 6, xp: 14, name: 'Mimic!',       tier: 2, disguise: '🎁' },

  // ── Tier 3 (Teeny Bridge, F10-14)
  swordian:    { sprite: '⚔️', hp: 14, dmg: 5, xp: 11, name: 'Swordian',    tier: 3 },
  spider:      { sprite: '🕷️', hp: 11, dmg: 4, xp: 8,  name: 'Spider',     tier: 3 },
  mantis:      { sprite: '🦗', hp: 12, dmg: 5, xp: 10, name: 'Mantis',       tier: 3 },
  wraith:      { sprite: '🌀', hp: 9,  dmg: 3, xp: 11, name: 'Wraith',       tier: 3, curseOnHit: true },
  slime:       { sprite: '🟢', hp: 9,  dmg: 3, xp: 7,  name: 'Slime',        tier: 3, splitInto: 'mini_slime' },
  mini_slime:  { sprite: '🟩', hp: 4,  dmg: 1, xp: 1,  name: 'Mini Slime',   tier: 0 },

  // ── Tier 4 (Dairy Plant, F15-19)
  gallotrice:  { sprite: '🐔', hp: 18, dmg: 6, xp: 13, name: 'Gallotrice',   tier: 4 },
  flower:      { sprite: '🌺', hp: 13, dmg: 4, xp: 12, name: 'Demon Flower', tier: 4, healPerTurn: 2 },
  ent:         { sprite: '🌳', hp: 22, dmg: 5, xp: 15, name: 'Ent',          tier: 4 },
  dragon_shrimp:{sprite:'🦐', hp: 17, dmg: 7, xp: 14, name: 'Dragon Shrimp',tier: 4 },

  // ── Tier 5 (Gallo Tower & Cappella Magna, F20+)
  gallo:       { sprite: '🐓', hp: 25, dmg: 7, xp: 18, name: 'Gallo',        tier: 5, berserk: true },
  trinacria:   { sprite: '☀️', hp: 30, dmg: 8, xp: 22, name: 'Trinacria',   tier: 5, reflectPct: 0.3 },
  moon_atl:    { sprite: '🌙', hp: 28, dmg: 6, xp: 24, name: 'Moon Atlantean',tier: 5, healPerTurn: 3 },
  beholder:    { sprite: '👁️', hp: 16, dmg: 4, xp: 20, name: 'Beholder',  tier: 5, curseOnHit: true, healPerTurn: 1 },
  mirror:      { sprite: '🪞', hp: 9,  dmg: 1, xp: 18, name: 'Mirror',      tier: 5, reflectPct: 0.55 },

  // ── BOSSES (every 5 floors, cycle)
  boss_giantmummy:  { sprite: '🧻', hp: 50,  dmg: 5,  xp: 35,  name: 'Giant Mummy',     tier: 99, boss: true },
  boss_hag_elite:   { sprite: '🧙', hp: 75,  dmg: 6,  xp: 60,  name: 'Hag Elite',       tier: 99, boss: true, healPerTurn: 3, reviveOnce: true },
  boss_swordflint:  { sprite: '🗡️', hp: 110, dmg: 9,  xp: 90,  name: 'SwordFlint',    tier: 99, boss: true, berserk: true },
  boss_gallo_elite: { sprite: '🐓', hp: 150, dmg: 10, xp: 130, name: 'Gallo Elite',     tier: 99, boss: true, reviveOnce: true, curseOnHit: true },
  boss_trinacria:   { sprite: '☀️', hp: 200, dmg: 11, xp: 180, name: 'Trinacria Elite',tier: 99, boss: true, reflectPct: 0.4, healPerTurn: 3 },
  boss_ender:       { sprite: '⬛', hp: 280, dmg: 13, xp: 250, name: 'Ender Elite',     tier: 99, boss: true, reviveOnce: true, berserk: true },
  boss_red_death:   { sprite: '☠️', hp: 550, dmg: 22, xp: 600, name: 'Red Death',      tier: 99, boss: true, reflectPct: 0.4, reviveOnce: true, healPerTurn: 5, berserk: true },
  boss_void_emperor:{ sprite: '👁️', hp: 800, dmg: 28, xp: 1000, name: 'Void Emperor',  tier: 99, boss: true, reflectPct: 0.5, reviveOnce: true, healPerTurn: 6, curseOnHit: true, berserk: true },
  // Death Reaper — appears past stage 8 as a hard wall (1500 HP, all abilities)
  boss_death_reaper:{ sprite: '💀', hp: 1500, dmg: 60, xp: 0, name: '💀 死神 / Grim Reaper', tier: 99, boss: true, reflectPct: 0.6, reviveOnce: true, healPerTurn: 12, curseOnHit: true, berserk: true },
};

// ========================================================================
// STAGES — 8 stages, each has theme/textures/enemy pool/boss
// ========================================================================
const STAGES = {
  1: { name: '森の入口',       wallTex: 'wall_grass', floorTex: 'floor_moss',
       enemies: ['bat','skeleton','rat','plant'],
       boss: 'boss_megabat',     tint: '#88ff88' },
  2: { name: '苔生す古城',     wallTex: 'wall_moss',  floorTex: 'floor_dirt',
       enemies: ['ghost','red_bat','hag','pumpkin','mimic','skeleton'],
       boss: 'boss_necro',       tint: '#aaeeaa' },
  3: { name: '石橋の砦',       wallTex: 'wall_stone', floorTex: 'floor',
       enemies: ['swordian','spider','mantis','wraith','slime'],
       boss: 'boss_dragon',      tint: '#ddccaa' },
  4: { name: '木造廃墟',       wallTex: 'wall_wood',  floorTex: 'floor_wood',
       enemies: ['gallotrice','flower','ent','dragon_shrimp','spider'],
       boss: 'boss_archlich',    tint: '#cc8855' },
  5: { name: '血肉の洞穴',     wallTex: 'wall_flesh', floorTex: 'floor_flesh',
       enemies: ['gallo','vampire_e','beholder','mirror','demon','lich'],
       boss: 'boss_trinacria',   tint: '#ff5566' },
  6: { name: '鋼鉄の塔',       wallTex: 'wall_iron',  floorTex: 'floor_metal',
       enemies: ['demon','hellhound','wraith','spider','beholder'],
       boss: 'boss_void',        tint: '#aaaacc' },
  7: { name: '機械都市',       wallTex: 'wall_metal', floorTex: 'floor_metal',
       enemies: ['demon','hellhound','beholder','lich','berserker','vampire_e'],
       boss: 'boss_ender',       tint: '#88ccff' },
  8: { name: '虚無の領域',     wallTex: 'wall_stone', floorTex: 'floor_dirt',
       enemies: ['mirror','trinacria','moon_atl','beholder','lich','demon','hellhound'],
       boss: 'boss_void_emperor',tint: '#bb88ff' },
};
const MAX_STAGE = 8;
// "Difficulty" is the central scaling number, 1-based.
// Stage 1-8 = difficulty 1-8 (cycle 0)
// Stage 1-8 (cycle 1) = difficulty 9-16
// Stage 1-8 (cycle 2) = difficulty 17-24 ... etc
function difficulty() {
  return S.stage + S.cycle * MAX_STAGE;
}
// Kept for back-compat in case anything else calls it
function effectiveFloor() {
  return difficulty();
}
function bossForStage(stage) {
  if (stage < 1 || stage > MAX_STAGE) return 'boss_death_reaper';
  return STAGES[stage].boss;
}

// ========================================================================
// STATE
// ========================================================================
const S = {
  mode: 'title',
  traits: [], // array of trait keys, e.g. ['iron_skin','mana_pool']
  player: { x: 1, y: 1, dir: 1, hp: BASE_HP, hpMax: BASE_HP, xp: 0, level: 1 },
  deck: [],
  discard: [],
  dungeon: [],
  enemies: [],
  chests: [],
  shovel: null,
  hasShovel: false,
  floor: 1,
  stage: 1,
  stageFloor: 1,
  cycle: 0, // +N difficulty loop (stage 8 cleared = cycle++)
  maxStageUnlocked: 1,
  maxCycleReached: 0,
  gems: 0,
  battle: null,
  inputLocked: false,
  pendingEvolution: null,
  // Test mode overrides
  testMode: false,
  testEnemyHpMul: 1.0,
  testEnemyDmgMul: 1.0,
  testManaOverride: null,
  testCardMul: 1.0,
  testHandSize: null,
  testStartBlock: 0,
  testEnemyPool: [],
  testBossPool: [],
  testRowsOverride: null,
};
let nextEnemyId = 1;

function hasPassive(name) {
  return S.traits.some(t => TRAITS[t] && TRAITS[t].passive === name);
}
function getMaxMana() {
  if (S.testMode && S.testManaOverride) return S.testManaOverride;
  return BASE_MAX_MANA + (hasPassive('manaPool') ? 2 : 0);
}
function getHandSize() {
  if (S.testMode && S.testHandSize) return S.testHandSize;
  return BASE_HAND_SIZE + (hasPassive('sage') ? 1 : 0);
}
function getCardDmgMul() {
  return S.testMode ? S.testCardMul : 1.0;
}

// ========================================================================
// ASSET LOADING — probe assets/ folder, use real image when present,
// else fall back to emoji text. No hard failure on missing files.
// ========================================================================
const ASSETS = {}; // key -> url string if loaded, undefined if not
function probeOne(url) {
  return new Promise(resolve => {
    const img = new Image();
    let done = false;
    img.onload = () => { if (!done) { done = true; resolve(true); } };
    img.onerror = () => { if (!done) { done = true; resolve(false); } };
    img.src = url;
    setTimeout(() => { if (!done) { done = true; resolve(false); } }, 1500);
  });
}
// Tries .png first (user-generated illustrations preferred), then .svg
async function probeAsset(key, baseName) {
  for (const ext of ['png', 'svg']) {
    const url = `assets/${baseName}.${ext}`;
    if (await probeOne(url)) { ASSETS[key] = url; return; }
  }
}
// Image cache for canvas-based rendering (3D view billboards)
const SPRITE_IMAGES = {};
function loadSpriteImage(key, url) {
  return new Promise(resolve => {
    if (!url) { resolve(); return; }
    const img = new Image();
    img.onload = () => { SPRITE_IMAGES[key] = img; resolve(); };
    img.onerror = () => resolve();
    img.src = url;
  });
}
async function loadSpriteImages() {
  const tasks = [];
  for (const key of Object.keys(ASSETS)) {
    tasks.push(loadSpriteImage(key, ASSETS[key]));
  }
  await Promise.all(tasks);
}

async function loadAssets() {
  const tasks = [];
  // Probe FX video assets (transparent .webm)
  ['slash','lightning','fire','shockwave','beam','wind','spiral','fog'].forEach(fxName => {
    tasks.push(probeVideoFx(fxName));
  });
  tasks.push(probeAsset('player', 'player'));
  tasks.push(probeAsset('shovel', 'shovel'));
  tasks.push(probeAsset('chest', 'chest'));
  tasks.push(probeAsset('floor', 'floor'));
  tasks.push(probeAsset('wall', 'wall'));
  // Theme variants
  ['wall_wood','wall_stone','wall_iron','wall_grass','wall_moss','wall_metal','wall_scifi','wall_flesh','wall_lava',
   'floor_dirt','floor_wood','floor_grass','floor_moss','floor_metal','floor_scifi','floor_flesh'].forEach(k => {
    tasks.push(probeAsset(k, k));
  });
  tasks.push(probeAsset('bg_dungeon', 'bg_dungeon'));
  tasks.push(probeAsset('bg_battle', 'bg_battle'));
  tasks.push(probeAsset('logo', 'logo'));
  for (const key of Object.keys(ENEMIES)) {
    tasks.push(probeAsset(`enemy_${key}`, `enemy_${key}`));
  }
  for (const key of Object.keys(CARDS)) {
    tasks.push(probeAsset(`card_${key}`, `card_${key}`));
  }
  await Promise.all(tasks);
  applyTextureClasses();
}
function applyTextureClasses() {
  const b = document.body;
  if (ASSETS.floor) b.classList.add('has-floor-tex');
  if (ASSETS.wall) b.classList.add('has-wall-tex');
  if (ASSETS.bg_dungeon) b.classList.add('has-bg-dungeon');
  if (ASSETS.bg_battle) b.classList.add('has-bg-battle');
  if (ASSETS.logo) b.classList.add('has-logo');
}
// Returns HTML string: <img> if asset exists, otherwise emoji text.
function spriteHtml(key, fallback) {
  const url = ASSETS[key];
  if (url) return `<img src="${url}" class="sprite-img" alt="" draggable="false">`;
  return fallback;
}

// ========================================================================
// AUDIO (Web Audio synth)
// ========================================================================
let audioCtx = null;
function getAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, dur, type = 'square', vol = 0.08, when = 0) {
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t); osc.stop(t + dur);
}
function sweep(fStart, fEnd, dur, type = 'sawtooth', vol = 0.08) {
  const ctx = getAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator(); const g = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(fStart, t);
  osc.frequency.exponentialRampToValueAtTime(fEnd, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t); osc.stop(t + dur);
}
function sfx(name) {
  switch (name) {
    case 'step':
      tone(180, 0.04, 'square', 0.03);
      break;
    case 'bump':
      tone(90, 0.1, 'sawtooth', 0.08);
      tone(60, 0.12, 'sine', 0.06);
      break;
    case 'attack':
      tone(440, 0.07, 'triangle', 0.1);
      tone(660, 0.06, 'triangle', 0.08, 0.04);
      tone(220, 0.12, 'sawtooth', 0.05);
      break;
    case 'crit':
      // dramatic: sub thump + bright sparkle + ring
      tone(110, 0.3, 'sawtooth', 0.18);
      tone(880, 0.05, 'square', 0.14);
      tone(1320, 0.08, 'square', 0.12, 0.03);
      tone(1760, 0.15, 'triangle', 0.1, 0.08);
      tone(2640, 0.25, 'sine', 0.08, 0.15);
      sweep(1320, 220, 0.4, 'triangle', 0.07, 0.05);
      break;
    case 'hit':
      tone(120, 0.15, 'sawtooth', 0.13);
      tone(80, 0.2, 'sine', 0.1);
      break;
    case 'heal':
      tone(523, 0.1, 'sine', 0.1);
      tone(784, 0.18, 'sine', 0.08, 0.05);
      tone(1046, 0.2, 'triangle', 0.06, 0.1);
      break;
    case 'block':
      tone(220, 0.08, 'square', 0.08);
      tone(330, 0.06, 'square', 0.05, 0.05);
      tone(110, 0.12, 'sine', 0.06);
      break;
    case 'combo':
      tone(660, 0.05, 'square', 0.12);
      tone(880, 0.07, 'square', 0.12, 0.05);
      tone(1100, 0.1, 'square', 0.1, 0.1);
      tone(1320, 0.13, 'triangle', 0.08, 0.15);
      break;
    case 'wild':
      sweep(400, 1200, 0.3, 'triangle', 0.1);
      tone(880, 0.2, 'sine', 0.06, 0.1);
      tone(1760, 0.25, 'sine', 0.05, 0.15);
      break;
    case 'freeze':
      tone(1760, 0.04, 'sine', 0.1);
      tone(1320, 0.06, 'sine', 0.08, 0.04);
      tone(880, 0.1, 'sine', 0.07, 0.08);
      tone(660, 0.18, 'sine', 0.06, 0.12);
      break;
    case 'levelup':
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, 'square', 0.11, i * 0.08));
      tone(110, 0.6, 'sine', 0.1);
      break;
    case 'die':
      sweep(440, 50, 0.9, 'sawtooth', 0.18);
      tone(60, 0.8, 'sine', 0.1, 0.2);
      break;
    case 'battle':
      tone(330, 0.06, 'square', 0.1);
      tone(220, 0.1, 'sawtooth', 0.1, 0.06);
      tone(165, 0.15, 'sine', 0.08, 0.1);
      break;
    case 'boss':
      tone(82.5, 0.4, 'sine', 0.15);
      tone(110, 0.35, 'sawtooth', 0.15);
      tone(165, 0.25, 'sawtooth', 0.12, 0.15);
      tone(55, 0.6, 'sine', 0.12, 0.25);
      sweep(220, 55, 0.7, 'sawtooth', 0.08, 0.3);
      break;
    case 'victory':
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.15, 'triangle', 0.11, i * 0.06));
      tone(82.5, 0.5, 'sine', 0.1, 0.1);
      break;
    case 'pickup':
      tone(659, 0.06, 'sine', 0.1);
      tone(880, 0.1, 'sine', 0.1, 0.05);
      tone(1046, 0.14, 'triangle', 0.08, 0.1);
      break;
    case 'dig':
      sweep(300, 100, 0.4, 'sawtooth', 0.12);
      tone(440, 0.15, 'sine', 0.1, 0.4);
      tone(55, 0.5, 'sine', 0.1);
      break;
    case 'curse':
      sweep(300, 100, 0.25, 'sawtooth', 0.12);
      tone(110, 0.3, 'sine', 0.08);
      break;
    case 'burn':
      tone(880, 0.04, 'sawtooth', 0.06);
      tone(660, 0.06, 'sawtooth', 0.05, 0.03);
      tone(440, 0.08, 'sawtooth', 0.04, 0.06);
      break;
    case 'revive':
      tone(440, 0.15, 'sine', 0.13);
      tone(659, 0.2, 'sine', 0.1, 0.1);
      tone(880, 0.3, 'triangle', 0.1, 0.25);
      tone(1318, 0.4, 'sine', 0.08, 0.4);
      break;
    case 'split':
      tone(330, 0.08, 'square', 0.1);
      tone(440, 0.08, 'square', 0.1, 0.07);
      tone(550, 0.1, 'square', 0.09, 0.14);
      break;
    case 'reflect':
      sweep(800, 1600, 0.2, 'sine', 0.1);
      tone(1200, 0.15, 'triangle', 0.07, 0.1);
      break;
    case 'chest':
      tone(659, 0.08, 'sine', 0.1);
      tone(880, 0.12, 'sine', 0.1, 0.05);
      tone(1046, 0.16, 'sine', 0.08, 0.12);
      tone(1318, 0.2, 'triangle', 0.07, 0.2);
      break;
    case 'execute':
      sweep(1760, 110, 0.5, 'sawtooth', 0.16);
      tone(55, 0.6, 'sine', 0.18, 0.05);
      tone(82.5, 0.5, 'sawtooth', 0.13, 0.15);
      tone(220, 0.4, 'square', 0.1, 0.25);
      break;
    case 'evolve':
      [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, 'triangle', 0.13, i * 0.07));
      tone(110, 0.7, 'sine', 0.1);
      sweep(440, 1760, 0.6, 'sine', 0.06, 0.1);
      break;
    case 'gem':
      tone(1046, 0.08, 'sine', 0.1);
      tone(1318, 0.12, 'sine', 0.1, 0.05);
      tone(1568, 0.15, 'triangle', 0.1, 0.12);
      tone(2093, 0.2, 'sine', 0.07, 0.18);
      break;
    case 'draw':
      tone(523, 0.05, 'sine', 0.08);
      tone(784, 0.08, 'sine', 0.07, 0.03);
      break;
    // ─── Per-card attack sounds ───
    case 'knife':
      sweep(2200, 400, 0.1, 'square', 0.08);
      tone(140, 0.12, 'sawtooth', 0.12, 0.08);
      tone(80, 0.18, 'sine', 0.1, 0.08);
      break;
    case 'fire':
      sweep(220, 1100, 0.22, 'sawtooth', 0.1);
      tone(82.5, 0.3, 'sawtooth', 0.08);
      tone(440, 0.15, 'triangle', 0.06, 0.1);
      sweep(900, 200, 0.15, 'sawtooth', 0.06, 0.15);
      break;
    case 'zap':
      tone(2200, 0.04, 'square', 0.13);
      tone(1800, 0.03, 'sawtooth', 0.11, 0.02);
      tone(2600, 0.06, 'square', 0.1, 0.04);
      sweep(3000, 600, 0.18, 'sawtooth', 0.08, 0.05);
      break;
    case 'bell':
      tone(880, 0.4, 'sine', 0.1);
      tone(1320, 0.5, 'sine', 0.08, 0.04);
      tone(1760, 0.55, 'sine', 0.06, 0.08);
      tone(2640, 0.5, 'sine', 0.04, 0.12);
      break;
    case 'swish':
      sweep(1500, 200, 0.13, 'sawtooth', 0.1);
      tone(70, 0.1, 'sine', 0.08, 0.1);
      tone(220, 0.08, 'square', 0.05, 0.1);
      break;
    case 'boom':
      sweep(400, 50, 0.4, 'sawtooth', 0.18);
      tone(82.5, 0.5, 'sine', 0.15);
      tone(55, 0.6, 'sine', 0.13, 0.1);
      break;
    case 'drain':
      sweep(440, 110, 0.25, 'sine', 0.1);
      tone(220, 0.3, 'triangle', 0.08, 0.12);
      sweep(110, 440, 0.2, 'sine', 0.06, 0.2);
      break;
    case 'swirl':
      sweep(220, 880, 0.25, 'triangle', 0.08);
      sweep(880, 220, 0.25, 'triangle', 0.08, 0.12);
      tone(440, 0.2, 'sine', 0.05, 0.05);
      break;
    case 'whoosh':
      sweep(900, 150, 0.22, 'sawtooth', 0.08);
      tone(110, 0.18, 'sine', 0.05, 0.08);
      break;
  }
}

let bgmTimer = null, bgmOn = false, bgmStep = 0;
const BGM_BASS = [110, 110, 146.83, 130.81, 110, 146.83, 164.81, 130.81];
const BGM_ARP  = [220, 261.63, 329.63, 392, 329.63, 261.63, 246.94, 220];
function startBgm() {
  if (bgmOn) return;
  bgmOn = true;
  const tick = () => {
    if (!bgmOn) return;
    tone(BGM_BASS[bgmStep % BGM_BASS.length], 0.35, 'triangle', 0.04);
    tone(BGM_ARP[bgmStep % BGM_ARP.length], 0.18, 'square', 0.022, 0.15);
    bgmStep++;
  };
  tick();
  bgmTimer = setInterval(tick, 380);
}
function stopBgm() {
  bgmOn = false;
  if (bgmTimer) clearInterval(bgmTimer);
  bgmTimer = null;
}

// ========================================================================
// ENEMY FACTORY
// ========================================================================
function makeEnemy(key, x, y) {
  const base = ENEMIES[key];
  const d = difficulty();
  // HP scales 1:1 with difficulty number (diff 8 = ×8 HP)
  // DMG scales softer so combat isn't insta-lethal at higher diffs
  // Bosses scale per cycle (each loop = +100% HP / +80% DMG on bosses)
  const floorHpMul = base.boss ? (1 + S.cycle * 1.0) : (1 + (d - 1) * 1.0);
  const floorDmgMul = base.boss ? (1 + S.cycle * 0.8) : (1 + (d - 1) * 0.4);
  const testHpMul = S.testMode ? S.testEnemyHpMul : 1;
  const testDmgMul = S.testMode ? S.testEnemyDmgMul : 1;
  const hpFinal = Math.max(1, Math.round(base.hp * floorHpMul * testHpMul));
  return {
    id: nextEnemyId++,
    x, y,
    type: key,
    sprite: base.sprite,
    disguise: base.disguise || null,
    name: base.name,
    hp: hpFinal,
    hpMax: hpFinal,
    dmg: Math.max(0, Math.round(base.dmg * floorDmgMul * testDmgMul)),
    // XP boosted ×2 so reaching ~Lv30 by end of Stage 8 (cycle 0) is realistic
    xp: Math.round(base.xp * floorHpMul * 2),
    boss: !!base.boss,
    healPerTurn: base.healPerTurn || 0,
    reviveOnce: !!base.reviveOnce, revived: false,
    berserk: !!base.berserk,
    reflectPct: base.reflectPct || 0,
    curseOnHit: !!base.curseOnHit,
    splitInto: base.splitInto || null, split: false,
    burnStacks: 0, burnDmg: 0,
    frozen: false,
  };
}

// ========================================================================
// DUNGEON GEN
// ========================================================================
function genFloor() {
  // Start fully walled, carve rooms + corridors
  const g = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(1));

  const rooms = [];
  const targetRooms = 5 + Math.floor(Math.random() * 4); // 5–8
  let tries = 0;
  while (rooms.length < targetRooms && tries < 80) {
    tries++;
    // Mix of small rooms and bigger halls
    const big = Math.random() < 0.3;
    const w = big ? 4 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3); // 2-4 small, 4-6 big
    const h = big ? 3 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 2); // 2-3 small, 3-5 big
    const x = 1 + Math.floor(Math.random() * (GRID_W - w - 2));
    const y = 1 + Math.floor(Math.random() * (GRID_H - h - 2));
    // No overlap (allow touching)
    const overlap = rooms.some(r =>
      x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y
    );
    if (overlap) continue;
    const room = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };
    // Carve floor
    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) g[ry][rx] = 0;
    }
    // 20% chance: leave a pillar in the middle (only for big rooms)
    if (big && Math.random() < 0.3 && w >= 4 && h >= 3) {
      const px = x + Math.floor(w / 2);
      const py = y + Math.floor(h / 2);
      g[py][px] = 1;
    }
    rooms.push(room);
  }

  // Carve L-shaped corridors between consecutive rooms
  function carveCorridor(a, b) {
    const horizFirst = Math.random() < 0.5;
    if (horizFirst) {
      const x0 = Math.min(a.cx, b.cx), x1 = Math.max(a.cx, b.cx);
      for (let x = x0; x <= x1; x++) g[a.cy][x] = 0;
      const y0 = Math.min(a.cy, b.cy), y1 = Math.max(a.cy, b.cy);
      for (let y = y0; y <= y1; y++) g[y][b.cx] = 0;
    } else {
      const y0 = Math.min(a.cy, b.cy), y1 = Math.max(a.cy, b.cy);
      for (let y = y0; y <= y1; y++) g[y][a.cx] = 0;
      const x0 = Math.min(a.cx, b.cx), x1 = Math.max(a.cx, b.cx);
      for (let x = x0; x <= x1; x++) g[b.cy][x] = 0;
    }
  }
  for (let i = 1; i < rooms.length; i++) carveCorridor(rooms[i - 1], rooms[i]);
  // Extra loop connections for variety (30% per extra pair)
  for (let i = 0; i < rooms.length - 2; i++) {
    if (Math.random() < 0.3) carveCorridor(rooms[i], rooms[i + 2]);
  }

  // Ensure player spawn (1,1) is open and connected
  g[1][1] = 0;
  if (rooms.length) {
    const r0 = rooms[0];
    carveCorridor({ cx: 1, cy: 1 }, r0);
  }

  // Force borders solid
  for (let y = 0; y < GRID_H; y++) { g[y][0] = 1; g[y][GRID_W - 1] = 1; }
  for (let x = 0; x < GRID_W; x++) { g[0][x] = 1; g[GRID_H - 1][x] = 1; }

  S.dungeon = g;
  S.player.x = 1; S.player.y = 1;
  S.hasShovel = false;
  S.enemies = [];
  S.chests = [];

  const isBossFloor = S.stageFloor === 5;
  // Stage-themed enemy pool
  const stageDef = STAGES[S.stage] || STAGES[1];

  if (isBossFloor) {
    const bx = Math.floor(GRID_W / 2);
    const by = Math.floor(GRID_H / 2);
    g[by][bx] = 0;
    let bossKey;
    if (S.testMode && S.testBossPool.length > 0) {
      const bossIdx = Math.max(0, S.stage - 1);
      bossKey = S.testBossPool[bossIdx % S.testBossPool.length];
    } else {
      bossKey = bossForStage(S.stage);
    }
    S.enemies.push(makeEnemy(bossKey, bx, by));
  } else {
    let candidates;
    if (S.testMode && S.testEnemyPool.length > 0) {
      candidates = [...S.testEnemyPool];
    } else {
      // Use stage's themed enemy pool
      candidates = stageDef.enemies.filter(k => ENEMIES[k]);
    }
    const maxTier = Math.min(5, Math.max(1, S.stage));
    const numEnemies = 3 + Math.min(S.floor + 1, 10);
    let tries = 0;
    while (S.enemies.length < numEnemies && tries < 400) {
      tries++;
      const x = 2 + Math.floor(Math.random() * (GRID_W - 4));
      const y = 2 + Math.floor(Math.random() * (GRID_H - 4));
      if (g[y][x] === 1) continue;
      if (S.enemies.some(e => e.x === x && e.y === y)) continue;
      if (Math.abs(x - 1) + Math.abs(y - 1) < 4) continue;
      const tierBias = Math.random() < 0.35 && maxTier > 1
        ? candidates.filter(k => ENEMIES[k].tier === maxTier)
        : candidates;
      const key = tierBias[Math.floor(Math.random() * tierBias.length)];
      S.enemies.push(makeEnemy(key, x, y));
    }
  }

  const numChests = 1 + (S.floor % 3 === 0 ? 1 : 0);
  let chestTries = 0;
  while (S.chests.length < numChests && chestTries < 200) {
    chestTries++;
    const x = 2 + Math.floor(Math.random() * (GRID_W - 4));
    const y = 2 + Math.floor(Math.random() * (GRID_H - 4));
    if (g[y][x] !== 0) continue;
    if (S.enemies.some(e => e.x === x && e.y === y)) continue;
    if (S.chests.some(c => c.x === x && c.y === y)) continue;
    if (Math.abs(x - 1) + Math.abs(y - 1) < 3) continue;
    S.chests.push({ x, y });
  }

  let sx = 0, sy = 0, best = -1;
  for (let y = 1; y < GRID_H - 1; y++) {
    for (let x = 1; x < GRID_W - 1; x++) {
      if (g[y][x] !== 0) continue;
      if (S.enemies.some(e => e.x === x && e.y === y)) continue;
      if (S.chests.some(c => c.x === x && c.y === y)) continue;
      const d = Math.abs(x - 1) + Math.abs(y - 1);
      const score = d + Math.random() * 2;
      if (score > best) { best = score; sx = x; sy = y; }
    }
  }
  S.shovel = { x: sx, y: sy };
}

// ========================================================================
// RENDER
// ========================================================================
const $ = sel => document.querySelector(sel);

// Bresenham-ish line-of-sight check; returns true if no wall between (x0,y0) and (x1,y1)
function lineOfSight(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.01) return true;
  const steps = Math.ceil(dist * 8); // 8 samples per tile
  const sx = dx / steps, sy = dy / steps;
  let x = x0, y = y0;
  for (let i = 1; i < steps; i++) {
    x += sx; y += sy;
    const cx = Math.floor(x), cy = Math.floor(y);
    if (cy < 0 || cx < 0 || cy >= GRID_H || cx >= GRID_W) return false;
    if (S.dungeon[cy][cx] === 1) return false;
  }
  return true;
}

// ── 3D first-person view (raycaster) ──
function render3D() {
  const canvas = $('#view-3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const stageDef = STAGES[S.stage] || STAGES[1];
  const tint = hexToRgb(stageDef.tint || '#ffffff');

  // Ceiling — tinted with stage color
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, h / 2);
  ceilGrad.addColorStop(0, '#0a0816');
  ceilGrad.addColorStop(1, `rgb(${Math.floor(29 + tint.r * 0.05)}, ${Math.floor(24 + tint.g * 0.05)}, ${Math.floor(40 + tint.b * 0.05)})`);
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(0, 0, w, h / 2);
  // Floor (per-stage texture, fallback to gradient)
  const floorImg = SPRITE_IMAGES[stageDef.floorTex] || SPRITE_IMAGES['floor'];
  if (floorImg && floorImg.width > 0) {
    if (render3D._floorPatternKey !== stageDef.floorTex) {
      render3D._floorPattern = ctx.createPattern(floorImg, 'repeat');
      render3D._floorPatternKey = stageDef.floorTex;
    }
    ctx.fillStyle = render3D._floorPattern;
    ctx.fillRect(0, h / 2, w, h / 2);
    // Darken with distance gradient
    const grd = ctx.createLinearGradient(0, h / 2, 0, h);
    grd.addColorStop(0, 'rgba(10,6,22,0.8)');
    grd.addColorStop(1, 'rgba(10,6,22,0.1)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, h / 2, w, h / 2);
  } else {
    const floorGrad = ctx.createLinearGradient(0, h / 2, 0, h);
    floorGrad.addColorStop(0, '#221a30');
    floorGrad.addColorStop(1, '#3a2e4a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h / 2, w, h / 2);
  }

  const fov = Math.PI / 3;
  const halfFov = fov / 2;
  const dirAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const playerAngle = dirAngles[S.player.dir];
  const px = S.player.x + 0.5;
  const py = S.player.y + 0.5;
  const maxDist = 14;
  const stripW = 2;
  const numStrips = Math.ceil(w / stripW);
  const zBuf = new Array(numStrips).fill(maxDist);

  const wallImg = SPRITE_IMAGES[stageDef.wallTex] || SPRITE_IMAGES['wall'];
  for (let i = 0; i < numStrips; i++) {
    const t = (i + 0.5) / numStrips;
    const rayAngle = playerAngle - halfFov + t * fov;
    const dx = Math.cos(rayAngle), dy = Math.sin(rayAngle);
    let x = px, y = py;
    let dist = 0;
    const step = 0.03;
    let prevCx = Math.floor(x), prevCy = Math.floor(y);
    let sideHit = 0; // 0 = horizontal wall (entered new cx), 1 = vertical (new cy)
    while (dist < maxDist) {
      x += dx * step; y += dy * step; dist += step;
      const cx = Math.floor(x), cy = Math.floor(y);
      if (cx !== prevCx) sideHit = 0;
      if (cy !== prevCy) sideHit = 1;
      prevCx = cx; prevCy = cy;
      if (cy < 0 || cx < 0 || cy >= GRID_H || cx >= GRID_W) break;
      if (S.dungeon[cy][cx] === 1) break;
    }
    if (dist >= maxDist) continue;
    const corrected = Math.max(0.2, dist * Math.cos(rayAngle - playerAngle));
    zBuf[i] = corrected;
    const wallH = Math.min(h * 1.4, h / corrected * 0.85);
    const top = (h - wallH) / 2;
    const shade = Math.max(0.25, 1 - dist / maxDist);
    if (wallImg && wallImg.width > 0) {
      // U coordinate from where the ray hit the wall
      const u = sideHit === 0 ? (y - Math.floor(y)) : (x - Math.floor(x));
      const texX = Math.floor(u * wallImg.width) % wallImg.width;
      try {
        ctx.drawImage(wallImg,
          texX, 0, Math.max(1, stripW), wallImg.height,
          i * stripW, top, stripW, wallH);
      } catch (e) {}
      // Distance shading overlay
      ctx.fillStyle = `rgba(10, 6, 22, ${1 - shade})`;
      ctx.fillRect(i * stripW, top, stripW, wallH);
      // Slightly darker for one wall side (depth cue)
      if (sideHit === 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(i * stripW, top, stripW, wallH);
      }
    } else {
      const r = Math.floor(95 * shade);
      const g = Math.floor(65 * shade);
      const b = Math.floor(125 * shade);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(i * stripW, top, stripW, wallH);
      ctx.fillStyle = `rgba(255,255,255,${0.08 * shade})`;
      ctx.fillRect(i * stripW, top, stripW, 3);
    }
  }

  // Render sprites (enemies, chests, shovel) as billboards
  const sprites = [];
  S.enemies.forEach(e => sprites.push({
    x: e.x + 0.5, y: e.y + 0.5,
    emoji: e.disguise || e.sprite,
    imgKey: e.disguise ? 'chest' : `enemy_${e.type}`,
    scale: e.boss ? 1.6 : 1,
    color: e.boss ? '#ffcb6b' : '#f06c8e'
  }));
  S.chests.forEach(c => sprites.push({
    x: c.x + 0.5, y: c.y + 0.5,
    emoji: '🎁', imgKey: 'chest',
    scale: 0.8, color: '#ffcb6b'
  }));
  if (S.shovel) sprites.push({
    x: S.shovel.x + 0.5, y: S.shovel.y + 0.5,
    emoji: '🪏', imgKey: 'shovel',
    scale: 0.7, color: '#ffcb6b'
  });

  sprites.forEach(s => {
    const sdx = s.x - px, sdy = s.y - py;
    s.dist = Math.sqrt(sdx * sdx + sdy * sdy);
    s.angle = Math.atan2(sdy, sdx);
  });
  sprites.sort((a, b) => b.dist - a.dist);

  for (const s of sprites) {
    if (s.dist > maxDist) continue;
    let relAngle = s.angle - playerAngle;
    while (relAngle < -Math.PI) relAngle += Math.PI * 2;
    while (relAngle > Math.PI) relAngle -= Math.PI * 2;
    if (Math.abs(relAngle) > halfFov + 0.05) continue;
    if (!lineOfSight(px, py, s.x, s.y)) continue;
    const screenX = w * (0.5 + relAngle / fov);
    const corrected = Math.max(0.2, s.dist * Math.cos(relAngle));
    const spriteH = Math.min(h * 1.4, (h / corrected) * 0.7 * s.scale);
    const spriteY = h / 2 + (h / corrected) * 0.1;
    const shade = Math.max(0.4, 1 - s.dist / maxDist);
    const img = SPRITE_IMAGES[s.imgKey];
    const spriteLeft = screenX - spriteH / 2;
    const spriteTop = spriteY - spriteH / 2;
    const colStart = Math.max(0, Math.floor(spriteLeft / stripW));
    const colEnd = Math.min(numStrips - 1, Math.ceil((spriteLeft + spriteH) / stripW));

    // Count how many strips show the sprite in front of the wall
    let visibleCols = 0, totalCols = 0;
    for (let ci = colStart; ci <= colEnd; ci++) {
      totalCols++;
      if (zBuf[ci] >= corrected - 0.1) visibleCols++;
    }
    if (totalCols === 0 || visibleCols / totalCols < 0.35) continue; // mostly behind wall: hide

    // Clip drawing to the union of visible spans (so partial occlusion looks right)
    ctx.save();
    ctx.beginPath();
    let i = colStart;
    while (i <= colEnd) {
      while (i <= colEnd && zBuf[i] < corrected - 0.1) i++;
      const a = i;
      while (i <= colEnd && zBuf[i] >= corrected - 0.1) i++;
      const b = i;
      if (a < b) ctx.rect(a * stripW, spriteTop, (b - a) * stripW, spriteH);
    }
    ctx.clip();

    if (img && img.width > 0) {
      try {
        ctx.filter = `brightness(${(0.7 + shade * 0.5).toFixed(2)}) drop-shadow(0 0 ${Math.floor(10 * shade)}px ${s.color})`;
      } catch (e) {}
      ctx.globalAlpha = shade;
      ctx.drawImage(img, spriteLeft, spriteTop, spriteH, spriteH);
    } else {
      ctx.font = `${Math.floor(spriteH)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.globalAlpha = shade;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12 * shade;
      ctx.fillStyle = '#fff';
      ctx.fillText(s.emoji, screenX, spriteY + spriteH / 2);
    }
    ctx.restore();
  }

  // Final stage color tint (subtle but distinct between stages)
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, 0.18)`;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  // Vignette + stage name in corner
  ctx.save();
  const vGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 0.85);
  vGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);
  // Stage banner top-left
  ctx.font = 'bold 14px Segoe UI';
  ctx.fillStyle = stageDef.tint || '#ffcb6b';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 6;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const plusStr = S.cycle > 0 ? ` +${S.cycle}` : '';
  ctx.fillText(`S${S.stage}-${S.stageFloor}${plusStr}  ${stageDef.name}  [難 ${difficulty()}]`, 10, 8);
  ctx.restore();
}

// ── Minimap (top-down small) ──
const MINI_CELL = 14;
function renderMinimap() {
  const m = $('#minimap');
  if (!m) return;
  m.innerHTML = '';
  m.style.width = (GRID_W * MINI_CELL) + 'px';
  m.style.height = (GRID_H * MINI_CELL) + 'px';
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const c = document.createElement('div');
      c.className = 'mini-cell ' + (S.dungeon[y][x] === 1 ? 'wall' : 'floor');
      c.style.left = (x * MINI_CELL) + 'px';
      c.style.top = (y * MINI_CELL) + 'px';
      m.appendChild(c);
    }
  }
  if (S.shovel) {
    const s = document.createElement('div');
    s.className = 'mini-sprite shovel';
    s.style.left = (S.shovel.x * MINI_CELL) + 'px';
    s.style.top = (S.shovel.y * MINI_CELL) + 'px';
    s.textContent = '🪏';
    m.appendChild(s);
  }
  S.chests.forEach(c => {
    const el = document.createElement('div');
    el.className = 'mini-sprite chest';
    el.style.left = (c.x * MINI_CELL) + 'px';
    el.style.top = (c.y * MINI_CELL) + 'px';
    el.textContent = '🎁';
    m.appendChild(el);
  });
  S.enemies.forEach(e => {
    const el = document.createElement('div');
    el.className = 'mini-sprite enemy' + (e.boss ? ' boss' : '');
    el.style.left = (e.x * MINI_CELL) + 'px';
    el.style.top = (e.y * MINI_CELL) + 'px';
    el.textContent = e.disguise || e.sprite;
    m.appendChild(el);
  });
  const p = document.createElement('div');
  p.className = 'mini-sprite player';
  p.style.left = (S.player.x * MINI_CELL) + 'px';
  p.style.top = (S.player.y * MINI_CELL) + 'px';
  p.textContent = ['▲', '▶', '▼', '◀'][S.player.dir];
  m.appendChild(p);
}

function renderDungeon() {
  render3D();
  renderMinimap();
}

// Helper: parse #rrggbb to {r,g,b}
function hexToRgb(hex) {
  const m = (hex || '#ffffff').match(/^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
  if (!m) return { r: 255, g: 255, b: 255 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function renderHUD() {
  $('#hp').textContent = S.player.hp;
  $('#hp-max').textContent = S.player.hpMax;
  $('#level').textContent = S.player.level;
  $('#xp').textContent = S.player.xp;
  $('#xp-next').textContent = xpNeeded();
  const stageDef = STAGES[S.stage];
  const stageName = stageDef ? stageDef.name : '???';
  const plus = S.cycle > 0 ? ` +${S.cycle}` : '';
  const diff = difficulty();
  $('#floor').textContent = `S${S.stage}-${S.stageFloor}${plus}${S.stageFloor === 5 ? ' 👑' : ''} ${stageName} [難易度 ${diff}]`;
  $('#deck-size').textContent = totalDeck();
  $('#shovel-status').textContent = S.hasShovel ? '所持 (SPACEで掘る)' : 'なし';
  $('#shovel-stat').dataset.has = S.hasShovel ? 'yes' : 'no';
  $('#trait-display').textContent = S.traits.length ? S.traits.map(t => TRAITS[t].icon).join(' ') : '-';
  $('#gem-count').textContent = S.gems;
  $('#hud-mana').textContent = S.battle ? `${S.battle.mana}/${S.battle.maxMana}` : `${getMaxMana()}/${getMaxMana()}`;
}
// Pokemon "Medium Fast" curve (公式): total XP at level N = N³ (Bulbapedia)
// Per-level requirement (current → next): (N+1)³ - N³ = 3N² + 3N + 1
// Level 30 total = 27,000 XP, reachable by clearing most enemies across 8 stages
function xpNeeded() {
  const n = S.player.level;
  return 3 * n * n + 3 * n + 1;
}
function totalDeck() {
  let n = S.deck.length + S.discard.length;
  if (S.battle) n += S.battle.hand.length + S.battle.discard.length;
  return n;
}

function abilityBadges(e) {
  const b = [];
  if (e.healPerTurn) b.push(`💚 Heal ${e.healPerTurn}/T`);
  if (e.reviveOnce && !e.revived) b.push('☠️ Revive');
  if (e.berserk) b.push('🔥 Berserk');
  if (e.reflectPct) b.push(`🪞 反射 ${Math.round(e.reflectPct * 100)}%`);
  if (e.curseOnHit) b.push('💀 Curse');
  if (e.splitInto) b.push('🟢 Split');
  if (e.burnStacks > 0) b.push(`🔥 Burn ${e.burnStacks}T (${e.burnDmg})`);
  if (e.frozen) b.push('⏰ Frozen');
  return b;
}

// ========================================================================
// EXPLORE
// ========================================================================
// Direction vectors: 0=N, 1=E, 2=S, 3=W
const DIR = [
  { dx: 0, dy: -1 }, // N
  { dx: 1, dy: 0 },  // E
  { dx: 0, dy: 1 },  // S
  { dx: -1, dy: 0 }, // W
];

function movePlayer(forward, strafe) {
  if (S.mode !== 'explore' || S.inputLocked) return;
  const fwd = DIR[S.player.dir];
  const right = DIR[(S.player.dir + 1) % 4];
  const dx = fwd.dx * forward + right.dx * strafe;
  const dy = fwd.dy * forward + right.dy * strafe;
  const nx = S.player.x + dx, ny = S.player.y + dy;
  if (S.dungeon[ny] === undefined || S.dungeon[ny][nx] === undefined) return;
  if (S.dungeon[ny][nx] === 1) {
    sfx('bump');
    return;
  }
  const enemy = S.enemies.find(e => e.x === nx && e.y === ny);
  if (enemy) {
    if (enemy.disguise) {
      bigCallout(`⚠️ ${enemy.name}!`, '#ff7e2b');
      screenFlash('rgba(255, 126, 43, 0.5)', 400);
    }
    sfx(enemy.boss ? 'boss' : 'battle');
    if (enemy.boss) {
      bigCallout(`👑 ${enemy.name}`, '#ff4060');
      screenFlash('rgba(192, 32, 64, 0.4)', 500);
    }
    startBattle(enemy);
    return;
  }
  S.player.x = nx; S.player.y = ny;
  sfx('step');
  S.inputLocked = true;
  setTimeout(() => { S.inputLocked = false; }, 130);
  renderDungeon();

  const chestIdx = S.chests.findIndex(c => c.x === nx && c.y === ny);
  if (chestIdx >= 0) openChest(chestIdx);

  if (S.shovel && nx === S.shovel.x && ny === S.shovel.y) {
    S.shovel = null;
    sfx('pickup');
    if (S.stageFloor === 5) {
      // Floor 5: shovel summons the Death Reaper instead of descending
      toast('💀 ショベルを掴んだ瞬間…死神が現れた!');
      renderDungeon();
      renderHUD();
      setTimeout(triggerStageReaper, 400);
    } else {
      S.hasShovel = true;
      toast('🪏 シャベルを掴んで地面を掘る!');
      renderDungeon();
      renderHUD();
      setTimeout(descendToNextFloor, 200);
    }
  }
}

function triggerStageReaper() {
  if (S.mode !== 'explore') return;
  S.inputLocked = true;
  bigCallout('💀 死神 / Grim Reaper', '#ff4060');
  screenFlash('rgba(64, 0, 16, 0.75)', 800);
  sfx('boss');
  setTimeout(() => {
    const reaper = makeEnemy('boss_death_reaper', 0, 0);
    reaper.row = 0; reaper.col = 1;
    S.reaperStageTransition = true;
    startBattle(reaper);
    S.inputLocked = false;
  }, 800);
}

function descendToNextFloor() {
  if (S.mode !== 'explore') return;
  // Infinite cycling — no more death reaper wall.
  // (Death Reaper still exists as a hidden boss key for test mode use.)
  S.inputLocked = true;
  sfx('dig');
  const wrap = $('#dungeon-wrap');
  wrap.classList.remove('ascending');
  wrap.classList.add('descending');
  setTimeout(() => {
    nextFloor();
    wrap.classList.remove('descending');
    wrap.classList.add('ascending');
    setTimeout(() => {
      wrap.classList.remove('ascending');
      S.inputLocked = false;
    }, 650);
  }, 700);
}

function turnPlayer(delta) {
  if (S.mode !== 'explore' || S.inputLocked) return;
  S.player.dir = (S.player.dir + delta + 4) % 4;
  sfx('step');
  S.inputLocked = true;
  setTimeout(() => { S.inputLocked = false; }, 150);
  renderDungeon();
}

function openChest(idx) {
  S.chests.splice(idx, 1);
  sfx('chest');
  const r = Math.random();
  if (r < 0.40) {
    const heal = 8;
    S.player.hp = Math.min(S.player.hpMax, S.player.hp + heal);
    toast(`🎁 HP +${heal}`);
  } else if (r < 0.70) {
    const key = POOL_FOR_LEVELUP[Math.floor(Math.random() * POOL_FOR_LEVELUP.length)];
    S.deck.push(key);
    shuffle(S.deck);
    toast(`🎁 + ${CARDS[key].name}`);
  } else if (r < 0.85) {
    S.gems++;
    sfx('gem');
    toast(`🎁💎 進化ジェム +1 (計 ${S.gems})`);
  } else {
    S.player.hp = S.player.hpMax;
    for (let i = 0; i < 2; i++) {
      const key = POOL_FOR_LEVELUP[Math.floor(Math.random() * POOL_FOR_LEVELUP.length)];
      S.deck.push(key);
    }
    S.gems++;
    shuffle(S.deck);
    sfx('levelup');
    toast(`🎁✨ 大当たり! 全回復+カード2枚+💎`);
  }
  renderDungeon();
  renderHUD();
  setTimeout(tryEvolve, 300);
}

function digDown() {
  // Legacy: SPACE used to descend; now shovel pickup auto-descends.
  // Keep this as a no-op trigger fallback if shovel held and not yet descended.
  if (S.mode !== 'explore' || !S.hasShovel) return;
  descendToNextFloor();
  S.hasShovel = false;
}

function nextFloor() {
  S.floor++;
  S.stageFloor++;
  if (S.stageFloor > 5) {
    if (S.stage >= MAX_STAGE) {
      // Loop: cycle++ and restart from stage 1
      S.cycle++;
      S.stage = 1;
      S.stageFloor = 1;
      try {
        S.maxCycleReached = Math.max(S.maxCycleReached, S.cycle);
        localStorage.setItem('vc_proto_maxCycle', String(S.maxCycleReached));
      } catch (e) {}
      bigCallout(`🌟 NEW GAME +${S.cycle} ENTERED 🌟`, '#ffcb6b');
      coinShower(80);
    } else {
      S.stage++;
      S.stageFloor = 1;
      try {
        S.maxStageUnlocked = Math.max(S.maxStageUnlocked, S.stage);
        localStorage.setItem('vc_proto_maxStage', String(S.maxStageUnlocked));
      } catch (e) {}
    }
  }
  genFloor();
  renderDungeon();
  renderHUD();
  const plus = S.cycle > 0 ? ` +${S.cycle}` : '';
  if (S.stageFloor === 5) toast(`👑 BOSS — Stage ${S.stage}${plus} Floor ${S.stageFloor}`);
  else if (S.stageFloor === 1) toast(`✦ STAGE ${S.stage}${plus}: ${(STAGES[S.stage] || {}).name || '???'} ✦`);
  else toast(`✦ Stage ${S.stage}${plus} - Floor ${S.stageFloor} ✦`);
}

// ========================================================================
// BATTLE
// ========================================================================
function drawOne() {
  if (S.deck.length === 0 && S.battle) {
    S.deck = S.battle.discard;
    S.battle.discard = [];
    shuffle(S.deck);
  }
  if (S.deck.length === 0) return null;
  const key = S.deck.shift();
  return { key, wild: Math.random() < WILD_TAG_CHANCE };
}

// ── Per-card visual effects
// fx  = main impact effect type: slash / lightning / fire / shockwave / beam /
//        drain / wind / spiral / fog / projectile (default emoji throw)
// proj = optional projectile emoji that flies BEFORE the impact effect
// p, c, s = secondary particle emoji / color / sound name
const CARD_EFFECTS = {
  // Slash/blade — sword arc slashes
  bone:          { fx: 'slash',     c: '#e8e2d8', s: 'swish',  p: '🦴' },
  knife:         { fx: 'projectile', proj: '🗡️', c: '#c8c8e0', s: 'knife', p: '🗡️', impact: 'slash' },
  thousand_edge: { fx: 'slash',     c: '#c8c8e0', s: 'swish',  p: '🗡️' },
  thousand_edge_evo: { fx: 'slash', c: '#ffcb6b', s: 'swish',  p: '🗡️' },
  whip:          { fx: 'slash',     c: '#d4a878', s: 'swish',  p: '〰️' },
  axe:           { fx: 'slash',     c: '#c8c8e0', s: 'swish',  p: '🪓', proj: '🪓', impact: 'slash' },
  magic_wand:    { fx: 'beam',      c: '#b07afc', s: 'bell',   p: '✨' },
  cross:         { fx: 'beam',      c: '#ffcb6b', s: 'bell',   p: '✝️' },
  // Fire — vertical fire pillar
  fire_wand:     { fx: 'fire',      c: '#ff8844', s: 'fire',   p: '🔥' },
  hellfire:      { fx: 'fire',      c: '#ff4444', s: 'fire',   p: '🔥' },
  hellfire_evo:  { fx: 'fire',      c: '#ff2222', s: 'fire',   p: '🔥' },
  santa_water:   { fx: 'fog',       c: '#ffaa88', s: 'whoosh', p: '💦' },
  la_borra:      { fx: 'fog',       c: '#a86844', s: 'whoosh', p: '🟫' },
  la_borra_evo:  { fx: 'fog',       c: '#ff6622', s: 'whoosh', p: '🟫' },
  // Lightning — jagged bolt from above
  lightning_ring:{ fx: 'lightning', c: '#ffe066', s: 'zap',    p: '⚡' },
  thunder_loop:  { fx: 'lightning', c: '#ffe066', s: 'zap',    p: '⚡' },
  thunder_loop_evo:{ fx: 'lightning', c: '#ffff00', s: 'zap',  p: '⚡' },
  // Holy — vertical beam of light
  king_bible:    { fx: 'beam',      c: '#ffcb6b', s: 'bell',   p: '✨' },
  heaven_sword:  { fx: 'beam',      c: '#ffcb6b', s: 'bell',   p: '⚔️', proj: '⚔️', impact: 'slash' },
  heaven_sword_evo:{ fx: 'beam',    c: '#ffff88', s: 'bell',   p: '⚔️', proj: '⚔️', impact: 'slash' },
  holy_wand:     { fx: 'beam',      c: '#ffcb6b', s: 'bell',   p: '✨' },
  unholy_vespers:{ fx: 'beam',      c: '#b07afc', s: 'bell',   p: '🕯️' },
  unholy_vespers_evo:{ fx: 'beam',  c: '#d4a6ff', s: 'bell',   p: '🕯️' },
  pentagram:     { fx: 'fog',       c: '#ff4060', s: 'curse',  p: '⛧' },
  gorgeous_moon: { fx: 'beam',      c: '#ffcb6b', s: 'bell',   p: '🌕' },
  // Drain/blood — orbs flow from target back to player HP
  soul_eater:    { fx: 'drain',     c: '#c044ff', s: 'drain',  p: '👻' },
  soul_eater_evo:{ fx: 'drain',     c: '#e088ff', s: 'drain',  p: '👻' },
  bloody_tear:   { fx: 'drain',     c: '#ff5577', s: 'drain',  p: '🩸' },
  bloody_tear_evo:{ fx: 'drain',    c: '#ff0055', s: 'drain',  p: '🩸' },
  vicious_hunger:{ fx: 'drain',     c: '#c044ff', s: 'drain',  p: '🦷' },
  // Wing/bird — horizontal wind streaks
  shadow_pinion: { fx: 'wind',      c: '#b07afc', s: 'whoosh', p: '🪶' },
  ebony_wings:   { fx: 'wind',      c: '#5a4878', s: 'whoosh', p: '🪶' },
  peachone:      { fx: 'wind',      c: '#ffaa44', s: 'whoosh', p: '🦅' },
  vandalier:     { fx: 'wind',      c: '#ffcb6b', s: 'whoosh', p: '🦅' },
  vandalier_evo: { fx: 'wind',      c: '#ffe088', s: 'whoosh', p: '🦅' },
  valkyrie_turner:{ fx: 'beam',     c: '#ffcb6b', s: 'bell',   p: '⚜️' },
  // Spiral — rotating ring expanding outward
  death_spiral:  { fx: 'spiral',    c: '#b07afc', s: 'swirl',  p: '🌀' },
  death_spiral_evo:{ fx: 'spiral',  c: '#e088ff', s: 'swirl',  p: '🌀' },
  mannajja:      { fx: 'spiral',    c: '#9aff6b', s: 'swirl',  p: '🌀' },
  mannajja_evo:  { fx: 'spiral',    c: '#bfff88', s: 'swirl',  p: '🌀' },
  // Bomb — shockwave
  cherry_bomb:   { fx: 'shockwave', c: '#ff5577', s: 'boom',   p: '💥', proj: '🍒', impact: 'shockwave' },
  no_future:     { fx: 'shockwave', c: '#ff5577', s: 'boom',   p: '💢' },
  phieraggi:     { fx: 'shockwave', c: '#ff5577', s: 'boom',   p: '💥' },
  phieraggi_evo: { fx: 'shockwave', c: '#ff0055', s: 'boom',   p: '💥' },
  // Projectile/arrow style
  runetracer:    { fx: 'projectile', proj: '🪨', c: '#88aaff', s: 'swish',  p: '🪨' },
  phiera:        { fx: 'projectile', proj: '💥', c: '#aaaaaa', s: 'knife',  p: '💥', impact: 'shockwave' },
  // Debuff fog
  garlic:        { fx: 'fog',       c: '#ffffaa', s: 'whoosh', p: '🧄' },
  // Beast — slash
  gatti_amari:   { fx: 'slash',     c: '#ffaa88', s: 'swish',  p: '🐈', proj: '🐈' },
  // Wild — beam
  rosary:        { fx: 'beam',      c: '#ffcb6b', s: 'bell',   p: '📿' },
};
function cardEffect(key) {
  return CARD_EFFECTS[key] || { fx: 'projectile', proj: '✦', c: '#ff7eb6', s: 'attack', p: '✦' };
}

// ─── Effect dispatchers ───
function fxSlash(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  // Try a video asset first; fall back to CSS animation
  if (tryVideoEffect('slash', cx, cy, 160)) return;
  for (let i = 0; i < 2; i++) {
    const el = document.createElement('div');
    el.className = 'fx-slash';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.setProperty('--angle', (i === 0 ? -35 : 35) + 'deg');
    el.style.background = `linear-gradient(90deg, transparent, ${color} 30%, #fff 50%, ${color} 70%, transparent)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 500);
  }
}
function fxLightning(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('lightning', cx, cy, 240)) return;
  // SVG zigzag bolt from top of screen to target
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.classList.add('fx-lightning');
  svg.setAttribute('viewBox', '0 0 200 400');
  svg.style.left = (cx - 100) + 'px';
  svg.style.top = '0px';
  svg.style.height = (cy + 30) + 'px';
  const path = document.createElementNS(ns, 'path');
  // Random zig-zag points
  const pts = ['M100 0'];
  for (let y = 60; y < 400; y += 50) pts.push(`L${60 + Math.random() * 80} ${y}`);
  pts.push(`L${100} 400`);
  path.setAttribute('d', pts.join(' '));
  path.setAttribute('stroke', '#fff');
  path.setAttribute('stroke-width', '8');
  path.setAttribute('fill', 'none');
  path.style.filter = `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${color})`;
  svg.appendChild(path);
  document.body.appendChild(svg);
  // also a flash
  const flash = document.createElement('div');
  flash.className = 'fx-flash';
  flash.style.background = color;
  document.body.appendChild(flash);
  setTimeout(() => { svg.remove(); flash.remove(); }, 350);
}
function fxFire(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('fire', cx, cy, 200)) return;
  const el = document.createElement('div');
  el.className = 'fx-fire';
  el.style.left = cx + 'px';
  el.style.top = (cy + 40) + 'px';
  el.style.background = `radial-gradient(ellipse at center bottom, #fff 0%, ${color} 25%, ${color}00 70%)`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}
function fxShockwave(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('shockwave', cx, cy, 240)) return;
  for (let i = 0; i < 3; i++) {
    const el = document.createElement('div');
    el.className = 'fx-shockwave';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.borderColor = color;
    el.style.animationDelay = (i * 0.08) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700 + i * 100);
  }
}
function fxBeam(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('beam', cx, cy, 200)) return;
  const el = document.createElement('div');
  el.className = 'fx-beam';
  el.style.left = cx + 'px';
  el.style.top = '0px';
  el.style.height = (cy + r.height / 2) + 'px';
  el.style.background = `linear-gradient(180deg, transparent, ${color}80 30%, #fff 70%, ${color}80)`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}
function fxDrain(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const hp = $('#hp');
  if (!hp) return;
  const r = t.getBoundingClientRect();
  const hr = hp.getBoundingClientRect();
  const startX = r.left + r.width / 2;
  const startY = r.top + r.height / 2;
  const endX = hr.left + hr.width / 2;
  const endY = hr.top + hr.height / 2;
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'fx-drain-orb';
    el.textContent = '●';
    el.style.color = color;
    el.style.left = (startX + (Math.random() - 0.5) * 50) + 'px';
    el.style.top = (startY + (Math.random() - 0.5) * 30) + 'px';
    el.style.setProperty('--dx', (endX - startX) + 'px');
    el.style.setProperty('--dy', (endY - startY) + 'px');
    el.style.animationDelay = (i * 0.05) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700 + i * 50);
  }
}
function fxWind(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('wind', cx, cy, 200)) return;
  for (let i = 0; i < 4; i++) {
    const el = document.createElement('div');
    el.className = 'fx-wind';
    el.style.left = (cx - 200) + 'px';
    el.style.top = (cy - 20 + i * 12) + 'px';
    el.style.background = `linear-gradient(90deg, transparent, ${color}, transparent)`;
    el.style.animationDelay = (i * 0.04) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 500);
  }
}
function fxSpiral(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('spiral', cx, cy, 200)) return;
  for (let i = 0; i < 3; i++) {
    const el = document.createElement('div');
    el.className = 'fx-spiral';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.borderTopColor = color;
    el.style.borderRightColor = color;
    el.style.animationDelay = (i * 0.1) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700 + i * 100);
  }
}
function fxFog(targetSel, color) {
  const t = $(targetSel); if (!t) return;
  const r = t.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (tryVideoEffect('fog', cx, cy, 200)) return;
  const el = document.createElement('div');
  el.className = 'fx-fog';
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  el.style.background = `radial-gradient(circle, ${color} 0%, ${color}80 30%, transparent 70%)`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function playFx(fxType, targetSel, color) {
  switch (fxType) {
    case 'slash':     return fxSlash(targetSel, color);
    case 'lightning': return fxLightning(targetSel, color);
    case 'fire':      return fxFire(targetSel, color);
    case 'shockwave': return fxShockwave(targetSel, color);
    case 'beam':      return fxBeam(targetSel, color);
    case 'drain':     return fxDrain(targetSel, color);
    case 'wind':      return fxWind(targetSel, color);
    case 'spiral':    return fxSpiral(targetSel, color);
    case 'fog':       return fxFog(targetSel, color);
  }
}

// ── Video effect support (transparent .webm in assets/fx/<name>.webm)
// If a video file exists for the named effect, it plays as overlay.
const VIDEO_FX_AVAILABLE = {};
function probeVideoFx(name) {
  return new Promise(resolve => {
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'metadata';
    v.src = `assets/fx/${name}.webm`;
    v.addEventListener('loadedmetadata', () => { VIDEO_FX_AVAILABLE[name] = true; resolve(true); });
    v.addEventListener('error', () => resolve(false));
    setTimeout(() => resolve(false), 1500);
  });
}
function tryVideoEffect(name, cx, cy, size) {
  if (!VIDEO_FX_AVAILABLE[name]) return false;
  const v = document.createElement('video');
  v.className = 'fx-video';
  v.src = `assets/fx/${name}.webm`;
  v.autoplay = true;
  v.muted = true;
  v.playsInline = true;
  v.style.left = cx + 'px';
  v.style.top = cy + 'px';
  v.style.width = size + 'px';
  v.style.height = size + 'px';
  document.body.appendChild(v);
  v.addEventListener('ended', () => v.remove());
  setTimeout(() => v.remove(), 2000); // fallback removal
  return true;
}
function cardEffect(key) {
  return CARD_EFFECTS[key] || { p: '✦', c: '#ff7eb6', s: 'attack' };
}

// Spawn a projectile flying from the hand area to an enemy slot
function spawnProjectile(emoji, color, toSel) {
  const toEl = $(toSel);
  if (!toEl) return;
  const handEl = $('#battle-hand');
  const handRect = handEl ? handEl.getBoundingClientRect() : null;
  const startX = handRect ? handRect.left + handRect.width / 2 : window.innerWidth / 2;
  const startY = handRect ? handRect.top : window.innerHeight - 200;
  const tr = toEl.getBoundingClientRect();
  const endX = tr.left + tr.width / 2;
  const endY = tr.top + tr.height / 2;
  const el = document.createElement('div');
  el.className = 'projectile';
  el.textContent = emoji;
  el.style.left = startX + 'px';
  el.style.top = startY + 'px';
  el.style.color = color;
  el.style.setProperty('--dx', (endX - startX) + 'px');
  el.style.setProperty('--dy', (endY - startY) + 'px');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 400);
}

// ── Multi-enemy helpers
function aliveEnemies(B) { return B.enemies.filter(e => e.hp > 0); }
function aliveInRow(B, row) { return B.enemies.filter(e => e.hp > 0 && e.row === row); }

// When the front row (row 0) is wiped, slide all rows forward by 1.
// Hidden rows (row > 2) move into view.
function checkAndPromoteRows() {
  const B = S.battle;
  if (!B) return;
  while (aliveInRow(B, 0).length === 0 && B.enemies.some(e => e.hp > 0)) {
    let promoted = false;
    B.enemies.forEach(e => {
      if (e.hp <= 0) return;
      if (e.row >= 1) {
        e.promoteFrom = e.row; // remember the source row for animation choice
        e.row--;
        e.justPromoted = true;
        promoted = true;
      }
    });
    if (!promoted) break;
    callout('💥 前列突破!', '#ffcb6b');
    sfx('combo');
    screenFlash('rgba(255, 203, 107, 0.35)', 300);
  }
}
function leftmostAlive(B) {
  for (const row of [0, 1, 2]) {
    const inRow = aliveInRow(B, row).sort((a, b) => a.col - b.col);
    if (inRow.length) return inRow[0];
  }
  return null;
}
function pickTargets(B, def) {
  const target = def.target || 'single';
  if (target === 'aoe' || target === 'all') {
    // Front row (row 0) only; cascade to next row only if all of row 0 is dead
    for (const row of [0, 1, 2]) {
      const inRow = aliveInRow(B, row);
      if (inRow.length) return inRow;
    }
    return [];
  }
  const one = leftmostAlive(B);
  return one ? [one] : [];
}

function spawnEnemyGroup(triggerEnemy) {
  // Boss = alone, in center front
  if (triggerEnemy.boss) {
    triggerEnemy.row = 0; triggerEnemy.col = 1;
    return [triggerEnemy];
  }
  // Regular battle: 3 enemies (front row), +1-3 back row at higher floors
  const enemies = [triggerEnemy];
  triggerEnemy.row = 0;
  triggerEnemy.col = 1; // center
  // Choose 2 more for front row
  const tierMax = Math.min(5, Math.max(1, Math.floor(S.floor / 4) + 1));
  let pool;
  if (S.testMode && S.testEnemyPool.length > 0) {
    pool = [...S.testEnemyPool];
  } else {
    pool = Object.keys(ENEMIES).filter(k => {
      const e = ENEMIES[k];
      return !e.boss && e.tier > 0 && e.tier <= tierMax;
    });
  }
  // Row 0 (front) siblings — trigger at col 1
  for (const col of [0, 2]) {
    const k = pool[Math.floor(Math.random() * pool.length)] || triggerEnemy.type;
    const e = makeEnemy(k, 0, 0);
    e.row = 0; e.col = col;
    enemies.push(e);
  }
  // Total rows: test override takes priority, else scales with floor
  let totalRows;
  if (S.testMode && S.testRowsOverride) {
    totalRows = Math.max(1, Math.min(10, S.testRowsOverride));
  } else {
    totalRows = Math.min(10, 3 + Math.floor(S.floor / 2));
  }
  for (let row = 1; row < totalRows; row++) {
    for (let col = 0; col < 3; col++) {
      const k = pool[Math.floor(Math.random() * pool.length)] || triggerEnemy.type;
      const e = makeEnemy(k, 0, 0);
      e.row = row; e.col = col;
      enemies.push(e);
    }
  }
  return enemies;
}

function startBattle(triggerEnemy) {
  S.mode = 'battle';
  S.deck = [...S.deck, ...S.discard];
  S.discard = [];
  shuffle(S.deck);
  const enemies = spawnEnemyGroup(triggerEnemy);
  S.battle = {
    enemies,
    originalEnemyId: triggerEnemy.id,
    hand: [],
    discard: [],
    lastMana: 0,
    cardsPlayedThisTurn: 0,
    comboMul: 1.0,
    comboCount: 0,
    block: 0,
    enemyDmgMod: 0,
    mana: getMaxMana(),
    maxMana: getMaxMana(),
    nextAttackBuffMul: 1.0,
    nextAttackBonusHits: 0,
    nextAttackLucky: false,
  };
  if (S.testMode && S.testStartBlock > 0) S.battle.block = S.testStartBlock;
  for (let i = 0; i < getHandSize(); i++) {
    const c = drawOne();
    if (c) S.battle.hand.push(c);
  }
  $('#battle').classList.remove('hidden');
  $('#battle-log').innerHTML = '';
  const prefix = triggerEnemy.boss ? '👑 BOSS' : '';
  logBattle('sys', `${prefix} ${enemies.length}体と遭遇!`);
  enemies.forEach(e => {
    const abilities = abilityBadges(e);
    logBattle('sys', `  ${e.sprite} ${e.name} HP ${e.hp} ATK ${e.dmg}${abilities.length ? ' [' + abilities.join(' ') + ']' : ''}`);
  });
  renderBattle();
}

function renderBattle() {
  if (!S.battle) return;
  const B = S.battle;
  checkAndPromoteRows();
  const isBoss = B.enemies.some(e => e.boss);
  const battleEl = $('#battle');
  battleEl.classList.toggle('boss-battle', isBoss);

  // Render enemy formation (front + middle + back rows)
  const frontEl = $('#enemy-front-row');
  const middleEl = $('#enemy-middle-row');
  const backEl = $('#enemy-back-row');
  if (frontEl) frontEl.innerHTML = '';
  if (middleEl) middleEl.innerHTML = '';
  if (backEl) backEl.innerHTML = '';
  B.enemies.forEach(e => {
    // Skip dead enemies (removed from board) and off-screen rows
    if (e.hp <= 0) return;
    if (e.row > 2) return;
    const slot = document.createElement('div');
    let promoteClass = '';
    if (e.justPromoted) {
      // Choose animation by source row:
      //   row 1→0: "from-middle" (middle slides into front, grows)
      //   row 2→1: "from-back"  (back slides into middle, grows)
      //   row 3→2: "fade-in"    (off-screen → back position, fade in only)
      if (e.promoteFrom === 1) promoteClass = ' promote-from-middle';
      else if (e.promoteFrom === 2) promoteClass = ' promote-from-back';
      else promoteClass = ' promote-fade-in';
    }
    slot.className = 'enemy-slot' + (e.boss ? ' boss-slot' : '') + promoteClass;
    if (e.justPromoted) { e.justPromoted = false; e.promoteFrom = null; }
    slot.id = `enemy-slot-${e.id}`;
    slot.dataset.enemyId = e.id;
    const baseEff = (e.dmg > 0) ? Math.max(1, e.dmg + B.enemyDmgMod) : Math.max(0, e.dmg + B.enemyDmgMod);
    const effDmg = baseEff + (e.berserk ? Math.floor((e.hpMax - e.hp) / 3) : 0);
    const pct = Math.max(0, e.hp / e.hpMax * 100);
    slot.innerHTML = `
      <div class="enemy-sprite ${e.boss ? 'boss-portrait' : ''}">${spriteHtml(`enemy_${e.type}`, e.sprite)}</div>
      <div class="enemy-name">${e.boss ? '👑 ' : ''}${e.name}</div>
      <div class="enemy-hp-bar"><div class="fill" style="width:${pct}%"></div></div>
      <div class="enemy-hp-text">${Math.max(0, e.hp)}/${e.hpMax} · ATK ${effDmg}</div>
      <div class="enemy-badges">${abilityBadges(e).map(t => `<span class="badge">${t}</span>`).join('')}</div>
    `;
    const target = (e.row === 0) ? frontEl : (e.row === 1) ? middleEl : backEl;
    if (target) target.appendChild(slot);
  });

  $('#combo-mul').textContent = `×${B.comboMul.toFixed(2)}`;
  const lastManaDisplay = B.cardsPlayedThisTurn === 0 ? '-' : (B.lastMana < 0 ? '🌀any' : B.lastMana);
  $('#last-mana').textContent = lastManaDisplay;
  $('#player-block').textContent = B.block;

  // Player HP/Mana panel
  $('#battle-player-hp').textContent = `${S.player.hp}/${S.player.hpMax}`;
  const hpPctP = Math.max(0, S.player.hp / S.player.hpMax * 100);
  $('#battle-player-hp-bar .fill').style.width = hpPctP + '%';
  $('#player-mana').textContent = `${B.mana}/${B.maxMana}`;
  const manaPct = Math.max(0, B.mana / B.maxMana * 100);
  $('#battle-player-mana-bar .fill').style.width = manaPct + '%';

  // show next-attack buffs
  let buffEl = $('#player-buffs');
  if (!buffEl) {
    buffEl = document.createElement('div');
    buffEl.id = 'player-buffs';
    $('.combo-meter').appendChild(buffEl);
  }
  const buffs = [];
  if (B.nextAttackBuffMul > 1.0) buffs.push(`💪 +${Math.round((B.nextAttackBuffMul - 1) * 100)}%`);
  if (B.nextAttackBonusHits > 0) buffs.push(`🎯 +${B.nextAttackBonusHits}弾`);
  if (B.nextAttackLucky) buffs.push('🍀 Crit');
  buffEl.innerHTML = buffs.map(t => `<span class="badge buff">${t}</span>`).join('');

  const handEl = $('#battle-hand');
  handEl.innerHTML = '';
  B.hand.forEach((handCard, i) => {
    const def = CARDS[handCard.key];
    const isWildTagged = handCard.wild && def.type !== 'wild';
    const unaffordable = def.mana > 0 && B.mana < def.mana && !isWildTagged && def.type !== 'wild';
    const c = document.createElement('div');
    c.className = `card type-${def.type}`
      + (def.type === 'wild' ? ' wild' : '')
      + (isWildTagged ? ' wild-tag' : '')
      + (def.evolved ? ' evolved' : '')
      + (unaffordable ? ' unaffordable' : '');
    c.innerHTML = `
      ${isWildTagged ? '<div class="wild-marker">🌀</div>' : ''}
      ${def.evolved ? '<div class="evolved-marker">✨</div>' : ''}
      <div class="mana">${def.type === 'wild' ? '?' : def.mana}</div>
      <div class="icon">${spriteHtml(`card_${handCard.key}`, def.icon)}</div>
      <div class="name">${def.name}</div>
      <div class="desc">${def.desc}</div>
    `;
    c.addEventListener('click', () => playCardWithAnimation(i));
    attachCardTooltip(c, handCard.key, { wild: isWildTagged });
    handEl.appendChild(c);
  });
  renderDiscardPile();
  renderHUD();
}

function renderDiscardPile() {
  const B = S.battle;
  const pile = $('#discard-pile');
  if (!pile || !B) return;
  // Preserve the label, clear only card entries
  pile.querySelectorAll('.discard-card').forEach(n => n.remove());
  const counts = {};
  const order = [];
  B.discard.forEach(k => {
    if (counts[k] === undefined) { counts[k] = 0; order.push(k); }
    counts[k]++;
  });
  order.forEach((key, idx) => {
    const def = CARDS[key];
    const div = document.createElement('div');
    div.className = `discard-card type-${def.type}`
      + (def.evolved ? ' evolved' : '')
      + (def.type === 'wild' ? ' wild' : '');
    const seed = (key.charCodeAt(0) * 7 + idx * 13) % 23;
    const rot = (seed % 21) - 10;
    const xOff = ((seed * 3) % 9) - 4;
    div.style.setProperty('--rot', rot + 'deg');
    div.style.setProperty('--x', xOff + 'px');
    div.style.top = (idx * 26) + 'px';
    div.style.zIndex = 100 + idx;
    div.innerHTML = `
      <div class="mini-mana">${def.type === 'wild' ? '?' : def.mana}</div>
      <div class="mini-icon">${spriteHtml(`card_${key}`, def.icon)}</div>
      <div class="mini-name">${def.name}</div>
      ${counts[key] > 1 ? `<div class="mini-count">×${counts[key]}</div>` : ''}
    `;
    div.style.pointerEvents = 'auto';
    attachCardTooltip(div, key);
    pile.appendChild(div);
  });
  // animate newest entry
  if (B.discard.length > 0 && B.lastAnimatedDiscardLen !== B.discard.length) {
    const lastKey = B.discard[B.discard.length - 1];
    const idx = order.indexOf(lastKey);
    const entries = pile.querySelectorAll('.discard-card');
    if (entries[idx]) entries[idx].classList.add('newly-added');
    B.lastAnimatedDiscardLen = B.discard.length;
  }
}

// Animated wrapper: card slides up & away, remaining cards re-layout, then real play
function playCardWithAnimation(i) {
  if (S._cardAnimating) return;
  if (!S.battle || !S.battle.hand[i]) return;
  // Mana check up front (avoid animating a card we can't play)
  const def = CARDS[S.battle.hand[i].key];
  if (def.mana > 0 && S.battle.mana < def.mana) {
    toast(`⚠️ マナ不足 (要 ${def.mana} / 現在 ${S.battle.mana})`);
    sfx('bump');
    return;
  }
  S._cardAnimating = true;
  const handEl = $('#battle-hand');
  const cardEls = Array.from(handEl.children);
  const flying = cardEls[i];
  if (flying) {
    flying.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.7, 1), opacity 0.15s ease-out';
    flying.style.transform = 'translateY(-220px) scale(0.5) rotate(10deg)';
    flying.style.opacity = '0';
    flying.style.pointerEvents = 'none';
    flying.style.zIndex = '100';
    flying.style.filter = `drop-shadow(0 0 18px ${cardEffect(S.battle.hand[i].key).c || '#ffcb6b'})`;
    // Slide remaining cards toward the gap
    cardEls.forEach((c, idx) => {
      if (idx === i) return;
      const shift = idx < i ? 70 : -70;
      c.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
      c.style.transform = `translateX(${shift}px)`;
    });
  }
  setTimeout(() => {
    S._cardAnimating = false;
    playCardFromHand(i);
  }, 140);
}

function playCardFromHand(i) {
  if (!S.battle) return;
  const B = S.battle;
  const handCard = B.hand[i];
  const def = CARDS[handCard.key];
  const isWild = (def.type === 'wild') || handCard.wild;
  const baseStep = hasPassive('comboBoost') ? 1.75 : 1.5;

  // Mana check (wilds and 0-cost cards always playable)
  if (def.mana > 0 && B.mana < def.mana) {
    toast(`⚠️ マナ不足 (要 ${def.mana} / 現在 ${B.mana})`);
    sfx('bump');
    return;
  }
  // Spend mana
  if (def.mana > 0) B.mana -= def.mana;

  if (B.cardsPlayedThisTurn === 0) {
    if (isWild) B.lastMana = -1;
    else B.lastMana = def.mana;
  } else {
    if (isWild) {
      let stepMul = baseStep;
      if (def.wildEffect === 'comboBoost') stepMul = def.mul || 2.0;
      B.comboMul *= stepMul;
      B.comboCount++;
      B.lastMana = -1;
      sfx('wild');
      flashCombo();
      callout('🌀 WILD!', '#b07afc');
      screenFlash('rgba(176, 122, 252, 0.3)');
      particlesAt('#battle-enemy-sprite', 12, '#b07afc', '🌀');
      const tag = (def.type === 'wild') ? def.name : `${def.name}(Wild)`;
      logBattle('combo', `🌀 ${tag}! コンボ継続 ×${B.comboMul.toFixed(2)} (次は何でもOK)`);
    } else if (def.mana > B.lastMana) {
      B.comboMul *= baseStep;
      B.comboCount++;
      sfx('combo');
      flashCombo();
      const prev = B.lastMana < 0 ? '🌀' : B.lastMana;
      logBattle('combo', `▲ COMBO ${prev}→${def.mana}  ×${B.comboMul.toFixed(2)}`);
      B.lastMana = def.mana;
      // Combo callouts at thresholds
      if (B.comboCount === 3) callout('🔥 NICE COMBO!', '#ff7eb6');
      else if (B.comboCount === 5) bigCallout('⚡ BIG COMBO!', '#ffcb6b');
      else if (B.comboCount === 7) bigCallout('💫 MEGA COMBO!', '#b07afc');
      else if (B.comboCount === 9) bigCallout('🎰 JACKPOT!!', '#ffcb6b');
      else if (B.comboCount >= 12 && B.comboCount % 3 === 0) {
        bigCallout(`🌟 GODLIKE ×${B.comboCount}!!`, randomHue());
        coinShower(15);
      }
      // particle burst on each combo step at all enemies
      const tgt = leftmostAlive(B);
      if (tgt) particlesAt(`#enemy-slot-${tgt.id} .enemy-sprite`, 8, randomHue(), '✦');
      screenFlash(`${randomHue()}33`, 200);
    } else {
      B.comboMul = 1.0;
      B.comboCount = 0;
      sfx('bump');
      logBattle('sys', `× コンボ途切れ (${B.lastMana}→${def.mana})`);
      B.lastMana = def.mana;
    }
  }
  B.cardsPlayedThisTurn++;

  applyCardEffect(def, handCard.key);
  B.hand.splice(i, 1);
  B.discard.push(handCard.key);

  if (S.player.hp <= 0) { gameOver(); return; }
  if (aliveEnemies(B).length === 0) { tryReviveOrSplitOrWin(); return; }
  renderBattle();
}

function attackOneEnemy(e, rawDmg, source, cardKey) {
  const B = S.battle;
  let dmg = rawDmg;
  e.hp = Math.max(0, e.hp - dmg);
  const fx = cardEffect(cardKey);
  if (e.row > 2) {
    logBattle('dmg', `(裏列) ${e.sprite} ${source} → ${dmg}`);
    return;
  }
  // Card-specific sound
  sfx(fx.s || 'attack');
  const sel = `#enemy-slot-${e.id} .enemy-sprite`;
  // Projectile flies from hand to target (if defined)
  if (fx.proj) spawnProjectile(fx.proj, fx.c, sel);
  // Play impact effect at the target (CSS effect, or video if available)
  const impactFx = fx.impact || fx.fx;
  const impactDelay = fx.proj ? 280 : 0;
  if (impactFx && impactFx !== 'projectile') {
    setTimeout(() => playFx(impactFx, sel, fx.c), impactDelay);
  }
  // Damage popup + particles + shake after projectile flight
  setTimeout(() => {
    sfx('hit');
    const popSize = dmg >= 50 ? 48 : dmg >= 25 ? 38 : dmg >= 12 ? 30 : 24;
    const popColor = dmg >= 50 ? '#ffcb6b' : dmg >= 25 ? '#ff7eb6' : '#ffaaaa';
    popupAt(sel, `-${dmg}`, popColor, popSize);
    const particleCount = Math.min(30, 5 + Math.floor(dmg / 3));
    particlesAt(sel, particleCount, fx.c, fx.p || '✦');
    particlesAt(sel, 4, popColor, '✦');
    flashShake(sel);
  }, impactDelay);
  if (dmg >= 30) {
    screenFlash('rgba(255, 126, 182, 0.4)');
    hitStop(70);
  }
  if (dmg >= 60) bigCallout('💥 MEGA HIT!', '#ffcb6b');
  logBattle('dmg', `${e.sprite} ${source} → ${dmg}`);

  if (e.reflectPct && e.hp > 0) {
    const reflected = Math.ceil(dmg * e.reflectPct);
    S.player.hp -= reflected;
    sfx('reflect');
    popupAt('#hp', `-${reflected} 反射`, '#c044ff');
    logBattle('dmg', `🪞 反射 -${reflected} HP`);
  }
  if (e.hp <= 0) {
    callout(`${e.sprite} 撃破!`, '#6cf0c2', 700);
    particlesAt(sel, 20, '#6cf0c2', '✦');
    // Vampire passive: lifeleech per kill
    if (hasPassive('lifeleech')) {
      const before = S.player.hp;
      S.player.hp = Math.min(S.player.hpMax, S.player.hp + 4);
      const healed = S.player.hp - before;
      if (healed > 0) popupAt('#hp', `+${healed} 🧛`, '#6cf0c2');
    }
  }
}

// Distribute attack across target enemies (one rawDmg per target).
// Returns whether any enemy was hit.
function attackTargets(targets, rawDmgPerTarget, source, cardKey, isAttackCard = true) {
  if (!targets || targets.length === 0) return false;
  const B = S.battle;
  let dmg = rawDmgPerTarget;
  if (isAttackCard) {
    if (B.nextAttackBuffMul > 1.0) {
      dmg = Math.round(dmg * B.nextAttackBuffMul);
      logBattle('sys', `💪 +${Math.round((B.nextAttackBuffMul - 1) * 100)}% buff 適用`);
      B.nextAttackBuffMul = 1.0;
    }
  }
  if (S.testMode && S.testCardMul !== 1.0) {
    dmg = Math.max(1, Math.round(dmg * S.testCardMul));
  }
  targets.forEach(t => attackOneEnemy(t, dmg, source, cardKey));
  return true;
}

function applyCardEffect(def, cardKey) {
  const B = S.battle;
  const mul = B.comboMul;
  const targets = pickTargets(B, def);

  // Helper: roll crit on attack damage
  function rollDmg(baseDmg) {
    let dmg = Math.round(baseDmg * mul);
    let isCrit = false;
    if (B.nextAttackLucky) {
      isCrit = true;
      B.nextAttackLucky = false;
    } else if (def.crit && Math.random() < def.crit) {
      isCrit = true;
    }
    if (isCrit) {
      dmg *= 2;
      sfx('crit');
      callout('💥 CRITICAL!', '#ffcb6b');
      screenFlash('rgba(255, 203, 107, 0.4)');
      if (def.critHeal) {
        S.player.hp = Math.min(S.player.hpMax, S.player.hp + def.critHeal);
        popupAt('#hp', `+${def.critHeal}`, '#6cf0c2');
      }
    }
    return dmg;
  }

  if (def.type === 'attack') {
    let actualTargets = targets;
    const baseDmg = rollDmg(def.dmg);
    attackTargets(actualTargets, baseDmg, def.name, cardKey);
    // Bonus hits with geometric damage decay (0.6^h)
    const bonusHits = B.nextAttackBonusHits || 0;
    B.nextAttackBonusHits = 0;
    if (bonusHits > 0) {
      bigCallout(`🎯 ${bonusHits + 1}-HIT BARRAGE!`, '#ffcb6b');
      screenFlash('rgba(255, 203, 107, 0.35)', 300);
      for (let h = 1; h <= bonusHits; h++) {
        const factor = Math.pow(0.6, h);
        const dmg = Math.max(1, Math.round(baseDmg * factor));
        setTimeout(() => {
          const stillAlive = actualTargets.filter(e => e.hp > 0);
          if (stillAlive.length) attackTargets(stillAlive, dmg, `${def.name}弾${h + 1}`, cardKey);
        }, h * 110);
      }
    }
    // Retrigger chance
    actualTargets.filter(e => e.hp > 0).forEach(e => {
      if (def.retrigChance && Math.random() < def.retrigChance) {
        attackTargets([e], baseDmg, `${def.name}🔄`, cardKey);
      }
    });
    // Bonus explode chance
    if (def.bonusChance) {
      const explodeTargets = actualTargets.filter(e => e.hp > 0 && Math.random() < def.bonusChance);
      if (explodeTargets.length) {
        logBattle('sys', `💥 爆発 ×${explodeTargets.length}`);
        attackTargets(explodeTargets, def.bonusDmg, `${def.name}爆発`, cardKey);
      }
    }
  } else if (def.type === 'block') {
    B.block += def.amt;
    sfx('block');
    popupAt('#hp', `+${def.amt} BLK`, '#9eb8ff');
    logBattle('sys', `ブロック +${def.amt} (計 ${B.block})`);
  } else if (def.type === 'heal') {
    const before = S.player.hp;
    S.player.hp = Math.min(S.player.hpMax, S.player.hp + def.amt);
    const healed = S.player.hp - before;
    sfx('heal');
    popupAt('#hp', `+${healed}`, '#6cf0c2');
    logBattle('heal', `HP +${healed}`);
  } else if (def.type === 'drain') {
    const baseDmg = rollDmg(def.dmg);
    attackTargets(targets, baseDmg, def.name, cardKey);
    const before = S.player.hp;
    S.player.hp = Math.min(S.player.hpMax, S.player.hp + def.heal);
    const healed = S.player.hp - before;
    if (healed > 0) {
      popupAt('#hp', `+${healed}`, '#6cf0c2');
      logBattle('heal', `${def.name}: HP +${healed}`);
    }
    if (def.debuff) B.enemyDmgMod -= def.debuff;
  } else if (def.type === 'burn') {
    const baseDmg = rollDmg(def.dmg);
    attackTargets(targets, baseDmg, def.name, cardKey);
    const burnBoost = hasPassive('burnBoost') ? 2 : 0;
    const burnDmg = Math.round(def.burn.dmg * mul) + burnBoost;
    targets.forEach(e => {
      if (e.hp <= 0) return;
      e.burnStacks = (e.burnStacks || 0) + def.burn.turns;
      e.burnDmg = Math.max(e.burnDmg || 0, burnDmg);
    });
    logBattle('dmg', `🔥 Burn ${def.burn.turns}T (${burnDmg}/T) × ${targets.length}`);
  } else if (def.type === 'debuff') {
    const baseDmg = rollDmg(def.dmg);
    attackTargets(targets, baseDmg, def.name, cardKey);
    B.enemyDmgMod -= def.debuff;
    logBattle('sys', `${def.name}: 敵ATK -${def.debuff}`);
  } else if (def.type === 'erase') {
    const exeThreshold = (def === CARDS.gorgeous_moon) ? 0.5 : PENTAGRAM_EXECUTE_THRESHOLD;
    const executable = targets.filter(e => !e.boss && (e.hp / e.hpMax) <= exeThreshold);
    const others = targets.filter(e => !executable.includes(e));
    if (executable.length) {
      sfx('execute');
      bigCallout(`☠️ EXECUTE ×${executable.length}!`, '#ff4060');
      screenFlash('rgba(192, 32, 64, 0.55)', 500);
      hitStop(150);
      executable.forEach(e => {
        particlesAt(`#enemy-slot-${e.id} .enemy-sprite`, 30, '#ff4060', '⛧');
        attackOneEnemy(e, e.hp, def.name, cardKey);
      });
    }
    if (others.length) {
      attackTargets(others, Math.round(def.dmg * mul), def.name, cardKey);
    }
  } else if (def.type === 'freeze') {
    targets.forEach(e => {
      e.frozen = true;
      popupAt(`#enemy-slot-${e.id} .enemy-sprite`, '⏰', '#9eb8ff');
    });
    sfx('freeze');
    logBattle('sys', `${def.name}: ${targets.length}体凍結!`);
  } else if (def.type === 'buff') {
    B.nextAttackBuffMul = Math.max(B.nextAttackBuffMul, def.buffMul);
    sfx('block');
    logBattle('sys', `${def.name}: 次の攻撃 ×${def.buffMul}`);
  } else if (def.type === 'luck') {
    B.nextAttackLucky = true;
    sfx('wild');
    logBattle('sys', `🍀 ${def.name}: 次の攻撃が確定クリ`);
  } else if (def.type === 'duplicate') {
    const add = def.amt || 1;
    B.nextAttackBonusHits = (B.nextAttackBonusHits || 0) + add;
    sfx('wild');
    logBattle('sys', `🎯 ${def.name}: 次の攻撃 +${add}弾 (累積 +${B.nextAttackBonusHits}弾)`);
  } else if (def.type === 'draw') {
    for (let i = 0; i < def.amt; i++) {
      const c = drawOne();
      if (c) B.hand.push(c);
    }
    sfx('draw');
    logBattle('sys', `${def.name}: +${def.amt} ドロー`);
  } else if (def.type === 'maxhp') {
    S.player.hpMax += def.amt;
    S.player.hp += def.amt;
    sfx('heal');
    popupAt('#hp', `MAX +${def.amt}`, '#6cf0c2');
    logBattle('heal', `${def.name}: 最大HP +${def.amt}`);
  } else if (def.type === 'support') {
    sfx('combo');
    logBattle('sys', `${def.name}: (チェーン繋ぎ)`);
  } else if (def.type === 'managen') {
    B.mana += def.amt;
    sfx('draw');
    popupAt('#player-mana', `+${def.amt} 💧`, '#9eb8ff');
    logBattle('sys', `${def.name}: マナ +${def.amt} (現在 ${B.mana})`);
  } else if (def.type === 'wild') {
    const we = def.wildEffect;
    if (we === 'heal') {
      const before = S.player.hp;
      S.player.hp = Math.min(S.player.hpMax, S.player.hp + def.amt);
      const healed = S.player.hp - before;
      popupAt('#hp', `+${healed}`, '#6cf0c2');
      logBattle('heal', `${def.name}: HP +${healed}`);
    } else if (we === 'draw') {
      for (let i = 0; i < def.amt; i++) {
        const c = drawOne();
        if (c) B.hand.push(c);
      }
      logBattle('sys', `${def.name}: +${def.amt} ドロー`);
    } else if (we === 'damage') {
      attackTargets(targets, Math.round(def.dmg * mul), def.name, cardKey);
    } else if (we === 'freeze') {
      targets.forEach(e => { e.frozen = true; });
      sfx('freeze');
      logBattle('sys', `${def.name}: ${targets.length}体凍結!`);
    } else if (we === 'luck') {
      B.nextAttackLucky = true;
      logBattle('sys', `${def.name}: 次の攻撃が確定クリ`);
    } else if (we === 'mana') {
      B.mana += def.amt || 3;
      logBattle('sys', `${def.name}: マナ +${def.amt || 3} (現在 ${B.mana})`);
    } else {
      const t = leftmostAlive(B);
      if (t) popupAt(`#enemy-slot-${t.id} .enemy-sprite`, '🌀', '#b07afc');
    }
  }
}

function endBattleTurn() {
  if (!S.battle) return;
  const B = S.battle;

  // 1. burn tick on each enemy with stacks
  for (const e of B.enemies) {
    if (e.hp <= 0) continue;
    if (e.burnStacks > 0) {
      sfx('burn');
      e.hp = Math.max(0, e.hp - e.burnDmg);
      popupAt(`#enemy-slot-${e.id} .enemy-sprite`, `-${e.burnDmg}🔥`, '#ff7e2b');
      logBattle('dmg', `🔥 ${e.sprite} Burn -${e.burnDmg} (残${e.burnStacks - 1}T)`);
      e.burnStacks--;
      if (e.burnStacks === 0) e.burnDmg = 0;
    }
  }
  if (aliveEnemies(B).length === 0) { tryReviveOrSplitOrWin(); return; }

  // 2. enemy regen
  for (const e of B.enemies) {
    if (e.hp <= 0) continue;
    if (e.healPerTurn) {
      const healed = Math.min(e.healPerTurn, e.hpMax - e.hp);
      e.hp += healed;
      if (healed > 0) {
        popupAt(`#enemy-slot-${e.id} .enemy-sprite`, `+${healed}`, '#6cf0c2');
      }
    }
  }

  // 3. only the front row (row 0) attacks. Back/hidden rows wait their turn.
  const blockBefore = B.block;
  let totalDmg = 0;
  for (const e of B.enemies) {
    if (e.hp <= 0) continue;
    if (e.row !== 0) continue;
    if (e.frozen) {
      e.frozen = false;
      logBattle('sys', `⏰ ${e.sprite} ${e.name} は動けない`);
      continue;
    }
    // Floor enemy ATK at 1 (unless spawn was already 0, e.g. test mode mul=0)
    let baseDmg = (e.dmg > 0) ? Math.max(1, e.dmg + B.enemyDmgMod) : Math.max(0, e.dmg + B.enemyDmgMod);
    if (e.berserk) baseDmg += Math.floor((e.hpMax - e.hp) / 3);
    let dmg = baseDmg;
    const blocked = Math.min(B.block, dmg);
    dmg -= blocked;
    B.block = Math.max(0, B.block - blocked);
    if (dmg > 0) {
      S.player.hp -= dmg;
      sfx('hit');
      popupAt('#hp', `-${dmg}`, '#f06c8e');
      flashScreen();
      logBattle('dmg', `${e.sprite} ${e.name} → -${dmg}${blocked ? ` (${blocked}🛡️)` : ''}`);
      totalDmg += dmg;
    } else {
      logBattle('sys', `${e.sprite} ${e.name} ブロック!`);
    }
    if (e.curseOnHit && B.hand.length > 0) {
      const idx = Math.floor(Math.random() * B.hand.length);
      const lost = B.hand.splice(idx, 1)[0];
      B.discard.push(lost.key);
      sfx('curse');
      logBattle('sys', `💀 呪い! 手札 ${CARDS[lost.key].name} を失う`);
    }
    if (S.player.hp <= 0) break;
  }
  // Warrior trait: block halves instead of fully resetting
  if (hasPassive('blockPersist')) {
    B.block = Math.floor(blockBefore / 2);
  } else if (B.block === blockBefore) {
    // No attacks landed — still reset block end of turn
    B.block = 0;
  } else {
    // Some block was absorbed; let it carry the remainder unless passive
    if (!hasPassive('blockPersist')) B.block = 0;
  }

  if (S.player.hp <= 0) { gameOver(); return; }

  B.lastMana = 0;
  B.cardsPlayedThisTurn = 0;
  B.comboMul = 1.0;
  B.comboCount = 0;
  B.mana = B.maxMana;
  while (B.hand.length < getHandSize()) {
    const c = drawOne();
    if (!c) break;
    B.hand.push(c);
  }
  renderBattle();
  const maxRow = Math.max(...B.enemies.filter(e => e.hp > 0).map(e => e.row), 0);
  logBattle('sys', `--- プレイヤーターン (マナ ${B.mana}/${B.maxMana}, 残り${aliveEnemies(B).length}体 / ${maxRow + 1}列) ---`);
}

function tryReviveOrSplitOrWin() {
  const B = S.battle;
  // Process revives + splits for any enemy that just died
  let triggered = false;
  for (const e of B.enemies) {
    if (e.hp > 0) continue;
    if (e.reviveOnce && !e.revived) {
      e.revived = true;
      e.hp = Math.floor(e.hpMax * 0.5);
      e.burnStacks = 0; e.burnDmg = 0;
      sfx('revive');
      toast(`☠️ ${e.name} 復活!`);
      logBattle('sys', `☠️ ${e.name} 復活 (HP ${e.hp}/${e.hpMax})`);
      triggered = true;
    } else if (e.splitInto && !e.split) {
      const baseMini = ENEMIES[e.splitInto];
      const hpMul = 1 + (S.floor - 1) * 0.20;
      const dmgMul = 1 + (S.floor - 1) * 0.10;
      const testHpMul = S.testMode ? S.testEnemyHpMul : 1;
      const testDmgMul = S.testMode ? S.testEnemyDmgMul : 1;
      const mini = {
        id: nextEnemyId++,
        type: e.splitInto,
        sprite: baseMini.sprite,
        name: baseMini.name,
        hp: Math.max(1, Math.round(baseMini.hp * hpMul * testHpMul)),
        hpMax: Math.max(1, Math.round(baseMini.hp * hpMul * testHpMul)),
        dmg: Math.max(0, Math.round(baseMini.dmg * dmgMul * testDmgMul)),
        xp: Math.round(baseMini.xp * hpMul),
        split: true,
        row: e.row, col: e.col,
        burnStacks: 0, burnDmg: 0,
        healPerTurn: 0, reviveOnce: false, revived: true,
        berserk: false, reflectPct: 0, curseOnHit: false,
        splitInto: null, frozen: false,
      };
      // Replace dead slime with mini
      const idx = B.enemies.indexOf(e);
      B.enemies[idx] = mini;
      sfx('split');
      toast(`🟢 分裂!`);
      logBattle('sys', `🟢 ${e.name} 分裂 → ${mini.name}`);
      triggered = true;
    }
  }
  if (triggered) {
    renderBattle();
    if (aliveEnemies(B).length === 0) winBattle();
    return;
  }
  winBattle();
}

function winBattle() {
  const B = S.battle;
  sfx('victory');
  // XP = single trigger enemy's value (1 encounter = 1 enemy worth, not the sum)
  const trigger = B.enemies.find(e => e.id === B.originalEnemyId) || B.enemies[0];
  const totalXp = trigger ? (trigger.xp || 0) : 0;
  const hadBoss = B.enemies.some(e => e.boss);
  const wasReaper = S.reaperEncounter;
  const wasStageReaper = S.reaperStageTransition;
  S.reaperEncounter = false;
  S.reaperStageTransition = false;

  // Stage transition reaper — advance regardless
  if (wasStageReaper) {
    bigCallout('✦ 死神を退けて次階層へ ✦', '#6cf0c2');
    screenFlash('rgba(108, 240, 194, 0.5)', 700);
    coinShower(50);
    S.deck = [...S.deck, ...B.hand.map(c => c.key), ...B.discard];
    shuffle(S.deck);
    setTimeout(() => {
      $('#battle').classList.add('hidden');
      $('#battle').classList.remove('boss-battle');
      S.mode = 'explore';
      S.battle = null;
      // Stage clear → advance (handles cycle wrap for stage 8)
      nextFloor();
      // Small heal as reward
      S.player.hp = Math.min(S.player.hpMax, S.player.hp + Math.floor(S.player.hpMax * 0.3));
      renderHUD();
    }, 1100);
    return;
  }
  if (wasReaper) {
    bigCallout('💀 死神を退けた...しかし', '#ff4060');
    screenFlash('rgba(64, 0, 16, 0.7)', 700);
  } else if (hadBoss && S.stageFloor === 5) {
    const plus = S.cycle > 0 ? ` +${S.cycle}` : '';
    bigCallout(`✦ STAGE ${S.stage}${plus} CLEAR! ✦`, '#ffcb6b');
    screenFlash('rgba(255, 203, 107, 0.6)', 800);
    coinShower(80);
    if (S.stage >= MAX_STAGE) {
      setTimeout(() => bigCallout(`🏆 LOOP ${S.cycle} CLEAR! Going to +${S.cycle + 1}...`, '#ffcb6b'), 900);
    }
  } else if (hadBoss) {
    bigCallout('👑 BOSS DOWN!', '#ffcb6b');
    screenFlash('rgba(255, 203, 107, 0.6)', 700);
    coinShower(60);
  } else {
    callout(`✦ VICTORY ✦`, '#6cf0c2');
    coinShower(25);
  }
  logBattle('sys', `★ ${B.enemies.length}体撃破! +${totalXp} XP`);
  S.deck = [...S.deck, ...B.hand.map(c => c.key), ...B.discard];
  shuffle(S.deck);
  S.enemies = S.enemies.filter(en => en.id !== B.originalEnemyId);
  S.player.xp += totalXp;

  if (hadBoss) {
    S.gems++;
    sfx('gem');
    toast(`👑 ボス撃破! 💎 +1 (計 ${S.gems})`);
  }

  setTimeout(() => {
    $('#battle').classList.add('hidden');
    $('#battle').classList.remove('boss-battle');
    if (S.testBattleOnly) { returnFromTestBattle(); toast('✦ 戦闘テスト完了'); return; }
    S.mode = 'explore';
    S.battle = null;
    renderDungeon();
    renderHUD();
    if (!tryEvolve()) tryLevelup();
  }, 800);
}

function flee() {
  if (!S.battle) return;
  const hasBoss = S.battle.enemies.some(e => e.boss);
  if (hasBoss && !S.testBattleOnly) {
    toast('👑 ボスからは逃げられない!');
    return;
  }
  if (!S.testBattleOnly) {
    S.player.hp -= 3;
    if (S.player.hp <= 0) { gameOver(); return; }
  }
  // Flee: light & quick — enemy scene shrinks into the distance
  sfx('whoosh');
  sfx('step');
  setTimeout(() => sfx('step'), 100);
  S.deck = [...S.deck, ...S.battle.hand.map(c => c.key), ...S.battle.discard];
  shuffle(S.deck);
  const battleEl = $('#battle');
  battleEl.classList.add('fleeing');
  setTimeout(() => {
    battleEl.classList.remove('fleeing');
    battleEl.classList.add('hidden');
    if (S.testBattleOnly) { returnFromTestBattle(); toast('戦闘中止'); return; }
    S.mode = 'explore';
    S.battle = null;
    renderHUD();
    toast('💨 逃走 (-3 HP)');
  }, 280);
}

// ========================================================================
// EVOLVE (VC Wiki recipes)
// primary card + secondary card + 💎 gem → evolved card
// ========================================================================
function findEvolution() {
  if (S.gems <= 0) return null;
  const allCards = [...S.deck, ...S.discard];
  for (const evo of EVOLUTIONS) {
    if (!allCards.includes(evo.primary)) continue;
    const matchedSecondary = evo.secondaries.find(s => allCards.includes(s));
    if (matchedSecondary) return { ...evo, matchedSecondary };
  }
  return null;
}

function tryEvolve() {
  const evo = findEvolution();
  if (!evo) return false;
  S.mode = 'evolve';
  S.pendingEvolution = evo;
  renderEvolvePrompt();
  return true;
}

function renderEvolvePrompt() {
  const evo = S.pendingEvolution;
  const display = $('#evolve-display');
  display.innerHTML = '';
  const makeCardEl = (key) => {
    const def = CARDS[key];
    const c = document.createElement('div');
    c.className = `card type-${def.type}` + (def.evolved ? ' evolved' : '');
    c.innerHTML = `
      ${def.evolved ? '<div class="evolved-marker">✨</div>' : ''}
      <div class="mana">${def.type === 'wild' ? '?' : def.mana}</div>
      <div class="icon">${spriteHtml(`card_${key}`, def.icon)}</div>
      <div class="name">${def.name}</div>
      <div class="desc">${def.desc}</div>
    `;
    attachCardTooltip(c, key);
    return c;
  };
  display.appendChild(makeCardEl(evo.primary));
  const plus = document.createElement('div');
  plus.className = 'evolve-arrow';
  plus.textContent = '+';
  display.appendChild(plus);
  display.appendChild(makeCardEl(evo.matchedSecondary));
  const gemEl = document.createElement('div');
  gemEl.className = 'evolve-arrow gem-cost';
  gemEl.textContent = '+ 💎';
  display.appendChild(gemEl);
  const arrow = document.createElement('div');
  arrow.className = 'evolve-arrow';
  arrow.textContent = '→';
  display.appendChild(arrow);
  display.appendChild(makeCardEl(evo.result));
  $('#evolve-prompt').classList.remove('hidden');
  $('#evolve-gem-count').textContent = `💎 ${S.gems}`;
  sfx('evolve');
}

function confirmEvolve() {
  const evo = S.pendingEvolution;
  if (!evo) return;
  const removeOne = (key) => {
    let idx = S.deck.indexOf(key);
    if (idx >= 0) { S.deck.splice(idx, 1); return true; }
    idx = S.discard.indexOf(key);
    if (idx >= 0) { S.discard.splice(idx, 1); return true; }
    return false;
  };
  removeOne(evo.primary);
  removeOne(evo.matchedSecondary);
  S.deck.push(evo.result);
  S.gems--;
  shuffle(S.deck);
  $('#evolve-prompt').classList.add('hidden');
  S.pendingEvolution = null;
  S.mode = 'explore';
  renderHUD();
  toast(`✨ 進化! ${CARDS[evo.result].name}`);
  if (!tryEvolve()) tryLevelup();
}

function skipEvolve() {
  $('#evolve-prompt').classList.add('hidden');
  S.pendingEvolution = null;
  S.mode = 'explore';
  tryLevelup();
}

// ========================================================================
// LEVELUP
// ========================================================================
function tryLevelup() {
  if (S.player.xp >= xpNeeded()) {
    S.player.xp -= xpNeeded();
    S.player.level++;
    // HP no longer increases on levelup (deck-only progression)
    offerLevelup();
  }
}

function offerLevelup() {
  sfx('levelup');
  bigCallout('⭐ LEVEL UP! ⭐', '#ffcb6b');
  screenFlash('rgba(255, 203, 107, 0.45)', 500);
  S.mode = 'levelup';
  const choices = [];
  while (choices.length < 3) {
    const pick = POOL_FOR_LEVELUP[Math.floor(Math.random() * POOL_FOR_LEVELUP.length)];
    choices.push(pick);
  }
  const container = $('#levelup-choices');
  container.innerHTML = '';
  choices.forEach(key => {
    const def = CARDS[key];
    const c = document.createElement('div');
    c.className = `card lvl-card type-${def.type}` + (def.type === 'wild' ? ' wild' : '');
    c.innerHTML = `
      <div class="mana">${def.type === 'wild' ? '?' : def.mana}</div>
      <div class="icon">${spriteHtml(`card_${key}`, def.icon)}</div>
      <div class="name">${def.name}</div>
      <div class="desc">${def.desc}</div>
    `;
    c.addEventListener('click', () => pickLevelup(key));
    attachCardTooltip(c, key);
    container.appendChild(c);
  });
  $('#levelup').classList.remove('hidden');
}

function pickLevelup(key) {
  S.deck.push(key);
  shuffle(S.deck);
  $('#levelup').classList.add('hidden');
  S.mode = 'explore';
  renderHUD();
  toast(`+ ${CARDS[key].name}`);
  if (tryEvolve()) return;
  if (S.player.xp >= xpNeeded()) setTimeout(tryLevelup, 400);
}

function skipLevelup() {
  $('#levelup').classList.add('hidden');
  S.mode = 'explore';
  renderHUD();
  toast('スキップ');
  if (S.player.xp >= xpNeeded()) setTimeout(tryLevelup, 400);
}

// ========================================================================
// TITLE / TEST MODE
// ========================================================================
function hideAllOverlays() {
  ['#title-screen','#test-mode','#stageselect','#charselect','#battle','#levelup','#evolve-prompt','#gameover']
    .forEach(s => $(s) && $(s).classList.add('hidden'));
}

function showTitle() {
  S.mode = 'title';
  hideAllOverlays();
  $('#title-screen').classList.remove('hidden');
}

function startGameMode() {
  // Reset test mode flags for normal play
  S.testMode = false;
  S.testEnemyHpMul = 1.0;
  S.testEnemyDmgMul = 1.0;
  S.testManaOverride = null;
  S.testCardMul = 1.0;
  S.testHandSize = null;
  S.testStartBlock = 0;
  S.testRowsOverride = null;
  hideAllOverlays();
  showStageSelect();
}

let selectedStage = 1;
function showStageSelect() {
  S.mode = 'stageselect';
  try {
    const v = parseInt(localStorage.getItem('vc_proto_maxStage') || '1');
    if (!isNaN(v) && v >= 1) S.maxStageUnlocked = Math.min(MAX_STAGE, v);
    S.maxCycleReached = parseInt(localStorage.getItem('vc_proto_maxCycle') || '0') || 0;
  } catch (e) {}
  const debug = (() => { try { return localStorage.getItem('vc_proto_debug') === '1'; } catch (e) { return false; } })();
  const effectiveMax = debug ? MAX_STAGE : S.maxStageUnlocked;
  selectedStage = 1;
  const container = $('#stage-choices');
  container.innerHTML = '';
  for (let n = 1; n <= MAX_STAGE; n++) {
    const def = STAGES[n];
    const unlocked = n <= effectiveMax;
    const div = document.createElement('div');
    div.className = 'stage-card' + (unlocked ? '' : ' locked');
    div.innerHTML = `
      <div class="stage-num">STAGE ${n}</div>
      <div class="stage-name">${def.name}</div>
      <div class="stage-meta" style="color:${def.tint}">${unlocked ? '✦ 解放' : '🔒 未到達'}</div>
    `;
    if (unlocked) {
      div.addEventListener('click', () => pickStage(n));
    }
    container.appendChild(div);
  }
  // Display max cycle reached
  let header = $('#cycle-record');
  if (!header) {
    header = document.createElement('div');
    header.id = 'cycle-record';
    container.parentElement.insertBefore(header, container);
  }
  header.textContent = S.maxCycleReached > 0
    ? `🏆 最高記録: +${S.maxCycleReached} ループ到達`
    : `初回プレイ — クリア後は無限ループ +N で難易度UP`;
  $('#stageselect').classList.remove('hidden');
}

function pickStage(stage) {
  selectedStage = stage;
  hideAllOverlays();
  showTraitSelect();
}

let customDeck = [];

function startTestMode() {
  hideAllOverlays();
  $('#test-mode').classList.remove('hidden');
  S.mode = 'testselect';
  renderTestCardPicker();
  renderTestEnemyPicker();
  populateBattleEnemyDropdown();
  $('#test-custom-deck').onchange = () => {
    $('#test-deck-builder').classList.toggle('hidden', !$('#test-custom-deck').checked);
  };
}

function renderTestCardPicker() {
  const picker = $('#test-card-picker');
  if (!picker) return;
  picker.innerHTML = '';
  const counts = {};
  customDeck.forEach(k => counts[k] = (counts[k] || 0) + 1);
  Object.entries(CARDS).forEach(([key, def]) => {
    const div = document.createElement('div');
    div.className = `card-pick type-${def.type}` + (def.type === 'wild' ? ' wild' : '') + (def.evolved ? ' evolved' : '');
    div.innerHTML = `
      <span class="mini-mana">${def.type === 'wild' ? '?' : def.mana}</span>
      <span class="mini-icon">${spriteHtml('card_' + key, def.icon)}</span>
      <span class="mini-name">${def.name}</span>
      ${counts[key] ? `<span class="mini-count">×${counts[key]}</span>` : ''}
    `;
    div.addEventListener('click', () => {
      customDeck.push(key);
      renderTestCardPicker();
    });
    div.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const idx = customDeck.lastIndexOf(key);
      if (idx >= 0) {
        customDeck.splice(idx, 1);
        renderTestCardPicker();
      }
    });
    attachCardTooltip(div, key);
    picker.appendChild(div);
  });
  $('#test-deck-count').textContent = customDeck.length;
}

function clearTestDeck() {
  customDeck = [];
  renderTestCardPicker();
}

let selectedEnemyPool = [];
let selectedBossPool = [];
function populateBattleEnemyDropdown() {
  const sel = $('#test-battle-enemy');
  if (!sel) return;
  sel.innerHTML = '';
  Object.entries(ENEMIES).forEach(([key, def]) => {
    if (def.tier === 0) return;
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${def.sprite} ${def.name}${def.boss ? ' 👑' : ` (T${def.tier})`}`;
    sel.appendChild(opt);
  });
}

function readTestPlayerSettings() {
  const hp = Math.max(1, parseInt($('#test-hp').value) || 100);
  const mana = Math.max(1, parseInt($('#test-mana').value) || 10);
  const cardMul = Math.max(0.1, parseFloat($('#test-card-mul').value) || 1.0);
  const startBlock = Math.max(0, parseInt($('#test-start-block').value) || 0);
  const gems = Math.max(0, parseInt($('#test-gems').value) || 0);
  const handSize = Math.max(1, parseInt($('#test-hand-size').value) || 5);
  const enemyHpMul = Math.max(0.1, parseFloat($('#test-enemy-hp-mul').value) || 1.0);
  const enemyDmgMul = Math.max(0, parseFloat($('#test-enemy-dmg-mul').value) || 1.0);
  const rows = Math.max(1, Math.min(10, parseInt($('#test-rows').value) || 3));
  const allTraits = $('#test-all-traits').checked;
  const useCustomDeck = $('#test-custom-deck').checked;
  const level = Math.max(1, parseInt($('#test-level').value) || 1);
  const floor = Math.max(1, parseInt($('#test-floor').value) || 1);
  return { hp, mana, cardMul, startBlock, gems, handSize, enemyHpMul, enemyDmgMul, rows, allTraits, useCustomDeck, level, floor };
}

function applyTestPlayerSettings(p) {
  S.testMode = true;
  S.testEnemyHpMul = p.enemyHpMul;
  S.testEnemyDmgMul = p.enemyDmgMul;
  S.testManaOverride = p.mana;
  S.testCardMul = p.cardMul;
  S.testHandSize = p.handSize;
  S.testStartBlock = p.startBlock;
  S.testRowsOverride = p.rows;
  S.traits = p.allTraits ? Object.keys(TRAITS) : [];
  S.player = { x: 1, y: 1, dir: 1, hp: p.hp, hpMax: p.hp, xp: 0, level: p.level };
  S.deck = (p.useCustomDeck && customDeck.length > 0) ? [...customDeck] : [...STARTING_DECK_PLAYER];
  S.discard = [];
  S.gems = p.gems;
}

function startTestBattle() {
  const p = readTestPlayerSettings();
  applyTestPlayerSettings(p);
  S.testBattleOnly = true;
  S.floor = p.floor;
  const enemyKey = $('#test-battle-enemy').value;
  if (!enemyKey || !ENEMIES[enemyKey]) {
    toast('⚠️ 敵を選択してください');
    return;
  }
  // In battle-only test, if no enemy pool chips set, fill formation with clones of the picked enemy
  if (S.testEnemyPool.length === 0 && !ENEMIES[enemyKey].boss) {
    S.testEnemyPool = [enemyKey];
  }
  const enemy = makeEnemy(enemyKey, 0, 0);
  hideAllOverlays();
  startBattle(enemy);
}

function returnFromTestBattle() {
  S.testBattleOnly = false;
  S.battle = null;
  hideAllOverlays();
  $('#test-mode').classList.remove('hidden');
  S.mode = 'testselect';
}

function renderTestEnemyPicker() {
  const enemyEl = $('#test-enemy-pool');
  const bossEl = $('#test-boss-pool');
  if (!enemyEl || !bossEl) return;
  enemyEl.innerHTML = '';
  bossEl.innerHTML = '';
  Object.entries(ENEMIES).forEach(([key, def]) => {
    if (def.tier === 0) return; // mini variants excluded
    const div = document.createElement('div');
    div.className = 'enemy-chip' + (def.boss ? ' boss' : '');
    div.dataset.key = key;
    const pool = def.boss ? selectedBossPool : selectedEnemyPool;
    if (pool.includes(key)) div.classList.add('selected');
    div.innerHTML = `<span class="chip-sprite">${spriteHtml('enemy_' + key, def.sprite)}</span><span class="chip-name">${def.name}</span>`;
    div.addEventListener('click', () => {
      const p = def.boss ? selectedBossPool : selectedEnemyPool;
      const idx = p.indexOf(key);
      if (idx >= 0) { p.splice(idx, 1); div.classList.remove('selected'); }
      else { p.push(key); div.classList.add('selected'); }
    });
    (def.boss ? bossEl : enemyEl).appendChild(div);
  });
}

// ========================================================================
// CARD TOOLTIP (hover anywhere on a card to see details)
// ========================================================================
function showCardTooltip(key, ev, opts) {
  const def = CARDS[key];
  if (!def) return;
  const tt = $('#card-tooltip');
  if (!tt) return;
  const isWildTag = opts && opts.wild;
  tt.querySelector('.tt-mana').textContent = def.type === 'wild' ? '🌀?' : `💧${def.mana}`;
  tt.querySelector('.tt-name').textContent = def.name + (def.evolved ? ' ✨' : '');
  const tags = [`Type: ${def.type}`];
  if (isWildTag) tags.push('🌀 Wild Tag');
  if (def.evolved) tags.push('進化版');
  tt.querySelector('.tt-type').textContent = tags.join(' / ');
  tt.querySelector('.tt-desc').textContent = def.desc;
  const extra = [];
  if (def.dmg) extra.push(`基礎ダメ: ${def.dmg}`);
  if (def.amt) extra.push(`量: ${def.amt}`);
  if (def.hits) extra.push(`ヒット数: ${def.hits}`);
  if (def.heal) extra.push(`回復: ${def.heal}`);
  if (def.burn) extra.push(`🔥 Burn: ${def.burn.dmg}/T × ${def.burn.turns}T`);
  if (def.crit) extra.push(`Crit率: ${Math.round(def.crit * 100)}% (×2)`);
  if (def.critHeal) extra.push(`Crit時 HP+${def.critHeal}`);
  if (def.debuff) extra.push(`敵ATK -${def.debuff}`);
  if (def.bonusChance) extra.push(`${Math.round(def.bonusChance * 100)}% で追加 +${def.bonusDmg} ダメ`);
  if (def.retrigChance) extra.push(`${Math.round(def.retrigChance * 100)}% で再攻撃`);
  if (def.comboBonus) extra.push(`コンボ倍率: ×${def.comboBonus}`);
  if (def.wildEffect) extra.push(`Wild効果: ${def.wildEffect}`);
  if (isWildTag) extra.push(`🌀 コンボを維持 (lastMana → 何でも)`);
  tt.querySelector('.tt-extra').innerHTML = extra.map(t => `<div class="tt-line">${t}</div>`).join('');
  tt.classList.remove('hidden');
  moveCardTooltip(ev);
}

function moveCardTooltip(ev) {
  const tt = $('#card-tooltip');
  if (!tt || tt.classList.contains('hidden')) return;
  const pad = 16;
  let x = ev.clientX + pad;
  let y = ev.clientY + pad;
  const rect = tt.getBoundingClientRect();
  if (x + rect.width > window.innerWidth - 4) x = ev.clientX - rect.width - pad;
  if (y + rect.height > window.innerHeight - 4) y = ev.clientY - rect.height - pad;
  if (x < 4) x = 4;
  if (y < 4) y = 4;
  tt.style.left = x + 'px';
  tt.style.top = y + 'px';
}

function hideCardTooltip() {
  const tt = $('#card-tooltip');
  if (tt) tt.classList.add('hidden');
}

function attachCardTooltip(el, key, opts) {
  el.addEventListener('mouseenter', (ev) => {
    // Only show tooltip in test mode (playing or setup screen)
    if (!S.testMode && S.mode !== 'testselect') return;
    showCardTooltip(key, ev, opts);
  });
  el.addEventListener('mousemove', (ev) => {
    if (!S.testMode && S.mode !== 'testselect') return;
    moveCardTooltip(ev);
  });
  el.addEventListener('mouseleave', hideCardTooltip);
}

function confirmTestMode() {
  const floor = Math.max(1, parseInt($('#test-floor').value) || 1);
  const level = Math.max(1, parseInt($('#test-level').value) || 1);
  const hp = Math.max(1, parseInt($('#test-hp').value) || 100);
  const mana = Math.max(1, parseInt($('#test-mana').value) || 10);
  const cardMul = Math.max(0.1, parseFloat($('#test-card-mul').value) || 1.0);
  const startBlock = Math.max(0, parseInt($('#test-start-block').value) || 0);
  const gems = Math.max(0, parseInt($('#test-gems').value) || 0);
  const handSize = Math.max(1, parseInt($('#test-hand-size').value) || 5);
  const enemyHpMul = Math.max(0.1, parseFloat($('#test-enemy-hp-mul').value) || 1.0);
  const enemyDmgMul = Math.max(0, parseFloat($('#test-enemy-dmg-mul').value) || 1.0);
  const allTraits = $('#test-all-traits').checked;
  const useCustomDeck = $('#test-custom-deck').checked;

  S.testMode = true;
  S.testEnemyHpMul = enemyHpMul;
  S.testEnemyDmgMul = enemyDmgMul;
  S.testManaOverride = mana;
  S.testCardMul = cardMul;
  S.testHandSize = handSize;
  S.testStartBlock = startBlock;
  S.testEnemyPool = [...selectedEnemyPool];
  S.testBossPool = [...selectedBossPool];
  S.traits = allTraits ? Object.keys(TRAITS) : [];
  S.player = { x: 1, y: 1, hp, hpMax: hp, xp: 0, level };
  S.deck = (useCustomDeck && customDeck.length > 0) ? [...customDeck] : [...STARTING_DECK_PLAYER];
  S.discard = [];
  S.chests = [];
  S.floor = floor;
  S.gems = gems;
  S.battle = null;
  S.pendingEvolution = null;
  S.mode = 'explore';
  hideAllOverlays();
  genFloor();
  renderDungeon();
  renderHUD();
  toast(`🧪 テスト F${floor} 開始 (敵 HP×${enemyHpMul} ATK×${enemyDmgMul})`);
}

function backToTitle() {
  showTitle();
}

// ========================================================================
// TRAIT SELECT (pick 2 before game starts)
// ========================================================================
let traitSelection = [];

function showTraitSelect() {
  S.mode = 'traitselect';
  traitSelection = [];
  const container = $('#trait-choices');
  container.innerHTML = '';
  Object.entries(TRAITS).forEach(([key, t]) => {
    const div = document.createElement('div');
    div.className = 'trait-card';
    div.dataset.key = key;
    div.innerHTML = `
      <div class="icon">${t.icon}</div>
      <div class="name">${t.name}</div>
      <div class="desc">${t.desc}</div>
    `;
    div.addEventListener('click', () => toggleTrait(key, div));
    container.appendChild(div);
  });
  updateTraitSelectUI();
  $('#charselect').classList.remove('hidden');
}

function toggleTrait(key, div) {
  const idx = traitSelection.indexOf(key);
  if (idx >= 0) {
    traitSelection.splice(idx, 1);
    div.classList.remove('selected');
  } else {
    if (traitSelection.length >= STARTING_TRAIT_COUNT) {
      // remove oldest
      const removeKey = traitSelection.shift();
      const removeDiv = document.querySelector(`.trait-card[data-key="${removeKey}"]`);
      if (removeDiv) removeDiv.classList.remove('selected');
    }
    traitSelection.push(key);
    div.classList.add('selected');
  }
  updateTraitSelectUI();
}

function updateTraitSelectUI() {
  $('#trait-counter').textContent = `${traitSelection.length} / ${STARTING_TRAIT_COUNT}`;
  $('#trait-start').disabled = traitSelection.length !== STARTING_TRAIT_COUNT;
}

function confirmTraits() {
  if (traitSelection.length !== STARTING_TRAIT_COUNT) return;
  S.traits = [...traitSelection];
  const toughBonus = hasPassive('tough') ? 15 : 0;
  const startHp = BASE_HP + toughBonus;
  S.player = { x: 1, y: 1, dir: 1, hp: startHp, hpMax: startHp, xp: 0, level: 1 };
  S.deck = [...STARTING_DECK_PLAYER];
  S.discard = [];
  S.chests = [];
  S.stage = selectedStage || 1;
  S.stageFloor = 1;
  S.cycle = 0;
  S.floor = (S.stage - 1) * 5 + 1;
  try {
    S.maxCycleReached = parseInt(localStorage.getItem('vc_proto_maxCycle') || '0') || 0;
  } catch (e) {}

  // Apply debug boost if debug mode is on
  const debugOn = (() => { try { return localStorage.getItem('vc_proto_debug') === '1'; } catch (e) { return false; } })();
  if (debugOn) {
    const getN = (k, d) => { try { const v = parseFloat(localStorage.getItem(k)); return isNaN(v) ? d : v; } catch (e) { return d; } };
    const getBool = (k) => { try { return localStorage.getItem(k) === '1'; } catch (e) { return false; } };
    const dStage = Math.max(1, Math.min(MAX_STAGE, getN('vc_proto_debug_stage', 1)));
    const dFloor = Math.max(1, Math.min(5, getN('vc_proto_debug_floor', 1)));
    const dCycle = Math.max(0, getN('vc_proto_debug_cycle', 0));
    const dHp = Math.max(1, getN('vc_proto_debug_hp', 60));
    const dMana = Math.max(1, getN('vc_proto_debug_mana', 8));
    const dCardMul = Math.max(0.1, getN('vc_proto_debug_cardMul', 2.0));
    const dGems = Math.max(0, getN('vc_proto_debug_gems', 5));
    const dAllTraits = getBool('vc_proto_debug_allTraits');
    S.stage = dStage;
    S.stageFloor = dFloor;
    S.cycle = dCycle;
    S.floor = (dStage - 1) * 5 + dFloor;
    S.player.hp = dHp; S.player.hpMax = dHp;
    S.gems = dGems;
    if (dAllTraits) S.traits = Object.keys(TRAITS);
    S.testMode = true;
    S.testManaOverride = dMana;
    S.testCardMul = dCardMul;
    S.testEnemyHpMul = 1.0;
    S.testEnemyDmgMul = 1.0;
    S.testHandSize = null;
    S.testStartBlock = 0;
    S.testEnemyPool = [];
    S.testBossPool = [];
    toast(`🛠️ デバッグ起動: S${dStage}-${dFloor}+${dCycle} HP${dHp}`);
  }
  S.gems = hasPassive('lucky') ? 2 : 0;
  S.battle = null;
  S.pendingEvolution = null;
  S.mode = 'explore';
  $('#charselect').classList.add('hidden');
  $('#gameover').classList.add('hidden');
  genFloor();
  renderDungeon();
  renderHUD();
  const traitNames = S.traits.map(t => `${TRAITS[t].icon}${TRAITS[t].name}`).join(' + ');
  toast(`出陣! ${traitNames}`);
}

// ========================================================================
// EFFECTS
// ========================================================================
function popupAt(anchorSel, text, color, size) {
  const anchor = $(anchorSel);
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'dmg-pop';
  el.textContent = text;
  el.style.color = color;
  el.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 50) + 'px';
  el.style.top = (rect.top - 8 + (Math.random() - 0.5) * 20) + 'px';
  if (size) el.style.fontSize = size + 'px';
  el.style.textShadow = `0 0 14px ${color}, 0 0 28px ${color}, 3px 3px 0 #000, -2px -2px 0 #000`;
  // Rainbow class for very big damage
  if (size && size >= 44) {
    el.classList.add('dmg-rainbow');
  }
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// === Pachinko helpers ===
const HUES = ['#ff5577','#ff9944','#ffcb6b','#9aff6b','#6cf0c2','#9eb8ff','#b07afc','#ff6bc1'];
function randomHue() { return HUES[Math.floor(Math.random() * HUES.length)]; }

function coinShower(count) {
  const w = window.innerWidth, h = window.innerHeight;
  const emojis = ['🪙','💰','💎','⭐','✨','💫'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'coin-rain';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = (Math.random() * w) + 'px';
    el.style.top = '-40px';
    el.style.setProperty('--fall', (h + 100) + 'px');
    el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    el.style.setProperty('--dur', (1.2 + Math.random() * 1.2) + 's');
    el.style.fontSize = (20 + Math.random() * 24) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
}

// ========================================================================
// JUICE: particles, callouts, missiles, combo meter
// ========================================================================
function spawnParticlesAt(x, y, count, color, emoji) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji || '✦';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.color = color;
    const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.6;
    const dist = 50 + Math.random() * 80;
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    p.style.fontSize = (16 + Math.random() * 12) + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function particlesAt(sel, count, color, emoji) {
  const el = $(sel);
  if (!el) return;
  const r = el.getBoundingClientRect();
  spawnParticlesAt(r.left + r.width / 2, r.top + r.height / 2, count, color, emoji);
}

function callout(text, color, durationMs) {
  const el = document.createElement('div');
  el.className = 'callout';
  el.textContent = text;
  el.style.color = color;
  el.style.textShadow = `0 0 16px ${color}, 0 0 32px ${color}, 3px 3px 0 #000`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), durationMs || 1100);
}

function bigCallout(text, color) {
  callout(text, color, 1300);
}

function screenFlash(color, durationMs) {
  const f = document.createElement('div');
  f.className = 'screen-flash';
  f.style.background = `radial-gradient(ellipse at center, ${color}, transparent 65%)`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), durationMs || 350);
}

function hitStop(ms) {
  document.body.classList.add('hit-stop');
  setTimeout(() => document.body.classList.remove('hit-stop'), ms);
}
function flashShake(sel) {
  const el = $(sel);
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 320);
}
function flashScreen() {
  const w = $('#dungeon-wrap');
  w.classList.remove('hit-flash');
  void w.offsetWidth;
  w.classList.add('hit-flash');
  setTimeout(() => w.classList.remove('hit-flash'), 300);
  const o = $('#battle');
  if (!o.classList.contains('hidden')) {
    o.classList.remove('shake');
    void o.offsetWidth;
    o.classList.add('shake');
    setTimeout(() => o.classList.remove('shake'), 300);
  }
}
function flashCombo() {
  const o = $('#battle');
  o.classList.remove('combo-flash');
  void o.offsetWidth;
  o.classList.add('combo-flash');
  setTimeout(() => o.classList.remove('combo-flash'), 400);
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
function logBattle(cls, msg) {
  const l = $('#battle-log');
  const e = document.createElement('div');
  e.className = `entry ${cls}`;
  e.textContent = msg;
  l.appendChild(e);
  l.scrollTop = l.scrollHeight;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ========================================================================
// GAME OVER
// ========================================================================
function gameOver() {
  sfx('die');
  $('#battle').classList.add('hidden');
  // Death Reaper at stage transition: dying = forced descent
  if (S.reaperStageTransition) {
    S.reaperStageTransition = false;
    bigCallout('💀 死神に倒された…が次階層へ突き落とされる', '#ff4060');
    screenFlash('rgba(64, 0, 16, 0.8)', 900);
    S.deck = [...S.deck, ...S.battle.hand.map(c => c.key), ...S.battle.discard];
    shuffle(S.deck);
    setTimeout(() => {
      $('#battle').classList.add('hidden');
      $('#battle').classList.remove('boss-battle');
      S.mode = 'explore';
      S.battle = null;
      // Revive at 30% HP and advance to next stage
      S.player.hp = Math.max(1, Math.floor(S.player.hpMax * 0.3));
      nextFloor();
      renderHUD();
    }, 1300);
    return;
  }
  if (S.testBattleOnly) {
    toast('💀 戦闘で死亡 — 設定画面に戻ります');
    returnFromTestBattle();
    return;
  }
  S.mode = 'over';
  stopBgm();
  $('#bgm-toggle').textContent = '♪ BGM OFF';
  $('#go-floor').textContent = S.floor;
  $('#go-level').textContent = S.player.level;
  $('#gameover').classList.remove('hidden');
}
function restart() {
  $('#gameover').classList.add('hidden');
  showTitle();
}

// ========================================================================
// INPUT
// ========================================================================
document.addEventListener('keydown', (ev) => {
  getAudio();
  if (S.mode === 'explore') {
    // WASD: forward/back/strafe (relative to facing direction)
    if      (ev.key === 'w' || ev.key === 'W' || ev.key === 'ArrowUp')    { ev.preventDefault(); movePlayer(1, 0); }
    else if (ev.key === 's' || ev.key === 'S' || ev.key === 'ArrowDown')  { ev.preventDefault(); movePlayer(-1, 0); }
    else if (ev.key === 'a' || ev.key === 'A' || ev.key === 'ArrowLeft')  { ev.preventDefault(); movePlayer(0, -1); }
    else if (ev.key === 'd' || ev.key === 'D' || ev.key === 'ArrowRight') { ev.preventDefault(); movePlayer(0, 1); }
    // Q/E: turn left / right 90°
    else if (ev.key === 'q' || ev.key === 'Q') { ev.preventDefault(); turnPlayer(-1); }
    else if (ev.key === 'e' || ev.key === 'E') { ev.preventDefault(); turnPlayer(1); }
    else if (ev.key === ' ' || ev.code === 'Space') { ev.preventDefault(); digDown(); }
  } else if (S.mode === 'battle') {
    if (ev.key === 'Enter') { ev.preventDefault(); endBattleTurn(); }
    else if (ev.key >= '1' && ev.key <= '5') {
      const idx = parseInt(ev.key, 10) - 1;
      if (S.battle && idx < S.battle.hand.length) playCardWithAnimation(idx);
    }
  }
});

// ========================================================================
// BOOT
// ========================================================================
async function boot() {
  $('#end-battle-turn').addEventListener('click', endBattleTurn);
  $('#flee').addEventListener('click', flee);
  $('#skip-levelup').addEventListener('click', skipLevelup);
  $('#evolve-confirm').addEventListener('click', confirmEvolve);
  $('#evolve-skip').addEventListener('click', skipEvolve);
  $('#trait-start').addEventListener('click', confirmTraits);
  $('#trait-back').addEventListener('click', showStageSelect);
  $('#stage-back').addEventListener('click', backToTitle);
  $('#btn-start-game').addEventListener('click', startGameMode);
  $('#btn-test-mode').addEventListener('click', startTestMode);
  $('#test-start').addEventListener('click', confirmTestMode);
  $('#test-back').addEventListener('click', backToTitle);
  $('#test-deck-clear').addEventListener('click', clearTestDeck);
  $('#test-battle-start').addEventListener('click', startTestBattle);
  $('#restart').addEventListener('click', restart);
  $('#bgm-toggle').addEventListener('click', () => {
    getAudio();
    if (bgmOn) { stopBgm(); $('#bgm-toggle').textContent = '♪ BGM OFF'; }
    else      { startBgm(); $('#bgm-toggle').textContent = '♪ BGM ON';  }
  });
  // Debug mode checkbox (title) + panel
  const dbg = $('#debug-mode');
  const dbgPanel = $('#debug-panel');
  function updateDebugPanel() {
    if (dbgPanel) dbgPanel.classList.toggle('hidden', !dbg.checked);
  }
  function loadDebugInput(id, key, def) {
    const el = $(`#${id}`);
    if (!el) return;
    try {
      const v = localStorage.getItem(key);
      if (v !== null) {
        if (el.type === 'checkbox') el.checked = v === '1';
        else el.value = v;
      } else {
        el.value = def;
      }
    } catch (e) { el.value = def; }
    const save = () => {
      try {
        if (el.type === 'checkbox') {
          if (el.checked) localStorage.setItem(key, '1');
          else localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, el.value);
        }
      } catch (e) {}
    };
    el.addEventListener('change', save);
    el.addEventListener('input', save);
  }
  if (dbg) {
    try { dbg.checked = localStorage.getItem('vc_proto_debug') === '1'; } catch (e) {}
    updateDebugPanel();
    dbg.addEventListener('change', () => {
      try {
        if (dbg.checked) localStorage.setItem('vc_proto_debug', '1');
        else localStorage.removeItem('vc_proto_debug');
      } catch (e) {}
      updateDebugPanel();
      toast(dbg.checked ? '🛠️ デバッグON' : 'デバッグOFF');
    });
    loadDebugInput('debug-stage', 'vc_proto_debug_stage', 1);
    loadDebugInput('debug-floor', 'vc_proto_debug_floor', 1);
    loadDebugInput('debug-cycle', 'vc_proto_debug_cycle', 0);
    loadDebugInput('debug-hp', 'vc_proto_debug_hp', 60);
    loadDebugInput('debug-mana', 'vc_proto_debug_mana', 8);
    loadDebugInput('debug-card-mul', 'vc_proto_debug_cardMul', 2.0);
    loadDebugInput('debug-gems', 'vc_proto_debug_gems', 5);
    loadDebugInput('debug-all-traits', 'vc_proto_debug_allTraits', false);
  }
  await loadAssets();
  await loadSpriteImages();
  showTitle();
}
boot();
