import React, { useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useSelector, useDispatch } from 'react-redux';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import { QUERY_PRODUCTS } from '../../utils/queries';
import { idbPromise } from '../../utils/helpers';
// import spinner from '../../assets/spinner.gif';
import ProductItem from '../ProductItem';
import BrandMenu from '../BrandMenu';

function ProductList() {
  const state = useSelector((state) => {
    return state;
  });
  const dispatch = useDispatch();

  const { currentBrand } = state;

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  useEffect(() => {
    // if there's data to be stored
    if (data) {
      // let's store it in the global state object
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products,
      });

      // take each product and save it to IndexedDB using the helper function
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
      // check if `loading` is undefined in `useQuery()` Hook
    } else if (!loading) {
      // when offline, get all of the data from the `products` store
      idbPromise('products', 'get').then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products,
        });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentBrand) {
      return state.products;
    }

    return state.products.filter(
      (product) => product.brand._id === currentBrand
    );
  }

  return (
    <div className="my-2">
      <h4>Our Products:</h4>
      <BrandMenu />
      {state.products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {/* {loading ? <img src={spinner} alt="loading" /> : null} */}
    </div>
  );
}

export default ProductList;