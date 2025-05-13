import {useSelector} from 'react-redux'
import { selectIsLoggedIn } from '../../redux/slice/authSlice'

const ShowOnLogin = ({children}) => {
  const isLoggenIn = useSelector(selectIsLoggedIn) && !window.location.href.includes('login');
  if(isLoggenIn) {
      return children
  }
  return null;
}
export default ShowOnLogin

export const ShowOnLogout = ({children}) => {
  const isLoggenIn = useSelector(selectIsLoggedIn);
  if(!isLoggenIn) {
      return children
  }
  return null;
}