import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { DataContext } from '../../Contexts/DataContext';

const CommentsCard = ({ comments, setEditMode, getDeleteId }) => {

    //console.log(comments);
    const { globalData } = useContext(DataContext);
    const userId = globalData.USER.id;

    return (
        comments.map((comment, index) => (

            <div className="card mb-2" key={comment.id}>

                <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <>
                            {comment.image ?
                                (<p>hi</p>) :
                                (<FontAwesomeIcon icon={faCircleUser} className="me-2" />)
                            }
                            <div>{comment.user.full_name}</div>
                        </>
                    </div>
                    <div className="d-flex align-items-center">
                        <em className="me-2">{comment.date_created}</em>
                        
                        {   /* Only Allow The Owner Of The Comment To Modify */
                            userId == comment.user.id && (
                                <>
                                    <button
                                        className="btn btn-outline-secondary btn-sm border-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="fa-solid fa-ellipsis"></i>
                                    </button>


                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton5">
                                        <li>
                                            <a className="dropdown-item text-primary" onClick={() => { setEditMode(comment.id, true); }}>
                                                <span className="pe-2"><i className="fa-solid fa-pencil"></i></span>Edit
                                            </a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item text-danger" onClick={() => { getDeleteId(comment.id); }}>
                                                <span className="pe-2"><i className="fa-solid fa-trash"></i></span>Delete Comment
                                            </a>
                                        </li>
                                    </ul>
                                </>
                            )}
                    </div>
                </div>

                <div className="card-body ck-content" key={comment.id} dangerouslySetInnerHTML={{ __html: comment.html_text }} />

            </div>
        ))
    );

}

export default CommentsCard;
