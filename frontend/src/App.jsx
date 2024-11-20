import {Navigate,Route,Routes} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CartPage from './pages/CartPage.jsx';
import PurchaseSuccessPage from './pages/PurchaseSuccessPage.jsx';
import PurchaseCancelPage from './pages/PurchaseCancelPage.jsx';

import NavBar from './components/NavBar.jsx';
import { Toaster } from 'react-hot-toast';
import { useUserStore } from './stores/useUserStore.js';
import { useCartStore } from './stores/useCartStore.js';
import { useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner.jsx';
//above isn't imported and shown a blank ahh page! :( be careful!

function App() {
  const {user, checkAuth, checkingAuth} = useUserStore(); 
  const {getCartItems} = useCartStore();
  //checkAuth is func which set's current session user with LoggedIn user
  //checkingAuth is a boolean which is set to true when checking auth and set to false when done checking auth.
  
  useEffect(()=>{ //to ensure the loggedin state is preserved with logged user, after refresh as the user is now logged in!
    checkAuth();
  },[checkAuth]); //updates the user field to retain the logged in state after refresh!
  //so after logged in, even if we visit signup/login routes too...it redirects to '/' i.e homePage as in below code.

  useEffect(() => {
		if(!user) return; 
    getCartItems();
	}, [getCartItems,user]);//taking user too in dependency here is very important for the update.
//so to update with the user's cart, right after login, to display count accordingly in the cart icon!

  if (checkingAuth) return <LoadingSpinner/>;
  //if checking auth, show the loading spinner

  //tailwind allows us to put the classes with relavent names with the defined css in the element itself :)
  return (
      <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
        <div>Hello</div>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute inset-0'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,220,255,0.3)_0%,rgba(135,206,235,0.2)_45%,rgba(0,10,61,0.9)_100%)]' />
          </div>
        </div>
        <div className='relative z-50 pt-20'> 
          <NavBar/>
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/signup' element={!user ? <SignUpPage/> : <Navigate to='/' />}/> 
            <Route path='/login' element={!user ? <LoginPage/> : <Navigate to='/' />}/> 
            {/*<HomePage/> or <Navigate to='/'/> same :) */}
            {/*i.e if user logged, we direct to homePage, else to loginPage*/}
            <Route path='/secret-dashboard' element={user?.role==="admin" ? <AdminPage/> : <Navigate to='/login'/>} />
            {/*so if no user logged in, it redirects to login page, if user logged in and not an admin, it redirects to login page, but since logged in, to user homepage :) 
            Jenna who is admin now has Dashboard button appearing on her home page, It redirects to AdminPage for user 'jenna' since her role is admin :) */}
            <Route path='/category/:category/' element={<CategoryPage/>}/>
            <Route path='/cart' element={user? <CartPage/>:<Navigate to='/login' />} />
            <Route path='/purchase-success' element={user? <PurchaseSuccessPage/>:<Navigate to='/login' />} />
            <Route path='/purchase-cancel' element={user? <PurchaseCancelPage/>:<Navigate to='/login' />} />
          </Routes>
        </div>
        <Toaster />
      </div>
  )
}

export default App

/* Background gradient */
/*<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2) rgba(135,206,235,0.2) _45%,rgba(0,0,0,0.1)_100%)]' /> -->*/
/*z-50 z-index 50 i.e the frontmost!, padding-top 20 */