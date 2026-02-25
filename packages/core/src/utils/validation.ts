export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  name: string;
  validate: (value: T) => string | null;
}

export function runValidation<T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const error = rule.validate(value);
    if (error) {
      errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
