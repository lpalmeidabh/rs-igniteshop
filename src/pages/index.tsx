import { GetStaticProps } from "next";
import Image from "next/future/image";
import { useKeenSlider } from 'keen-slider/react'
import Link from "next/link";
import Head from "next/head";

import Stripe from 'stripe'
import { stripe } from "../lib/stripe";
import { HomeContainer, Product } from "../styles/pages/home"
import placeholderShirt from "../assets/placeholder.png"
import 'keen-slider/keen-slider.min.css'
import {Handbag} from 'phosphor-react'
import {useShoppingCart} from 'use-shopping-cart'
import { Cart } from "../components/cart";
import { Header } from "../components/header";

interface ProductProps {
  id: string,
  name: string,
  imageUrl: string,
  price: string,
  priceId: string,
  priceNum: number
}
interface HomeProps {
  products: ProductProps[]
}

export default function Home({products}: HomeProps) {
  const {addItem, shouldDisplayCart} = useShoppingCart()

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 2.75,
      spacing: 48
    }
  })

  function handleAddProduct(product: ProductProps){
    addItem({
      name: product.name,
      id: product.id,
      price: product.priceNum,
      price_id: product.priceId,
      image: product.imageUrl,
      currency: 'BRL'
    })
    
  }
  
  return (
    <>
      <Head>
        <title>Ignite Shop</title>
      </Head>
      <Header />
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products.map(product => {
          return (
            <Link 
              key={product.id} 
              href={`/product/${product.id}`} 
              prefetch={false}
            >
                <Product className="keen-slider__slide">
                  <Image blurDataURL={placeholderShirt.src} src={product.imageUrl} width={520} height={480} alt="" />
                  <footer>

                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.price}</span>
                    </div>
                    <button onClick={() => handleAddProduct(product)}><Handbag weight="bold" size={32} /></button>
                  </footer>
              </Product>
            </Link>
          )})} 
          
      </HomeContainer>
      {shouldDisplayCart && (<Cart />)}
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price']
  })
  
  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price
    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      priceNum: price.unit_amount,
      priceId: price.id,
      price: new Intl.NumberFormat('pt-BR', {
        style: "currency",
        currency: "BRL"
      }).format(price.unit_amount / 100)

    }
  })
  return {
    props: {
      products
    },    
    revalidate: 60 * 60 * 2
  }
}