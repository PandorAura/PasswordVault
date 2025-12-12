import zxcvbn from "zxcvbn";

export function calculatePasswordStrength(password) {
  let score = zxcvbn(password).score;

  switch (score) {
    case 0:
      return "Very Weak";
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Strong";
    case 4:
      return "Very Strong";
    default:
      return "Very Weak";
  }
}
