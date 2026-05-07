import React, { useState,useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { currencies } from '../../Utils/Currencies';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useUI } from '../Contexts/UIContext';


/**
 * 
 * Use The Options To Set Any Extra Options EX: Currency Requires The Currency Type
 */
const FieldsInput = ({ type, value, styles, callBack, options = {}, required, keyName, showError = false }) => {

    const { showToastNotification } = useUI();

    const [text, setInput] = useState(value);

    const [disabled, toggleEdit] = useState(true);

    const [linkText, setLinkText] = useState(value);

    const [isInvalid, setInvalid] = useState(showError);

    //  In Case This Was Changed Outside
    useEffect(() => {
        setInvalid(showError);
    }, [showError]);

    const handleInputChange = (event) => {

        setInput(event.target.value);

        //if( type == 'link' ) setLinkText( event.target.value );

    };

    const handleBlur = (event) => {

        if (type == 'currency' && isNaN(event.target.value)) setInput('0.00');

    }

    const handleEditToggle = () => {

        let _canToggle = true;

        //  If We're Required And Can't Be Empty
        if( required && !disabled ) {

            if (text.trim() == '') _canToggle = false;
            setInvalid(true);

        }

        if (_canToggle) {

            toggleEdit(!disabled);

            //  If We're Saving 
            if (!disabled) {

                if (callBack) {
                    let _value = ( type !== 'link' ? text : linkText);
                    if( keyName ){
                        callBack(keyName,_value);
                    } else {
                        callBack(_value);
                    }
                }

                showToastNotification({
                    type: 'success',
                    message: "Updated Item Field"
                });

                setInvalid(false);
            }
        }


    };

    const chooseElement = () => {

        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !disabled) {
                handleEditToggle();
            }
        };

        if (type != 'link' || (type == 'link' && !disabled)) {

            return (
                <Form.Control
                    type={type}
                    placeholder="Enter A Value Here"
                    value={getValueFormat(text)}
                    onChange={handleInputChange}
                    disabled={disabled}
                    style={styles}
                    className={`${ isInvalid ? 'is-invalid' : '' }`}
                    onKeyDown={handleKeyDown}
                />
            );

        } else {

            let newText = text.includes('https') ? text : 'https://' + text;

            return (
                <span className="form-control disabled">
                    <a href={newText} target="_blank" className="p-button font-bold">{linkText}</a>
                </span>
            );

        }
    }

    const getValueFormat = (text) => {

        if (type == "currency" && disabled) {
           
            return formatPrice(text);

        } else if (type == "number" && disabled) {
            
            
            return text?.toLocaleString();

        } else {

            return text || '';

        }
    }

    const formatPrice = (number) => {
        return new Intl.NumberFormat('en-US').format(number);
    };


    return (
        <InputGroup style={styles} onBlur={handleBlur}>
            
            { 
                ( type == 'currency') && <span className="input-group-text">
                {currencies[options.currency]}
                </span>
            }

            {chooseElement()}

            <Button
                variant= { disabled ? "outline-secondary" : "success"}
                id="button-addon1"
                onClick={handleEditToggle}
            >

                <FontAwesomeIcon icon={disabled ? faPencilAlt : faCheck} />

            </Button>

        </InputGroup>
    );
};

export default FieldsInput;
