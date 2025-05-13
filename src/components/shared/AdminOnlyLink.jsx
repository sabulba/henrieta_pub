import { useSelector } from "react-redux";
import { selectEmail } from "../../redux/slice/authSlice";

export const AdminOnlyLink = ({children}) => {
    const userEmail = useSelector(selectEmail);
    if(userEmail === 'barnushi@gmail.com' || userEmail === 'lazerashdot@gmail.com') { // TBD check the email from sys var
        return children;
    }
    return null;
  };
  