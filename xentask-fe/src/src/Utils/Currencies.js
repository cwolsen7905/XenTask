/**
 * This Is Meant To Be Global Use Throughout Our Code For 
 * Currencies And Their Mapping For Their Icons
 */
 import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
 import {
     faDollarSign,
     faEuroSign,
     faPoundSign,
     faYenSign,
 } from '@fortawesome/free-solid-svg-icons';

export const currenciesDropdown = {
    value: '0',
    options: [{
        label: 'US Dollar',
        icon: <FontAwesomeIcon icon={faDollarSign} />,
        id: '0',
        value: 'dollar'
    },
    {
        label: 'Euro',
        icon: <FontAwesomeIcon icon={faEuroSign} />,
        id: '1',
        value: 'euro'
    },
    {
        label: 'British Pound',
        icon: <FontAwesomeIcon icon={faPoundSign} />,
        id: '2',
        value: 'pound'
    },
    {
        label: 'Chinese Yuan',
        icon: <FontAwesomeIcon icon={faYenSign} />,
        id: '3',
        value: 'yuan'
    },
    {
        label: 'Japanese Yen',
        icon: <FontAwesomeIcon icon={faYenSign} />,
        id: '4',
        value: 'yen'
    }]
};

export const currencies = {
    
    "dollar": <FontAwesomeIcon icon={faDollarSign} />,
    "euro": <FontAwesomeIcon icon={faEuroSign} />,
    "yaun": <FontAwesomeIcon icon={faYenSign} />,
    "yen": <FontAwesomeIcon icon={faYenSign} />,
  
};