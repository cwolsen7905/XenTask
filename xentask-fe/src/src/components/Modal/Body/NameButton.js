const NameButton = ({ getValue, toggleSidePanel }) => {

    return (

        <button className="btn btn-link" onClick={toggleSidePanel}>{getValue()}</button>
        
    );

};
  export default NameButton;