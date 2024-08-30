import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'


import en from 'javascript-time-ago/locale/en.json'
import ru from 'javascript-time-ago/locale/ru.json'

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(ru)

const PostAuthor = ({ authorId, createdAt }) => {
  const [author, setAuthor] = useState({}); // Start with null to handle loading state

  useEffect(() => {
    const getAuthor = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorId}`);
        setAuthor(response?.data);
      } catch (err) {
        console.log(err);
      }
    };

    getAuthor();
  }, [authorId]);


  return (
    <Link to={`/posts/users/${authorId}`} className='post__author'>
      <div className="post__author-avatar">
        <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${author?.avatar}`} alt="" />
      </div>
      <div className="post__author-detail">
        <h5>{author?.name || 'Author Name'}</h5>
        <small><ReactTimeAgo date={new Date(createdAt)} locale='en-US' /></small>
      </div>
    </Link>
  );
};

export default PostAuthor;
