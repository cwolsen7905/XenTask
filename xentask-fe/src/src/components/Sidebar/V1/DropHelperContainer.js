/**
 * This Is A Helper Container So We Can Drop Items Into A Particular List
 * In The Sidebar. It Prevents Items From Being Stuck When Sorting
 */
import { useDroppable } from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const DropHelperContainer = ( {id, parentId, show, isFolderItem = false} ) => {

    const {setNodeRef, isOver} = useDroppable({
      id,
      data: {
        type: "helper",
        parentId,
        isFolderItem
      },
    });

    let styles = {
        height: 36,
        border: '1px solid',
        borderStyle: 'dashed',
        marginRight:10,
        marginTop: 10,
        color: "white"
    }

    if( isOver ) { 
    
      styles['color'] = "green";
    
    } else {
      styles['color'] = {
        border: '2px dashed var(--bs-border-color)'
      }
    }

    return (
      <>
      { show && (

        <div 
          className="d-flex align-items-center justify-content-center"
          style={styles}
          ref={setNodeRef}
        >
          <FontAwesomeIcon icon={faPlus} />
          &nbsp;Drop Items Here
        </div>
      
      )}
      </>
    )
  }
  
export default DropHelperContainer;