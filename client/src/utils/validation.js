const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    return password.length >= 6; // Minimum length of 6 characters
};

const validateHomeListing = (listing) => {
    const { location, availableDates, requirements } = listing;
    return location && availableDates.length > 0 && requirements;
};

export { validateEmail, validatePassword, validateHomeListing };