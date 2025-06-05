import { getIngredientSectionName } from '../scripts/main.js';

describe('getIngredientSectionName', () => {
  test('retorna o nome formatado para "poolish"', () => {
    expect(getIngredientSectionName('poolish')).toBe('Poolish (Pré-Fermento)');
  });

  test('formata chaves camelCase', () => {
    expect(getIngredientSectionName('finalDough')).toBe('Massa Final');
  });
});
