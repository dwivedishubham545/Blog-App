import React,{useState, useEffect} from 'react'
import axios from 'axios'
import PostItem from '../components/PostItem';
import Loader from '../components/Loader'
import { useParams } from 'react-router-dom';


const AuthorsPost = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const {id} = useParams()

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/users/${id}`);
                // Assuming response.data is an object with a posts key
                setPosts(response?.data.posts || []);
            } catch (err) {
                console.log(err);
            }
            setIsLoading(false);
        };
        

        fetchPosts();
    }, [id]);

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
}

export default AuthorsPost