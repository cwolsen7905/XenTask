import { parseTimeToSeconds, convertSecondsToTime } from '../../../Utils/Utils';
import { useState, useEffect, useRef } from 'react';

const FieldsTimeInput = ({ placeholder = "Add In A Time Entry", callBack, defaultValue, required = false, disabled = false }) => {

    const initial = convertSecondsToTime(defaultValue);
    const [value, setValue] = useState(defaultValue ? initial : '');
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);  // Reference for the input element

    // Validate the input and apply the classes for valid/invalid states
    const validateInput = (inputValue, inputElement) => {
        const result = parseTimeToSeconds(inputValue);

        if (result !== null) {
            // Valid input
            inputElement.classList.add('valid-input');
            inputElement.classList.remove('invalid-input');
        } else {
            if (inputValue.trim() !== '') {
                // Invalid input if not empty
                inputElement.classList.add('invalid-input');
                inputElement.classList.remove('valid-input');
            } else {
                // Remove classes if the input is blank
                inputElement.classList.remove('valid-input');
                inputElement.classList.remove('invalid-input');
            }
        }
    };

    const handleChange = (e) => {
        const inputValue = e.target.value;
        validateInput(inputValue, e.target);  // Apply validation logic

        setValue(inputValue);
        setShowDropdown(!isNaN(inputValue.charAt(0)) && inputValue.charAt(0) !== ' ' && inputValue.charAt(0) !== '');
    };

    const handleBlur = (e) => {
        if (e.relatedTarget && e.relatedTarget.closest('.dropdown-menu')) {
            return;  // Ignore blur if focus is moving to a dropdown item
        }

        const inputValue = e.target.value;
        const result = parseTimeToSeconds(inputValue);

        if (result !== null) {
            if (result !== defaultValue) {
                if (callBack) callBack(result);
            }
        } else if (inputValue.trim() === '') {
            // If the input is blank, reset the value and remove any classes
            e.target.classList.remove('valid-input');
            e.target.classList.remove('invalid-input');
            if (callBack) callBack(0);
        }

        setShowDropdown(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleItemClick = (unit) => {
        const inputElement = inputRef.current;  // Use ref to get the input element
        const numericValue = value.replace(/\D/g, '');  // Extract numeric part of the value

        if (numericValue) {
            const newValue = `${numericValue} ${unit}`;
            setValue(newValue);

            // Validate the newly constructed value
            validateInput(newValue, inputElement);

            setShowDropdown(false);  // Close the dropdown after selection
        }
    };

    useEffect(() => {
        const _initial = convertSecondsToTime(defaultValue);
        setValue(defaultValue ? _initial : '');
    }, [defaultValue]);

    return (
        <div className="position-relative">
            <input
                ref={inputRef}  // Attach the ref to the input element
                type="text"
                placeholder={placeholder}
                value={value}
                className="custom-select-search form-control"
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                required={required}
                disabled={disabled}
            />
            {showDropdown && (
                <div className="dropdown-menu show">
                    <button className="dropdown-item" type="button" onMouseDown={() => handleItemClick('Seconds')}>Seconds</button>
                    <button className="dropdown-item" type="button" onMouseDown={() => handleItemClick('Minutes')}>Minutes</button>
                    <button className="dropdown-item" type="button" onMouseDown={() => handleItemClick('Hours')}>Hours</button>
                    <button className="dropdown-item" type="button" onMouseDown={() => handleItemClick('Day(s)')}>Day(s)</button>
                    <button className="dropdown-item" type="button" onMouseDown={() => handleItemClick('Month(s)')}>Month(s)</button>
                    <button className="dropdown-item" type="button" onMouseDown={() => handleItemClick('Year(s)')}>Year(s)</button>
                </div>
            )}
        </div>
    );
};

export default FieldsTimeInput;
