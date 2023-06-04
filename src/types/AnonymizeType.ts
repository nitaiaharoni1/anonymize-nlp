import { regexesKeys } from '../common/regexPatterns';

export const anonymizeTypeOptions: AnonymizeType[] = ['date', 'email', 'firstname', 'lastname', 'money', 'organization', 'phonenumber', ...regexesKeys];

export type AnonymizeType =
  | 'date'
  | 'email'
  | 'firstname'
  | 'lastname'
  | 'money'
  | 'organization'
  | 'phonenumber'
  | 'time'
  | 'numbers'
  | 'creditcard'
  | 'apikey'
  | 'ssn'
  | 'dl'
  | 'passport'
  | 'bankacc'
  | 'routing'
  | 'canadian_sin'
  | 'uk_nin'
  | 'ipv4'
  | 'ipv6'
  | 'bitcoin'
  | 'awsid'
  | 'awskey'
  | 'basic_auth'
  | 'bearer_token'
  | 'creditcard_luhn';
