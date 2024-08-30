import React from 'react';
import Error from '../images/error.png';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <section className='error-page'>
      <div className="center">
        <div className="error-image">
          <img src={Error} alt="Error" />
        </div>
        <Link to="/" className="btn primary">Go Back Home</Link>
      </div>
    </section>
  );
}

export default ErrorPage;
