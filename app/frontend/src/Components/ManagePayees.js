import React, {useState, useEffect} from 'react';
import instance from '../axois';
import payeeRequests from '../requests/payee';
import Payee from './Payee';

import '../style/ManagePayees.css'
export default function ManagePayees() {
  const [payees, setPayees] = useState([]);


  async function fetchPayees() {
    const payees = await instance.get(payeeRequests.fetchAllPayees)
    setPayees(payees.data)
  }

  useEffect(() => {
    fetchPayees()
  }, [])
  

  return (
    <div className="ManagePayeesDiv">
    <div className="ManagePayeesScrollDiv">
        {payees.map(p => {
            return (
                <Payee key={p.id} id={p.id} name={p.name} fetchPayees={fetchPayees}/>
            )
        })}
    </div>
    </div>
  );

}
