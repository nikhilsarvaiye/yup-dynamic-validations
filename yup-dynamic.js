import * as yup from 'yup';

const config = [
    {
        id: 'name',
        label: 'Full name',
        placeholder: 'Enter full name',
        type: 'text',
        validationType: 'string',
        value: 'User name',
        validations: [
            {
                type: 'required',
                params: ['this field is required'],
            },
            {
                type: 'min',
                params: [5, 'name cannot be less than 5 characters'],
            },
            {
                type: 'max',
                params: [10, 'name cannot be more than 10 characters'],
            },
        ],
    },
    {
        id: 'email',
        label: 'Email',
        placeholder: 'Email',
        type: 'text',
        validationType: 'string',
        value: 'email',
        validations: [
            {
                type: 'required',
                params: ['this field is required'],
            },
            {
                type: 'min',
                params: [5, 'email cannot be less than 5 characters'],
            },
            {
                type: 'max',
                params: [10, 'email cannot be more than 10 characters'],
            },
            {
                type: 'email',
                params: ['please enter a valid email'],
            },
        ],
    },
    {
        id: 'phoneNumber',
        label: 'phone number',
        type: 'text',
        validationType: 'number',
        value: 7878787878,
        validations: [
            {
                type: 'min',
                params: [5, 'phone number cannot be less than 5 characters'],
            },
            {
                type: 'max',
                params: [10, 'phone number cannot be more than 10 characters'],
            },
            {
                type: 'required',
                params: ['phone number is required'],
            },
        ],
    },
    {
        id: 'total',
        label: 'Total People in Family',
        placeholder: 'family members count',
        type: 'text',
        validationType: 'number',
        required: false,
        value: '1',
        validations: [
            {
                type: 'required',
                params: ['this field is required'],
            },
            {
                type: 'min',
                params: [1, 'there should be atleast 1 family member'],
            },
            {
                type: 'max',
                params: [5, 'max family members can be 5'],
            },
        ],
    },
    {
        id: 'values',
        label: 'Values',
        type: 'text',
        validationType: 'array',
        value: [],
        validations: [
            {
                type: 'min',
                params: [1, 'array should have min one item'],
            },
            {
                type: 'required',
                params: ['values is required'],
            },
        ],
    },
    {
        id: 'custom',
        label: 'Custom',
        type: 'text',
        validationType: 'number',
        value: 7878787878,
        validations: [
            {
                type: 'customValidation',
                params: ['custom cannot be less than 10'],
            },
        ],
    },
];

yup.addMethod(yup.number, 'customValidation', function(message) {
    return this.test({
        name: 'custom',
        message: message,
        test: value => {
            console.log('running customValidation with value ' + value);
            return value >= 10 ? true : false;
        },
    });
});

function createYupSchema(schema, config) {
    const { id, validationType, validations = [] } = config;
    if (!yup[validationType]) {
        return schema;
    }
    let validator = yup[validationType]();
    validations.forEach((validation) => {
        const { params, type } = validation;
        if (!validator[type]) {
            return;
        }
        console.log(type, params);
        validator = validator[type](...params);
    });
    schema[id] = validator;
    return schema;
}

const testValidation = () => {
    const additionalManualValidations = {
		metadata: yup.object().shape({
			variants: yup
				.array()
				.of(
					yup.object().shape({
						color: yup.string().required('Please specify Color'),
						size: yup.number().required('Please specify Size'),
					}),
				)
				.required()
				.min(1),
		}),
	}
	
	try {
        schema = {
            ...schema,
            ...additionalManualValidations,
        };
        yup.object()
            .shape(schema)
            .validate(
                {
                    name: 'names',
                    email: 's@b.com',
                    phoneNumber: 6,
                    total: '4',
                    values: [{}],
                    metadata: {
                        variants: [{ color: 'a', size: 100 }],
                    },
                    custom: 10,
                },
                {
                    abortEarly: false,
                },
            )
            .then((r) => {
                console.log('------------- Valid ---------------');
                console.log(r);
            })
            .catch((error) => {
                const fieldErrors: any = {};
                if (Array.isArray(error.inner) && error.inner.length) {
                    error.inner.forEach((x: any) => {
                        fieldErrors[x.path] = {
                            type: x.type,
                            message: x.message,
                        };
                    });
                } else if (error.path && error.message) {
                    fieldErrors[error.path] = {
                        type: error.type,
                        message: error.message,
                    };
                }
                console.log('************** Errors *********************');
                console.log(fieldErrors);
            });
    } catch (e) {
        console.error(e);
    }
};

testValidation();
