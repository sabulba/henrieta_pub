import { useSelector } from "react-redux";
import { selectEmail } from "../../redux/slice/authSlice";

export const AdminOnlyLink = ({children}) => {
    const userEmail = useSelector(selectEmail);
    if(userEmail === 'barnushi@gmail.com' || userEmail === 'eliavhilu@gmail.com' || 'h.szold23@gmail.com') { // TBD check the email from sys var
        return children;
    }
    return null;
  };
  