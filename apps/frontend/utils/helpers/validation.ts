export const validationErrors = {
  required: 'This field is required',
  minOne: 'Please enter at least one character.',
  minString: (min: number) => `Please enter at least ${min} characters.`,
  maxString: (max: number) => `Please enter no more than ${max} characters.`,
  minArray: (min: number) =>
    `Please select at least ${min} option${min === 1 ? '' : 's'}.`,
  maxArray: (max: number) => `Please select no more than ${max} options.`,
  minNumber: (min: number) =>
    `Please enter a number greater or equal to ${min}.`,
  maxNumber: (max: number) => `Please enter a number less than ${max}.`,
  alphaNumericWithSpaces:
    'Please enter only alphanumeric characters and spaces.',
  alphaNumericWithoutSpaces:
    'Please enter only alphanumeric characters and no spaces.',
  invalidAddress: 'Please enter a valid address.',
  invalidEmail: 'Please enter a valid email address.',
  invalidColor: 'Please enter a valid color.',
  invalidNewPassword:
    'Please enter a valid password. It must contain at least one uppercase letter, one lowercase letter, one number and one special character.'
};

export const passwordValidation =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const hexColorValidation = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const isValidHex = (hex: string) => hexColorValidation.test(hex);

export const isUndefined = (value: unknown) => typeof value === 'undefined';

export const urlValidation =
  /^(https?:\/\/(www\.)?[^\s/$.?#]+\.[^\s/]+\.[a-zA-Z]{2,}[^\s]*)$/i;
