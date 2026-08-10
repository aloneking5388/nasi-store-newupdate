// In your 'AllNav' file
import { AiFillDashboard, AiOutlineShoppingCart, AiOutlinePlus, AiOutlineShop } from 'react-icons/ai'
import { BiCategory, BiLoaderCircle } from 'react-icons/bi'
import { FiUsers } from 'react-icons/fi'
import { CiChat1 } from 'react-icons/ci'
import { BsCurrencyDollar, BsChat, BsShop } from 'react-icons/bs'
import { RiProductHuntLine } from 'react-icons/ri'
import { ImNewspaper } from 'react-icons/im'

// Function to get navigation items based on role
export const getNavs = (role: string) => {
  if (role === 'admin') {
    return [
      { id: 1, title: 'Dashboard', icon: <AiFillDashboard />, path: '/admin' },
      { id: 2, title: 'Orders', icon: <AiOutlineShoppingCart />, path: '/admin/orders' },
      { id: 3, title: 'Category', icon: <BiCategory />, path: '/admin/category' },
      { id: 4, title: 'Sellers', icon: <BsShop />, path: '/admin/sellers' },
      { id: 5, title: 'Customers', icon: <FiUsers />, path: '/admin/customers' },
      { id: 6, title: 'Payment request', icon: <BsCurrencyDollar />, path: '/admin/payment-request' },
      { id: 7, title: 'Chat Seller', icon: <CiChat1 />, path: '/admin/chat-sellers' },
      { id: 8, title: 'Blog', icon: <ImNewspaper />, path: '/admin/blogs' },
    ]
  } else if (role === 'seller') {
    return [
      { id: 8, title: 'Dashboard', icon: <AiFillDashboard />, path: '/seller' },
      { id: 9, title: 'Add Product', icon: <AiOutlinePlus />, path: '/seller/addProduct' },
      { id: 10, title: 'All Product', icon: <RiProductHuntLine />, path: '/seller/allproducts' },
      { id: 11, title: 'Discount Product', icon: <RiProductHuntLine />, path: '/seller/discountProduct' },
      { id: 12, title: 'Orders', icon: <AiOutlineShoppingCart />, path: '/seller/orders' },
      { id: 13, title: 'Payments', icon: <BsCurrencyDollar />, path: '/seller/payments' },
      { id: 14, title: 'Chat Customer', icon: <BsChat />, path: '/seller/chatcustomer' },
      { id: 15, title: 'Chat Support', icon: <CiChat1 />, path: '/seller/chatsupport' },
      { id: 16, title: 'Profile', icon: <FiUsers />, path: '/seller/profile' },
    ]
  }

  // Return an empty array if role is not recognized
  return []
}
