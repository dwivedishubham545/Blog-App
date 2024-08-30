import React from "react";
import { Circles } from "react-loader-spinner";
// import LoadingGif from '../images/loading.gif'

const Loader = () => {
  return (
    <div className="loader">
      <Circles
      height="80"
      width="80"
      color="#6f6af8"
      ariaLabel="circles-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
      />
    </div>
  );
};

export default Loader;
