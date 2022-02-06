import React from 'react';

export const Transaction = ({ transaction }) => {

    return (
        <tr>
            <td> {transaction.date} </td>
            <td> {transaction.payee} </td>
            <td> {transaction.categories.toString()} </td>
            <td> {transaction.memo} </td>
            <td> {transaction.amount} </td>
            <td> {transaction.amount} </td>
            <td> {transaction.cleared} </td>
        </tr>);

}
