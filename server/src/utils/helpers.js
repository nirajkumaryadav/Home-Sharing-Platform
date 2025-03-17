function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US');
}

function isDateInRange(startDate, endDate, dateToCheck) {
    return new Date(dateToCheck) >= new Date(startDate) && new Date(dateToCheck) <= new Date(endDate);
}

function calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export { generateUniqueId, formatDate, isDateInRange, calculateDaysBetween };