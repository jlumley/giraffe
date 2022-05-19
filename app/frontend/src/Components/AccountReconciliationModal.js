import React from 'react';
import Modal from 'react-modal';
import { centsToMoney } from '../utils/money_utils';
import WindowCloseIcon from 'mdi-react/WindowCloseIcon';
import MoneyInput from './Inputs/MoneyInput';

const ReconcileAccountButton = {
  width: '100px',
  height: 'max-content',
  padding: '5px',
  margin: '10px',
  textAlign: 'center',
  borderRadius: '5px',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: 'white',
};

const ReconcileButton = {
  padding: '5px',
  margin: '10px',
  textAlign: 'center',
  borderRadius: '5px',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: 'lightgrey',
};

const modalStyle = {
  content: {
    margin: 'auto',
    height: 'max(180px, 15%)',
    width: 'max(200px, 25%)',
  },
  overlay: {
    background: 'rgb(0, 0, 0, 0.6)',
  }
};

const closeButtonStlye = {
  float: 'right',
  cursor: 'pointer',
}

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

export function AccountReconciliationModal({account}) {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {setIsOpen(true);}
  function closeModal() {setIsOpen(false);}
  return (
    <div>
      <div style={ReconcileAccountButton} onClick={openModal}>Reconcile Account</div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyle}>
        <WindowCloseIcon style={closeButtonStlye} onClick={closeModal}/>
        <h2>Is your account balance {centsToMoney(account.cleared_balance)}?</h2>
        <MoneyInput/>
      <div style={ReconcileButton} onClick={openModal}>Reconcile</div>
      </Modal>
    </div>
  );
}
