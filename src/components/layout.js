import React from 'react';
import LeftBar from './leftbar';

const Layout = ({ children }) => {

  return (
    <div className="w-full h-screen flex" id="root">
      <div className="bg-gray-800 text-white fixed top-0 left-0 h-screen w-[15%]">
        <LeftBar />
      </div>
      <div className="ml-[15%] flex flex-col flex-1 overflow-visible" id='root'>{children}</div>
    </div>
  );
};

export default Layout;
