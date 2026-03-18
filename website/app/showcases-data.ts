// Shared showcase data for COBE demos

export type ShowcaseConfig = {
  theta: number
  dark: number
  mapBrightness: number
  markerColor: [number, number, number]
  baseColor: [number, number, number]
  arcColor: [number, number, number]
  markerSize: number
  markerElevation: number
}

// Showcase: Default (matches hero globe exactly)
export const showcaseDefaultMarkers = [
  {
    id: 'default-sf',
    location: [37.7595, -122.4367] as [number, number],
    label: 'San Francisco',
  },
  {
    id: 'default-nyc',
    location: [40.7128, -74.006] as [number, number],
    label: 'New York',
  },
  {
    id: 'default-tokyo',
    location: [35.6762, 139.6503] as [number, number],
    label: 'Tokyo',
  },
  {
    id: 'default-london',
    location: [51.5074, -0.1278] as [number, number],
    label: 'London',
  },
  {
    id: 'default-sydney',
    location: [-33.8688, 151.2093] as [number, number],
    label: 'Sydney',
  },
  {
    id: 'default-capetown',
    location: [-33.9249, 18.4241] as [number, number],
    label: 'Cape Town',
  },
  {
    id: 'default-dubai',
    location: [25.2048, 55.2708] as [number, number],
    label: 'Dubai',
  },
  {
    id: 'default-paris',
    location: [48.8566, 2.3522] as [number, number],
    label: 'Paris',
  },
  {
    id: 'default-saopaulo',
    location: [-23.5505, -46.6333] as [number, number],
    label: 'São Paulo',
  },
]

export const showcaseDefaultArcs = [
  {
    id: 'default-sf-tokyo',
    from: [37.7595, -122.4367] as [number, number],
    to: [35.6762, 139.6503] as [number, number],
    label: 'SF → Tokyo',
  },
  {
    id: 'default-nyc-london',
    from: [40.7128, -74.006] as [number, number],
    to: [51.5074, -0.1278] as [number, number],
    label: 'NYC → London',
  },
]

// Showcase: Stickers
export const stickerMarkers = [
  {
    id: 'sticker-paris',
    location: [48.86, 2.35] as [number, number],
    sticker: '🥐',
  },
  {
    id: 'sticker-tokyo',
    location: [35.68, 139.65] as [number, number],
    sticker: '🗼',
  },
  {
    id: 'sticker-nyc',
    location: [40.71, -74.01] as [number, number],
    sticker: '🍎',
  },
  {
    id: 'sticker-rio',
    location: [-22.91, -43.17] as [number, number],
    sticker: '🎭',
  },
  {
    id: 'sticker-sydney',
    location: [-33.87, 151.21] as [number, number],
    sticker: '🐨',
  },
  {
    id: 'sticker-cairo',
    location: [30.04, 31.24] as [number, number],
    sticker: '🐪',
  },
  {
    id: 'sticker-rome',
    location: [41.9, 12.5] as [number, number],
    sticker: '🍕',
  },
  {
    id: 'sticker-mexico',
    location: [19.43, -99.13] as [number, number],
    sticker: '🌮',
  },
  {
    id: 'sticker-india',
    location: [28.61, 77.21] as [number, number],
    sticker: '🐘',
  },
  {
    id: 'sticker-iceland',
    location: [64.15, -21.94] as [number, number],
    sticker: '🧊',
  },
  {
    id: 'sticker-london',
    location: [51.51, -0.13] as [number, number],
    sticker: '☕',
  },
  {
    id: 'sticker-hawaii',
    location: [21.31, -157.86] as [number, number],
    sticker: '🏄',
  },
  {
    id: 'sticker-amsterdam',
    location: [52.37, 4.9] as [number, number],
    sticker: '🚲',
  },
  {
    id: 'sticker-beijing',
    location: [39.9, 116.4] as [number, number],
    sticker: '🐉',
  },
  {
    id: 'sticker-moscow',
    location: [55.75, 37.62] as [number, number],
    sticker: '🪆',
  },
  {
    id: 'sticker-seoul',
    location: [37.57, 126.98] as [number, number],
    sticker: '🎮',
  },
]

// Showcase: Live badge
export const liveMarkers = [
  { id: 'live-sf', location: [37.78, -122.44] as [number, number] },
  { id: 'live-london', location: [51.51, -0.13] as [number, number] },
  { id: 'live-tokyo', location: [35.68, 139.65] as [number, number] },
  { id: 'live-paris', location: [48.86, 2.35] as [number, number] },
  { id: 'live-sydney', location: [-33.87, 151.21] as [number, number] },
  { id: 'live-nyc', location: [40.71, -74.01] as [number, number] },
]

// Showcase: Interactive markers
export const interactiveMarkers = [
  {
    id: 'hq',
    location: [37.78, -122.44] as [number, number],
    name: 'HQ',
    users: 1420,
  },
  {
    id: 'eu',
    location: [52.52, 13.41] as [number, number],
    name: 'EU',
    users: 892,
  },
  {
    id: 'asia',
    location: [35.68, 139.65] as [number, number],
    name: 'Asia',
    users: 2103,
  },
  {
    id: 'latam',
    location: [-23.55, -46.63] as [number, number],
    name: 'LATAM',
    users: 567,
  },
  {
    id: 'mena',
    location: [25.2, 55.27] as [number, number],
    name: 'MENA',
    users: 734,
  },
  {
    id: 'oceania',
    location: [-33.87, 151.21] as [number, number],
    name: 'APAC',
    users: 445,
  },
]

// Showcase: Polaroid photos
export const polaroidMarkers = [
  {
    id: 'polaroid-sf',
    location: [37.78, -122.44] as [number, number],
    image: '/sf.jpg',
    caption: 'San Francisco',
    rotate: -5,
  },
  {
    id: 'polaroid-nyc',
    location: [40.71, -74.01] as [number, number],
    image: '/nyc.jpg',
    caption: 'New York',
    rotate: 4,
  },
  {
    id: 'polaroid-tokyo',
    location: [35.68, 139.65] as [number, number],
    image: '/tokyo.jpg',
    caption: 'Tokyo',
    rotate: -3,
  },
  {
    id: 'polaroid-sydney',
    location: [-33.87, 151.21] as [number, number],
    image: '/sydney.jpg',
    caption: 'Sydney',
    rotate: 6,
  },
  {
    id: 'polaroid-beijing',
    location: [39.9, 116.4] as [number, number],
    image: '/beijing.jpg',
    caption: 'Beijing',
    rotate: -4,
  },
  {
    id: 'polaroid-egypt',
    location: [29.98, 31.13] as [number, number],
    image: '/egypt.jpg',
    caption: 'Egypt',
    rotate: 3,
  },
  {
    id: 'polaroid-pisa',
    location: [43.72, 10.4] as [number, number],
    image: '/pisa.jpg',
    caption: 'Pisa',
    rotate: -6,
  },
  {
    id: 'polaroid-singapore',
    location: [1.35, 103.82] as [number, number],
    image: '/singapore.jpg',
    caption: 'Singapore',
    rotate: 5,
  },
]

// Showcase: Pulse animations
export const pulseMarkers = [
  { id: 'pulse-1', location: [51.51, -0.13] as [number, number], delay: 0 },
  { id: 'pulse-2', location: [40.71, -74.01] as [number, number], delay: 0.5 },
  { id: 'pulse-3', location: [35.68, 139.65] as [number, number], delay: 1 },
  { id: 'pulse-4', location: [-33.87, 151.21] as [number, number], delay: 1.5 },
]

// Showcase: Highlight bars
export const barMarkers = [
  {
    id: 'bar-1',
    location: [40.71, -74.01] as [number, number],
    value: 85,
    label: 'NYC',
  },
  {
    id: 'bar-2',
    location: [51.51, -0.13] as [number, number],
    value: 62,
    label: 'London',
  },
  {
    id: 'bar-3',
    location: [35.68, 139.65] as [number, number],
    value: 94,
    label: 'Tokyo',
  },
  {
    id: 'bar-4',
    location: [1.35, 103.82] as [number, number],
    value: 78,
    label: 'Singapore',
  },
]

// Showcase: Analytics (visitor tracking)
export const analyticsMarkers = [
  {
    id: 'vis-1',
    location: [40.71, -74.01] as [number, number],
    visitors: 847,
    trend: 12,
  },
  {
    id: 'vis-2',
    location: [51.51, -0.13] as [number, number],
    visitors: 623,
    trend: -3,
  },
  {
    id: 'vis-3',
    location: [35.68, 139.65] as [number, number],
    visitors: 412,
    trend: 8,
  },
  {
    id: 'vis-4',
    location: [48.86, 2.35] as [number, number],
    visitors: 385,
    trend: 5,
  },
  {
    id: 'vis-5',
    location: [-33.87, 151.21] as [number, number],
    visitors: 201,
    trend: 15,
  },
  {
    id: 'vis-6',
    location: [52.52, 13.41] as [number, number],
    visitors: 178,
    trend: -1,
  },
]

// Showcase: Flights
export const flightArcs = [
  {
    id: 'flight-1',
    from: [40.64, -73.78] as [number, number],
    to: [51.47, -0.46] as [number, number],
  },
  {
    id: 'flight-2',
    from: [51.47, -0.46] as [number, number],
    to: [25.25, 55.36] as [number, number],
  },
  {
    id: 'flight-3',
    from: [35.55, 139.78] as [number, number],
    to: [37.62, -122.38] as [number, number],
  },
  {
    id: 'flight-4',
    from: [1.36, 103.99] as [number, number],
    to: [-33.95, 151.18] as [number, number],
  },
  {
    id: 'flight-5',
    from: [48.86, 2.35] as [number, number],
    to: [40.64, -73.78] as [number, number],
  },
]

export const flightMarkers = [
  { id: 'apt-jfk', location: [40.64, -73.78] as [number, number] },
  { id: 'apt-lhr', location: [51.47, -0.46] as [number, number] },
  { id: 'apt-dxb', location: [25.25, 55.36] as [number, number] },
  { id: 'apt-nrt', location: [35.55, 139.78] as [number, number] },
  { id: 'apt-sfo', location: [37.62, -122.38] as [number, number] },
  { id: 'apt-sin', location: [1.36, 103.99] as [number, number] },
  { id: 'apt-syd', location: [-33.95, 151.18] as [number, number] },
  { id: 'apt-cdg', location: [48.86, 2.35] as [number, number] },
]

// Showcase: Labels (text stickers)
export const labelMarkers = [
  {
    id: 'label-1',
    location: [48.86, 2.35] as [number, number],
    text: 'visit soon!',
    color: '#e84855',
    rotate: -8,
  },
  {
    id: 'label-2',
    location: [35.68, 139.65] as [number, number],
    text: 'amazing food',
    color: '#2a9d8f',
    rotate: 5,
  },
  {
    id: 'label-3',
    location: [40.71, -74.01] as [number, number],
    text: 'home ♥',
    color: '#e76f51',
    rotate: -3,
  },
  {
    id: 'label-4',
    location: [-33.87, 151.21] as [number, number],
    text: 'bucket list',
    color: '#264653',
    rotate: 7,
  },
  {
    id: 'label-5',
    location: [51.51, -0.13] as [number, number],
    text: 'rainy but fun',
    color: '#7b2cbf',
    rotate: -5,
  },
  {
    id: 'label-6',
    location: [-22.91, -43.17] as [number, number],
    text: 'samba time!',
    color: '#f4a261',
    rotate: 4,
  },
  {
    id: 'label-7',
    location: [55.75, 37.62] as [number, number],
    text: 'cold but cozy',
    color: '#457b9d',
    rotate: -6,
  },
  {
    id: 'label-8',
    location: [25.2, 55.27] as [number, number],
    text: 'so luxurious',
    color: '#d4a373',
    rotate: 3,
  },
  {
    id: 'label-9',
    location: [1.35, 103.82] as [number, number],
    text: 'foodie heaven',
    color: '#e63946',
    rotate: -4,
  },
  {
    id: 'label-10',
    location: [-34.6, -58.38] as [number, number],
    text: 'tango nights',
    color: '#9d4edd',
    rotate: 6,
  },
]

// Showcase: Satellites
export const satelliteMarkers = [
  { id: 'sat-1', location: [45.0, -120.0] as [number, number] },
  { id: 'sat-2', location: [30.0, 45.0] as [number, number] },
  { id: 'sat-3', location: [-15.0, 100.0] as [number, number] },
  { id: 'sat-4', location: [60.0, -30.0] as [number, number] },
  { id: 'sat-5', location: [-40.0, -60.0] as [number, number] },
  { id: 'sat-6', location: [10.0, 150.0] as [number, number] },
  { id: 'sat-7', location: [55.0, 80.0] as [number, number] },
  { id: 'sat-8', location: [-25.0, 20.0] as [number, number] },
  { id: 'sat-9', location: [70.0, 25.0] as [number, number] },
  { id: 'sat-10', location: [-5.0, -75.0] as [number, number] },
  { id: 'sat-11', location: [35.0, -95.0] as [number, number] },
  { id: 'sat-12', location: [-50.0, 140.0] as [number, number] },
  { id: 'sat-13', location: [20.0, -20.0] as [number, number] },
  { id: 'sat-14', location: [50.0, 120.0] as [number, number] },
  { id: 'sat-15', location: [-30.0, 70.0] as [number, number] },
  { id: 'sat-16', location: [5.0, -150.0] as [number, number] },
]

// Showcase: CDN (Vercel-style edge network)
export const cdnMarkers = [
  {
    id: 'cdn-iad',
    location: [38.95, -77.45] as [number, number],
    region: 'iad1',
  },
  {
    id: 'cdn-sfo',
    location: [37.62, -122.38] as [number, number],
    region: 'sfo1',
  },
  {
    id: 'cdn-cdg',
    location: [49.01, 2.55] as [number, number],
    region: 'cdg1',
  },
  {
    id: 'cdn-hnd',
    location: [35.55, 139.78] as [number, number],
    region: 'hnd1',
  },
  {
    id: 'cdn-syd',
    location: [-33.95, 151.18] as [number, number],
    region: 'syd1',
  },
  {
    id: 'cdn-gru',
    location: [-23.43, -46.47] as [number, number],
    region: 'gru1',
  },
  {
    id: 'cdn-sin',
    location: [1.36, 103.99] as [number, number],
    region: 'sin1',
  },
  {
    id: 'cdn-arn',
    location: [59.65, 17.93] as [number, number],
    region: 'arn1',
  },
  {
    id: 'cdn-dub',
    location: [53.43, -6.25] as [number, number],
    region: 'dub1',
  },
  {
    id: 'cdn-bom',
    location: [19.09, 72.87] as [number, number],
    region: 'bom1',
  },
]

export const cdnArcs = [
  {
    id: 'cdn-arc-1',
    from: [38.95, -77.45] as [number, number], // IAD
    to: [49.01, 2.55] as [number, number], // CDG
    traffic: '2.4 TB/s',
  },
  {
    id: 'cdn-arc-2',
    from: [37.62, -122.38] as [number, number], // SFO
    to: [35.55, 139.78] as [number, number], // HND
    traffic: '1.8 TB/s',
  },
  {
    id: 'cdn-arc-3',
    from: [49.01, 2.55] as [number, number], // CDG
    to: [1.36, 103.99] as [number, number], // SIN
    traffic: '1.2 TB/s',
  },
  {
    id: 'cdn-arc-4',
    from: [38.95, -77.45] as [number, number], // IAD
    to: [-23.43, -46.47] as [number, number], // GRU
    traffic: '890 GB/s',
  },
  {
    id: 'cdn-arc-5',
    from: [35.55, 139.78] as [number, number], // HND
    to: [-33.95, 151.18] as [number, number], // SYD
    traffic: '720 GB/s',
  },
  {
    id: 'cdn-arc-6',
    from: [49.01, 2.55] as [number, number], // CDG
    to: [19.09, 72.87] as [number, number], // BOM
    traffic: '650 GB/s',
  },
]

// Showcase: Weather emojis
export const weatherMarkers = [
  {
    id: 'weather-1',
    location: [50.0, -100.0] as [number, number],
    emoji: '☀️',
  },
  { id: 'weather-2', location: [55.0, 10.0] as [number, number], emoji: '🌧️' },
  { id: 'weather-3', location: [25.0, 80.0] as [number, number], emoji: '⛈️' },
  {
    id: 'weather-4',
    location: [-10.0, -60.0] as [number, number],
    emoji: '🌤️',
  },
  { id: 'weather-5', location: [65.0, 100.0] as [number, number], emoji: '❄️' },
  { id: 'weather-6', location: [35.0, 140.0] as [number, number], emoji: '🌸' },
  { id: 'weather-7', location: [-30.0, 25.0] as [number, number], emoji: '🌈' },
  { id: 'weather-8', location: [40.0, -5.0] as [number, number], emoji: '☁️' },
  {
    id: 'weather-9',
    location: [-45.0, 170.0] as [number, number],
    emoji: '🌊',
  },
  {
    id: 'weather-10',
    location: [15.0, -130.0] as [number, number],
    emoji: '🌴',
  },
  {
    id: 'weather-11',
    location: [70.0, -40.0] as [number, number],
    emoji: '🌨️',
  },
  {
    id: 'weather-12',
    location: [-20.0, 130.0] as [number, number],
    emoji: '🔥',
  },
  { id: 'weather-13', location: [5.0, 40.0] as [number, number], emoji: '🌪️' },
  { id: 'weather-14', location: [45.0, 60.0] as [number, number], emoji: '🌙' },
  {
    id: 'weather-15',
    location: [-35.0, -70.0] as [number, number],
    emoji: '⭐',
  },
  {
    id: 'weather-16',
    location: [20.0, -20.0] as [number, number],
    emoji: '🌞',
  },
]

// Showcase configs
export const showcaseConfigs: Record<string, ShowcaseConfig> = {
  default: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    markerColor: [0.3, 0.45, 0.85],
    baseColor: [1, 1, 1],
    arcColor: [0.3, 0.45, 0.85],
    markerSize: 0.025,
    markerElevation: 0.01,
  },
  stickers: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 8,
    markerColor: [0.85, 0.35, 0.6],
    baseColor: [1, 1, 1],
    arcColor: [0.9, 0.4, 0.7],
    markerSize: 0.03,
    markerElevation: 0,
  },
  live: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    markerColor: [0.9, 0.2, 0.2],
    baseColor: [0.95, 0.95, 0.95],
    arcColor: [0.9, 0.3, 0.3],
    markerSize: 0.02,
    markerElevation: 0.01,
  },
  pulse: {
    theta: 0.2,
    dark: 1,
    mapBrightness: 10,
    markerColor: [0.2, 0.8, 0.9],
    baseColor: [0.5, 0.5, 0.5],
    arcColor: [0.3, 0.85, 0.95],
    markerSize: 0.025,
    markerElevation: 0,
  },
  interactive: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    markerColor: [0.1, 0.2, 0.45],
    baseColor: [1, 1, 1],
    arcColor: [0.15, 0.3, 0.55],
    markerSize: 0.025,
    markerElevation: 0,
  },
  polaroids: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 9,
    markerColor: [0.4, 0.6, 0.9],
    baseColor: [1, 1, 1],
    arcColor: [0.5, 0.7, 1],
    markerSize: 0.02,
    markerElevation: 0,
  },
  bars: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 9,
    markerColor: [0.15, 0.55, 0.55],
    baseColor: [1, 1, 1],
    arcColor: [0.2, 0.6, 0.6],
    markerSize: 0.02,
    markerElevation: 0,
  },
  analytics: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    markerColor: [0.3, 0.85, 0.45],
    baseColor: [1, 1, 1],
    arcColor: [0.25, 0.9, 0.5],
    markerSize: 0.04,
    markerElevation: 0,
  },
  flights: {
    theta: 0.2,
    dark: 0.05,
    mapBrightness: 8,
    markerColor: [0.3, 0.55, 0.95],
    baseColor: [0.98, 0.98, 1],
    arcColor: [0.35, 0.6, 1],
    markerSize: 0.02,
    markerElevation: 0,
  },
  labels: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 9,
    markerColor: [0.55, 0.35, 0.75],
    baseColor: [1, 1, 1],
    arcColor: [0.6, 0.4, 0.8],
    markerSize: 0.025,
    markerElevation: 0,
  },
  satellites: {
    theta: 0.2,
    dark: 0.01,
    mapBrightness: 9,
    markerColor: [0.9, 0.9, 0.9],
    baseColor: [0.95, 0.95, 0.95],
    arcColor: [0.5, 0.8, 1],
    markerSize: 0.03,
    markerElevation: 0.15,
  },
  weather: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    markerColor: [0.4, 0.7, 0.95],
    baseColor: [0.98, 0.98, 1],
    arcColor: [0.5, 0.8, 1],
    markerSize: 0.025,
    markerElevation: 0.12,
  },
  cdn: {
    theta: 0.2,
    dark: 0,
    mapBrightness: 10,
    markerColor: [0, 0, 0],
    baseColor: [1, 1, 1],
    arcColor: [0, 0, 0],
    markerSize: 0.012,
    markerElevation: 0.02,
  },
}

export const showcases = [
  { name: 'COBE v2', key: 'default' },
  { name: '▲ CDN', key: 'cdn' },
  { name: 'Stickers', key: 'stickers' },
  { name: 'Labels', key: 'labels' },
  { name: 'Satellites', key: 'satellites' },
  { name: 'Polaroids', key: 'polaroids' },
  { name: 'Live Badge', key: 'live' },
  { name: 'Flights', key: 'flights' },
  { name: 'Interactive', key: 'interactive' },
  { name: 'Analytics', key: 'analytics' },
  { name: 'Pulse', key: 'pulse' },
  { name: 'Weather', key: 'weather' },
  { name: 'Bars', key: 'bars' },
] as const

export type ShowcaseKey = (typeof showcases)[number]['key']

// Helper to get markers for a showcase
export function getShowcaseMarkers(key: ShowcaseKey, size: number) {
  const markerArrays: Record<
    ShowcaseKey,
    { id: string; location: [number, number] }[]
  > = {
    default: showcaseDefaultMarkers,
    cdn: cdnMarkers,
    stickers: stickerMarkers,
    live: liveMarkers,
    interactive: interactiveMarkers,
    polaroids: polaroidMarkers,
    pulse: pulseMarkers,
    bars: barMarkers,
    analytics: analyticsMarkers,
    flights: flightMarkers,
    labels: labelMarkers,
    satellites: satelliteMarkers,
    weather: weatherMarkers,
  }
  const arr = markerArrays[key]
  if (!arr) return []
  return arr.map((m) => ({ location: m.location, size, id: m.id }))
}

// Helper to get arcs for a showcase
export function getShowcaseArcs(key: ShowcaseKey) {
  if (key === 'default') {
    return showcaseDefaultArcs.map((a) => ({
      from: a.from,
      to: a.to,
      id: a.id,
    }))
  }
  if (key === 'flights') {
    return flightArcs.map((a) => ({ ...a }))
  }
  if (key === 'cdn') {
    return cdnArcs.map((a) => ({ ...a }))
  }
  return []
}
