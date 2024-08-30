import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import Loader from './Loader';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
                // Assuming response.data is an object with a posts key
                setPosts(response?.data.posts || []);
            } catch (err) {
                console.log(err);
            }
            setIsLoading(false);
        };
        

        fetchPosts();
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <section className="posts">
            {
                posts.length > 0 ? (
                    <div className="container posts__container">
                        {
                            posts.map(({_id: id, thumbnail, category, title, description, creator, createdAt}) => (
                                <PostItem 
                                    key={id} 
                                    postId={id} 
                                    thumbnail={thumbnail} 
                                    category={category} 
                                    title={title} 
                                    description={description} 
                                    authorId={creator} 
                                    createdAt={createdAt}
                                />
                            ))
                        }
                    </div>
                ) : (
                    <h2 className="center">No Posts</h2>
                )
            }
        </section>
    );
};

export default Posts;
