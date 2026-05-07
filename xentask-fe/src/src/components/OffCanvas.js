/**
 * This OffCanvas Is Responsible For The Bottom Menu Bar 
 * For The Phone App and Messenger
 * 
 */
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const OffCanvas = ({ activeCanvas, canvasToggled, closeCanvas }) => {

    //console.log(activeCanvas);

    const getCanvasBody = () => {
        switch (activeCanvas) {
            case ('chat'):
                return (
                    <div className="list-group list-group-flush border-bottom scrollarea">
                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>

                        <a className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100">
                                <i className="fa-solid fa-circle-user" style={{ fontSize: 3 + 'em' }}></i>
                                <div style={{
                                    marginLeft: 1 + 'em',
                                    width: 16 + 'em',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    <h5>Username</h5>
                                    <small className="text-muted">This is a chat sample blah blah blahasdasdasdasdasdsadsasadasdasdasdassadsadasdasdasdsadasdasdasdsasad</small>
                                </div>
                                <div><small className="text-muted">4/24/2024</small></div>
                            </div>
                        </a>
                    </div>
                )

                break;

            case ('phone'):

                break;
            
            default:
                break;
        }
    }

    const getToolBar = () => {

        return (
            <div className={`toolbar toolbar-end justify-content-center ${canvasToggled ? 'show' : ''}`}>
                <ul className="list-unstyled">
                    <li>
                        <OverlayTrigger
                            placement="left" // Set the desired placement (e.g., "top", "bottom", "left", "right")
                            overlay={<Tooltip>Chats</Tooltip>}
                        >
                            <button className="btn btn-primary mb-2 me-4 fs-2 text toolbar-button">
                                <i className="fa-regular fa-comments"></i>
                            </button>
                        </OverlayTrigger>
                    </li>

                    <li>
                        <OverlayTrigger
                            placement="left" // Set the desired placement (e.g., "top", "bottom", "left", "right")
                            overlay={<Tooltip>Users</Tooltip>}
                        >
                            <button className="btn btn-primary mb-2 fs-2 text toolbar-button">
                                <i className="fa-solid fa-users"></i>
                            </button>
                        </OverlayTrigger>
                    </li>

                    <li>
                        <OverlayTrigger
                            placement="left" // Set the desired placement (e.g., "top", "bottom", "left", "right")
                            overlay={<Tooltip>Group Chats</Tooltip>}
                        >
                            <button className="btn btn-primary mb-2 fs-2 text toolbar-button">
                                <i className="fa-solid fa-users-between-lines"></i>
                            </button>
                        </OverlayTrigger>
                    </li>

                    <li>
                        <OverlayTrigger
                            placement="left" // Set the desired placement (e.g., "top", "bottom", "left", "right")
                            overlay={<Tooltip>Channels</Tooltip>}
                        >
                            <button className="btn btn-primary mb-2 fs-2 text toolbar-button">
                                <i className="fa-solid fa-hashtag"></i>
                            </button>
                        </OverlayTrigger>
                    </li>
                </ul>
            </div>
        );
    }


    return (
        <>
            <div className={`offcanvas offcanvas-end toolbar ${canvasToggled ? 'show' : ''}`} data-bs-scroll data-bs-backdrop="false" id="offcanvas" aria-labelledby="offcanvasLabel">
                <div className="offcanvas-header">
                    <h5 id="offcanvasLabel">{activeCanvas.charAt(0).toUpperCase() + activeCanvas.slice(1)}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" onClick={closeCanvas}></button>
                </div>
                <div className="offcanvas-body">
                    {getCanvasBody()}
                </div>
            </div>

            {getToolBar()}

        </>
    )
}

export default OffCanvas;