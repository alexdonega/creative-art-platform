/**
 * Formatador de telefone brasileiro
 * Suporta celular (11 dígitos) e telefone fixo (10 dígitos)
 */

export function formatPhone(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita o número de dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Formata baseado no tamanho
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 3) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 10) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    // Celular com 11 dígitos
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 3)} ${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
  }
}

export function unformatPhone(value: string): string {
  // Remove tudo que não é número
  return value.replace(/\D/g, '');
}

export function validatePhone(value: string): boolean {
  const numbers = unformatPhone(value);
  
  // Deve ter 10 dígitos (fixo) ou 11 dígitos (celular)
  if (numbers.length !== 10 && numbers.length !== 11) {
    return false;
  }
  
  // Validações básicas de DDD
  const ddd = parseInt(numbers.slice(0, 2));
  const validDDDs = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, // RJ
    27, 28, // ES
    31, 32, 33, 34, 35, 37, 38, // MG
    41, 42, 43, 44, 45, 46, // PR
    47, 48, 49, // SC
    51, 53, 54, 55, // RS
    61, // DF
    62, 64, // GO
    63, // TO
    65, 66, // MT
    67, // MS
    68, // AC
    69, // RO
    71, 73, 74, 75, 77, // BA
    79, // SE
    81, 87, // PE
    82, // AL
    83, // PB
    84, // RN
    85, 88, // CE
    86, 89, // PI
    91, 93, 94, // PA
    92, 97, // AM
    95, // RR
    96, // AP
    98, 99 // MA
  ];
  
  if (!validDDDs.includes(ddd)) {
    return false;
  }
  
  // Se for celular (11 dígitos), o terceiro dígito deve ser 9
  if (numbers.length === 11) {
    return numbers[2] === '9';
  }
  
  // Se for fixo (10 dígitos), o terceiro dígito não pode ser 9
  if (numbers.length === 10) {
    return numbers[2] !== '9';
  }
  
  return true;
}

export function getPhoneType(value: string): 'mobile' | 'landline' | 'invalid' {
  const numbers = unformatPhone(value);
  
  if (numbers.length === 11 && numbers[2] === '9') {
    return 'mobile';
  } else if (numbers.length === 10 && numbers[2] !== '9') {
    return 'landline';
  }
  
  return 'invalid';
}

export function getPhoneError(value: string): string | null {
  if (!value.trim()) return null;
  
  const numbers = unformatPhone(value);
  
  if (numbers.length === 0) return null;
  
  if (numbers.length < 10) {
    return 'Telefone deve ter pelo menos 10 dígitos';
  }
  
  if (numbers.length > 11) {
    return 'Telefone deve ter no máximo 11 dígitos';
  }
  
  const ddd = parseInt(numbers.slice(0, 2));
  const validDDDs = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, // RJ
    27, 28, // ES
    31, 32, 33, 34, 35, 37, 38, // MG
    41, 42, 43, 44, 45, 46, // PR
    47, 48, 49, // SC
    51, 53, 54, 55, // RS
    61, // DF
    62, 64, // GO
    63, // TO
    65, 66, // MT
    67, // MS
    68, // AC
    69, // RO
    71, 73, 74, 75, 77, // BA
    79, // SE
    81, 87, // PE
    82, // AL
    83, // PB
    84, // RN
    85, 88, // CE
    86, 89, // PI
    91, 93, 94, // PA
    92, 97, // AM
    95, // RR
    96, // AP
    98, 99 // MA
  ];
  
  if (!validDDDs.includes(ddd)) {
    return 'DDD inválido';
  }
  
  if (numbers.length === 11 && numbers[2] !== '9') {
    return 'Celular deve começar com 9 após o DDD';
  }
  
  if (numbers.length === 10 && numbers[2] === '9') {
    return 'Telefone fixo não pode começar com 9';
  }
  
  return null;
}