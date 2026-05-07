import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleDown,
    faTag,
    faMoneyBill,
    faSliders,
    faUser,
    faSquareCheck,
    faHashtag,
    faCalendar,
    faPhone,
    faGlobe,
    faFont,
    faFlag,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

export const customFieldsIcons = (type) => {

    switch(type) {

        case('text'):
        return <FontAwesomeIcon icon={faFont} />
        
        case('dropdown'):
        return <FontAwesomeIcon icon={faCircleDown} />

        case('labels'):
        return  <FontAwesomeIcon icon={faTag} />

        case('currency'):
        return <FontAwesomeIcon icon={faMoneyBill} />

        case('slider'):
        return <FontAwesomeIcon icon={faSliders} />

        case('users'):
        case('people'):
        return <FontAwesomeIcon icon={faUser} />

        case('checkbox'):
        return <FontAwesomeIcon icon={faSquareCheck} />

        case('number'):
        return <FontAwesomeIcon icon={faHashtag} />

        case('date'):
        return <FontAwesomeIcon icon={faCalendar} />

        case('phone'):
        return <FontAwesomeIcon icon={faPhone} />

        case('link'):
        return <FontAwesomeIcon icon={faGlobe} />

        case('priority'):
        return <FontAwesomeIcon icon={faFlag} />

        case('status'):
        return <FontAwesomeIcon icon={faQuestionCircle} />

        default:
            return '';

    }
}