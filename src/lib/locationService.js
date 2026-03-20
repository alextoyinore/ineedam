const COUNTRY_TO_CURRENCY = {
    'NG': '₦',
    'US': '$',
    'GB': '£',
    'CA': 'C$',
    'AU': 'A$',
    'IN': '₹',
    'JP': '¥',
    'ZA': 'R',
    'AE': 'د.إ',
    // EU countries
    'AT': '€', 'BE': '€', 'CY': '€', 'EE': '€', 'FI': '€', 'FR': '€', 'DE': '€', 'GR': '€', 'IE': '€', 'IT': '€', 'LV': '€', 'LT': '€', 'LU': '€', 'MT': '€', 'NL': '€', 'PT': '€', 'SK': '€', 'SI': '€', 'ES': '€'
};

/**
 * Detect the user's country code using a free IP geolocation API.
 * Caches the result in localStorage to avoid redundant API calls.
 */
export const detectUserCurrency = async () => {
    try {
        // Check cache first
        const cached = localStorage.getItem('needam_detected_currency');
        if (cached) {
            const { currency, expiry } = JSON.parse(cached);
            if (Date.now() < expiry) return currency;
        }

        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Location detection failed');
        
        const data = await response.json();
        const countryCode = data.country_code; // e.g., 'NG'
        const currencySymbol = COUNTRY_TO_CURRENCY[countryCode] || '₦'; // Default to ₦ if not in list

        // Cache for 24 hours
        localStorage.setItem('needam_detected_currency', JSON.stringify({
            currency: currencySymbol,
            expiry: Date.now() + 24 * 60 * 60 * 1000
        }));

        return currencySymbol;
    } catch (err) {
        console.warn('[LocationService] Failed to detect currency:', err.message);
        return '₦'; // Global default
    }
};
