import { useState } from 'react';
import OffCanvas from './OffCanvas';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Tooltip from 'react-bootstrap/Tooltip';

const BottomNav = ({setViewType}) => {

    //  Toggle OffCanvas 
    const [canvasToggled, toggleCanvas] = useState(false);
    //  Sets The Active Canvas To Render
    const [activeCanvas, setActiveCanvas] = useState('');
    const [showPopover, setShowPopover] = useState(true);

    const activateCanvas = (canvas) => {
        const updatedCanvasToggled = !canvasToggled; // Store the updated value

        //console.log('Before toggle:', canvasToggled);

        toggleCanvas(updatedCanvasToggled);

        updatedCanvasToggled ? setActiveCanvas(canvas) : setActiveCanvas('');

        //console.log('After toggle:', updatedCanvasToggled);
    };

    const closeCanvas = () => toggleCanvas(false);

    const handleButtonClick = () => {
        setShowPopover(!showPopover);
    };

    return (
        <>
            <footer className="mt-auto" style={{ zIndex: 1 }}>
                
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-center text-center small">

                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Project Mangement</Tooltip>}
                        >
                            <button className="btn btn-primary mx-2 fs-5 text" type="button" onClick={() => { setViewType('task') }}><i className="fa-solid fa-tasks"></i></button>

                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Table Mangement</Tooltip>}
                        >
                            <button className="btn btn-warning mx-2 fs-5 text" type="button" onClick={() => { setViewType('crm') }}><i className="fa-solid fa-users"></i></button>

                        </OverlayTrigger>


                            
                            
                            {/*<button className="btn btn-primary mx-2 fs-5 text" type="button" onClick={() => { activateCanvas('chat') }}><i className="fa-solid fa-message"></i></button>*/}

                        {/*}
                        <OverlayTrigger
                            trigger="click"
                            placement="top"
                            overlay={
                                <Popover id="phonePopOver" >
                                    <Popover.Header as="h3">Phone App</Popover.Header>
                                    <Popover.Body>
                                        <div className="container mt-2">
                                            <div className="container mb-2">
                                                <input type="number" className="form-control" placholder="Enter A Number" />
                                            </div>
                                            <div className="row">
                                                <div className="col text-center">
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">1</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">2</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">3</button>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col text-center">
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">4</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">5</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">6</button>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col text-center">
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">7</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">8</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">9</button>

                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col text-center">
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">*</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">0</button>
                                                    <button type="button" className="btn btn-outline-primary phone-keypad">#</button>
                                                </div>
                                            </div>

                                            <div className="row mt-2">
                                                <div className="col text-center">
                                                    <button type="button" className="btn btn-outline-primary"><i className="fa-solid fa-star"></i></button>
                                                    <button type="button" className="btn btn-success mx-2" style={{width:5 + 'em'}}><i className="fa-solid fa-phone"></i></button>
                                                    <button type="button" className="btn btn-danger">Delete</button>
                                                </div>
                                            </div>

                                        </div>
                                    </Popover.Body>
                                </Popover>
                            }
                        >
                            <button onClick={handleButtonClick} className="btn btn-success mx-2 fs-5 text toolbar-button">
                                <i className="fa-solid fa-phone"></i>
                            </button>
                        </OverlayTrigger>
                        */}
                    </div>
                </div>
            </footer>

            <OffCanvas activeCanvas={activeCanvas} canvasToggled={canvasToggled} closeCanvas={closeCanvas} />

        </>
    );
};

export default BottomNav;