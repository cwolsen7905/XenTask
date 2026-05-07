
import { useState, useContext, useEffect } from 'react';
import { useUI } from '../../Contexts/UIContext';
import { Link } from 'react-router-dom';

import TaskTable from '../../Tables/TaskTable';
import TableButton from '../../Tables/components/TableButton';
import TableCheckbox from '../../Tables/components/TableCheckbox';
import TableTags from '../../Tables/components/TableTags';
import TableDropdown from '../../Tables/components/TableDropdown';
import TableDatePicker from '../../Tables/components/TableDatePicker';
import TableSlider from '../../Tables/components/TableSlider';
import TableInput from '../../Tables/components/TableInput';
import TableAssignees from '../../Tables/components/TableAssignees';
import { DataContext } from '../../Contexts/DataContext';

import axios from 'axios';

const TimeSheets = () => {

    // Allows Us To Use The Modal
    const { openModal } = useUI();
    const { globalData } = useContext(DataContext);

    const [dataLoaded, setDataLoaded] = useState(false);

    
};


export default TimeSheets;