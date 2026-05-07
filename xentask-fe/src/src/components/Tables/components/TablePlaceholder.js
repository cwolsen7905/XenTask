 const TablePlaceholder = () => {

    return (
        <div className="table-responsive">
            <table className="table table-bordered">

                <tbody>
                    <tr className="placeholder-glow">
                        <td><span className="col-2 placeholder"></span></td>
                        <td><span className="col-2 placeholder"></span></td>
                        <td><span className="col-2 placeholder"></span></td>

                    </tr>
                    <tr className="placeholder-glow">
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                    </tr>
                    <tr className="placeholder-glow">
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                    </tr>
                    <tr className="placeholder-glow">
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                    </tr>
                    <tr className="placeholder-glow">
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                        <td><span className="placeholder col-6 placeholder-glow"></span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default TablePlaceholder;