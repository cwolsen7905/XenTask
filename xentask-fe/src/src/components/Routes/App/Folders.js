import { Link, useParams } from 'react-router-dom';
import TaskTable from '../../Tables/TaskTable';

const Folders = () => {

    const { id } = useParams();

    /**
     * GET Request For The Folder In Question
     */
    return (

        <div className="container-fluid px-4">

            <h1 className="mt-4">{id}</h1>

            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                <li className="breadcrumb-item">Folder 1</li>
                <li className="breadcrumb-item active">{id}</li>
            </ol>

            <div className="accordion mb-2" id="accordionExample">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            List #1
                        </button>
                    </h2>
                    <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                            <div className="card mb-2">

                                <div className="card-header">

                                    <ul className="nav nav-tabs card-header-tabs" id="nav-tab" role="tablist">

                                        <li className="nav-item">
                                            <a className="nav-link active" id="nav-profile-tab" data-bs-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Open Tasks</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Awaiting Review</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Overdue</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Closed</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" href="#">Canceled</a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="card-body">

                                    <div className="tab-content" id="nav-tabContent">

                                        <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                                            {/*<TaskTable />*/}
                                        </div>

                                        <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">

                                        </div>

                                        <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">

                                        </div>

                                        <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">

                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="accordion" id="accordionExample2">
                <div className="accordion-item">
                    <h2 className="accordion-header" id="heading2">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="true" aria-controls="collapse2">
                            List #2
                        </button>
                    </h2>
                    <div id="collapse2" className="accordion-collapse collapse show" aria-labelledby="heading2" data-bs-parent="#accordionExample2">
                        <div className="accordion-body">
                            Another Table Here
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};


export default Folders;