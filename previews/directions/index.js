/** Directions 7–26. Registered additively; 1–6 live in app.js and are untouched. */
import * as d7 from './d7.js';
import * as d8 from './d8.js';
import * as d9 from './d9.js';
import * as d10 from './d10.js';
import * as d11 from './d11.js';
import * as d12 from './d12.js';
import * as d13 from './d13.js';
import * as d14 from './d14.js';
import * as d15 from './d15.js';
import * as d16 from './d16.js';
import * as d17 from './d17.js';
import * as d18 from './d18.js';
import * as d19 from './d19.js';
import * as d20 from './d20.js';
import * as d21 from './d21.js';
import * as d22 from './d22.js';
import * as d23 from './d23.js';
import * as d24 from './d24.js';
import * as d25 from './d25.js';
import * as d26 from './d26.js';

const mods = [d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26];
export const EXTRA_DIRECTIONS = mods.map((m) => m.meta);
export const EXTRA_RENDER = Object.fromEntries(mods.map((m) => [m.meta.id, { list: m.list, detail: m.detail }]));
