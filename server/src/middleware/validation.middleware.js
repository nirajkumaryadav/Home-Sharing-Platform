const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const listingSchema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    location: Joi.string().required(),
    description: Joi.string().min(20).required(),
    availableDates: Joi.array().items(Joi.date()).required(),
    pricePerNight: Joi.number().min(1).required(),
    amenities: Joi.array().items(Joi.string())
});

const bookingSchema = Joi.object({
    listingId: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required()
});

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    };
};

module.exports = {
    validateUser: validate(userSchema),
    validateListing: validate(listingSchema),
    validateBooking: validate(bookingSchema)
};