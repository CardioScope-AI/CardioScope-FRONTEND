import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSimulationPdf } from '../src/pdf/simulationPdf.js';
import { profilsFictifs } from '../src/data/profils.js';

test('exporte les deux classes sans modifier le profil et utilise une date UTC', () => {
  for (const prediction of [0, 1]) {
    const profile = { ...profilsFictifs[0].values };
    const before = { ...profile };
    const { doc, filename } = createSimulationPdf({ prediction, profile, exportedAt: new Date('2026-11-20T10:15:00Z') });
    assert.deepEqual(profile, before);
    assert.match(doc.output(), /^%PDF-/);
    assert.equal(doc.getNumberOfPages(), 1);
    assert.equal(filename, 'cardioscope-simulation-2026-11-20T10-15-00-000Z.pdf');
  }
});

test('refuse les classes et profils invalides sans les présenter comme une vraie simulation', () => {
  for (const prediction of [null, true, 2, '0']) {
    assert.throws(() => createSimulationPdf({ prediction, profile: profilsFictifs[0].values }));
  }
  assert.throws(() => createSimulationPdf({ prediction: 0, profile: {} }));
  const { filename } = createSimulationPdf({ prediction: 0, profile: {}, illustrative: true });
  assert.match(filename, /^cardioscope-apercu-/);
});
