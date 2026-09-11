const { ValidationError } = require('../../errors/app-error');

function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new ValidationError('Request validation failed', result.error.flatten()));
    }

    if (target === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,