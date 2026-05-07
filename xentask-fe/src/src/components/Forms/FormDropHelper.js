/**
 * This Is A Helper Container So We Can Drop Items Into A Particular List
 * In The Sidebar. It Prevents Items From Being Stuck When Sorting
 */
import { useDroppable } from '@dnd-kit/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const FormDropHelper = ({ id, parentId, flatItems, addItemToEditor,show }) => {

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "helper",
      parentId,
    },
  });

  let styles = {
    height: 36,
    border: '1px solid',
    borderStyle: 'dashed',
    marginRight: 10,
    marginTop: 10,
    color: "white"
  }

  if (isOver) {

    styles = {
      border: '2px dashed green'
    }
  } else {
    styles = {
      border: '2px dashed var(--bs-border-color)'
    }
  }
  console.log(flatItems);
  return (
    <>
      {show && (

        <div
          className="dropdown d-flex align-items-center justify-content-center w-100 p-3 "
          style={{ cursor: "pointer", ...styles }}
          ref={setNodeRef}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span>
            <FontAwesomeIcon icon={faPlus} />
            &nbsp;Drop Items Here or Click To Add.
          </span>

          <ul className="dropdown-menu w-100">
            {flatItems.map(e => {
              return <li 
                        key={e.id}
                      >
                        <button type="button" className="dropdown-item" onClick={()=>addItemToEditor(e)}>
                          {e.name}
                        </button>
                      </li>
            })}
            
          </ul>
        </div>


      )}
    </>
  )
}

export default FormDropHelper;