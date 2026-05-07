import Kanban from '../../../Kanban/Kanban';
import Forms from '../../../Forms/Forms';
import List from './List';


const ListViewSwitcher = (props) => {
    const { viewType } = props; // Assuming 'viewType' is the flag that indicates which component to render

    switch (viewType) {
        case 'kanban':
            return <Kanban {...props} />;
        case 'list':
            return <List {...props} />;
        case 'forms':
            const { id, selectedForm, statuses, taskCustomFields, priority, setForms, setSelectedForm } = props;
            return <Forms props={{ 
                    id, 
                    statuses, 
                    taskCustomFields, 
                    priority,
                    selectedForm, 
                    setForms,
                    setSelectedForm
                }} />;
        default:
            return;
    }
};

export default ListViewSwitcher;
