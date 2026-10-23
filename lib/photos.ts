/**
 * Stock photography for the sample templates, hosted by Unsplash (free to use).
 * Unlike the generated artwork in `placeholderImage`, these are real requests, so
 * the template previews need a network connection. Each id below was checked to load.
 */
const PHOTOS = {
  retail: "1441986300917-64674bd600d8",
  fashion: "1523381210434-271e8be1f52b",
  openShop: "1472851294608-062f824d29cc",
  promo: "1607082348824-0a96f2a4b9da",
  shopping: "1556742049-0cfed4f6a45d",
  laptop: "1515378791036-0648a3ef77b2",
  team: "1522202176988-66273c2fd55f",
  teamwork: "1531482615713-2afd69097998",
  office: "1504384308090-c894fdcc538d",
  meeting: "1556761175-5973dc0f32e7",
  code: "1498050108023-c5249f4df085",
  analytics: "1460925895917-afdab827c52f",
  auditorium: "1511578314322-379afb476865",
  conference: "1540575467063-178a50c2df87",
  celebration: "1492684223066-81342ee5ff30",
  desk: "1553877522-43269d4ea984",
  group: "1521737604893-d14cc237f11d",
  womanA: "1494790108377-be9c29b29330",
  manA: "1507003211169-0a1dd7228f2d",
  womanB: "1438761681033-6461ffad8d80",
  manB: "1500648767791-00dcc994a43e",
  womanC: "1534528741775-53994a69daeb",
  manC: "1472099645785-5658abf4ff4e",
  beach: "1507525428034-b723cf961d3e",
  summer: "1473496169904-658ba7c44d8a",
  autumn: "1507371341162-763b5e419408",
  leaves: "1477414348463-c0eb7f1359b6",
  winter: "1482517967863-00e15c9b44be",
  holiday: "1512389142860-9c449e58a543",
  holidayDecor: "1543589077-47d81606c1bf",
  coffee: "1495474472287-4d71bcdd2085",
  hat: "1521369909029-2afed882baee",
  sunglasses: "1511499767150-a48a237f0083",
  welcome: "1517486808906-6ca8b3f04846",
  thanks: "1513151233558-d860c5398176",
  webinar: "1573164713988-8665fc963095",
  shoes: "1542291026-7eec264c27ff",
  watch: "1523275335684-37898b6baf30",
  travel: "1488646953014-85cb44e25828",
  wellness: "1571019613454-1cb2f99b2d8b",
  hearts: "1518199266791-5375a83190b7",
  yoga: "1544367567-0f2fcb009e0b",
  running: "1552674605-db6ffd4facb5",
  suitcase: "1436491865332-7a61a109cc05",
  gifts: "1513885535751-8b9238bd345a",
  saleTags: "1607082349566-187342175e2f",
  bags: "1483985988355-763728e1935b",
  mountains: "1464822759023-fed622ff2c3b",
  dining: "1528605248644-14dd04022da1",
  tropical: "1519046904884-53103b34b206",
  champagne: "1470337458703-46ad1756a187",
  snow: "1418985991508-e47386d96a71",
  headphones: "1505740420928-5e560c06d30e",
  cozy: "1513694203232-719a280e022f",
  skincare: "1556228720-195a672e8a03",
} as const;

export type PhotoKey = keyof typeof PHOTOS;

/** A cropped stock photo at the given design size (requested at 2x so it stays sharp). */
export function photo(key: PhotoKey, w = 600, h = 260): string {
  return `https://images.unsplash.com/photo-${PHOTOS[key]}?auto=format&fit=crop&crop=faces,entropy&w=${w * 2}&h=${h * 2}&q=65`;
}
