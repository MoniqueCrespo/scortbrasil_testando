import { brazilStates } from "@/data/locations";

/**
 * Valida se o código do estado é válido (2 letras maiúsculas)
 * @param stateCode - Código do estado a ser validado
 * @returns true se válido, false caso contrário
 */
export const isValidStateCode = (stateCode: string): boolean => {
  // Verifica se tem exatamente 2 caracteres
  if (!stateCode || stateCode.length !== 2) {
    return false;
  }
  
  // Verifica se são apenas letras maiúsculas
  if (!/^[A-Z]{2}$/.test(stateCode)) {
    return false;
  }
  
  // Verifica se é um código de estado brasileiro válido
  return brazilStates.some(state => state.code === stateCode);
};

/**
 * Normaliza o código do estado para o formato correto (2 letras maiúsculas)
 * Converte slugs ou nomes completos para códigos quando possível
 * @param value - Valor a ser normalizado
 * @returns Código do estado normalizado ou string vazia se inválido
 */
export const normalizeStateCode = (value: string): string => {
  if (!value) return '';
  
  const trimmedValue = value.trim().toUpperCase();
  
  // Se já é um código válido, retorna
  if (isValidStateCode(trimmedValue)) {
    return trimmedValue;
  }
  
  // Tenta encontrar por slug
  const stateBySlug = brazilStates.find(
    state => state.slug === value.toLowerCase()
  );
  if (stateBySlug) {
    return stateBySlug.code;
  }
  
  // Tenta encontrar por nome
  const stateByName = brazilStates.find(
    state => state.name.toLowerCase() === value.toLowerCase()
  );
  if (stateByName) {
    return stateByName.code;
  }
  
  // Se não encontrou nada, retorna vazio
  return '';
};

/**
 * Valida dados de localização antes do envio
 * @param state - Código do estado
 * @param city - Slug da cidade
 * @returns Objeto com status de validação e mensagem de erro
 */
export const validateLocation = (state: string, city: string): { 
  isValid: boolean; 
  error?: string 
} => {
  // Valida estado
  if (!state) {
    return { isValid: false, error: 'Estado é obrigatório' };
  }
  
  if (!isValidStateCode(state)) {
    return { 
      isValid: false, 
      error: `Código de estado inválido: "${state}". Use códigos como RJ, SP, MG` 
    };
  }
  
  // Valida cidade
  if (!city) {
    return { isValid: false, error: 'Cidade é obrigatória' };
  }
  
  if (!isValidCitySlug(city)) {
    return { 
      isValid: false, 
      error: `Formato de cidade inválido: "${city}". Use formato slug (ex: rio-de-janeiro, sao-paulo)` 
    };
  }
  
  return { isValid: true };
};

/**
 * Valida se o city slug está no formato correto (kebab-case)
 * Aceita tanto cidades quanto bairros principais
 * @param citySlug - Slug da cidade/bairro a ser validado
 * @returns true se válido, false caso contrário
 */
export const isValidCitySlug = (citySlug: string): boolean => {
  // Verifica se está vazio
  if (!citySlug || citySlug.length < 2) {
    return false;
  }
  
  // Verifica formato kebab-case: lowercase, números, hífens, sem caracteres especiais
  // Não pode começar ou terminar com hífen
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(citySlug)) {
    return false;
  }
  
  return true;
};

/**
 * Valida CPF brasileiro
 * @param cpf - CPF a ser validado (com ou sem pontuação)
 * @returns true se válido, false caso contrário
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }
  
  return true;
};

/**
 * Formata CPF para exibição (###.###.###-##)
 * @param cpf - CPF sem formatação
 * @returns CPF formatado
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return cpf;
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Valida email com regex robusto
 * @param email - Email a ser validado
 * @returns true se válido, false caso contrário
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  // RFC 5322 compliant regex (simplificado)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
};

/**
 * Valida telefone brasileiro (celular)
 * @param phone - Telefone a ser validado
 * @returns true se válido, false caso contrário
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Valida formato: (DD) 9XXXX-XXXX = 11 dígitos
  if (cleanPhone.length !== 11) return false;
  
  // Verifica se começa com 9 (celular)
  if (cleanPhone.charAt(2) !== '9') return false;
  
  return true;
};

/**
 * Valida chave PIX (CPF, email, telefone ou chave aleatória)
 * @param pixKey - Chave PIX a ser validada
 * @returns Objeto com validação e tipo de chave
 */
export const validatePixKey = (pixKey: string): { isValid: boolean; type?: string; error?: string } => {
  if (!pixKey || pixKey.trim().length === 0) {
    return { isValid: false, error: 'Chave PIX é obrigatória' };
  }
  
  const trimmedKey = pixKey.trim();
  
  // Tenta validar como CPF
  const cleanCPF = trimmedKey.replace(/[^\d]/g, '');
  if (cleanCPF.length === 11 && isValidCPF(trimmedKey)) {
    return { isValid: true, type: 'CPF' };
  }
  
  // Tenta validar como email
  if (isValidEmail(trimmedKey)) {
    return { isValid: true, type: 'Email' };
  }
  
  // Tenta validar como telefone
  const cleanPhone = trimmedKey.replace(/[^\d]/g, '');
  if (cleanPhone.length === 11 && isValidPhone(trimmedKey)) {
    return { isValid: true, type: 'Telefone' };
  }
  
  // Valida chave aleatória (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmedKey)) {
    return { isValid: true, type: 'Chave Aleatória' };
  }
  
  return { 
    isValid: false, 
    error: 'Chave PIX inválida. Use CPF, email, telefone ou chave aleatória válidos.' 
  };
};
