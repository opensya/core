function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 *
 * @param length default 16
 * @returns string
 */
export function random({
  length = 12,
  lowerCase = true,
  upperCase = true,
  digits = true,
  specialChars = false,
}: {
  length?: number;
  lowerCase?: boolean;
  upperCase?: boolean;
  digits?: boolean;
  specialChars?: boolean;
} = {}) {
  const _lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const _upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const _digits = "0123456789";
  const _specialChars = "!@#$%^&*()_+[]{};':\"\\|,.<>/?`~-";
  let allChars = "";

  let password = "";
  if (lowerCase) {
    password += _lowerCase[getRandomInt(_lowerCase.length)];
    allChars += _lowerCase;
  }

  if (upperCase) {
    password += _upperCase[getRandomInt(_upperCase.length)];
    allChars += _upperCase;
  }

  if (digits) {
    password += _digits[getRandomInt(_digits.length)];
    allChars += _digits;
  }

  if (specialChars) {
    password += _specialChars[getRandomInt(_specialChars.length)];
    allChars += _specialChars;
  }

  for (let i = password.length; i < length; i++) {
    password += allChars[getRandomInt(allChars.length)];
  }

  // Mélange sécurisé
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}
