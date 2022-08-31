const Joi = require('joi');
const { objectId } = require('../../validations/custom.validation');

const createNewEmailTemplate = {
  body: Joi.object().keys({
    description: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Description is required.`);
          case 'string.empty':
            return new Error(`Description must not be empty.`);
          default:
            return new Error(`Description must be a string.`);
        }
      }
    }),
    title: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Title is required.`);
          case 'string.empty':
            return new Error(`Title must not be empty.`);
          default:
            return new Error(`Title must be a string.`);
        }
      }
    }),
    category: Joi.string()
      .valid(
        'Registration',
        'Referrence',
        'Reset_Password',
        'Approval',
        'Approval_Performed',
        'Share_Profile',
        'User_Status'
      )
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Category is required.`);
            case 'string.empty':
              return new Error(`Category must not be empty.`);
            case 'any.only':
              return new Error(
                `Category must be one of these: ['Registration', 'Referrence', 'Reset_Password', 'Approval', 'Approval_Performed', 'Share_Profile', 'User_Status']`
              );
            default:
              return new Error(`Category must be a string.`);
          }
        }
      }),
    aimTo: Joi.string()
      .valid('User', 'Admin', 'Referrer')
      .required()
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Aimto is required.`);
            case 'string.empty':
              return new Error(`Aimto must not be empty.`);
            case 'any.only':
              return new Error(`Aimto must be one of these: ['User', 'Admin', 'Referrer']`);
            default:
              return new Error(`Aimto must be a string.`);
          }
        }
      }),
    greetings: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Greetings is required.`);
          case 'string.empty':
            return new Error(`Greetings must not be empty.`);
          default:
            return new Error(`Greetings must be a string.`);
        }
      }
    }),
    body: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Body is required.`);
          case 'string.empty':
            User_Status;
            return new Error(`Body must not be empty.`);
          default:
            return new Error(`Body must be a string.`);
        }
      }
    }),

    closing: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Closing is required.`);
          case 'string.empty':
            return new Error(`Closing must not be empty.`);
          default:
            return new Error(`Closing must be a string.`);
        }
      }
    }),
    signature: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Signature is required.`);
          case 'string.empty':
            return new Error(`Signature must not be empty.`);
          default:
            return new Error(`Signature must be a string.`);
        }
      }
    }),
  }),
};

const getById = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId).error(new Error(`template id is required.`)),
  }),
};

const deleteEmailTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId).error(new Error(`template id is required.`)),
  }),
};

const updateEmailtemplate = {
  body: Joi.object().keys({
    description: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Description is required.`);
          case 'string.empty':
            return new Error(`Description must not be empty.`);
          default:
            return new Error(`Description must be a string.`);
        }
      }
    }),
    title: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Title is required.`);
          case 'string.empty':
            return new Error(`Title must not be empty.`);
          default:
            return new Error(`Title must be a string.`);
        }
      }
    }),
    category: Joi.string()
      .valid(
        'Registration',
        'Referrence',
        'Reset_Password',
        'Approval',
        'Approval_Performed',
        'Share_Profile',
        'User_Status'
      )
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Category is required.`);
            case 'string.empty':
              return new Error(`Category must not be empty.`);
            case 'any.only':
              return new Error(
                `Category must be one of these: ['Registration', 'Referrence', 'Reset_Password', 'Approval', 'Approval_Performed', 'Share_Profile', 'User_Status']`
              );
            default:
              return new Error(`Category must be a string.`);
          }
        }
      }),
    aimTo: Joi.string()
      .valid('User', 'Admin', 'Referrer')
      .error((errors) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const err of errors) {
          console.log(err.code);
          switch (err.code) {
            case 'any.required':
              return new Error(`Aimto is required.`);
            case 'string.empty':
              return new Error(`Aimto must not be empty.`);
            case 'any.only':
              return new Error(`Aimto must be one of these: ['User', 'Admin', 'Referrer']`);
            default:
              return new Error(`Aimto must be a string.`);
          }
        }
      }),
    greetings: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Greetings is required.`);
          case 'string.empty':
            return new Error(`Greetings must not be empty.`);
          default:
            return new Error(`Greetings must be a string.`);
        }
      }
    }),
    body: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Body is required.`);
          case 'string.empty':
            return new Error(`Body must not be empty.`);
          default:
            return new Error(`Body must be a string.`);
        }
      }
    }),

    closing: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Closing is required.`);
          case 'string.empty':
            return new Error(`Closing must not be empty.`);
          default:
            return new Error(`Closing must be a string.`);
        }
      }
    }),
    signature: Joi.string().error((errors) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const err of errors) {
        console.log(err.code);
        switch (err.code) {
          case 'any.required':
            return new Error(`Signature is required.`);
          case 'string.empty':
            return new Error(`Signature must not be empty.`);
          default:
            return new Error(`Signature must be a string.`);
        }
      }
    }),
  }),
};

module.exports = {
  getById,
  updateEmailtemplate,
  deleteEmailTemplate,
  createNewEmailTemplate,
};
