import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import WindowCloseIcon from 'mdi-react/WindowCloseIcon';
import MoneyInput from '../Inputs/MoneyInput';
import instance from '../../axois';
import accountRequests from '../../requests/account';


const AddAccountButton ={
  cursor: 'pointer',
  color: 'white',
  width: 'fit-content',
  padding: 'clamp(5px, 3%, 8px)',
  display: 'flex'
}

const CreateAccountButton = {
  padding: '5px',
  margin: '10px',
  textAlign: 'center',
  borderRadius: '10px',
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

const AccountNameInput = {
  width: '80%',
  borderColor: 'hsl(0, 0%, 80%)',
  borderStyle: 'solid',
  height: 'px',
  borderWidth: '1px',
  color: 'var(--dark-color)',
  borderRadius: '10px',
  marginBottom: '5px',
  paddingLeft: '5px',
  minWidth: '100px',
  outline: 'none',
};

const closeButtonStlye = {
  float: 'right',
  cursor: 'pointer',
}

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

export function AddAccountModal() {
  const [accountName, setAccountName] = useState("");
  const [startingBalance, setStartingBalance] = useState(0);
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [accountNotes, setAccountNotes] = useState("");
  const [modalIsOpen, setIsOpen] = React.useState(false);
  function openModal() {setIsOpen(true);}
  function closeModal() {setIsOpen(false);}


  async function createNewAccount() {
    await instance.post(
      `${accountRequests.createNewAccount}`,
      {
        name: accountName,
        starting_balance: parseInt(startingBalance) * 100,
        credit_card: isCreditCard,
        date: new Date().toISOString().slice(0, 10),
        notes: accountNotes, 
      })
    closeModal()

  }

  return (
    <div>
      <div style={AddAccountButton} onClick={openModal}> Add Account</div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyle}>
        <WindowCloseIcon style={closeButtonStlye} onClick={closeModal}/>
        <h2>Create New Account</h2>
        <input style={AccountNameInput} value={accountName} placeholder="Account Name" onChange={e => {setAccountName(e.target.value)}}/>
        <MoneyInput startingValue={startingBalance} onBlur={(e) => { setStartingBalance(e) }} />
        <div><input type={"checkbox"} defaultChecked={isCreditCard} onClick={() => {setIsCreditCard(!isCreditCard)}}/>Is this a credit Card?</div>
      <div style={CreateAccountButton} onClick={createNewAccount}>Create Account</div>
      </Modal>
    </div>
  );
}
