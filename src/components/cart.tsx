import {CartEntry} from './cartEntry'
import { useShoppingCart } from 'use-shopping-cart';

import { CartContainer, CloseCartButton, CartContent,  CartDetails } from '../styles/components/cart';
import {X} from 'phosphor-react'
import { useState } from 'react';
import axios from 'axios'

export function Cart() {
  
  const { removeItem, cartDetails, formattedTotalPrice, handleCloseCart, clearCart} = useShoppingCart()
  
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  async function handleCheckout() {
    try{
      const lineItems = Object.values(cartDetails ?? {}).map(entry => {
        return ({
          price: entry.price_id,
          quantity: entry.quantity          
        })
      })
      setIsCreatingCheckoutSession(true)
      
      const response = await axios.post('/api/checkout', {
        line_items: lineItems
      })

      const {checkoutUrl} = response.data
      window.location.href = checkoutUrl
      clearCart()
    }
    catch(err){
      setIsCreatingCheckoutSession(false)

      //conectar com uma ferramenta de observabilidade (Datadog / Sentry etc)
      alert('Falha ao redirecionar ao checkout')
      
    }
  }

  const cartEntries = Object.values(cartDetails ?? {}).map((entry) => (
    <CartEntry key={entry.id} entry={entry} removeItem={removeItem} />
  ))

  return (
    <CartContainer>
      <CloseCartButton>
        <button onClick={handleCloseCart}><X size={24} weight='bold'/></button>
      </CloseCartButton>
      <CartContent>
        <h1>Sacola de Compras</h1>
        {cartEntries.length === 0 ? <p>O carrinho está vazio.</p> : null}
        {cartEntries}
        <CartDetails>
        <h1>Quantidade: <span>{cartEntries.length}</span></h1>
        <p>Valor total: <span>{formattedTotalPrice}</span></p>
        <button disabled={isCreatingCheckoutSession } onClick={handleCheckout}>Finalizar Compra</button>
        </CartDetails>
      </CartContent>
    </CartContainer>
  )
}