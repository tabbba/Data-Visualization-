// ── Geographic centroids (lat, lon) ──
export const CENTROIDS = {
  AL:[41.0,20.0], AZ:[40.1,47.6], BE:[50.5,4.5], BG:[42.7,25.5], CH:[46.8,8.2],
  CY:[35.1,33.4], CZ:[49.8,15.5], DE:[51.2,10.4], DK:[56.0,10.0], EE:[58.6,25.0],
  ES:[40.5,-3.7], FI:[64.0,26.0], FR:[46.2,2.2], GB:[54.0,-2.0], GE:[42.3,43.4],
  GR:[39.0,22.0], HR:[45.1,15.2], HU:[47.2,19.5], IE:[53.4,-8.0], IL:[31.0,34.9],
  IS:[64.9,-19.0], IT:[42.5,12.5], LT:[55.2,23.9], LU:[49.8,6.1], LV:[56.9,24.1],
  MA:[31.8,-7.1], MD:[47.4,28.4], ME:[42.7,19.3], MK:[41.6,21.7], MT:[35.9,14.4],
  NL:[52.1,5.3], NO:[60.5,8.5], PL:[51.9,19.1], PT:[39.5,-8.0], RO:[45.9,24.9],
  RS:[44.0,21.0], SE:[60.1,18.6], SI:[46.1,14.8], SK:[48.7,19.7], TR:[39.0,35.0],
  UA:[48.4,31.2], DZ:[36.8,3.0], LB:[33.9,35.5], TN:[35.0,9.5], EG:[26.8,30.0],
};

// ── ISO code mappings ──
const _iso23 = {
  AL:'008', AT:'040', AZ:'031', BE:'056', BG:'100', CH:'756', CY:'196', CZ:'203',
  DE:'276', DK:'208', DZ:'012', EE:'233', EG:'818', ES:'724', FI:'246', FR:'250',
  GB:'826', GE:'268', GR:'300', HR:'191', HU:'348', IE:'372', IL:'376', IS:'352',
  IT:'380', LB:'422', LT:'440', LU:'442', LV:'428', MA:'504', MD:'498', ME:'499',
  MK:'807', MT:'470', NL:'528', NO:'578', PL:'616', PT:'620', RO:'642', RS:'688',
  SE:'752', SI:'705', SK:'703', TN:'788', TR:'792', UA:'804',
};
export const ISO_A2_TO_NUM = _iso23;
export const ISO_NUM_TO_A2 = Object.fromEntries(
  Object.entries(_iso23).map(([k, v]) => [v, k])
);

// ── Country display names ──
export const COUNTRY_NAMES = {
  AL:'Albania', AZ:'Azerbaijan', BE:'Belgium', BG:'Bulgaria', CH:'Switzerland',
  CY:'Cyprus', CZ:'Czech Republic', DE:'Germany', DK:'Denmark', DZ:'Algeria',
  EE:'Estonia', EG:'Egypt', ES:'Spain', FI:'Finland', FR:'France',
  GB:'United Kingdom', GE:'Georgia', GR:'Greece', HR:'Croatia', HU:'Hungary',
  IE:'Ireland', IL:'Israel', IS:'Iceland', IT:'Italy', LB:'Lebanon',
  LT:'Lithuania', LU:'Luxembourg', LV:'Latvia', MA:'Morocco', MD:'Moldova',
  ME:'Montenegro', MK:'North Macedonia', MT:'Malta', NL:'Netherlands', NO:'Norway',
  PL:'Poland', PT:'Portugal', RO:'Romania', RS:'Serbia', SE:'Sweden',
  SI:'Slovenia', SK:'Slovakia', TN:'Tunisia', TR:'Turkey', UA:'Ukraine',
};

// ── Year annotation text ──
export const CAPTIONS = {
  2019: { text: 'The baseline. European aviation at its pre-pandemic peak: 10.7 million cruise-phase flights across ECAC airspace.' },
  2020: { text: 'COVID-19 collapses air traffic. Borders close overnight. Some states see traffic fall below 10% of 2019 levels.' },
  2021: { text: 'A fragile restart. Vaccinations unlock leisure travel but business routes stay grounded and restrictions linger.' },
  2022: { text: 'Pent-up demand surges. Southern Europe bounces past 2019. Ukraine war reroutes eastern corridors permanently.' },
  2023: { text: 'Recovery consolidates. Turkey, North Africa and the Gulf corridor become new growth engines for the network.' },
  2024: { text: 'Most of Europe has recovered: but not equally. Eastern states and smaller markets still trail their 2019 baselines.' },
};

// ── SVG canvas & compass geometry ──
export const R    = 290;   // radius of the 2019 baseline ring (px)
export const CX   = 400;   // SVG center X
export const CY   = 400;   // SVG center Y
export const SVGW = 800;
export const SVGH = 800;

// ── Geographic center of the compass (Prague area) ──
export const CENTER_LAT = 50;
export const CENTER_LON = 15;
