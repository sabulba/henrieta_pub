
import { useSelector } from 'react-redux';
import { selectEmail } from '../../redux/slice/authSlice';
import { Link } from 'react-router-dom';

const AdminOnlyRout = ({children}) => {
  const userEmail = useSelector(selectEmail);
  if(userEmail === 'barnushi@gmail.com' || userEmail === 'eliavhilu@gmail.com') { // TBD check the email from sys var
      return children;
  }
  return (
    <section style={{height:'82.4vh'}}>
      <div className="container">
        {/* <h2>Permission Denied</h2>
        <p>This page can only be view by an admin.</p> */}
        <br />
        <Link to='/'>
          <button  className='--btn'>&larr; Back To Home</button>
        </Link>
      </div>
    </section>
  );
};

export default AdminOnlyRout;
