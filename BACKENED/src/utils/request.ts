import { Request } from 'express';

export const getParam = (req: Request, paramName: string): string => {
  const value = req.params[paramName];
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
};

export const getQueryString = (req: Request, queryName: string): string | undefined => {
  const value = req.query[queryName];
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : undefined;
  }
  return value ? String(value) : undefined;
};
