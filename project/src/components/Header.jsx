// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Menu, X, Shield, User } from 'lucide-react';

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const location = useLocation();

//   const navigation = [
//     { name: 'Home', href: '/' },
//     { name: 'Dispatcher', href: '/dispatcher' },
//     { name: 'Live Map', href: '/live-map' },
//     // { name: 'Analytics', href: '/analytics' },
//   ];

//   const isActive = (path) => location.pathname === path;

//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <Link to="/" className="flex items-center space-x-2">
//               <Shield className="h-8 w-8 text-red-600" />
//               <span className="text-xl font-bold text-gray-900">
//                 ResQRoute
//               </span>
//             </Link>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex space-x-8">
//             {navigation.map((item) => (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                   isActive(item.href)
//                     ? 'text-red-600 bg-red-50'
//                     : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
//                 }`}
//               >
//                 {item.name}
//               </Link>
//             ))}
//           </nav>

//           <div className="flex items-center space-x-4">
//             <div className="hidden md:block">
//               <User className="h-6 w-6 text-gray-600 hover:text-red-600 cursor-pointer transition-colors" />
//             </div>

//             {/* Mobile menu button */}
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="md:hidden p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
//             >
//               {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden">
//             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
//               {navigation.map((item) => (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
//                     isActive(item.href)
//                       ? 'text-red-600 bg-red-50'
//                       : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
//                   }`}
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;



import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../context/auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dispatcher', href: '/dispatcher' },
    { name: 'Live Map', href: '/live-map' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleProfileClick = () => {
    navigate('/login/user');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo on left */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">ResQroute</span>
            </Link>
          </div>
          {/* Nav and Profile RIGHT */}
          <div className="flex items-center space-x-8">
            {/* Nav links (shifted right) */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Profile avatar right of nav */}
              {user && (
                <button
                  onClick={handleProfileClick}
                  className="ml-6 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="User profile menu"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center font-bold text-base text-blue-700 border-2 border-blue-300">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                </button>
              )}
            </nav>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleProfileClick}
                  className="w-full mt-3 px-3 py-2 flex items-center space-x-2 text-base font-bold text-blue-700"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center border-2 border-blue-300">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>Profile</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
