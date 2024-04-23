import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'dateOrString', async: false })
export class DateOrStringValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value === 'string' || value instanceof Date) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return '날짜 혹은 문자열이 들어가야 합니다.';
  }
}
