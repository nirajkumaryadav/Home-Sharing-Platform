const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const isDateAvailable = (bookedDates, startDate, endDate) => {
    for (let date of bookedDates) {
        if (date >= startDate && date <= endDate) {
            return false;
        }
    }
    return true;
};

export { formatDate, calculateDaysBetween, isDateAvailable };