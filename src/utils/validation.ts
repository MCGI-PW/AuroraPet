import { RegisterInput } from '../types/auth';

/** Validações dos formulários de autenticação (retornam a mensagem de erro ou null). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

export function validateLoginForm(email: string, password: string): string | null {
  if (!email.trim()) return 'Informe seu e-mail.';
  if (!isValidEmail(email)) return 'Digite um e-mail válido (ex.: nome@email.com).';
  if (!password) return 'Informe sua senha.';
  return null;
}

export function validateRegisterForm(input: RegisterInput, confirmPassword: string): string | null {
  if (input.name.trim().length < 3) return 'Informe seu nome completo.';
  if (!isValidEmail(input.email)) return 'Digite um e-mail válido (ex.: nome@email.com).';
  if (input.password.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
  if (input.password !== confirmPassword) return 'As senhas digitadas não coincidem.';
  if (input.role === 'veterinarian' && !input.crmv?.trim()) return 'Informe seu CRMV.';
  return null;
}

export function validateEmailForm(email: string): string | null {
  if (!email.trim()) return 'Informe o e-mail cadastrado.';
  if (!isValidEmail(email)) return 'Digite um e-mail válido.';
  return null;
}
