import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from '../components/PostItem';
import Loader from '../components/Loader';
import { useParams } from 'react-router-dom';

const CategoryPosts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { category } = useParams();

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/categories/${category}`);
                setPosts(response?.data?.catPosts || []);
                
            } catch (err) {
                console.error('Error fetching posts:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [category]); // Add category as a dependency

    if (isLoading) {
        return <Loader />;
    }

    return (
        <section className="posts">
            {posts.length > 0 ? (
                <div className="container posts__container">
                    {posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt }) => (
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
                    ))}
                </div>
            ) : (
                <h2 className="center">No Posts</h2>
            )}
        </section>
    );
};

export default CategoryPosts;
