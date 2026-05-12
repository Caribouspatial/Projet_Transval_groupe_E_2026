export function validateUserRegistration(age: number, role: string, email: string): boolean {

  if (role !== "admin" && role !== "user" && role !== "stagiaire") {
    throw new Error("Rôle invalide");
  }

  if (typeof age !== 'number') {
    throw new Error("Âge invalide");
  }

  if (age > 120) {
    throw new Error("Âge invalide");
  }

  if (age < 18 && role !== "stagiaire") {
    return false;
  }

  if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return false;
  }

  return true;
}