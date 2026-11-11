import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSimulation } from '../src/data/validateSimulation.js';

const valid = {
  age: '63', sex: '1', cp: '1', trestbps: '145', chol: '233', fbs: '0',
  restecg: '2', thalach: '150', exang: '0', oldpeak: '0', slope: '3', ca: '0', thal: '6',
};

test('convertit les 13 champs en nombres et conserve les zéros', () => {
  const { payload, errors } = validateSimulation(valid);
  assert.deepEqual(errors, {});
  assert.equal(Object.keys(payload).length, 13);
  assert.ok(Object.values(payload).every(value => typeof value === 'number'));
  assert.equal(payload.fbs, 0);
  assert.equal(payload.oldpeak, 0);
  assert.equal(payload.ca, 0);
});

test('refuse un champ vide avant toute conversion en zéro', () => {
  for (const value of ['', '  ', null, undefined]) {
    const { payload, errors } = validateSimulation({ ...valid, age: value });
    assert.ok(errors.age);
    assert.equal(Object.hasOwn(payload, 'age'), false);
  }
  assert.equal(Object.keys(validateSimulation({}).errors).length, 13);
});

test('refuse les nombres non finis, codes inconnus et entiers fractionnaires', () => {
  const { errors } = validateSimulation({ ...valid, age: '2.5', thalach: '150.5', cp: '9', chol: 'Infinity' });
  for (const field of ['age', 'thalach', 'cp', 'chol']) assert.ok(errors[field]);
  assert.deepEqual(validateSimulation({ ...valid, oldpeak: '1.5' }).errors, {});
});
