import { validateUserRegistration } from '../utils/userValidator';

describe('validateUserRegistration - Tests complets', function () {

  
    //valide
    test('Adulte valide', function () {
        expect(validateUserRegistration(25, "user", "user@example.com")).toBe(true);
    });

    test('Mineur stagiaire accepté', function () {
        expect(validateUserRegistration(17, "stagiaire", "user@example.com")).toBe(true);
    });


    //refus
    test('Mineur non stagiaire refusé', function () {
        expect(validateUserRegistration(17, "admin", "user@example.com")).toBe(false);
    });

    test('Email sans @', function () {
        expect(validateUserRegistration(25, "user", "userexample.com")).toBe(false);
    });

    test('Email sans point', function () {
        expect(validateUserRegistration(25, "user", "user@examplecom")).toBe(false);
    });

    test('Email non string', function () {
        expect(validateUserRegistration(25, "user", null as any)).toBe(false);
    });

    // erreur
    test('Age trop grand', function () {
        expect(function () {
        validateUserRegistration(121, "user", "user@example.com");
        }).toThrow("Âge invalide");
    });

    test('Age non numérique', function () {
        expect(function () {
        validateUserRegistration("abc" as any, "user", "user@example.com");
        }).toThrow("Âge invalide");
    });

    test('Role invalide', function () {
        expect(function () {
        validateUserRegistration(25, "moderator", "user@example.com");
        }).toThrow("Rôle invalide");
    });

});