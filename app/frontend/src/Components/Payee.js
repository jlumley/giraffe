import React, {useState} from 'react';
import instance from '../axois';
import payeeRequests from '../requests/payee';

import {darkColor} from '../style/Colors'


const PayeesInput = {
  width: '50%',
  borderColor: 'hsl(0, 0%, 80%)',
  borderStyle: 'solid',
  minHeight: '34px',
  borderWidth: '1px',
  color: darkColor,
  borderRadius: '10px',
  outline: 'none',
};

export default function Payee({key, id, name, fetchPayees}) {
  const [payeeName, setPayeeName] = useState(name);
  
  const handleUpdate = (event) => {
      instance.put(
        `${payeeRequests.updatePayee}${id}`,
        {
          name: event.target.value
        })
      fetchPayees()
  }

  return (
    <div>
      <input 
      style={PayeesInput} 
      value={payeeName} 
      onChange={e => {setPayeeName(e.target.value)}} 
      onBlur={handleUpdate}/>
    </div>
  );

}
