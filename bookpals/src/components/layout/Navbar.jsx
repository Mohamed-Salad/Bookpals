import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/supabase';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">BookPals</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/home"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-outline"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 