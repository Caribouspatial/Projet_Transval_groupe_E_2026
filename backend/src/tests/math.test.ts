import { calculateShipping } from '../utils/shipping';

/////////////////////////////////////////////////////////
//                  TESTS FONCTIONNELS                //
/////////////////////////////////////////////////////////

describe('Shipping Calculator - Tests Fonctionnels', () => {

  // 1. Cas simples
  describe('1. Cas simples', () => {

    test('Distance courte, poids léger, standard', () => {
      expect(calculateShipping(10, 5, 'standard')).toBe(10);
    });

    test('Distance moyenne, poids lourd, standard', () => {
      expect(calculateShipping(100, 20, 'standard')).toBe(37.5);
    });

    test('Distance courte, poids léger, express', () => {
      expect(calculateShipping(10, 5, 'express')).toBe(20);
    });

  });

  // 2. Tests des limites
  describe('2. Tests des limites', () => {

    test('Distance = 0 km', () => {
      expect(calculateShipping(0, 5, 'standard')).toBe(10);
    });

    test('Distance = 50 km', () => {
      expect(calculateShipping(50, 5, 'standard')).toBe(10);
    });

    test('Distance = 51 km', () => {
      expect(calculateShipping(51, 5, 'standard')).toBe(25);
    });

    test('Distance = 500 km', () => {
      expect(calculateShipping(500, 5, 'standard')).toBe(25);
    });

    test('Distance = 501 km', () => {
      expect(calculateShipping(501, 5, 'standard')).toBe(50);
    });

    test('Poids = 10 kg', () => {
      expect(calculateShipping(10, 10, 'standard')).toBe(15);
    });

  });

  // 3. Tests des erreurs
  describe('3. Tests des erreurs', () => {

    test('Distance négative', () => {
      expect(() => calculateShipping(-1, 5, 'standard')).toThrow('Invalid distance');
    });

    test('Poids = 0', () => {
      expect(() => calculateShipping(10, 0, 'standard')).toThrow('Invalid weight');
    });

    test('Poids négatif', () => {
      expect(() => calculateShipping(10, -5, 'standard')).toThrow('Invalid weight');
    });

    test('Poids > 50', () => {
      expect(() => calculateShipping(10, 51, 'standard')).toThrow('Invalid weight');
    });

  });

});

/////////////////////////////////////////////////////////
//                TESTS PAIRWISE (2-WISE)            //
/////////////////////////////////////////////////////////

describe('Shipping Calculator - Pairwise (2-wise)', () => {

  /**
   * Pairwise Testing (2-wise)
   * Objectif : couvrir toutes les paires (distance, poids, type)
   * sans tester toutes les combinaisons de 3 paramètres.
   * 
   * Paramètres :
   * Distance (D) : D1=0-50, D2=51-500, D3>500
   * Poids (W) : W1<10, W2=10-50
   * Type (T) : Standard, Express
   */
  const pairwiseCases = [
    [10, 5, 'standard', 10],   // D1, W1, T1
    [10, 20, 'express', 30],   // D1, W2, T2
    [100, 5, 'express', 50],   // D2, W1, T2
    [100, 20, 'standard', 37.5], // D2, W2, T1
    [600, 5, 'express', 100],  // D3, W1, T2
    [600, 20, 'standard', 75]  // D3, W2, T1
  ];

  test.each(pairwiseCases)(
    'distance=%i, weight=%i, type=%s → %f',
    (distance, weight, type, expected) => {
      expect(calculateShipping(distance, weight, type)).toBe(expected);
    }
  );

});