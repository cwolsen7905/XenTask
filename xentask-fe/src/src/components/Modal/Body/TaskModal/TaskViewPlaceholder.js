/**
 * Placeholder Component Why The Task Is Loading
 */

const TaskViewPlaceHolder = () => {

    return (
        <div className="col-xl-6 resize horizontal" style={{ minWidth: 35 + '%' }}>

            <div className="taskPaneScroll">

                {/* Task Basics */}
                <div className="card mb-2 placeholder-glow">

                    <div className="card-header">
                        <div>
                            <span className="card-text placeholder col-4"></span>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="row">

                            <div className="col-xl-12 mb-2 placeholder"></div>

                            <div className="col-xl-6 placeholder-glow">

                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-xl-6">

                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <span className="placeholder col-12"></span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Area*/}

                <div className="card mb-2 placeholder-glow">
                    <div className="card-header"><span className="placeholder col-4"></span></div>
                    <div className="card-body">
                        <span className="placeholder col-12"></span>
                        <span className="placeholder col-12"></span>
                        <span className="placeholder col-12"></span>
                    </div>
                </div>
                {/* Extra Task Data */}
                <div className="card mb-2 placeholder-glow">

                    <div className="card-header">
                        <span className="placeholder col-4"></span>
                    </div>

                    <div className="card-body">

                        <div className="tab-content" id="nav-tabContent">

                            {/* Custom Fields */}
                            <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                                <div className="card mb-2">
                                    <h5 className="card-header"><span className="placeholder col-4"></span></h5>
                                    <div className="card-body">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <span className="placeholder col-12"></span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span className="placeholder col-12"></span>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span className="placeholder col-12"></span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="resize-handle right"></div>

        </div>
    );

};

export default TaskViewPlaceHolder;