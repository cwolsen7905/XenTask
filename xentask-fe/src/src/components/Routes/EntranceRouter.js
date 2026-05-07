import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Entrance/LoginPage';
import ForgotPassword from './Entrance/ForgotPassword';
import ForgotUsername from './Entrance/ForgotUsername';
import Invitation from './Entrance/Invitation/Invitation';
import ErrorPage from '../ErrorPage';

const EntranceRouter = () => {

    return (
        <div id="layoutAuthentication" className="login-body">

            <div id="layoutAuthentication_content">
                <main>
                    <div className="container-fluid">
                        <div className="loginwrapper white">
                            <span className="circle"></span>
                            <div className="loginone">
                                <Routes>
                                    <Route path="/" element={<LoginPage />} />
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<LoginPage />} />
                                    <Route path="/password" element={<ForgotPassword />} />
                                    <Route path="/username" element={<ForgotUsername />} />
                                    <Route path="/invite/:hash" element={<Invitation />} />
                                    <Route path="/error" element={<ErrorPage />} />
                                    {/* Any Other Unknown Route Just Navigate Them To The Login Or 404 Page */}
                                    <Route path="*" element={<ErrorPage/>} />
                                </Routes>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <div id="layoutAuthentication_footer">
                <footer className="py-4 bg-light mt-auto">
                    <div className="container-fluid px-4">
                        <div className="d-flex align-items-center justify-content-between small">
                            <div className="text-muted">Copyright &copy; Xentask 2024</div>
                            <div>
                                <a href="#">Privacy Policy</a>
                                &middot;
                                <a href="#">Terms &amp; Conditions</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

        </div>
    );

}

export default EntranceRouter;