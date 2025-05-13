import { NavLink } from 'react-router-dom';
import { FaFirstOrderAlt } from 'react-icons/fa';
const PaymentResult = (props) => {
  const message = props.msg;
  if (props.success === false) {
    return (
      <div className="container">
        <div className="row justify-content-center align-self-center pt-5">
          <div
            className="swal2-icon swal2-error swal2-animate-error-icon"
            style={{ display: "flex" }}
          >
            <span className="swal2-x-mark">
              <span className="swal2-x-mark-line-left"></span>
              <span className="swal2-x-mark-line-right"></span>
            </span>
          </div>
        </div>
        <div className="row justify-content-center align-self-center pt-5">
          <h2 style={{ color: "#FF0000" }}>Payment failed!</h2>
        </div>
        <div className="row justify-content-center align-self-center pt-5">
          <h5>{message}</h5>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div className="row justify-content-center align-self-center pt-5">
        <div
          className="swal2-icon swal2-success swal2-animate-success-icon"
          style={{ display: "flex" }}
        >
          <div
            className="swal2-success-circular-line-left"
            style={{ backgroundColor: "rgb(255, 255, 255)" }}
          ></div>
          <span className="swal2-success-line-tip"></span>
          <span className="swal2-success-line-long"></span>
          <div className="swal2-success-ring"></div>
          <div
            className="swal2-success-fix"
            style={{ backgroundColor: "rgb(255, 255, 255)" }}
          ></div>
          <div
            className="swal2-success-circular-line-right"
            style={{ backgroundColor: "rgb(255, 255, 255)" }}
          ></div>
        </div>
      </div>
      <div className="row justify-content-center align-self-center pt-5">
        <h2 style={{ color: "#0fad00" }}>Payment completed successfully</h2>
         <NavLink to="/order-history" >
                           <FaFirstOrderAlt size={22} color='black' /> My Orders
         </NavLink>
      </div>
      <div className="row justify-content-center align-self-center pt-5">
        <h5>{message}</h5>
      </div>
    </div>
  );
};

export default PaymentResult;
