const currencyMap = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'AED': 'د.إ',
    'CAD': '$'
};

export const getSymbol = (code) => currencyMap[code] || '$';
