export function parseTimeToSeconds(timeInput) {

    const regex = /^(?<value1>\d+(\.\d+)?)\s*(?<unit1>[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s*(?:\(?s\)?)?(?:\s*(?:and|&)?\s*(?<value2>\d+(\.\d+)?)\s*(?<unit2>[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s*(?:\(?s\)?)?)?$/;

    const match = timeInput.match(regex);
    
    if (!match) {
        console.error(`Invalid time format: ${timeInput}`);
        return null;
    }
    
    const { value1, unit1, value2, unit2 } = match.groups;

    // Convert values to numeric
    const numericValue1 = parseFloat(value1 || '');
    const numericValue2 = parseFloat(value2 || 0);

    // Normalize units
    const normalizedUnit1 = normalizeUnit(unit1);
    const normalizedUnit2 = normalizeUnit(unit2);

    const timeUnits = {
        second: 1,
        minute: 60,
        hour: 3600,
        day: 86400,
        week: 604800,
        month: 2592000,
        year: 31536000,
        // Add more units if needed
    };

    if (timeUnits.hasOwnProperty(normalizedUnit1)) {
        const totalSeconds = (numericValue1 * timeUnits[normalizedUnit1]) +
            (numericValue2 * timeUnits[normalizedUnit2 || 'minute']); // Default to minutes if unit2 is empty

        // Convert total seconds to human-readable format
        const hours = Math.floor(totalSeconds / 3600);
        const remainingSeconds = totalSeconds % 3600;
        const minutes = Math.floor(remainingSeconds / 60);

        if (isNaN(hours) || isNaN(minutes)) return null;

        //console.log(`Converted time: ${hours}hr ${minutes}min`, totalSeconds);

        if (isNaN(totalSeconds)) return null;

        return totalSeconds;

    } else {
        console.error(`Invalid time unit: ${unit1}`);
        return null;
    }
};

export function normalizeUnit(unit) {
    if (!unit) return '';
    const unitMappings = {
        s: 'second',
        sec: 'second',
        secs: 'second',
        seconds: 'second',
        second: 'second',
        min: 'minute',
        mins: 'minute',
        m: 'minute',
        minute: 'minute',
        minutes: 'minute',
        hour: 'hour',
        hours: 'hour',
        hr: 'hour',
        hrs: 'hour',
        hs: 'hour',
        h: 'hour',
        day: 'day',
        days: 'day',
        d: 'day',
        wk: 'week',
        wks: 'week',
        weeks: 'week',
        mo: 'month',
        mos: 'month',
        months: 'month',
        mon: 'month',
        mons: 'month',
        yr: 'year',
        yrs: 'year',
        year: 'year',
        years: 'year',
    };

    const normalizedUnit = unit.toLowerCase().replace(/\b(and|s)\b\s*/, '').trim();
    return unitMappings[normalizedUnit] || normalizedUnit;

};

export function convertSecondsToTime(seconds) {
    const timeUnits = {
        year: 31536000,  // 365 days
        month: 2592000,  // 30 days
        week: 604800,    // 7 days
        day: 86400,      // 24 hours
        hour: 3600,      // 60 minutes
        minute: 60,      // 60 seconds
        second: 1,       // 1 second
    };

    let remainingSeconds = seconds;
    const timeComponents = [];

    for (const [unit, unitInSeconds] of Object.entries(timeUnits)) {
        if (remainingSeconds >= unitInSeconds) {
            const value = Math.floor(remainingSeconds / unitInSeconds);
            remainingSeconds %= unitInSeconds;
            timeComponents.push(`${value} ${unit}${value > 1 ? 's' : ''}`);
        }
    }

    return timeComponents.join(' and ');
}

/**
 * Will Take An Array Of Objects And Return A New Array
 * That Groups It By A Particular Type 
 * 
 * @param {*} arr - Array Of Objects
 * @param {*} key - Key To Group By on 
 * @returns Array Of Objects Grouped By A Key 
 */
export function groupByKey(arr, key) {
    return Object.entries(arr.reduce((acc, cur) => {
        const keyValue = cur[key];
        acc[keyValue] = acc[keyValue] || [];
        acc[keyValue].push(cur);
        return acc;
    }, {})).map(([key, items]) => ({ key, items }));
}


export function groupByKeyToObject(arr, key) {
    return arr.reduce((acc, cur) => {
        const keyValue = cur[key];
        if (!acc[keyValue]) {
            acc[keyValue] = [];
        }
        acc[keyValue].push(cur);
        return acc;
    }, {});
}

/**
 * Uppercase The The Letter Of A String
 */
export function ucFirst(string) {

    if (string.length === 0) {
        return string;
    }

    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function firstLetter(str){
    return str.charAt(0);
}

/**
 * Test To Ensure It's A Proper Email
 * @param {string} email 
 * @returns 
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};