//import { Trans } from "react-i18next";

import { environment } from "../../environment/conf";




const errMessage = (msgs, c) => {
  let message = msgs.find((x) => x === c);

  if (message) {
    return message;
  }
  return "";
};

const ErrorMsg = (props) => {
  const err = props.msg;

  if (!err || err === "") {
    return "";
  }

  const errorMessage = "error_" + err;
  return (
    <div className="cross-validation-error-message alert alert-danger">
      <span>{errorMessage}
        {/* <Trans>{errorMessage}</Trans> */}
      </span>
    </div>
  );
};

const PaymentForm = (props) => {
  const responseMsgs = props.msg;
  const imageSrc = process.env.PUBLIC_URL + "/images/" + props.img + ".png";
  return (
    <form
      id="payment_form"
      style={{ marginTop: 100 }}
      onSubmit={props.handleSubmit}
    >
      <div className="row h-100 justify-content-center align-self-center pt-5">
        <div className="card card-outline-secondary">
          <div className="card-body">
            <h3 className="text-center">
            header
              {/* <Trans>header</Trans> */}
            </h3>
            <div className="row pt-4">
              <div className="col-md-4">
                <label htmlFor="payment_amount" style={{ height: "auto" }}>
                lbl_amount
                {/* <Trans>lbl_amount</Trans> */}
                </label>
                <div className="input-group ">
                  <input
                    type="text"
                    className="form-control"
                    name="amount"
                    id="payment_amount"
                    style={{ textAlign: "right" }}
                    value={environment.amount}
                    disabled
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">
                      {environment.currency_code}
                    </span>
                  </div>
                </div>
                <ErrorMsg msg={errMessage(responseMsgs, "amount")}></ErrorMsg>
              </div>
            </div>
            <div className="row pt-2">
              <div className="col-md-10">
                <label htmlFor="credit_card_num">
                  lbl_card_number
                  {/* <Trans>lbl_card_number</Trans> */}
                </label>
                <div className="form-control" id="credit_card_num"></div>
                <div id="errors_for_number" className="error_message"></div>
                <ErrorMsg
                  msg={errMessage(responseMsgs, "credit_card_number")}
                ></ErrorMsg>
              </div>
              <div className="col-md-2 photo">
                <img alt="Card" src={imageSrc} style={{ paddingTop: "15px" }} />
              </div>
            </div>
            <div className="row pt-2">
              <div className="col-md-12">
                <label
                  htmlFor="card_holder_id_number"
                  style={{ height: "auto" }}
                >lbl_card_holder_id
                  {/* <Trans>lbl_card_holder_id</Trans> */}
                </label>
                <div className="form-control" id="card_holder_id_number"></div>
                <div id="errors_for_id" className="error_message"></div>
                <ErrorMsg
                  msg={errMessage(responseMsgs, "card_holder_id_number")}
                ></ErrorMsg>
              </div>
            </div>
            <div className="row pt-3">
              <div className="col-md-7">
                <label htmlFor="expiry">
                lbl_expiry
                  {/* <Trans>lbl_expiry</Trans> */}
                </label>
                <div className="form-control" id="expiry"></div>
                <div id="errors_for_expiry" className="error_message"></div>
                <ErrorMsg msg={errMessage(responseMsgs, "expiry")}></ErrorMsg>
              </div>
              <div className="col-md-5">
                <label htmlFor="cvv">
                lbl_cvv
                  {/* <Trans>lbl_cvv</Trans> */}
                </label>
                <div className="form-control" id="cvv"></div>
                <div id="errors_for_cvv" className="error_message"></div>
                <ErrorMsg msg={errMessage(responseMsgs, "cvv")}></ErrorMsg>
              </div>
            </div>

            <div className="row pt-4">
              <div className="col-md-12">
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: "100%" }}
                >submit
                  {/* <Trans>submit</Trans> */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row h-100 justify-content-center align-self-center">
        <span>copyright_message
          {/* <Trans i18nKey="copyright_message"> </Trans> */}
        </span>
      </div>
    </form>
  );
};

export default PaymentForm;
