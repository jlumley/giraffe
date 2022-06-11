import React, {useState, useEffect} from 'react';
import instance from '../axois';
import payeeRequests from '../requests/payee';
import Payee from './Payee';

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
    <div>
        {payees.map(p => {
            console.log(p)
            return (
                <Payee key={p.id} id={p.id} name={p.name} fetchPayees={fetchPayees}/>
            )
        })}
    </div>
  );

}
