import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import PaymentForm from './PaymentForm';
import PaymentResult from './PaymentResult';

import { selectEmail, selectIsLoggedIn } from '../../redux/slice/authSlice';
import { selectCartItems, selectCartTotalAmount } from '../../redux/slice/cartSlice';
import { selecteTheShippingAddress } from '../../redux/slice/checkoutSlice';
import styles from './Payment.module.scss';
import Loader from '../loader/Loader';
import { environment } from '../../environment/conf';
import { useDispatch, useSelector } from 'react-redux';

class Payment extends Component {
  fields = null;
  environment = null;
  state = {
    imageSrc: 'cardExample',
    messages: [],
    sucess: false,
    resMessage: '',
    isLoading: false,
  };

  componentDidMount = () => {
    if (this.fields == null) {
      this.environment = environment;
      this.tzlHostedFields();
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.chargeCcData(event);
  };

  chargeCcData = (e) => {
    this.fields.charge(
      {
        terminal_name: this.environment.terminal_name,
        amount: e.target.amount.value,
        currency_code: this.environment.currency_code,
        response_language: this.environment.response_language,
      },
      (error, response) => {
        if (response) {
          this.parseResponse(response);
          this.saveOrder();
        }
        if (error && error.messages) {
          this.handleError(error);
        }
      }
    );
  };

  handleError = (err) => {
    const messages = err.messages.map((message) => message.param);
    this.setState({ messages, sucess: false });
  };

  parseResponse = (response) => {
    if (response.errors) {
      const resMessage = response.errors.map((message) => message.message).join(', ');
      this.setState({ resMessage, sucess: false });
    } else {
      const sucess = response.transaction_response.success;
      const resMessage = sucess ? '' : response.transaction_response.error;
      this.setState({ sucess, resMessage });
    }
  };

  onCardNumberChanged = (result) => {
    if (result?.cardType !== 'unknown') {
      this.setState({ imageSrc: result.cardType });
    }
  };

  validityChange = (result) => {
    if (result?.field) {
      this.setState((prevState) => ({
        messages: prevState.messages.filter((_, index) => index !== result.field.index),
      }));
    }
  };

  tzlHostedFields = () => {
    const tzlFields = window.TzlaHostedFields.create({
      sandbox: false,
      fields: {
        card_holder_id_number: { selector: '#card_holder_id_number', placeholder: 'placeholder_card_holder_id', tabindex: 2 },
        credit_card_number: { selector: '#credit_card_num', placeholder: 'placeholder_card_number', tabindex: 1 },
        cvv: { selector: '#cvv', placeholder: 'placeholder_cvv', tabindex: 4 },
        expiry: { selector: '#expiry', placeholder: 'placeholder_expiry', tabindex: 3, version: '1' },
      },
    });

    tzlFields.onEvent('cardTypeChange', this.onCardNumberChanged);
    tzlFields.onEvent('blur', this.validityChange);
    this.fields = tzlFields;
  };

  saveOrder = () => {
    this.setState({ isLoading: true });
    const { userEmail, cartItems, totalAmount, shippingAddress } = this.props;

    try {
      addDoc(collection(db, 'orders'), {
        email: userEmail,
        cartItems:cartItems,
        date: Date.now(),
        totalAmount:totalAmount,
        shippingAddress:shippingAddress,
      });
      this.setState({ isLoading: false });
      toast.success('Order uploaded successfully.',{
        position: "bottom-left",
        autoClose: 1000,
      });
    } catch (error) {
      this.setState({ isLoading: false });
      toast.error(error.message,{
        position: "bottom-left",
        autoClose: 1000,
      });
    }
  };

  render() {
    const { resMessage, imageSrc, sucess, messages, isLoading } = this.state;

    if (resMessage || sucess) {
      return <PaymentResult msg={resMessage} success={sucess} />;
    }

    return (
        <>
            {
              isLoading ?  <Loader/> :
              <div className={styles.formContent}>
                <PaymentForm
                  handleSubmit={this.handleSubmit}
                  img={imageSrc}
                  msg={messages}
                  isLoading={isLoading}
                />
              </div>
              }
        </>
    );
  }
}

const mapStateToProps = (state) => ({
  userEmail: selectEmail(state),
  cartItems: selectCartItems(state),
  totalAmount: selectCartTotalAmount(state),
  shippingAddress: selecteTheShippingAddress(state),
});

export default connect(mapStateToProps)(Payment);
