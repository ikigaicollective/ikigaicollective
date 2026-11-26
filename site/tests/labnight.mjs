import { nextLabNight, labNightPhase, LAB_NIGHT_LABEL } from '../src/lib/labnight.ts';
const iso = (t) => new Date(t).toISOString();
let bad = 0; const eq = (name, got, want) => { const ok = got === want; if (!ok) bad++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : `got ${got} want ${want}`); };
eq('label', LAB_NIGHT_LABEL, '16:00 Rome');
// summer (CEST, UTC+2): Thu 22 Oct 2026, 16:00 Rome = 14:00Z
eq('summer start 14:00Z', iso(nextLabNight(Date.parse('2026-10-20T10:00:00Z'))), '2026-10-22T14:00:00.000Z');
eq('Thu 12:59 Rome = idle', labNightPhase(Date.parse('2026-10-22T10:59:00Z')).phase, 'idle');
eq('Thu 13:00 Rome = tonight', labNightPhase(Date.parse('2026-10-22T11:00:00Z')).phase, 'tonight');
eq('Thu 15:30 Rome = tonight', labNightPhase(Date.parse('2026-10-22T13:30:00Z')).phase, 'tonight');
eq('Thu 15:59:59 = tonight', labNightPhase(Date.parse('2026-10-22T13:59:59Z')).phase, 'tonight');
eq('Thu 16:00 = live', labNightPhase(Date.parse('2026-10-22T14:00:00Z')).phase, 'live');
eq('Thu 16:30 = live', labNightPhase(Date.parse('2026-10-22T14:30:00Z')).phase, 'live');
eq('Thu 16:59:59 = live', labNightPhase(Date.parse('2026-10-22T14:59:59Z')).phase, 'live');
eq('Thu 17:00 = idle, next week', iso(labNightPhase(Date.parse('2026-10-22T15:00:00Z')).start), '2026-10-29T15:00:00.000Z');
eq('Thu 17:00 = idle', labNightPhase(Date.parse('2026-10-22T15:00:00Z')).phase, 'idle');
// DST ends Sun 25 Oct 2026: next Thu 29 Oct is CET (UTC+1) -> 15:00Z
eq('after DST end: 16:00 Rome = 15:00Z', iso(nextLabNight(Date.parse('2026-10-23T09:00:00Z'))), '2026-10-29T15:00:00.000Z');
eq('Thu 26 Nov 15:30 Rome (14:30Z) = tonight', labNightPhase(Date.parse('2026-11-26T14:30:00Z')).phase, 'tonight');
eq('Thu 26 Nov 16:30 Rome (15:30Z) = live', labNightPhase(Date.parse('2026-11-26T15:30:00Z')).phase, 'live');
// DST starts Sun 29 Mar 2026: Thu 26 Mar is CET (15:00Z), Thu 2 Apr is CEST (14:00Z)
eq('before DST start: Thu 26 Mar 15:00Z', iso(nextLabNight(Date.parse('2026-03-24T09:00:00Z'))), '2026-03-26T15:00:00.000Z');
eq('after DST start: Thu 2 Apr 14:00Z', iso(nextLabNight(Date.parse('2026-03-27T09:00:00Z'))), '2026-04-02T14:00:00.000Z');
console.log(bad ? `${bad} FAILED` : 'all pass');
